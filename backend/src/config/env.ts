import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().default("postgres://qsl_user:qsl_password@localhost:5433/qsl_db"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_REDIRECT_URI: z.string().default("http://localhost:4000/api/auth/google/callback"),
  // Session
  SESSION_SECRET: z.string().default("qsl-dev-secret-change-in-production-min-32-chars"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  SESSION_COOKIE_SECURE: z.enum(["true", "false"]).default("false").transform((value) => value === "true")
});

export const env = envSchema.parse(process.env);
