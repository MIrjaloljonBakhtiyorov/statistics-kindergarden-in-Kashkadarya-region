import { OAuth2Client } from "google-auth-library";
import { Router } from "express";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/http.js";
import { env } from "../config/env.js";
import { createNotification } from "../utils/notifications.js";

export const googleAuthRouter = Router();

const oauthClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

// ─── CSRF state store (in-memory, production'da Redis ishlating) ─────────────
const pendingStates = new Map<string, { nonce: string; createdAt: number }>();

// 10 daqiqa amal qiladi
const STATE_TTL_MS = 10 * 60 * 1000;

function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function cleanExpiredStates() {
  const now = Date.now();
  for (const [key, value] of pendingStates.entries()) {
    if (now - value.createdAt > STATE_TTL_MS) {
      pendingStates.delete(key);
    }
  }
}

// ─── GET /api/auth/google — OAuth jarayonini boshlash ────────────────────────
googleAuthRouter.get("/google", (_req, res) => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new ApiError(503, "Google autentifikatsiya sozlanmagan");
  }

  cleanExpiredStates();

  const state = generateToken(32);
  const nonce = generateToken(32);
  pendingStates.set(state, { nonce, createdAt: Date.now() });

  const authUrl = oauthClient.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    state,
    nonce,
    prompt: "select_account"
  });

  res.redirect(authUrl);
});

