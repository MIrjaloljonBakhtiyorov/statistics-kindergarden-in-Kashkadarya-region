import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/http.js";
import { verifyPassword, hashPassword } from "../utils/password.js";

export const judgeAuthRouter = Router();

declare module "express-session" {
  interface SessionData {
    judgeId?: string;
    judgeLogin?: string;
  }
}


judgeAuthRouter.post("/login", async (req, res, next) => {
  try {
    const { login, password } = z.object({
      login: z.string().trim().min(1),
      password: z.string().min(1),
    }).parse(req.body);

    const result = await pool.query(
      `SELECT id, login, password_hash, must_change_password, status,
              first_name, last_name, middle_name, organization, position,
              specialization, experience_years, phone, email,
              avatar_url, judge_category, directions,
              assigned_competition, assigned_stage, assigned_location,
              assigned_projects, eval_start_date, eval_end_date
       FROM judges
       WHERE login = $1
       LIMIT 1`,
      [login]
    );

    const judge = result.rows[0];
    if (!judge?.password_hash) {
      throw new ApiError(401, "Login yoki parol noto'g'ri");
    }

    if (judge.status !== "active") {
      throw new ApiError(403, "Hisobingiz faol emas. Administrator bilan bog'laning.");
    }

    const valid = await verifyPassword(password, judge.password_hash);
    if (!valid) {
      throw new ApiError(401, "Login yoki parol noto'g'ri");
    }

    // Store judge in session
    req.session.judgeId = judge.id;
    req.session.judgeLogin = judge.login;

    await pool.query("UPDATE judges SET updated_at = now() WHERE id = $1", [judge.id]);

    res.json({
      data: {
        id: judge.id,
        login: judge.login,
        firstName: judge.first_name,
        lastName: judge.last_name,
        middleName: judge.middle_name,
        organization: judge.organization,
        position: judge.position,
        specialization: judge.specialization,
        experienceYears: judge.experience_years,
        phone: judge.phone,
        email: judge.email,
        avatarUrl: judge.avatar_url,
        judgeCategory: judge.judge_category,
        directions: judge.directions ?? [],
        assignedCompetition: judge.assigned_competition,
        assignedStage: judge.assigned_stage,
        assignedLocation: judge.assigned_location,
        assignedProjects: judge.assigned_projects,
        evalStartDate: judge.eval_start_date,
        evalEndDate: judge.eval_end_date,
        mustChangePassword: judge.must_change_password,
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/judge/auth/logout ────────────────────────────────────────────
judgeAuthRouter.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("qsl.sid");
    res.json({ success: true });
  });
});

// ─── POST /api/judge/auth/change-password ───────────────────────────────────
judgeAuthRouter.post("/change-password", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId;
    if (!judgeId) throw new ApiError(401, "Tizimga kiring");

    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6).max(128),
    }).parse(req.body);

    const r = await pool.query("SELECT password_hash FROM judges WHERE id = $1", [judgeId]);
    const judge = r.rows[0];
    if (!judge) throw new ApiError(404, "Hakam topilmadi");

    const valid = await verifyPassword(currentPassword, judge.password_hash);
    if (!valid) throw new ApiError(400, "Joriy parol noto'g'ri");

    const newHash = await hashPassword(newPassword);
    await pool.query(
      "UPDATE judges SET password_hash=$1, must_change_password=false, updated_at=now() WHERE id=$2",
      [newHash, judgeId]
    );

    res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/judge/auth/me ──────────────────────────────────────────────────
judgeAuthRouter.get("/me", async (req, res, next) => {
  try {
    const judgeId = req.session.judgeId;
    if (!judgeId) throw new ApiError(401, "Tizimga kiring");

    const r = await pool.query(
      `SELECT id, login, first_name, last_name, middle_name, organization, position,
              specialization, experience_years, phone, email, avatar_url,
              judge_category, directions, assigned_competition, assigned_stage,
              assigned_location, assigned_projects, eval_start_date, eval_end_date,
              must_change_password, status, agreed_criteria, agreed_independent,
              agreed_confidential, agreed_no_conflict, agreed_no_share
       FROM judges WHERE id = $1`,
      [judgeId]
    );

    const judge = r.rows[0];
    if (!judge) throw new ApiError(404, "Hakam topilmadi");

    res.json({
      data: {
        id: judge.id,
        login: judge.login,
        firstName: judge.first_name,
        lastName: judge.last_name,
        middleName: judge.middle_name,
        organization: judge.organization,
        position: judge.position,
        specialization: judge.specialization,
        experienceYears: judge.experience_years,
        phone: judge.phone,
        email: judge.email,
        avatarUrl: judge.avatar_url,
        judgeCategory: judge.judge_category,
        directions: judge.directions ?? [],
        assignedCompetition: judge.assigned_competition,
        assignedStage: judge.assigned_stage,
        assignedLocation: judge.assigned_location,
        assignedProjects: judge.assigned_projects,
        evalStartDate: judge.eval_start_date,
        evalEndDate: judge.eval_end_date,
        mustChangePassword: judge.must_change_password,
        status: judge.status,
        agreedCriteria: judge.agreed_criteria,
        agreedIndependent: judge.agreed_independent,
        agreedConfidential: judge.agreed_confidential,
        agreedNoConflict: judge.agreed_no_conflict,
        agreedNoShare: judge.agreed_no_share,
      }
    });
  } catch (err) {
    next(err);
  }
});
