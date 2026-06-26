import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { hashPassword } from "../utils/password.js";

export const judgesRouter = Router();

// ─── helpers ────────────────────────────────────────────────────────────────
function toDto(row: any) {
  return {
    id: row.id,
    lastName: row.last_name,
    firstName: row.first_name,
    middleName: row.middle_name,
    avatarUrl: row.avatar_url,
    organization: row.organization,
    position: row.position,
    specialization: row.specialization,
    experienceYears: row.experience_years,
    phone: row.phone,
    email: row.email,
    judgeCategory: row.judge_category,
    directions: row.directions ?? [],
    assignedCompetition: row.assigned_competition,
    assignedStage: row.assigned_stage,
    assignedLocation: row.assigned_location,
    assignedProjects: row.assigned_projects,
    evalStartDate: row.eval_start_date,
    evalEndDate: row.eval_end_date,
    login: row.login,
    mustChangePassword: row.must_change_password,
    platformUrl: row.platform_url,
    agreedCriteria: row.agreed_criteria,
    agreedIndependent: row.agreed_independent,
    agreedConfidential: row.agreed_confidential,
    agreedNoConflict: row.agreed_no_conflict,
    agreedNoShare: row.agreed_no_share,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ─── schemas ────────────────────────────────────────────────────────────────
const createSchema = z.object({
  lastName: z.string().trim().min(1).max(100),
  firstName: z.string().trim().min(1).max(100),
  middleName: z.string().trim().max(100).optional().or(z.literal("")),
  avatarUrl: z.string().trim().optional().or(z.literal("")),
  organization: z.string().trim().min(1).max(200),
  position: z.string().trim().min(1).max(200),
  specialization: z.string().trim().min(1).max(200),
  experienceYears: z.coerce.number().int().min(0).max(60),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  judgeCategory: z.string().trim().min(1).max(100),
  directions: z.array(z.string()).default([]),
  assignedCompetition: z.string().trim().max(200).optional().or(z.literal("")),
  assignedStage: z.string().trim().max(200).optional().or(z.literal("")),
  assignedLocation: z.string().trim().max(300).optional().or(z.literal("")),
  assignedProjects: z.coerce.number().int().min(0).default(0),
  evalStartDate: z.string().trim().optional().or(z.literal("")),
  evalEndDate: z.string().trim().optional().or(z.literal("")),
  login: z.string().trim().min(3).max(80),
  password: z.string().min(6).max(128).optional(),
  platformUrl: z.string().trim().max(500).optional().or(z.literal("")),
  agreedCriteria: z.boolean().default(false),
  agreedIndependent: z.boolean().default(false),
  agreedConfidential: z.boolean().default(false),
  agreedNoConflict: z.boolean().default(false),
  agreedNoShare: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
});

const updateSchema = createSchema.partial().extend({
  password: z.string().min(6).max(128).optional(),
});

// ─── GET /admin/judges ───────────────────────────────────────────────────────
judgesRouter.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM judges ORDER BY created_at DESC`
    );
    res.json({ data: result.rows.map(toDto) });
  } catch (err) { next(err); }
});

// ─── POST /admin/judges ──────────────────────────────────────────────────────
judgesRouter.post("/", async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body);
    const rawPassword = payload.password || generatePassword();
    const hash = await hashPassword(rawPassword);

    const r = await pool.query(
      `INSERT INTO judges (
        last_name, first_name, middle_name, avatar_url, organization, position,
        specialization, experience_years, phone, email, judge_category, directions,
        assigned_competition, assigned_stage, assigned_location, assigned_projects,
        eval_start_date, eval_end_date, login, password_hash, must_change_password,
        platform_url, agreed_criteria, agreed_independent, agreed_confidential,
        agreed_no_conflict, agreed_no_share, status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        true,$21,$22,$23,$24,$25,$26,$27
      ) RETURNING *`,
      [
        payload.lastName, payload.firstName, payload.middleName || null,
        payload.avatarUrl || null, payload.organization, payload.position,
        payload.specialization, payload.experienceYears,
        payload.phone || null, payload.email || null,
        payload.judgeCategory, payload.directions,
        payload.assignedCompetition || null, payload.assignedStage || null,
        payload.assignedLocation || null, payload.assignedProjects,
        payload.evalStartDate || null, payload.evalEndDate || null,
        payload.login, hash,
        payload.platformUrl || null,
        payload.agreedCriteria, payload.agreedIndependent,
        payload.agreedConfidential, payload.agreedNoConflict,
        payload.agreedNoShare, payload.status,
      ]
    );
    res.status(201).json({ data: toDto(r.rows[0]), generatedPassword: rawPassword });
  } catch (err) { next(err); }
});

// ─── PATCH /admin/judges/:id ─────────────────────────────────────────────────
judgesRouter.patch("/:id", async (req, res, next) => {
  try {
    const payload = updateSchema.parse(req.body);
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;

    const fieldMap: Record<string, string> = {
      lastName: "last_name", firstName: "first_name", middleName: "middle_name",
      avatarUrl: "avatar_url", organization: "organization", position: "position",
      specialization: "specialization", experienceYears: "experience_years",
      phone: "phone", email: "email", judgeCategory: "judge_category",
      directions: "directions", assignedCompetition: "assigned_competition",
      assignedStage: "assigned_stage", assignedLocation: "assigned_location",
      assignedProjects: "assigned_projects", evalStartDate: "eval_start_date",
      evalEndDate: "eval_end_date", login: "login", platformUrl: "platform_url",
      agreedCriteria: "agreed_criteria", agreedIndependent: "agreed_independent",
      agreedConfidential: "agreed_confidential", agreedNoConflict: "agreed_no_conflict",
      agreedNoShare: "agreed_no_share", status: "status",
    };

    let generatedPassword: string | undefined;

    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in payload) {
        sets.push(`${col} = $${i++}`);
        vals.push((payload as any)[key] ?? null);
      }
    }

    if (payload.password) {
      generatedPassword = payload.password;
      sets.push(`password_hash = $${i++}`);
      vals.push(await hashPassword(payload.password));
      sets.push(`must_change_password = $${i++}`);
      vals.push(true);
    }

    if (sets.length === 0) {
      res.status(400).json({ error: { message: "No fields to update" } });
      return;
    }

    sets.push(`updated_at = now()`);
    vals.push(req.params.id);

    const r = await pool.query(
      `UPDATE judges SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
      vals
    );
    if (r.rowCount === 0) {
      res.status(404).json({ error: { message: "Judge not found" } });
      return;
    }
    res.json({ data: toDto(r.rows[0]), ...(generatedPassword ? { generatedPassword } : {}) });
  } catch (err) { next(err); }
});

// ─── PATCH /admin/judges/:id/password ────────────────────────────────────────
judgesRouter.patch("/:id/password", async (req, res, next) => {
  try {
    const { password } = z.object({ password: z.string().min(6).max(128) }).parse(req.body);
    const hash = await hashPassword(password);
    const r = await pool.query(
      `UPDATE judges SET password_hash=$1, must_change_password=true, updated_at=now() WHERE id=$2 RETURNING *`,
      [hash, req.params.id]
    );
    if (r.rowCount === 0) { res.status(404).json({ error: { message: "Judge not found" } }); return; }
    res.json({ data: toDto(r.rows[0]) });
  } catch (err) { next(err); }
});

// ─── DELETE /admin/judges/:id ────────────────────────────────────────────────
judgesRouter.delete("/:id", async (req, res, next) => {
  try {
    const r = await pool.query("DELETE FROM judges WHERE id=$1 RETURNING id", [req.params.id]);
    if (r.rowCount === 0) { res.status(404).json({ error: { message: "Judge not found" } }); return; }
    res.json({ success: true });
  } catch (err) { next(err); }
});