// ─── GET /api/auth/google/callback — Google'dan qaytish ─────────────────────
googleAuthRouter.get("/google/callback", async (req, res, next) => {
  try {
    const { code, state, error: oauthError } = req.query as Record<string, string>;

    const frontendUrl = env.FRONTEND_URL;

    // Foydalanuvchi bekor qilgan
    if (oauthError === "access_denied") {
      return res.redirect(`${frontendUrl}/register?google_error=cancelled`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/register?google_error=invalid_request`);
    }

    // State (CSRF) tekshiruvi
    const pendingState = pendingStates.get(state);
    if (!pendingState) {
      return res.redirect(`${frontendUrl}/register?google_error=invalid_state`);
    }
    pendingStates.delete(state);

    if (Date.now() - pendingState.createdAt > STATE_TTL_MS) {
      return res.redirect(`${frontendUrl}/register?google_error=expired_state`);
    }

    // Authorization code → tokens
    let tokens;
    try {
      const tokenResponse = await oauthClient.getToken(code);
      tokens = tokenResponse.tokens;
    } catch {
      return res.redirect(`${frontendUrl}/register?google_error=token_exchange_failed`);
    }

    if (!tokens.id_token) {
      return res.redirect(`${frontendUrl}/register?google_error=no_id_token`);
    }

    // ID token tekshiruvi
    let ticket;
    try {
      ticket = await oauthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID
      });
    } catch {
      return res.redirect(`${frontendUrl}/register?google_error=invalid_token`);
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.redirect(`${frontendUrl}/register?google_error=no_payload`);
    }

    // Tasdiqlangan email tekshiruvi
    if (!payload.email_verified) {
      return res.redirect(`${frontendUrl}/register?google_error=email_not_verified`);
    }

    const googleId = payload.sub;
    const email = payload.email!.toLowerCase();
    const firstName = payload.given_name ?? "";
    const lastName = payload.family_name ?? "";
    const avatarUrl = payload.picture ?? null;

    // ─── Foydalanuvchini topish yoki yaratish ─────────────────────────────
    let user: any;
    let isNewUser = false;

    // 1. Google ID bo'yicha qidirish
    const byGoogleId = await pool.query(
      "SELECT * FROM users WHERE google_id = $1 LIMIT 1",
      [googleId]
    );

    if (byGoogleId.rows.length > 0) {
      user = byGoogleId.rows[0];

      // Bloklangan akkaunt tekshiruvi
      if (user.status === "blocked") {
        return res.redirect(`${frontendUrl}/register?google_error=account_blocked`);
      }

      // last_login yangilash
      await pool.query(
        "UPDATE users SET last_login = now(), updated_at = now() WHERE id = $1",
        [user.id]
      );
    } else {
      // 2. Email bo'yicha tekshirish (boshqa usul bilan ro'yxatdan o'tgan bo'lishi mumkin)
      const byEmail = await pool.query(
        "SELECT * FROM users WHERE lower(email) = $1 LIMIT 1",
        [email]
      );

      if (byEmail.rows.length > 0) {
        const existing = byEmail.rows[0];

        if (existing.status === "blocked") {
          return res.redirect(`${frontendUrl}/register?google_error=account_blocked`);
        }

        // Mavjud akkauntga Google ID biriktirish
        if (!existing.google_id) {
          await pool.query(
            `UPDATE users SET google_id = $1, auth_provider = 'google',
             avatar_url = COALESCE(avatar_url, $2), email_verified = true,
             last_login = now(), updated_at = now() WHERE id = $3`,
            [googleId, avatarUrl, existing.id]
          );
        } else {
          // Boshqa Google ID bilan bog'langan
          return res.redirect(`${frontendUrl}/register?google_error=email_exists`);
        }

        user = { ...existing, google_id: googleId };
      } else {
        // 3. Yangi foydalanuvchi yaratish
        isNewUser = true;

        const insertResult = await pool.query(
          `INSERT INTO users (
            first_name, last_name, email, google_id, avatar_url,
            email_verified, auth_provider, profile_status, status,
            password_hash, participation_type, profile_completion
          ) VALUES ($1,$2,$3,$4,$5,true,'google','incomplete','active',null,'university',30)
          RETURNING *`,
          [firstName || "Ism", lastName || "Familiya", email, googleId, avatarUrl]
        );

        user = insertResult.rows[0];

        // Xush kelibsiz bildirishnomalar
        await createNotification({
          userId: user.id,
          type: "system",
          title: "Qashqadaryo Startup Ligasiga xush kelibsiz!",
          body: "Google akkauntingiz orqali muvaffaqiyatli ro'yxatdan o'tdingiz. Profilingizni to'ldirishni boshlang.",
          actionUrl: `/profile/${user.id}/personal`,
          actionLabel: "Profilni to'ldirish"
        });
        await createNotification({
          userId: user.id,
          type: "sorting",
          title: "Musobaqa yangiliklari",
          body: "Musobaqa bosqichlari va natijalar bo'yicha xabarlar shu yerda saqlanadi.",
          actionUrl: `/profile/${user.id}/overview`,
          actionLabel: "Kabinetni ko'rish"
        });
      }
    }

    // ─── Session yaratish ──────────────────────────────────────────────────
    const sessionData = {
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url,
      profileStatus: user.profile_status ?? "incomplete",
      authProvider: user.auth_provider ?? "google",
      isNewUser
    };

    // Express-session ga yozish (req.session mavjud bo'lsa)
    if ((req as any).session) {
      (req as any).session.user = sessionData;
    }

    // Frontend'ga redirect — URL parametrlar orqali xavfsiz ma'lumot uzatish
    const params = new URLSearchParams({
      google_success: "1",
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar_url: user.avatar_url ?? "",
      profile_status: user.profile_status ?? "incomplete",
      is_new: isNewUser ? "1" : "0"
    });

    return res.redirect(`${frontendUrl}/register?${params.toString()}`);
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/auth/me — Joriy foydalanuvchi ──────────────────────────────────
googleAuthRouter.get("/me", async (req, res, next) => {
  try {
    const sessionUser = (req as any).session?.user;
    if (!sessionUser?.userId) {
      // localStorage dan fallback — profileUser headerdan tekshirish
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        throw new ApiError(401, "Autentifikatsiya talab qilinadi");
      }

      const result = await pool.query(
        `SELECT id, first_name, last_name, email, role, avatar_url,
                profile_status, auth_provider, status, profile_completion
         FROM users WHERE id = $1 LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new ApiError(404, "Foydalanuvchi topilmadi");
      }

      const u = result.rows[0];
      if (u.status === "blocked") {
        throw new ApiError(403, "Akkaunt bloklangan");
      }

      return res.json({ data: toMeDto(u) });
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, avatar_url,
              profile_status, auth_provider, status, profile_completion
       FROM users WHERE id = $1 LIMIT 1`,
      [sessionUser.userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    const u = result.rows[0];
    if (u.status === "blocked") {
      throw new ApiError(403, "Akkaunt bloklangan");
    }

    res.json({ data: toMeDto(u) });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
googleAuthRouter.post("/logout", (req, res) => {
  if ((req as any).session) {
    (req as any).session.destroy(() => {
      res.clearCookie("qsl.sid");
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

function toMeDto(row: any) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url,
    profileStatus: row.profile_status ?? "incomplete",
    profileCompletion: row.profile_completion ?? 25,
    authProvider: row.auth_provider ?? "local"
  };
}
