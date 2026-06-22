import { Router } from "express";
import { checkDatabase } from "../db/pool.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    const databaseTime = await checkDatabase();

    res.json({
      status: "ok",
      database: {
        status: "connected",
        time: databaseTime
      }
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: {
        status: "unavailable"
      }
    });
  }
});
