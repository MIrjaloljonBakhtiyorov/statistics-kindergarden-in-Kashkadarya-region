import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/http.js";
import { createNotification } from "../utils/notifications.js";
import { verifyPassword as comparePassword, hashPassword } from "../utils/password.js";

const userProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  middleName: z.string().trim().max(80).optional(),
  birthDate: z.string().trim().max(20).optional(),
  gender: z.enum(["male", "female", ""]).optional(),
  pinfl: z.string().trim().max(20).optional(),
  passportSeries: z.string().trim().max(8).optional(),
  passportNumber: z.string().trim().max(16).optional(),
  phone: z.string().trim().max(32).optional(),
  email: z.string().trim().toLowerCase().email().max(180).optional().or(z.literal("")),
  telegram: z.string().trim().max(80).optional(),
  region: z.string().trim().max(140).optional(),
  district: z.string().trim().max(140).optional(),
  mahalla: z.string().trim().max(140).optional(),
  street: z.string().trim().max(220).optional(),
  institution: z.string().trim().max(220).optional(),
  avatarUrl: z.preprocess((value) => value === null ? undefined : value, z.string().trim().max(1000).optional())
});

const userParticipationSchema = z.object({
  participationType: z.enum(["otm", "university", "independent", "team"]).optional(),
  employmentStatus: z.enum(["student", "master", "phd", "developer", "entrepreneur", "unemployed", "other", ""]).optional(),
  institution: z.preprocess((value) => value === null ? undefined : value, z.string().trim().max(220).optional()),
  faculty: z.preprocess((value) => value === null ? undefined : value, z.string().trim().max(220).optional()),
  course: z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z.coerce.number().int().min(1).max(6).optional()
  ),
  educationDirection: z.preprocess((value) => value === null ? undefined : value, z.string().trim().max(220).optional()),
  district: z.preprocess((value) => value === null ? undefined : value, z.string().trim().max(140).optional())
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parolni kiriting"),
  newPassword: z.string().min(6, "Yangi parol kamida 6 ta belgi bo'lishi kerak"),
});

const sendPhoneVerificationSchema = z.object({
  phone: z.string().trim().regex(/^\+998\d{9}$/, "Noto'g'ri telefon format"),
});

const verifyPhoneSchema = z.object({
  phone: z.string().trim().regex(/^\+998\d{9}$/, "Noto'g'ri telefon format"),
  code: z.string().trim().length(6, "Kod 6 ta raqamdan iborat bo'lishi kerak"),
});

const sendEmailVerificationSchema = z.object({
  email: z.string().trim().email("Noto'g'ri email format"),
});

const verifyEmailSchema = z.object({
  email: z.string().trim().email("Noto'g'ri email format"),
  code: z.string().trim().length(6, "Kod 6 ta raqamdan iborat bo'lishi kerak"),
});

const toggleTwoFactorSchema = z.object({
  enabled: z.boolean(),
});

const createNotificationSchema = z.object({
  type: z.enum(["application", "team", "sorting", "result", "monitoring", "system"]),
  title: z.string().trim().min(2).max(180),
  body: z.string().trim().min(2).max(1000),
  actionUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  actionLabel: z.string().trim().max(120).optional().or(z.literal(""))
});

const optionalText = (max: number) => z.preprocess(
  (value) => value === null || value === "" ? undefined : value,
  z.string().trim().max(max).optional()
);

const createUserApplicationSchema = z.object({
  userId: z.string().uuid(),
  projectName: z.string().trim().min(2).max(180),
  direction: z.string().trim().min(2).max(80),
  goal: z.string().trim().min(10).max(2000),
  problem: z.string().trim().min(10).max(2000),
  presentationUrl: optionalText(500),
  videoUrl: optionalText(500),
  demoUrl: optionalText(500),
  githubUrl: optionalText(500),
  websiteUrl: optionalText(500),
  presentationFile: z.object({
    name: z.string().trim().min(1).max(220),
    contentType: z.string().trim().max(120),
    data: z.string().min(1)
  }).optional(),
  videoFile: z.object({
    name: z.string().trim().min(1).max(220),
    contentType: z.string().trim().max(120),
    data: z.string().min(1)
  }).optional(),
  demoFile: z.object({
    name: z.string().trim().min(1).max(220),
    contentType: z.string().trim().max(120),
    data: z.string().min(1)
  }).optional()
});

