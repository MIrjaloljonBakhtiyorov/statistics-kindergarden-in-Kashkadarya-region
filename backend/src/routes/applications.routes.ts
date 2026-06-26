import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/http.js";
import { createNotification } from "../utils/notifications.js";

const createApplicationSchema = z.object({
  teamName: z.string().trim().min(2).max(160),
  projectName: z.string().trim().min(2).max(180),
  directionId: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(120),
  participantName: z.string().trim().min(2).max(140),
  phone: z.string().trim().min(7).max(32),
  email: z.string().trim().email().max(180).optional(),
  description: z.string().trim().min(20).max(3000)
});

type ApplicationRow = {
  id: string;
  application_number: string;
  team_name: string;
  project_name: string;
  direction_id: string;
  direction_name: string;
  region: string;
  participant_name: string;
  phone: string;
  email: string | null;
  description: string;
  status: string;
  stage: string;
  score: string | null;
  created_at: string;
};

export const applicationsRouter = Router();

applicationsRouter.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query<ApplicationRow>(
      `
        SELECT
          a.id,
          a.application_number,
          a.team_name,
          a.project_name,
          a.direction_id,
          d.name AS direction_name,
          a.region,
          a.participant_name,
          a.phone,
          a.email,
          a.description,
          a.status,
          a.stage,
          a.score,
          a.created_at
        FROM applications a
        JOIN directions d ON d.id = a.direction_id
        ORDER BY a.created_at DESC
      `
    );

    res.json({ data: result.rows.map(toApplicationDto) });
  } catch (error) {
    next(error);
  }
});

applicationsRouter.get("/:id", async (req, res, next) => {
  try {
    const result = await pool.query<ApplicationRow>(
      `
        SELECT
          a.id,
          a.application_number,
          a.team_name,
          a.project_name,
          a.direction_id,
          d.name AS direction_name,
          a.region,
          a.participant_name,
          a.phone,
          a.email,
          a.description,
          a.status,
          a.stage,
          a.score,
          a.created_at
        FROM applications a
        JOIN directions d ON d.id = a.direction_id
        WHERE a.id = $1
      `,
      [req.params.id]
    );

    const row = result.rows[0];
    if (!row) {
      throw new ApiError(404, "Application not found");
    }

    res.json({ data: toApplicationDto(row) });
  } catch (error) {
    next(error);
  }
});

applicationsRouter.post("/", async (req, res, next) => {
  try {
    const payload = createApplicationSchema.parse(req.body);

    const direction = await pool.query("SELECT id FROM directions WHERE id = $1 AND is_active = true", [
      payload.directionId
    ]);

    if (direction.rowCount === 0) {
      throw new ApiError(400, "Direction is not available");
    }

    const numberResult = await pool.query<{ next_number: string }>(
      `
        SELECT 'APP-' || to_char(now(), 'YYYY') || '-' ||
          lpad((count(*) + 1)::text, 4, '0') AS next_number
        FROM applications
        WHERE date_part('year', created_at) = date_part('year', now())
      `
    );

    const applicationNumber = numberResult.rows[0]?.next_number ?? "APP-2026-0001";

    const result = await pool.query<ApplicationRow>(
      `
        INSERT INTO applications (
          application_number,
          team_name,
          project_name,
          direction_id,
          region,
          participant_name,
          phone,
          email,
          description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          id,
          application_number,
          team_name,
          project_name,
          direction_id,
          (SELECT name FROM directions WHERE id = direction_id) AS direction_name,
          region,
          participant_name,
          phone,
          email,
          description,
          status,
          stage,
          score,
          created_at
      `,
      [
        applicationNumber,
        payload.teamName,
        payload.projectName,
        payload.directionId,
        payload.region,
        payload.participantName,
        payload.phone,
        payload.email ?? null,
        payload.description
      ]
    );

    const application = result.rows[0];
    if (payload.email) {
      const userResult = await pool.query("SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1", [
        payload.email
      ]);
      const user = userResult.rows[0];
      if (user) {
        await createNotification({
          userId: user.id,
          type: "application",
          title: "Yangi ariza yaratildi",
          body: `${application.application_number} raqamli "${application.project_name}" arizasi tizimga saqlandi.`,
          actionUrl: `/profile/${user.id}/applications`,
          actionLabel: "Arizalarni ko'rish"
        });
      }
    }

    res.status(201).json({ data: toApplicationDto(application) });
  } catch (error) {
    next(error);
  }
});

function toApplicationDto(row: ApplicationRow) {
  return {
    id: row.id,
    number: row.application_number,
    teamName: row.team_name,
    projectName: row.project_name,
    direction: {
      id: row.direction_id,
      name: row.direction_name
    },
    region: row.region,
    participantName: row.participant_name,
    phone: row.phone,
    email: row.email,
    description: row.description,
    status: row.status,
    stage: row.stage,
    score: row.score === null ? null : Number(row.score),
    createdAt: row.created_at
  };
}
