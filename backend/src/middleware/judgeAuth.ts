import type { RequestHandler } from "express";
import { ApiError } from "../utils/http.js";

export const requireJudge: RequestHandler = (req, _res, next) => {
  if (!req.session.judgeId) {
    return next(new ApiError(401, "Tizimga kiring"));
  }
  next();
};
