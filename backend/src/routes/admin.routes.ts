import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { toUserDto } from "./auth.routes.js";

export const adminRouter = Router();

const updateUserStatusSchema = z.object({
  status: z.enum(["active", "unverified", "temp_blocked", "blocked"])
});

adminRouter.get("/dashboard", async (_req, res, next) => {
  try {
    const [stats, byDirection, byRegion, recent, stages] = await Promise.all([
      pool.query<{ total: string; finalists: string; winners: string }>(
        `
          SELECT
            count(*)::text AS total,
            count(*) FILTER (WHERE stage = 'final')::text AS finalists,
            count(*) FILTER (WHERE status = 'winner')::text AS winners
          FROM applications
        `
      ),
      pool.query<{ name: string; value: string; color: string }>(
        `
          SELECT d.name, count(a.id)::text AS value, d.color
          FROM directions d
          LEFT JOIN applications a ON a.direction_id = d.id
          WHERE d.is_active = true
          GROUP BY d.id
          ORDER BY count(a.id) DESC, d.sort_order ASC
        `
      ),
      pool.query<{ region: string; count: string }>(
        `
          SELECT region, count(*)::text AS count
          FROM applications
          GROUP BY region
          ORDER BY count(*) DESC, region ASC
          LIMIT 8
        `
      ),
      pool.query(
        `
          SELECT application_number, team_name, project_name, status, stage, created_at
          FROM applications
          ORDER BY created_at DESC
          LIMIT 8
        `
      ),
      pool.query<{ stage: string; count: string }>(
        `
          SELECT stage, count(*)::text AS count
          FROM applications
          GROUP BY stage
          ORDER BY count(*) DESC
        `
      )
    ]);

    const statRow = stats.rows[0] ?? { total: "0", finalists: "0", winners: "0" };

    res.json({
      data: {
        stats: {
          applications: Number(statRow.total),
          finalists: Number(statRow.finalists),
          winners: Number(statRow.winners)
        },
        applicationsByDirection: byDirection.rows.map((row) => ({
          name: row.name,
          value: Number(row.value),
          color: row.color
        })),
        regionalDistribution: byRegion.rows.map((row) => ({
          region: row.region,
          count: Number(row.count)
        })),
        recentApplications: recent.rows,
        stages: stages.rows.map((row) => ({
          stage: row.stage,
          count: Number(row.count)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/users", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          role,
          participation_type,
          institution,
          region,
          status,
          registered_at,
          last_login
        FROM users
        ORDER BY registered_at DESC
      `
    );

    res.json({ data: result.rows.map(toUserDto) });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/users/:id/status", async (req, res, next) => {
  try {
    const payload = updateUserStatusSchema.parse(req.body);
    const result = await pool.query(
      `
        UPDATE users
        SET status = $1
        WHERE id = $2
        RETURNING
          id,
          first_name,
          last_name,
          email,
          role,
          participation_type,
          institution,
          region,
          status,
          registered_at,
          last_login
      `,
      [payload.status, req.params.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: { message: "User not found" } });
      return;
    }

    res.json({ data: toUserDto(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITIONS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

const createCompetitionSchema = z.object({
  name: z.string().trim().min(3).max(200),
  applicationStartDate: z.string().trim(),
  applicationEndDate: z.string().trim(),
  resultsAnnouncementDate: z.string().trim(),
  firstPlacePrize: z.string().trim().min(1).max(500),
  secondPlacePrize: z.string().trim().min(1).max(500),
  thirdPlacePrize: z.string().trim().min(1).max(500),
});

const updateCompetitionStatusSchema = z.object({
  status: z.enum(["draft", "pending_approval", "announced", "applications_open", "sorting", "final", "completed", "cancelled", "archived"])
});

const updateCompetitionSchema = z.object({
  name: z.string().trim().min(3).max(200).optional(),
  applicationStartDate: z.string().trim().optional(),
  applicationEndDate: z.string().trim().optional(),
  resultsAnnouncementDate: z.string().trim().optional(),
  firstPlacePrize: z.string().trim().min(1).max(500).optional(),
  secondPlacePrize: z.string().trim().min(1).max(500).optional(),
  thirdPlacePrize: z.string().trim().min(1).max(500).optional(),
});

adminRouter.get("/competitions", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          name,
          year,
          description,
          application_deadline,
          current_stage,
          applications_count,
          responsible,
          status,
          created_at,
          updated_at
        FROM competitions
        ORDER BY created_at DESC
      `
    );

    res.json({
      data: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        year: row.year,
        description: row.description,
        applicationDeadline: row.application_deadline,
        currentStage: row.current_stage,
        applicationsCount: row.applications_count,
        responsible: row.responsible,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/competitions", async (req, res, next) => {
  try {
    const payload = createCompetitionSchema.parse(req.body);
    
    const year = new Date(payload.applicationStartDate).getFullYear();
    const description = `Tadbir: ${new Date(payload.applicationStartDate).toLocaleDateString("uz-UZ")} - ${new Date(payload.applicationEndDate).toLocaleDateString("uz-UZ")}. Natijalar: ${new Date(payload.resultsAnnouncementDate).toLocaleDateString("uz-UZ")}. Mukofotlar: 1-o'rin - ${payload.firstPlacePrize}, 2-o'rin - ${payload.secondPlacePrize}, 3-o'rin - ${payload.thirdPlacePrize}`;

    const result = await pool.query(
      `
        INSERT INTO competitions (
          name,
          year,
          description,
          application_deadline,
          current_stage,
          applications_count,
          responsible,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          name,
          year,
          description,
          application_deadline,
          current_stage,
          applications_count,
          responsible,
          status,
          created_at,
          updated_at
      `,
      [
        payload.name,
        year,
        description,
        payload.applicationEndDate,
        "Tayyorlanmoqda",
        0,
        "Administrator", // TODO: Get from authenticated user
        "draft"
      ]
    );

    const row = result.rows[0];

    res.status(201).json({
      data: {
        id: row.id,
        name: row.name,
        year: row.year,
        description: row.description,
        applicationDeadline: row.application_deadline,
        currentStage: row.current_stage,
        applicationsCount: row.applications_count,
        responsible: row.responsible,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/competitions/:id/status", async (req, res, next) => {
  try {
    const payload = updateCompetitionStatusSchema.parse(req.body);
    
    const result = await pool.query(
      `
        UPDATE competitions
        SET status = $1, updated_at = now()
        WHERE id = $2
        RETURNING
          id,
          name,
          year,
          description,
          application_deadline,
          current_stage,
          applications_count,
          responsible,
          status,
          created_at,
          updated_at
      `,
      [payload.status, req.params.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: { message: "Competition not found" } });
      return;
    }

    const row = result.rows[0];

    // Agar tanlov "applications_open" holatiga o'tsa, barcha userlarga bildirishnoma yuborish
    if (payload.status === "applications_open") {
      const usersResult = await pool.query("SELECT id FROM users WHERE status = 'active'");
      
      const notificationPromises = usersResult.rows.map((user) => 
        pool.query(
          `
            INSERT INTO notifications (user_id, type, title, body, action_url, action_label)
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            user.id,
            "application",
            "Yangi tanlov boshlandi! 🎉",
            `"${row.name}" tanloviga ariza topshirish boshlandi. Arizalar ${new Date(row.application_deadline).toLocaleDateString("uz-UZ")} gacha qabul qilinadi.`,
            "/profile/arizalar",
            "Ariza topshirish"
          ]
        )
      );

      await Promise.all(notificationPromises);
    }

    res.json({
      data: {
        id: row.id,
        name: row.name,
        year: row.year,
        description: row.description,
        applicationDeadline: row.application_deadline,
        currentStage: row.current_stage,
        applicationsCount: row.applications_count,
        responsible: row.responsible,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/competitions/:id", async (req, res, next) => {
  try {
    const payload = updateCompetitionSchema.parse(req.body);
    
    let description = null;
    if (payload.applicationStartDate && payload.applicationEndDate && payload.resultsAnnouncementDate) {
      const year = new Date(payload.applicationStartDate).getFullYear();
      description = `Tadbir: ${new Date(payload.applicationStartDate).toLocaleDateString("uz-UZ")} - ${new Date(payload.applicationEndDate).toLocaleDateString("uz-UZ")}. Natijalar: ${new Date(payload.resultsAnnouncementDate).toLocaleDateString("uz-UZ")}. Mukofotlar: 1-o'rin - ${payload.firstPlacePrize}, 2-o'rin - ${payload.secondPlacePrize}, 3-o'rin - ${payload.thirdPlacePrize}`;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (payload.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(payload.name);
    }
    if (payload.applicationStartDate) {
      const year = new Date(payload.applicationStartDate).getFullYear();
      updates.push(`year = $${paramIndex++}`);
      values.push(year);
    }
    if (description) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (payload.applicationEndDate) {
      updates.push(`application_deadline = $${paramIndex++}`);
      values.push(payload.applicationEndDate);
    }

    updates.push(`updated_at = now()`);
    values.push(req.params.id);

    const result = await pool.query(
      `
        UPDATE competitions
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING
          id,
          name,
          year,
          description,
          application_deadline,
          current_stage,
          applications_count,
          responsible,
          status,
          created_at,
          updated_at
      `,
      values
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: { message: "Competition not found" } });
      return;
    }

    const row = result.rows[0];

    res.json({
      data: {
        id: row.id,
        name: row.name,
        year: row.year,
        description: row.description,
        applicationDeadline: row.application_deadline,
        currentStage: row.current_stage,
        applicationsCount: row.applications_count,
        responsible: row.responsible,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/competitions/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM competitions WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: { message: "Competition not found" } });
      return;
    }

    res.json({ success: true, message: "Competition deleted" });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// USER APPLICATIONS ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

const updateUserApplicationStatusSchema = z.object({
  status: z.enum(["submitted", "under_review", "needs_correction", "accepted", "rejected", "next_stage"]),
  adminComment: z.string().optional()
});

adminRouter.get("/user-applications", async (req, res, next) => {
  try {
    const groupType = typeof req.query.groupType === "string" ? req.query.groupType : "";
    const groupValue = typeof req.query.groupValue === "string" ? req.query.groupValue : "";
    const filters: string[] = [];
    const values: string[] = [];

    if (groupType === "institution" && groupValue) {
      values.push(groupValue);
      filters.push(`
        COALESCE(a.participation_type, u.participation_type) IN ('otm', 'university')
        AND COALESCE(NULLIF(a.institution, ''), NULLIF(u.institution, ''), 'OTM ko''rsatilmagan') = $${values.length}
      `);
    }
    if (groupType === "region" && groupValue) {
      values.push(groupValue);
      filters.push(`
        COALESCE(a.participation_type, u.participation_type) NOT IN ('otm', 'university')
        AND COALESCE(NULLIF(a.district, ''), NULLIF(u.district, ''), 'Hudud ko''rsatilmagan') = $${values.length}
      `);
    }

    const result = await pool.query(
      `
        SELECT
          ua.id,
          ua.user_id,
          u.first_name || ' ' || u.last_name as user_name,
          ua.application_number,
          ua.admin_application_id,
          ua.project_name,
          ua.direction,
          ua.goal,
          ua.problem,
          ua.presentation_url,
          ua.video_url,
          ua.demo_url,
          ua.github_url,
          ua.website_url,
          ua.status,
          ua.admin_comment,
          ua.created_at,
          ua.updated_at,
          COALESCE(a.participation_type, u.participation_type) AS participation_type,
          COALESCE(NULLIF(a.institution, ''), NULLIF(u.institution, '')) AS institution,
          u.region,
          COALESCE(NULLIF(a.district, ''), NULLIF(u.district, '')) AS district,
          u.phone,
          u.email,
          u.faculty,
          u.education_direction,
          u.course
        FROM user_applications ua
        JOIN users u ON u.id = ua.user_id
        LEFT JOIN applications a ON a.source_user_application_id = ua.id
        ${filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : ""}
        ORDER BY ua.created_at DESC
      `,
      values
    );

    const rows = await Promise.all(result.rows.map(enrichApplicationFileAvailability));
    res.json({
      data: rows.map(toAdminUserApplicationDto)
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/institutions-summary", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT
          COALESCE(NULLIF(a.institution, ''), NULLIF(u.institution, ''), 'OTM ko''rsatilmagan') AS name,
          count(ua.id)::int AS applications_count,
          count(ua.id) FILTER (WHERE ua.status IN ('accepted', 'next_stage'))::int AS accepted_count,
          max(ua.created_at) AS last_application_at
        FROM user_applications ua
        JOIN users u ON u.id = ua.user_id
        LEFT JOIN applications a ON a.source_user_application_id = ua.id
        WHERE COALESCE(a.participation_type, u.participation_type) IN ('otm', 'university')
        GROUP BY COALESCE(NULLIF(a.institution, ''), NULLIF(u.institution, ''), 'OTM ko''rsatilmagan')
        ORDER BY applications_count DESC, name ASC
      `
    );

    res.json({
      data: result.rows.map((row, index) => {
        const name = String(row.name);
        return {
          id: `institution_${index + 1}`,
          name,
          shortName: makeShortName(name),
          applicationsCount: Number(row.applications_count ?? 0),
          acceptedCount: Number(row.accepted_count ?? 0),
          lastApplicationAt: row.last_application_at ?? null,
          status: "active"
        };
      })
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/regions-summary", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT
          COALESCE(NULLIF(a.district, ''), NULLIF(u.district, ''), 'Hudud ko''rsatilmagan') AS name,
          count(ua.id)::int AS applications_count,
          count(ua.id) FILTER (WHERE ua.status IN ('accepted', 'next_stage'))::int AS accepted_count,
          max(ua.created_at) AS last_application_at
        FROM user_applications ua
        JOIN users u ON u.id = ua.user_id
        LEFT JOIN applications a ON a.source_user_application_id = ua.id
        WHERE COALESCE(a.participation_type, u.participation_type) NOT IN ('otm', 'university')
        GROUP BY COALESCE(NULLIF(a.district, ''), NULLIF(u.district, ''), 'Hudud ko''rsatilmagan')
        ORDER BY applications_count DESC, name ASC
      `
    );

    res.json({
      data: result.rows.map((row, index) => {
        const name = String(row.name);
        const applicationsCount = Number(row.applications_count ?? 0);
        return {
          id: `region_${index + 1}`,
          name,
          type: name.toLowerCase().endsWith("shahri") ? "city" : "district",
          applicationsCount,
          acceptedCount: Number(row.accepted_count ?? 0),
          lastApplicationAt: row.last_application_at ?? null,
          selectionEnabled: applicationsCount > 0,
          status: "active"
        };
      })
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/user-applications/:id/status", async (req, res, next) => {
  try {
    const payload = updateUserApplicationStatusSchema.parse(req.body);
    
    const result = await pool.query(
      `
        WITH updated AS (
          UPDATE user_applications
          SET status = $1, admin_comment = $2, updated_at = now()
          WHERE id = $3
          RETURNING *
        )
        SELECT
          ua.id,
          ua.user_id,
          u.first_name || ' ' || u.last_name as user_name,
          ua.application_number,
          ua.admin_application_id,
          ua.project_name,
          ua.direction,
          ua.goal,
          ua.problem,
          ua.presentation_url,
          ua.video_url,
          ua.demo_url,
          ua.github_url,
          ua.website_url,
          ua.status,
          ua.admin_comment,
          ua.created_at,
          ua.updated_at,
          u.participation_type,
          u.institution,
          u.region,
          u.district,
          u.phone,
          u.email,
          u.faculty,
          u.education_direction,
          u.course
        FROM updated ua
        JOIN users u ON u.id = ua.user_id
      `,
      [payload.status, payload.adminComment || null, req.params.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: { message: "Application not found" } });
      return;
    }

    const row = result.rows[0];

    await pool.query(
      `
        UPDATE applications
        SET status = $1, updated_at = now()
        WHERE source_user_application_id = $2
      `,
      [payload.status, row.id]
    );

    if (payload.status === "next_stage") {
      await syncUserApplicationToJudgeProjects(row);
    }

    // Foydalanuvchiga bildirishnoma yuborish
    await pool.query(
      `
        INSERT INTO notifications (user_id, type, title, body, action_url, action_label)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        row.user_id,
        "application",
        "Ariza holati yangilandi",
        `"${row.project_name}" arizangizning holati: ${getStatusLabel(payload.status)}. ${payload.adminComment || ""}`,
        "/profile/arizalar",
        "Arizalarni ko'rish"
      ]
    );

    res.json({
      data: toAdminUserApplicationDto(row)
    });
  } catch (error) {
    next(error);
  }
});

function toAdminUserApplicationDto(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    applicationNumber: row.application_number,
    adminApplicationId: row.admin_application_id,
    projectName: row.project_name,
    direction: row.direction,
    goal: row.goal,
    problem: row.problem,
    presentationUrl: row.presentation_url,
    videoUrl: row.video_url,
    demoUrl: row.demo_url,
    presentationExists: row.presentation_exists ?? !isUploadPath(row.presentation_url),
    videoExists: row.video_exists ?? !isUploadPath(row.video_url),
    demoExists: row.demo_exists ?? !isUploadPath(row.demo_url),
    githubUrl: row.github_url,
    websiteUrl: row.website_url,
    status: row.status || "submitted",
    adminComment: row.admin_comment,
    participationType: row.participation_type === "university" ? "otm" : row.participation_type,
    institution: row.institution,
    region: row.region,
    district: row.district,
    phone: row.phone,
    email: row.email,
    faculty: row.faculty,
    educationDirection: row.education_direction,
    course: row.course,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isUploadPath(value: unknown) {
  return typeof value === "string" && value.startsWith("/uploads/");
}

async function enrichApplicationFileAvailability(row: any) {
  return {
    ...row,
    presentation_exists: await resourceAvailable(row.presentation_url),
    video_exists: await resourceAvailable(row.video_url),
    demo_exists: await resourceAvailable(row.demo_url)
  };
}

async function resourceAvailable(value: unknown) {
  if (!isUploadPath(value)) return Boolean(value);
  const relativePath = String(value).replace(/^\/uploads\//, "").split("?")[0];
  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const filePath = path.resolve(uploadsRoot, relativePath);
  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) return false;
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function makeShortName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 8)
    .toUpperCase();
}

async function syncUserApplicationToJudgeProjects(row: any) {
  const materials = [
    row.presentation_url ? { id: "presentation", type: "presentation", title: "Taqdimot materiali", url: row.presentation_url } : null,
    row.video_url ? { id: "video", type: "video", title: "Video material", url: row.video_url } : null,
    row.demo_url ? { id: "demo", type: "demo", title: "Demo versiyasi", url: row.demo_url } : null,
    row.github_url ? { id: "github", type: "github", title: "GitHub havolasi", url: row.github_url } : null,
    row.website_url ? { id: "website", type: "other", title: "Yaratilgan sayt", url: row.website_url } : null
  ].filter(Boolean);

  await pool.query(
    `
      INSERT INTO judge_projects (
        judge_id,
        application_number,
        project_name,
        team_name,
        direction,
        stage,
        region,
        institution,
        summary,
        problem,
        solution,
        demo_url,
        github_url,
        materials
      )
      SELECT
        j.id,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $8,
        $10,
        $11,
        $12::jsonb
      FROM judges j
      WHERE j.status = 'active'
        AND (cardinality(j.directions) = 0 OR $4 = ANY(j.directions))
        AND NOT EXISTS (
          SELECT 1
          FROM judge_projects jp
          WHERE jp.judge_id = j.id AND jp.application_number = $1
        )
    `,
    [
      row.application_number,
      row.project_name,
      row.user_name,
      row.direction,
      "Keyingi bosqich",
      row.district || row.region,
      row.institution,
      row.goal,
      row.problem,
      row.demo_url,
      row.github_url,
      JSON.stringify(materials)
    ]
  );
}

function getStatusLabel(status: string): string {
  const labels = {
    submitted: "Qabul qilish bosqichida",
    under_review: "Ko'rib chiqilmoqda", 
    needs_correction: "Tuzatish kerak",
    accepted: "Admin loyihani qabul qildi",
    rejected: "Rad etildi",
    next_stage: "Keyingi bosqichga o'tdi"
  };
  return labels[status as keyof typeof labels] || status;
}