export const usersRouter = Router();

usersRouter.get("/:id/overview", async (req, res, next) => {
  try {
    const [profileResult, applicationsResult, notificationsResult] = await Promise.all([
      pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]),
      pool.query(
        `
          SELECT 
            id,
            user_id,
            project_name,
            direction,
            goal,
            problem,
            presentation_url,
            video_url,
            demo_url,
            github_url,
            website_url,
            application_number,
            admin_application_id,
            status,
            created_at,
            updated_at
          FROM user_applications
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 12
        `,
        [req.params.id]
      ),
      pool.query(
        `
          SELECT
            id,
            type,
            title,
            body,
            action_url,
            action_label,
            is_read,
            created_at
          FROM notifications
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 20
        `,
        [req.params.id]
      )
    ]);

    const profile = profileResult.rows[0];
    if (!profile) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    res.json({
      data: {
        profile: toUserProfileDto(profile),
        applications: applicationsResult.rows.map(toUserApplicationDto),
        notifications: notificationsResult.rows.map(toNotificationDto)
      }
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:id/profile", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM users
        WHERE id = $1
      `,
      [req.params.id]
    );

    const row = result.rows[0];
    if (!row) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    res.json({ data: toUserProfileDto(row) });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/:id/profile", async (req, res, next) => {
  try {
    await assertProfileEditable(req.params.id);
    const payload = userProfileSchema.parse(req.body);

    const result = await pool.query(
      `
        UPDATE users
        SET
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          middle_name = COALESCE($4, middle_name),
          birth_date = COALESCE(NULLIF($5::text, '')::date, birth_date),
          gender = COALESCE(NULLIF($6, ''), gender),
          pinfl = COALESCE($7, pinfl),
          passport_series = COALESCE($8, passport_series),
          passport_number = COALESCE($9, passport_number),
          phone = COALESCE($10, phone),
          email = COALESCE(NULLIF($11, ''), email),
          telegram = COALESCE($12, telegram),
          region = COALESCE($13, region),
          district = COALESCE($14, district),
          mahalla = COALESCE($15, mahalla),
          street = COALESCE($16, street),
          institution = COALESCE($17, institution),
          avatar_url = COALESCE($18, avatar_url),
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [
        req.params.id,
        payload.firstName,
        payload.lastName,
        payload.middleName,
        payload.birthDate,
        payload.gender,
        payload.pinfl,
        payload.passportSeries,
        payload.passportNumber,
        payload.phone,
        payload.email,
        payload.telegram,
        payload.region,
        payload.district,
        payload.mahalla,
        payload.street,
        payload.institution,
        payload.avatarUrl
      ]
    );

    const row = result.rows[0];
    if (!row) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    // Profil to'ldirilganligini hisoblash va yangilash
    const completion = calculateProfileCompletion(row);
    await pool.query(
      "UPDATE users SET profile_completion = $2 WHERE id = $1",
      [req.params.id, completion]
    );

    row.profile_completion = completion;
    if (req.header("X-Profile-Save-Mode") !== "auto") {
      await createNotification({
        userId: req.params.id,
        type: "system",
        title: "Profil tahrirlandi",
        body: "Shaxsiy ma'lumotlaringiz muvaffaqiyatli yangilandi.",
        actionUrl: `/profile/${req.params.id}/personal`,
        actionLabel: "Profilni ko'rish"
      });
    }
    res.json({ data: toUserProfileDto(row) });
  } catch (error) {
    if (isUniqueEmailError(error)) {
      next(new ApiError(409, "Bu email boshqa foydalanuvchiga biriktirilgan"));
      return;
    }
    next(error);
  }
});

