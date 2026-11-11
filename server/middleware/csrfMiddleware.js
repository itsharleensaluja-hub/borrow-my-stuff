import crypto from "crypto";
import { AppError } from "./errorMiddleware.js";
import { loadConfig } from "../config/env.js";

const csrfCookie = "borrowbox_csrf";
const config = loadConfig();

export const setCsrfCookie = (req, res, next) => {
  const runtimeConfig = req.app.locals.config || config;
  if (!req.cookies[csrfCookie]) {
    res.cookie(csrfCookie, crypto.randomBytes(24).toString("hex"), {
      httpOnly: false,
      sameSite: runtimeConfig.cookieSecure ? "none" : "lax",
      secure: runtimeConfig.cookieSecure,
      path: "/",
    });
  }
  next();
};

export const requireCsrf = (req, res, next) => {
  const requestPath = req.originalUrl.split("?")[0];
  if (
    ["/api/auth/login", "/api/auth/register"].some(
      (path) => requestPath === path,
    )
  )
    return next();
  const hasBearer = req.headers.authorization?.startsWith("Bearer ");
  if (hasBearer || ["GET", "HEAD", "OPTIONS"].includes(req.method))
    return next();

  const cookieToken = req.cookies[csrfCookie];
  const headerToken = req.headers["x-csrf-token"];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError("Invalid CSRF token", 403, "CSRF_FAILED"));
  }
  next();
};
