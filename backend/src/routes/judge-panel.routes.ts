import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/http.js";
import { requireJudge } from "../middleware/judgeAuth.js";

export const judgePanelRouter = Router();
judgePanelRouter.use(requireJudge);

// ─── GET /api/judge/dashboard ────────────────────────────────────────────────
judgePanelRouter.get("/dashboard", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const judgeRow = await pool.query(
      `SELECT assigned_projects, eval_start_date, eval_end_date,
              first_name, last_name
       FROM judges WHERE id=$1`, [judgeId]
    );
    const judge = judgeRow.rows[0];

    const evalsRow = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status='pending')::int AS pending,
        COUNT(*) FILTER (WHERE status='draft')::int AS draft,
        COUNT(*) FILTER (WHERE status='submitted')::int AS submitted,
        COUNT(*) AS total
       FROM judge_evaluations WHERE judge_id=$1`, [judgeId]
    );
    const ev = evalsRow.rows[0] ?? { pending: 0, draft: 0, submitted: 0, total: 0 };

    const recentRow = await pool.query(
      `SELECT jp.id, jp.project_name, jp.direction, jp.stage, jp.region,
              jp.application_number, jp.created_at,
              je.status AS eval_status
       FROM judge_projects jp
       LEFT JOIN judge_evaluations je ON je.project_id=jp.id AND je.judge_id=$1
       WHERE jp.judge_id=$1
       ORDER BY jp.created_at DESC LIMIT 5`,
      [judgeId]
    );

    res.json({
      data: {
        judge: { firstName: judge?.first_name, lastName: judge?.last_name },
        stats: {
          total: judge?.assigned_projects ?? 0,
          pending: Number(ev.pending),
          draft: Number(ev.draft),
          submitted: Number(ev.submitted),
        },
        evalStartDate: judge?.eval_start_date,
        evalEndDate: judge?.eval_end_date,
        recentProjects: recentRow.rows,
      }
    });
  } catch (err) { next(err); }
});

// ─── GET /api/judge/projects ─────────────────────────────────────────────────
judgePanelRouter.get("/projects", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const { status, stage, direction, search } = req.query as Record<string, string>;

    let where = "WHERE jp.judge_id=$1";
    const vals: any[] = [judgeId];
    let idx = 2;

    if (status && status !== "all") {
      where += ` AND COALESCE(je.status,'pending')=$${idx++}`;
      vals.push(status);
    }
    if (stage) { where += ` AND jp.stage=$${idx++}`; vals.push(stage); }
    if (direction) { where += ` AND jp.direction=$${idx++}`; vals.push(direction); }
    if (search) { where += ` AND jp.project_name ILIKE $${idx++}`; vals.push(`%${search}%`); }

    const r = await pool.query(
      `SELECT jp.id, jp.application_number, jp.project_name, jp.direction,
              jp.stage, jp.region, jp.institution, jp.assigned_date,
              jp.eval_deadline, jp.team_name,
              COALESCE(je.status,'pending') AS eval_status,
              je.id AS eval_id, je.updated_at AS eval_updated
       FROM judge_projects jp
       LEFT JOIN judge_evaluations je ON je.project_id=jp.id AND je.judge_id=$1
       ${where}
       ORDER BY jp.created_at DESC`, vals
    );
    res.json({ data: r.rows });
  } catch (err) { next(err); }
});

// ─── GET /api/judge/projects/:id ─────────────────────────────────────────────
judgePanelRouter.get("/projects/:id", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const r = await pool.query(
      `SELECT jp.*, je.id AS eval_id, COALESCE(je.status,'pending') AS eval_status,
              je.scores, je.comments, je.total_score,
              je.strengths, je.weaknesses, je.tech_risks, je.market_risks,
              je.business_model_issues, je.team_assessment, je.improvements,
              je.pilot_feasibility, je.regional_relevance, je.next_steps,
              je.recommendation, je.justification, je.updated_at AS eval_updated_at,
              je.submitted_at
       FROM judge_projects jp
       LEFT JOIN judge_evaluations je ON je.project_id=jp.id AND je.judge_id=$1
       WHERE jp.id=$2 AND jp.judge_id=$1`,
      [judgeId, req.params.id]
    );
    if (!r.rows[0]) throw new ApiError(404, "Loyiha topilmadi");
    res.json({ data: r.rows[0] });
  } catch (err) { next(err); }
});

// ─── POST /api/judge/projects/:id/start ──────────────────────────────────────
judgePanelRouter.post("/projects/:id/start", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const projCheck = await pool.query(
      "SELECT id FROM judge_projects WHERE id=$1 AND judge_id=$2", [req.params.id, judgeId]
    );
    if (!projCheck.rows[0]) throw new ApiError(404, "Loyiha topilmadi");

    const existing = await pool.query(
      "SELECT id FROM judge_evaluations WHERE project_id=$1 AND judge_id=$2",
      [req.params.id, judgeId]
    );
    if (existing.rows[0]) {
      return res.json({ data: { evalId: existing.rows[0].id, alreadyStarted: true } });
    }

    const r = await pool.query(
      `INSERT INTO judge_evaluations (judge_id, project_id, status, scores, comments)
       VALUES ($1,$2,'pending','{}','{}') RETURNING id`,
      [judgeId, req.params.id]
    );
    res.status(201).json({ data: { evalId: r.rows[0].id } });
  } catch (err) { next(err); }
});

const draftSchema = z.object({
  scores: z.record(z.string(), z.number()).optional(),
  comments: z.record(z.string(), z.string()).optional(),
  totalScore: z.number().min(0).max(100).optional(),
  strengths: z.string().max(2000).optional(),
  weaknesses: z.string().max(2000).optional(),
  techRisks: z.string().max(2000).optional(),
  marketRisks: z.string().max(2000).optional(),
  businessModelIssues: z.string().max(2000).optional(),
  teamAssessment: z.string().max(2000).optional(),
  improvements: z.string().max(2000).optional(),
  pilotFeasibility: z.string().max(2000).optional(),
  regionalRelevance: z.string().max(2000).optional(),
  nextSteps: z.string().max(2000).optional(),
  recommendation: z.enum(["promising", "not_promising"]).optional(),
  justification: z.string().max(2000).optional(),
  conflictOfInterest: z.boolean().optional(),
  agreedCriteria: z.boolean().optional(),
  agreedIndependent: z.boolean().optional(),
  agreedConfidential: z.boolean().optional(),
  agreedNoConflict: z.boolean().optional(),
});

// ─── PUT /api/judge/evaluations/:id/draft ────────────────────────────────────
judgePanelRouter.put("/evaluations/:id/draft", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const payload = draftSchema.parse(req.body);

    const check = await pool.query(
      "SELECT id, status FROM judge_evaluations WHERE id=$1 AND judge_id=$2",
      [req.params.id, judgeId]
    );
    if (!check.rows[0]) throw new ApiError(404, "Baholash topilmadi");
    if (check.rows[0].status === "submitted") throw new ApiError(400, "Yakunlangan baholash tahrirlanmaydi");

    const r = await pool.query(
      `UPDATE judge_evaluations SET
        scores = COALESCE($1::jsonb, scores),
        comments = COALESCE($2::jsonb, comments),
        total_score = COALESCE($3, total_score),
        strengths = COALESCE($4, strengths),
        weaknesses = COALESCE($5, weaknesses),
        tech_risks = COALESCE($6, tech_risks),
        market_risks = COALESCE($7, market_risks),
        business_model_issues = COALESCE($8, business_model_issues),
        team_assessment = COALESCE($9, team_assessment),
        improvements = COALESCE($10, improvements),
        pilot_feasibility = COALESCE($11, pilot_feasibility),
        regional_relevance = COALESCE($12, regional_relevance),
        next_steps = COALESCE($13, next_steps),
        recommendation = COALESCE($14, recommendation),
        justification = COALESCE($15, justification),
        status = 'draft',
        updated_at = now()
       WHERE id=$16 AND judge_id=$17
       RETURNING *`,
      [
        payload.scores ? JSON.stringify(payload.scores) : null,
        payload.comments ? JSON.stringify(payload.comments) : null,
        payload.totalScore ?? null,
        payload.strengths ?? null, payload.weaknesses ?? null,
        payload.techRisks ?? null, payload.marketRisks ?? null,
        payload.businessModelIssues ?? null, payload.teamAssessment ?? null,
        payload.improvements ?? null, payload.pilotFeasibility ?? null,
        payload.regionalRelevance ?? null, payload.nextSteps ?? null,
        payload.recommendation ?? null, payload.justification ?? null,
        req.params.id, judgeId,
      ]
    );
    res.json({ data: r.rows[0], savedAt: new Date().toISOString() });
  } catch (err) { next(err); }
});

// ─── POST /api/judge/evaluations/:id/finalize ────────────────────────────────
judgePanelRouter.post("/evaluations/:id/finalize", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const payload = draftSchema.parse(req.body);

    const check = await pool.query(
      "SELECT id, status, project_id FROM judge_evaluations WHERE id=$1 AND judge_id=$2",
      [req.params.id, judgeId]
    );
    if (!check.rows[0]) throw new ApiError(404, "Baholash topilmadi");
    if (check.rows[0].status === "submitted") throw new ApiError(400, "Allaqachon yakunlangan");

    if (!payload.recommendation) throw new ApiError(400, "Tavsiya tanlanmagan");
    if (payload.totalScore === undefined || payload.totalScore === null) {
      throw new ApiError(400, "Umumiy ball kiritilmagan");
    }

    const r = await pool.query(
      `UPDATE judge_evaluations SET
        scores = COALESCE($1::jsonb, scores),
        comments = COALESCE($2::jsonb, comments),
        total_score = $3,
        strengths = COALESCE($4, strengths),
        weaknesses = COALESCE($5, weaknesses),
        tech_risks = COALESCE($6, tech_risks),
        market_risks = COALESCE($7, market_risks),
        business_model_issues = COALESCE($8, business_model_issues),
        team_assessment = COALESCE($9, team_assessment),
        improvements = COALESCE($10, improvements),
        pilot_feasibility = COALESCE($11, pilot_feasibility),
        regional_relevance = COALESCE($12, regional_relevance),
        next_steps = COALESCE($13, next_steps),
        recommendation = $14,
        justification = COALESCE($15, justification),
        status = 'submitted',
        submitted_at = now(),
        updated_at = now()
       WHERE id=$16 AND judge_id=$17
       RETURNING *`,
      [
        payload.scores ? JSON.stringify(payload.scores) : null,
        payload.comments ? JSON.stringify(payload.comments) : null,
        payload.totalScore,
        payload.strengths ?? null, payload.weaknesses ?? null,
        payload.techRisks ?? null, payload.marketRisks ?? null,
        payload.businessModelIssues ?? null, payload.teamAssessment ?? null,
        payload.improvements ?? null, payload.pilotFeasibility ?? null,
        payload.regionalRelevance ?? null, payload.nextSteps ?? null,
        payload.recommendation, payload.justification ?? null,
        req.params.id, judgeId,
      ]
    );

    // Update project status
    await pool.query(
      "UPDATE judge_projects SET eval_status='submitted' WHERE id=$1",
      [check.rows[0].project_id]
    );

    res.json({ data: r.rows[0] });
  } catch (err) { next(err); }
});

// ─── POST /api/judge/evaluations/:id/reopen-request ─────────────────────────
judgePanelRouter.post("/evaluations/:id/reopen-request", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const { reason, reasonType, attachmentUrl } = z.object({
      reason: z.string().min(10).max(2000),
      reasonType: z.string().min(1),
      attachmentUrl: z.string().optional(),
    }).parse(req.body);

    const check = await pool.query(
      "SELECT id, status FROM judge_evaluations WHERE id=$1 AND judge_id=$2",
      [req.params.id, judgeId]
    );
    if (!check.rows[0]) throw new ApiError(404, "Baholash topilmadi");
    if (check.rows[0].status !== "submitted") throw new ApiError(400, "Faqat yakunlangan baholar uchun murojaat qilish mumkin");

    const r = await pool.query(
      `INSERT INTO judge_reopen_requests (eval_id, judge_id, reason_type, reason, attachment_url, status)
       VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *`,
      [req.params.id, judgeId, reasonType, reason, attachmentUrl ?? null]
    );
    res.status(201).json({ data: r.rows[0] });
  } catch (err) { next(err); }
});

// ─── GET /api/judge/evaluations/completed ────────────────────────────────────
judgePanelRouter.get("/evaluations/completed", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const r = await pool.query(
      `SELECT je.id, je.total_score, je.recommendation, je.submitted_at,
              jp.application_number, jp.project_name, jp.direction, jp.stage,
              je.status
       FROM judge_evaluations je
       JOIN judge_projects jp ON jp.id=je.project_id
       WHERE je.judge_id=$1 AND je.status='submitted'
       ORDER BY je.submitted_at DESC`,
      [judgeId]
    );
    res.json({ data: r.rows });
  } catch (err) { next(err); }
});

// ─── GET /api/judge/profile ──────────────────────────────────────────────────
judgePanelRouter.get("/profile", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const r = await pool.query("SELECT * FROM judges WHERE id=$1", [judgeId]);
    if (!r.rows[0]) throw new ApiError(404, "Topilmadi");
    const j = r.rows[0];
    res.json({ data: {
      id: j.id, login: j.login,
      firstName: j.first_name, lastName: j.last_name, middleName: j.middle_name,
      organization: j.organization, position: j.position,
      specialization: j.specialization, experienceYears: j.experience_years,
      phone: j.phone, email: j.email, avatarUrl: j.avatar_url,
      judgeCategory: j.judge_category, directions: j.directions ?? [],
      assignedCompetition: j.assigned_competition, assignedStage: j.assigned_stage,
      assignedLocation: j.assigned_location,
      evalStartDate: j.eval_start_date, evalEndDate: j.eval_end_date,
      mustChangePassword: j.must_change_password, status: j.status,
      agreedCriteria: j.agreed_criteria, agreedIndependent: j.agreed_independent,
      agreedConfidential: j.agreed_confidential, agreedNoConflict: j.agreed_no_conflict,
      agreedNoShare: j.agreed_no_share,
    }});
  } catch (err) { next(err); }
});

// ─── PUT /api/judge/profile ──────────────────────────────────────────────────
judgePanelRouter.put("/profile", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const payload = z.object({
      phone: z.string().max(30).optional().or(z.literal("")),
      email: z.string().email().max(200).optional().or(z.literal("")),
      avatarUrl: z.string().max(500).optional().or(z.literal("")),
    }).parse(req.body);

    await pool.query(
      `UPDATE judges SET
         phone=COALESCE($1,phone),
         email=COALESCE($2,email),
         avatar_url=COALESCE($3,avatar_url),
         updated_at=now()
       WHERE id=$4`,
      [payload.phone || null, payload.email || null, payload.avatarUrl || null, judgeId]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── GET /api/judge/notifications ────────────────────────────────────────────
judgePanelRouter.get("/notifications", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const r = await pool.query(
      `SELECT id, type, title, body, action_url, action_label, read, created_at
       FROM judge_notifications
       WHERE judge_id=$1
       ORDER BY created_at DESC LIMIT 50`,
      [judgeId]
    );
    res.json({ data: r.rows });
  } catch (err) { next(err); }
});

// ─── PATCH /api/judge/notifications/:id/read ─────────────────────────────────
judgePanelRouter.patch("/notifications/:id/read", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    await pool.query(
      "UPDATE judge_notifications SET read=true WHERE id=$1 AND judge_id=$2",
      [req.params.id, judgeId]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── POST /api/judge/projects/:id/report-issue ───────────────────────────────
judgePanelRouter.post("/projects/:id/report-issue", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const { issueType, description, attachmentUrl } = z.object({
      issueType: z.string().min(1),
      description: z.string().min(5).max(2000),
      attachmentUrl: z.string().optional(),
    }).parse(req.body);

    const r = await pool.query(
      `INSERT INTO judge_issue_reports (judge_id, project_id, issue_type, description, attachment_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [judgeId, req.params.id, issueType, description, attachmentUrl ?? null]
    );
    res.status(201).json({ data: { id: r.rows[0].id } });
  } catch (err) { next(err); }
});

// ─── POST /api/judge/projects/:id/conflict-of-interest ───────────────────────
judgePanelRouter.post("/projects/:id/conflict-of-interest", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId!;
    const { reason } = z.object({ reason: z.string().min(5).max(1000) }).parse(req.body);
    await pool.query(
      `INSERT INTO judge_conflict_reports (judge_id, project_id, reason)
       VALUES ($1,$2,$3) ON CONFLICT (judge_id, project_id) DO UPDATE SET reason=$3, updated_at=now()`,
      [judgeId, req.params.id, reason]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── GET /api/judge/guidelines ───────────────────────────────────────────────
judgePanelRouter.get("/guidelines", async (_req, res, next) => {
  try {
    res.json({ data: { version: "1.0", publishedAt: "2026-07-01" } });
  } catch (err) { next(err); }
});