usersRouter.patch("/:id/participation", async (req, res, next) => {
  try {
    await assertProfileEditable(req.params.id);
    const payload = userParticipationSchema.parse(req.body);
    const participationType = payload.participationType === "university" ? "otm" : payload.participationType;

    const result = await pool.query(
      `
        UPDATE users
        SET
          participation_type = COALESCE($2, participation_type),
          employment_status = COALESCE(NULLIF($3, ''), employment_status),
          institution = CASE
            WHEN $2 IS NOT NULL AND $2 <> 'otm' THEN NULL
            ELSE COALESCE($4, institution)
          END,
          faculty = CASE
            WHEN $2 IS NOT NULL AND $2 <> 'otm' THEN NULL
            ELSE COALESCE($5, faculty)
          END,
          course = CASE
            WHEN $2 IS NOT NULL AND $2 <> 'otm' THEN NULL
            ELSE COALESCE($6, course)
          END,
          education_direction = CASE
            WHEN $2 IS NOT NULL AND $2 <> 'otm' THEN NULL
            ELSE COALESCE($7, education_direction)
          END,
          district = COALESCE($8, district),
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [
        req.params.id,
        participationType,
        payload.employmentStatus,
        payload.institution,
        payload.faculty,
        payload.course,
        payload.educationDirection,
        payload.district
      ]
    );

    const row = result.rows[0];
    if (!row) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    const completion = calculateProfileCompletion(row);
    await pool.query(
      "UPDATE users SET profile_completion = $2 WHERE id = $1",
      [req.params.id, completion]
    );
    row.profile_completion = completion;

    await createNotification({
      userId: req.params.id,
      type: "system",
      title: "Ishtirok ma'lumotlari saqlandi",
      body: "Tanlovdagi ishtirok ma'lumotlaringiz muvaffaqiyatli yangilandi.",
      actionUrl: `/profile/${req.params.id}/participation`,
      actionLabel: "Ko'rish"
    });

    res.json({ data: toUserProfileDto(row) });
  } catch (error) {
    next(error);
  }
});

function toUserProfileDto(row: any) {
  const birthDate = row.birth_date ? new Date(row.birth_date).toISOString().slice(0, 10) : "";

  return {
    id: row.id,
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    middleName: row.middle_name ?? "",
    birthDate,
    age: calculateAge(birthDate),
    gender: row.gender ?? "",
    pinfl: row.pinfl ?? "",
    passportSeries: row.passport_series ?? "",
    passportNumber: row.passport_number ?? "",
    phone: row.phone ?? "",
    phoneVerified: row.phone_verified ?? false,
    email: row.email ?? "",
    emailVerified: row.email_verified ?? false,
    telegram: row.telegram ?? "",
    region: row.region ?? "",
    district: row.district ?? "",
    mahalla: row.mahalla ?? "",
    street: row.street ?? "",
    role: row.role ?? "participant",
    participationType: row.participation_type ?? "university",
    employmentStatus: row.employment_status ?? "other",
    institution: row.institution ?? "",
    faculty: row.faculty ?? "",
    educationDirection: row.education_direction ?? "",
    course: row.course ?? undefined,
    profileCompletion: row.profile_completion ?? 25,
    profileLocked: row.profile_locked ?? false,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.registered_at,
    lastLogin: row.last_login ?? row.registered_at
  };
}

function toNotificationDto(row: any) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    isRead: row.is_read,
    actionUrl: row.action_url ?? undefined,
    actionLabel: row.action_label ?? undefined,
    createdAt: row.created_at
  };
}

function toUserApplicationDto(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    projectName: row.project_name,
    direction: row.direction,
    goal: row.goal,
    problem: row.problem,
    presentationUrl: row.presentation_url,
    videoUrl: row.video_url,
    demoUrl: row.demo_url,
    githubUrl: row.github_url,
    websiteUrl: row.website_url,
    applicationNumber: row.application_number,
    adminApplicationId: row.admin_application_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function calculateAge(birthDate: string) {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

async function assertProfileEditable(userId: string) {
  const result = await pool.query<{ profile_locked: boolean }>(
    "SELECT profile_locked FROM users WHERE id = $1",
    [userId]
  );
  const row = result.rows[0];
  if (!row) {
    throw new ApiError(404, "Foydalanuvchi topilmadi");
  }
  if (row.profile_locked) {
    throw new ApiError(423, "Siz ma'lumotlarni o'zgartira olmaysiz. Ariza yuborilgandan keyin profil ma'lumotlari qulflanadi.");
  }
}

function getApplicationReadiness(user: any) {
  const missing: string[] = [];
  const has = (value: unknown) => typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;

  if (!has(user.last_name)) missing.push("familiya");
  if (!has(user.first_name)) missing.push("ism");
  if (!has(user.birth_date)) missing.push("tug'ilgan sana");
  if (!has(user.gender)) missing.push("jinsi");
  if (!has(user.pinfl)) missing.push("JShShIR");
  if (!has(user.passport_series)) missing.push("pasport seriyasi");
  if (!has(user.passport_number)) missing.push("pasport raqami");
  if (!has(user.phone)) missing.push("telefon raqami");
  if (!has(user.region)) missing.push("viloyat");
  if (!has(user.district)) missing.push("tuman/shahar");
  if (!has(user.participation_type)) missing.push("ishtirok turi");

  if (user.participation_type === "otm" || user.participation_type === "university") {
    if (!has(user.institution)) missing.push("OTM nomi");
    if (!has(user.faculty)) missing.push("fakultet");
    if (!has(user.education_direction)) missing.push("ta'lim yo'nalishi");
    if (!has(user.course)) missing.push("kurs");
  } else if (!has(user.district)) {
    missing.push("qatnashadigan tuman/shahar");
  }

  return {
    ready: missing.length === 0,
    missing
  };
}

async function resolveDirectionId(client: any, direction: string) {
  const normalized = direction.trim().toLowerCase();
  const result = await client.query(
    `
      SELECT id
      FROM directions
      WHERE id = $1 OR lower(name) = $1
      LIMIT 1
    `,
    [normalized]
  );

  if (result.rows[0]?.id) {
    return result.rows[0].id;
  }

  const fallback = await client.query(
    "SELECT id FROM directions WHERE id = 'other' AND is_active = true LIMIT 1"
  );
  return fallback.rows[0]?.id ?? "other";
}

async function saveApplicationUpload(
  userId: string,
  kind: "presentation" | "video" | "demo",
  file: { name: string; contentType: string; data: string }
) {
  const commaIndex = file.data.indexOf(",");
  const base64 = commaIndex >= 0 ? file.data.slice(commaIndex + 1) : file.data;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > 75 * 1024 * 1024) {
    throw new ApiError(400, "Fayl hajmi 75 MB dan oshmasligi kerak");
  }

  const safeName = file.name
    .replace(/[^\w.\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 160) || `${kind}-file`;
  const folder = path.join(process.cwd(), "uploads", "applications", userId);
  await fs.mkdir(folder, { recursive: true });

  const filename = `${Date.now()}-${kind}-${safeName}`;
  await fs.writeFile(path.join(folder, filename), buffer);
  return `/uploads/applications/${userId}/${filename}`;
}

function isUniqueEmailError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// XAVFSIZLIK ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parolni o'zgartirish
 */
usersRouter.post("/:id/security/change-password", async (req, res, next) => {
  try {
    const payload = changePasswordSchema.parse(req.body);

    // Foydalanuvchini topish va joriy parolni tekshirish
    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.params.id]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    const user = userResult.rows[0];
    if (!user.password_hash) {
      throw new ApiError(400, "Parol o'rnatilmagan");
    }

    const isPasswordValid = await comparePassword(payload.currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, "Joriy parol noto'g'ri");
    }

    // Yangi parolni hash qilish va saqlash
    const newPasswordHash = await hashPassword(payload.newPassword);

    await pool.query(
      `
        UPDATE users
        SET password_hash = $2,
            last_password_change = now(),
            updated_at = now()
        WHERE id = $1
      `,
      [req.params.id, newPasswordHash]
    );

    await createNotification({
      userId: req.params.id,
      type: "system",
      title: "Parol o'zgartirildi",
      body: "Hisobingiz paroli yangilandi. Keyingi kirishda yangi paroldan foydalaning.",
      actionUrl: `/profile/${req.params.id}/settings`,
      actionLabel: "Sozlamalar"
    });

    res.json({
      success: true,
      message: "Parol muvaffaqiyatli o'zgartirildi"
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:id/notifications", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          type,
          title,
          body,
          is_read,
          action_url,
          action_label,
          created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 100
      `,
      [req.params.id]
    );

    res.json({ data: result.rows.map(toNotificationDto) });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/:id/notifications", async (req, res, next) => {
  try {
    const payload = createNotificationSchema.parse(req.body);

    const userResult = await pool.query("SELECT id FROM users WHERE id = $1", [req.params.id]);
    if (userResult.rows.length === 0) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    await createNotification({
      userId: req.params.id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      actionUrl: payload.actionUrl || null,
      actionLabel: payload.actionLabel || null
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/:id/notifications/:notificationId/read", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `,
      [req.params.notificationId, req.params.id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Bildirishnoma topilmadi");
    }

    res.json({ data: toNotificationDto(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/:id/notifications/read-all", async (req, res, next) => {
  try {
    await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:id/notifications/:notificationId", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.notificationId, req.params.id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Bildirishnoma topilmadi");
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Telefon uchun tasdiqlash kodi yuborish
 */
usersRouter.post("/:id/security/send-phone-verification", async (req, res, next) => {
  try {
    const payload = sendPhoneVerificationSchema.parse(req.body);

    // 6 xonali tasodifiy kod generatsiya qilish
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa

    await pool.query(
      `
        UPDATE users
        SET phone_verification_code = $2,
            phone_verification_expires = $3,
            updated_at = now()
        WHERE id = $1
      `,
      [req.params.id, code, expiresAt]
    );

    // TODO: Real SMS yuborish integratsiyasi (Eskiz.uz, Playmobile.uz)
    console.log(`📱 SMS kod yuborildi: ${payload.phone} → ${code}`);

    res.json({
      success: true,
      message: "SMS kod yuborildi",
      // Development uchun kodni qaytarish (production da o'chirish kerak!)
      ...(process.env.NODE_ENV === "development" && { code })
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Telefon kodini tasdiqlash
 */
usersRouter.post("/:id/security/verify-phone", async (req, res, next) => {
  try {
    const payload = verifyPhoneSchema.parse(req.body);

    const result = await pool.query(
      `
        SELECT phone_verification_code, phone_verification_expires
        FROM users
        WHERE id = $1 AND phone = $2
      `,
      [req.params.id, payload.phone]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Foydalanuvchi topilmadi yoki telefon mos kelmadi");
    }

    const user = result.rows[0];

    if (!user.phone_verification_code) {
      throw new ApiError(400, "Tasdiqlash kodi yuborilmagan");
    }

    if (new Date() > new Date(user.phone_verification_expires)) {
      throw new ApiError(400, "Tasdiqlash kodi muddati tugagan");
    }

    if (user.phone_verification_code !== payload.code) {
      throw new ApiError(400, "Noto'g'ri tasdiqlash kodi");
    }

    // Telefon tasdiqlangan deb belgilash va kodlarni tozalash
    await pool.query(
      `
        UPDATE users
        SET phone_verified = true,
            phone_verification_code = NULL,
            phone_verification_expires = NULL,
            updated_at = now()
        WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Telefon muvaffaqiyatli tasdiqlandi"
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Email uchun tasdiqlash kodi yuborish
 */
usersRouter.post("/:id/security/send-email-verification", async (req, res, next) => {
  try {
    const payload = sendEmailVerificationSchema.parse(req.body);

    // 6 xonali tasodifiy kod
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 daqiqa

    await pool.query(
      `
        UPDATE users
        SET email_verification_code = $2,
            email_verification_expires = $3,
            updated_at = now()
        WHERE id = $1
      `,
      [req.params.id, code, expiresAt]
    );

    // TODO: Real email yuborish integratsiyasi (NodeMailer, SendGrid, AWS SES)
    console.log(`📧 Email kod yuborildi: ${payload.email} → ${code}`);

    res.json({
      success: true,
      message: "Email kod yuborildi",
      // Development uchun kodni qaytarish (production da o'chirish kerak!)
      ...(process.env.NODE_ENV === "development" && { code })
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Email kodini tasdiqlash
 */
usersRouter.post("/:id/security/verify-email", async (req, res, next) => {
  try {
    const payload = verifyEmailSchema.parse(req.body);

    const result = await pool.query(
      `
        SELECT email_verification_code, email_verification_expires
        FROM users
        WHERE id = $1 AND LOWER(email) = LOWER($2)
      `,
      [req.params.id, payload.email]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Foydalanuvchi topilmadi yoki email mos kelmadi");
    }

    const user = result.rows[0];

    if (!user.email_verification_code) {
      throw new ApiError(400, "Tasdiqlash kodi yuborilmagan");
    }

    if (new Date() > new Date(user.email_verification_expires)) {
      throw new ApiError(400, "Tasdiqlash kodi muddati tugagan");
    }

    if (user.email_verification_code !== payload.code) {
      throw new ApiError(400, "Noto'g'ri tasdiqlash kodi");
    }

    // Email tasdiqlangan deb belgilash va kodlarni tozalash
    await pool.query(
      `
        UPDATE users
        SET email_verified = true,
            email_verification_code = NULL,
            email_verification_expires = NULL,
            updated_at = now()
        WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Email muvaffaqiyatli tasdiqlandi"
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Ikki bosqichli himoyani yoqish/o'chirish
 */
usersRouter.post("/:id/security/toggle-2fa", async (req, res, next) => {
  try {
    const payload = toggleTwoFactorSchema.parse(req.body);

    // Agar 2FA yoqilayotgan bo'lsa, telefon tasdiqlangan bo'lishi kerak
    if (payload.enabled) {
      const result = await pool.query(
        "SELECT phone_verified FROM users WHERE id = $1",
        [req.params.id]
      );

      if (result.rows.length === 0) {
        throw new ApiError(404, "Foydalanuvchi topilmadi");
      }

      if (!result.rows[0].phone_verified) {
        throw new ApiError(400, "Avval telefon raqamingizni tasdiqlang");
      }
    }

    await pool.query(
      `
        UPDATE users
        SET two_factor_enabled = $2,
            updated_at = now()
        WHERE id = $1
      `,
      [req.params.id, payload.enabled]
    );

    res.json({
      success: true,
      message: payload.enabled ? "2FA yoqildi" : "2FA o'chirildi",
      twoFactorEnabled: payload.enabled
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Xavfsizlik holatini olish
 */
usersRouter.get("/:id/security/status", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT
          phone_verified,
          email_verified,
          two_factor_enabled,
          last_password_change
        FROM users
        WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    const user = result.rows[0];

    res.json({
      data: {
        phoneVerified: user.phone_verified ?? false,
        emailVerified: user.email_verified ?? false,
        twoFactorEnabled: user.two_factor_enabled ?? false,
        lastPasswordChange: user.last_password_change
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Profil to'ldirilganligini hisoblash (0-100%)
 */
function calculateProfileCompletion(user: any): number {
  let completed = 0;
  const totalFields = 12;

  // Asosiy ma'lumotlar (4 ball)
  if (user.first_name?.trim()) completed++;
  if (user.last_name?.trim()) completed++;
  if (user.birth_date) completed++;
  if (user.gender) completed++;

  // Hujjatlar (2 ball)
  if (user.pinfl?.trim()) completed++;
  if (user.passport_series?.trim() && user.passport_number?.trim()) completed++;

  // Aloqa (3 ball)
  if (user.phone?.trim()) completed++;
  if (user.phone_verified) completed++;
  if (user.email?.trim()) completed++;

  // Manzil (2 ball)
  if (user.region?.trim()) completed++;
  if (user.district?.trim()) completed++;

  // Avatar (1 ball)
  if (user.avatar_url?.trim()) completed++;

  return Math.round((completed / totalFields) * 100);
}

// ═══════════════════════════════════════════════════════════════════════════
// USER APPLICATIONS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Foydalanuvchining barcha arizalarini olish
 */
usersRouter.get("/:id/applications", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT 
          id,
          user_id,
          project_name,
          direction,
          goal,
          problem,
          presentation_url,
          video_url,
          demo_url,
          github_url,
            website_url,
            application_number,
            admin_application_id,
            status,
          created_at,
          updated_at
        FROM user_applications
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    res.json({ data: result.rows.map(toUserApplicationDto) });
  } catch (error) {
    next(error);
  }
});

/**
 * Yangi ariza yaratish
 */
usersRouter.post("/:id/applications", async (req, res, next) => {
  try {
    const payload = createUserApplicationSchema.parse(req.body);

    // User ID ni tekshirish
    if (payload.userId !== req.params.id) {
      throw new ApiError(403, "Faqat o'z arizangizni yaratishingiz mumkin");
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.params.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    const readiness = getApplicationReadiness(user);
    if (!readiness.ready) {
      throw new ApiError(400, `Ariza yuborishdan oldin quyidagi ma'lumotlarni to'ldiring: ${readiness.missing.join(", ")}`);
    }

    const presentationUrl = payload.presentationFile
      ? await saveApplicationUpload(req.params.id, "presentation", payload.presentationFile)
      : payload.presentationUrl;
    const videoUrl = payload.videoFile
      ? await saveApplicationUpload(req.params.id, "video", payload.videoFile)
      : payload.videoUrl;
    const demoUrl = payload.demoFile
      ? await saveApplicationUpload(req.params.id, "demo", payload.demoFile)
      : payload.demoUrl;

    const client = await pool.connect();
    let row: any;
    try {
      await client.query("BEGIN");

      const numberResult = await client.query<{ next_number: string }>(
        `
          SELECT 'QSL-' || to_char(now(), 'YYYY') || '-' ||
            lpad((count(*) + 1)::text, 4, '0') AS next_number
          FROM user_applications
          WHERE date_part('year', created_at) = date_part('year', now())
        `
      );
      const applicationNumber = numberResult.rows[0]?.next_number ?? "QSL-2026-0001";
      const directionId = await resolveDirectionId(client, payload.direction);
      const participantName = `${user.last_name ?? ""} ${user.first_name ?? ""}`.trim();
      const region = user.participation_type === "otm"
        ? (user.institution ?? user.region ?? "OTM")
        : (user.district ?? user.region ?? "Hudud");
      const description = `Maqsad: ${payload.goal}\n\nMazmun/mohiyat va muammo: ${payload.problem}`;

      const userAppResult = await client.query(
        `
          INSERT INTO user_applications (
            user_id,
            project_name,
            direction,
            goal,
            problem,
            presentation_url,
            video_url,
            demo_url,
            github_url,
            website_url,
            application_number
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING
            id,
            user_id,
            project_name,
            direction,
            goal,
            problem,
            presentation_url,
            video_url,
            demo_url,
            github_url,
            website_url,
            application_number,
            admin_application_id,
            status,
            created_at,
            updated_at
        `,
        [
          payload.userId,
          payload.projectName,
          payload.direction,
          payload.goal,
          payload.problem,
          presentationUrl || null,
          videoUrl || null,
          demoUrl || null,
          payload.githubUrl || null,
          payload.websiteUrl || null,
          applicationNumber
        ]
      );

      row = userAppResult.rows[0];
      const adminAppResult = await client.query<{ id: string }>(
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
            description,
            user_id,
            source_user_application_id,
            participation_type,
            institution,
            district,
            project_goal,
            project_problem,
            presentation_url,
            video_url,
            demo_url,
            github_url,
            website_url
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          RETURNING id
        `,
        [
          applicationNumber,
          participantName || payload.projectName,
          payload.projectName,
          directionId,
          region,
          participantName || "Ishtirokchi",
          user.phone,
          user.email,
          description,
          user.id,
          row.id,
          user.participation_type,
          user.institution,
          user.district,
          payload.goal,
          payload.problem,
          presentationUrl || null,
          videoUrl || null,
          demoUrl || null,
          payload.githubUrl || null,
          payload.websiteUrl || null
        ]
      );

      await client.query(
        "UPDATE user_applications SET admin_application_id = $1 WHERE id = $2",
        [adminAppResult.rows[0].id, row.id]
      );
      row.admin_application_id = adminAppResult.rows[0].id;

      await client.query(
        "UPDATE users SET profile_locked = true, profile_status = 'complete', updated_at = now() WHERE id = $1",
        [req.params.id]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    // Bildirishnoma yaratish
    await createNotification({
      userId: req.params.id,
      type: "application",
      title: "Yangi ariza yaratildi",
      body: `"${payload.projectName}" loyihasi uchun ariza muvaffaqiyatli yaratildi.`,
      actionUrl: `/profile/${req.params.id}/applications`,
      actionLabel: "Arizalarni ko'rish"
    });

    res.status(201).json({
      data: {
        id: row.id,
        userId: row.user_id,
        projectName: row.project_name,
        direction: row.direction,
        goal: row.goal,
        problem: row.problem,
        presentationUrl: row.presentation_url,
        videoUrl: row.video_url,
        demoUrl: row.demo_url,
        githubUrl: row.github_url,
        websiteUrl: row.website_url,
        applicationNumber: row.application_number,
        adminApplicationId: row.admin_application_id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:id/applications/:applicationId", async (req, res, next) => {
  try {
    const payload = createUserApplicationSchema.parse(req.body);

    if (payload.userId !== req.params.id) {
      throw new ApiError(403, "Faqat o'z arizangizni tahrirlashingiz mumkin");
    }

    const existingResult = await pool.query(
      `
        SELECT ua.*, u.participation_type, u.institution, u.district, u.region, u.phone, u.email,
               u.first_name, u.last_name
        FROM user_applications ua
        JOIN users u ON u.id = ua.user_id
        WHERE ua.id = $1 AND ua.user_id = $2
      `,
      [req.params.applicationId, req.params.id]
    );

    const existing = existingResult.rows[0];
    if (!existing) {
      throw new ApiError(404, "Ariza topilmadi");
    }
    if (["accepted", "next_stage"].includes(existing.status)) {
      throw new ApiError(423, "Admin loyihani qabul qilganidan keyin arizani o'zgartirib bo'lmaydi.");
    }

    const presentationUrl = payload.presentationFile
      ? await saveApplicationUpload(req.params.id, "presentation", payload.presentationFile)
      : payload.presentationUrl;
    const videoUrl = payload.videoFile
      ? await saveApplicationUpload(req.params.id, "video", payload.videoFile)
      : payload.videoUrl;
    const demoUrl = payload.demoFile
      ? await saveApplicationUpload(req.params.id, "demo", payload.demoFile)
      : payload.demoUrl;

    const client = await pool.connect();
    let row: any;
    try {
      await client.query("BEGIN");
      const updated = await client.query(
        `
          UPDATE user_applications
          SET
            project_name = $3,
            direction = $4,
            goal = $5,
            problem = $6,
            presentation_url = $7,
            video_url = $8,
            demo_url = $9,
            github_url = $10,
            website_url = $11,
            status = CASE WHEN status = 'rejected' THEN 'submitted' ELSE status END,
            updated_at = now()
          WHERE id = $1 AND user_id = $2 AND status NOT IN ('accepted', 'next_stage')
          RETURNING *
        `,
        [
          req.params.applicationId,
          req.params.id,
          payload.projectName,
          payload.direction,
          payload.goal,
          payload.problem,
          presentationUrl || null,
          videoUrl || null,
          demoUrl || null,
          payload.githubUrl || null,
          payload.websiteUrl || null
        ]
      );

      row = updated.rows[0];
      if (!row) {
        throw new ApiError(423, "Bu arizani o'zgartirib bo'lmaydi.");
      }

      const directionId = await resolveDirectionId(client, payload.direction);
      const participantName = `${existing.last_name ?? ""} ${existing.first_name ?? ""}`.trim();
      const region = existing.participation_type === "otm"
        ? (existing.institution ?? existing.region ?? "OTM")
        : (existing.district ?? existing.region ?? "Hudud");
      const description = `Maqsad: ${payload.goal}\n\nMazmun/mohiyat va muammo: ${payload.problem}`;

      await client.query(
        `
          UPDATE applications
          SET
            team_name = $2,
            project_name = $3,
            direction_id = $4,
            region = $5,
            participant_name = $6,
            phone = $7,
            email = $8,
            description = $9,
            participation_type = $10,
            institution = $11,
            district = $12,
            project_goal = $13,
            project_problem = $14,
            presentation_url = $15,
            video_url = $16,
            demo_url = $17,
            github_url = $18,
            website_url = $19,
            status = CASE WHEN status = 'rejected' THEN 'submitted' ELSE status END,
            updated_at = now()
          WHERE source_user_application_id = $1 AND status NOT IN ('accepted', 'next_stage')
        `,
        [
          row.id,
          participantName || payload.projectName,
          payload.projectName,
          directionId,
          region,
          participantName || "Ishtirokchi",
          existing.phone,
          existing.email,
          description,
          existing.participation_type,
          existing.institution,
          existing.district,
          payload.goal,
          payload.problem,
          presentationUrl || null,
          videoUrl || null,
          demoUrl || null,
          payload.githubUrl || null,
          payload.websiteUrl || null
        ]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    await createNotification({
      userId: req.params.id,
      type: "application",
      title: "Ariza yangilandi",
      body: `"${payload.projectName}" loyihasi ma'lumotlari yangilandi.`,
      actionUrl: `/profile/${req.params.id}/applications`,
      actionLabel: "Arizani ko'rish"
    });

    res.json({ data: toUserApplicationDto(row) });
  } catch (error) {
    next(error);
  }
});
