import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.routes.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get("/api", (_req, res) => {
  res.json({
    name: "Qashqadaryo Startaplar Ligasi API",
    version: "0.1.0",
    status: "running"
  });
});

app.use("/api/health", healthRouter);
