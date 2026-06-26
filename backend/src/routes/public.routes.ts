import { Router } from "express";
import { pool } from "../db/pool.js";

export const publicRouter = Router();

publicRouter.get("/directions", async (_req, res, next) => {
  try {
    const result = await pool.query<{
      id: string;
      name: string;
      color: string;
      sort_order: number;
    }>(
      `
        SELECT id, name, color, sort_order
        FROM directions
        WHERE is_active = true
        ORDER BY sort_order ASC, name ASC
      `
    );

    res.json({
      data: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        sortOrder: row.sort_order
      }))
    });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/competitions/active", async (_req, res, next) => {
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
          status,
          created_at
        FROM competitions
        WHERE status IN ('announced', 'applications_open', 'sorting')
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
        status: row.status,
        createdAt: row.created_at,
      }))
    });
  } catch (error) {
    next(error);
  }
});
