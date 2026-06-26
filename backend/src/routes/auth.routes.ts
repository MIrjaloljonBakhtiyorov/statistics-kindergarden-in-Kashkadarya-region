import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/http.js";
import { createNotification } from "../utils/notifications.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(180),
  password: z.string().min(8).max(128),
  participationType: z.enum(["university", "independent", "team"]),
  institution: z.string().trim().max(220).optional().or(z.literal("")),
  region: z.string().trim().max(140).optional().or(z.literal(""))
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1)
});

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const passwordHash = await hashPassword(payload.password);

    const result = await pool.query(
      `
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password_hash,
          participation_type,
          institution,
          region
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
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
      [
        payload.firstName,
        payload.lastName,
        payload.email,
        passwordHash,
        payload.participationType,
        payload.institution || null,
        payload.region || null
      ]
    );

    const user = result.rows[0];
    await createNotification({
      userId: user.id,
      type: "system",
      title: "Ro'yxatdan o'tdingiz",
      body: "Shaxsiy kabinetingiz yaratildi. Profil ma'lumotlarini to'ldirishni davom ettiring.",
      actionUrl: `/profile/${user.id}/personal`,
      actionLabel: "Profilni to'ldirish"
    });
    await createNotification({
      userId: user.id,
      type: "sorting",
      title: "Qashqadaryo Startup Ligasi yangiliklari",
      body: "Musobaqa bosqichlari, saralash va natijalar bo'yicha xabarlar shu yerda saqlanadi.",
      actionUrl: `/profile/${user.id}/overview`,
      actionLabel: "Kabinetni ko'rish"
    });

    res.status(201).json({ data: toUserDto(user) });
  } catch (error) {
    if (isUniqueEmailError(error)) {
      next(new ApiError(409, "Bu email bilan foydalanuvchi allaqachon ro'yxatdan o'tgan"));
      return;
    }
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const normalizedIdentifier = payload.identifier.replace(/\s/g, "").toLowerCase();

    const result = await pool.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          password_hash,
          role,
          participation_type,
          institution,
          region,
          status,
          registered_at,
          last_login
        FROM users
        WHERE lower(email) = $1 OR regexp_replace(coalesce(phone, ''), '\\s', '', 'g') = $2
        LIMIT 1
      `,
      [normalizedIdentifier, normalizedIdentifier]
    );

    const user = result.rows[0];
    if (!user?.password_hash) {
      throw new ApiError(401, "Login yoki parol noto'g'ri");
    }

    const isPasswordValid = await verifyPassword(payload.password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, "Login yoki parol noto'g'ri");
    }

    await pool.query("UPDATE users SET last_login = now(), updated_at = now() WHERE id = $1", [user.id]);

    res.json({
      data: {
        ...toUserDto(user),
        phone: user.phone ?? ""
      }
    });
  } catch (error) {
    next(error);
  }
});

export function toUserDto(row: any) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    participationType: row.participation_type,
    institution: row.institution,
    region: row.region,
    status: row.status,
    registeredAt: row.registered_at,
    lastLogin: row.last_login
  };
}

function isUniqueEmailError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
