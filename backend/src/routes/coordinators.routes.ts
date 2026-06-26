import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { hashPassword } from "../utils/password.js";

export const coordinatorsRouter = Router();

function toDto(row: any) {
  return {
    id: row.id,
    lastName: row.last_name,
    firstName: row.first_name,
    middleName: row.middle_name,
    avatarUrl: row.avatar_url,
    organization: row.organization,
    position: row.position,
    phone: row.phone,
    email: row.email,
    role: row.role,
    location: row.location,
    competition: row.competition,
    login: row.login,
    mustChangePassword: row.must_change_password,
    status: row.status,
    validUntil: row.valid_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const createSchema = z.object({
  lastName: z.string().trim().min(1).max(100),
  firstName: z.string().trim().min(1).max(100),
  middleName: z.string().trim().max(100).optional().or(z.literal("")),
  avatarUrl: z.string().trim().optional().or(z.literal("")),
  organization: z.string().trim().min(1).max(200),
  position: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  role: z.enum(["otm", "region", "city", "province", "secretary", "monitoring"]).default("otm"),
  location: z.string().trim().max(300).optional().or(z.literal("")),
  competition: z.string().trim().max(200).optional().or(z.literal("")),
  login: z.string().trim().min(3).max(80),
  password: z.string().min(6).max(128).optional(),
  status: z.enum(["active", "temp_suspended", "expired"]).default("active"),
  validUntil: z.string().trim().optional().or(z.literal("")),
});

const updateSchema = createSchema.partial().extend({
  password: z.string().min(6).max(128).optional(),
});

// GET /admin/coordinators
coordinatorsRouter.get("/", async (_req, res, next) => {
  try {
    const r = await pool.query(`SELECT * FROM coordinators ORDER BY created_at DESC`);
    res.json({ data: r.rows.map(toDto) });
  } catch (err) { next(err); }
});

// POST /admin/coordinators
coordinatorsRouter.post("/", async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body);
    const rawPassword = payload.password || generatePassword();
    const hash = await hashPassword(rawPassword);

    const r = await pool.query(
      `INSERT INTO coordinators (
        last_name, first_name, middle_name, avatar_url, organization, position,
        phone, email, role, location, competition, login, password_hash,
        must_change_password, status, valid_until
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,$14,$15)
      RETURNING *`,
      [
        payload.lastName, payload.firstName, payload.middleName || null,
        payload.avatarUrl || null, payload.organization, payload.position,
        payload.phone || null, payload.email || null,
        payload.role, payload.location || null, payload.competition || null,
        payload.login, hash, payload.status,
        payload.validUntil || null,
      ]
    );
    res.status(201).json({ data: toDto(r.rows[0]), generatedPassword: rawPassword });
  } catch (err) { next(err); }
});

// PATCH /admin/coordinators/:id
coordinatorsRouter.patch("/:id", async (req, res, next) => {
  try {
    const payload = updateSchema.parse(req.body);
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;

    const fieldMap: Record<string, string> = {
      lastName: "last_name", firstName: "first_name", middleName: "middle_name",
      avatarUrl: "avatar_url", organization: "organization", position: "position",
      phone: "phone", email: "email", role: "role", location: "location",
      competition: "competition", login: "login", status: "status",
      validUntil: "valid_until",
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

    if (sets.length === 0) { res.status(400).json({ error: { message: "No fields to update" } }); return; }

    sets.push(`updated_at = now()`);
    vals.push(req.params.id);

    const r = await pool.query(
      `UPDATE coordinators SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
      vals
    );
    if (r.rowCount === 0) { res.status(404).json({ error: { message: "Coordinator not found" } }); return; }
    res.json({ data: toDto(r.rows[0]), ...(generatedPassword ? { generatedPassword } : {}) });
  } catch (err) { next(err); }
});

// PATCH /admin/coordinators/:id/password
coordinatorsRouter.patch("/:id/password", async (req, res, next) => {
  try {
    const { password } = z.object({ password: z.string().min(6).max(128) }).parse(req.body);
    const hash = await hashPassword(password);
    const r = await pool.query(
      `UPDATE coordinators SET password_hash=$1, must_change_password=true, updated_at=now() WHERE id=$2 RETURNING *`,
      [hash, req.params.id]
    );
    if (r.rowCount === 0) { res.status(404).json({ error: { message: "Coordinator not found" } }); return; }
    res.json({ data: toDto(r.rows[0]) });
  } catch (err) { next(err); }
});

// DELETE /admin/coordinators/:id
coordinatorsRouter.delete("/:id", async (req, res, next) => {
  try {
    const r = await pool.query("DELETE FROM coordinators WHERE id=$1 RETURNING id", [req.params.id]);
    if (r.rowCount === 0) { res.status(404).json({ error: { message: "Coordinator not found" } }); return; }
    res.json({ success: true });
  } catch (err) { next(err); }
});
