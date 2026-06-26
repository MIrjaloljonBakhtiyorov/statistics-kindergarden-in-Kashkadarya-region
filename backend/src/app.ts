import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { adminRouter } from "./routes/admin.routes.js";
import { applicationsRouter } from "./routes/applications.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { googleAuthRouter } from "./routes/google-auth.routes.js";
import { filePreviewRouter } from "./routes/file-preview.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { publicRouter } from "./routes/public.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { teamsRouter } from "./routes/teams.routes.js";
import { judgesRouter } from "./routes/judges.routes.js";
import { coordinatorsRouter } from "./routes/coordinators.routes.js";
import { judgeAuthRouter } from "./routes/judge-auth.routes.js";
import { judgePanelRouter } from "./routes/judge-panel.routes.js";
import { errorHandler, notFoundHandler } from "./utils/http.js";

export const app = express();

app.set("trust proxy", 1);

const PgSession = connectPgSimple(session);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "accounts.google.com"],
      frameSrc: ["accounts.google.com"],
      connectSrc: ["'self'", "accounts.google.com", "oauth2.googleapis.com"]
    }
  }
}));

app.use(cors({
  origin: [env.CORS_ORIGIN, env.FRONTEND_URL],
  credentials: true
}));

app.use(session({
  store: new PgSession({ pool, tableName: "sessions", createTableIfMissing: true }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "qsl.sid",
  cookie: {
    httpOnly: true,
    secure: env.SESSION_COOKIE_SECURE,
    sameSite: env.SESSION_COOKIE_SECURE ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 kun
  },
  proxy: env.SESSION_COOKIE_SECURE
}));

app.use(express.json({ limit: "110mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api", (_req, res) => {
  res.json({
    name: "Qashqadaryo Startaplar Ligasi API",
    version: "0.1.0",
    status: "running"
  });
});

app.use("/api/health", healthRouter);
app.use("/api", publicRouter);
app.use("/api/auth", authRouter);
app.use("/api/auth", googleAuthRouter);
app.use("/api/file-preview", filePreviewRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", usersRouter);
app.use("/api", teamsRouter);
app.use("/api/admin/judges", judgesRouter);
app.use("/api/admin/coordinators", coordinatorsRouter);
app.use("/api/judge/auth", judgeAuthRouter);
app.use("/api/judge", judgePanelRouter);

app.use(notFoundHandler);
app.use(errorHandler);
