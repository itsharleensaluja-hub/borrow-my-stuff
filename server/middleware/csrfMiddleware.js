import crypto from "crypto"
import { AppError } from "./errorMiddleware.js"

const csrfCookie = "borrowbox_csrf"

export const setCsrfCookie = (req, res, next) => {
  if (!req.cookies[csrfCookie]) {
    res.cookie(csrfCookie, crypto.randomBytes(24).toString("hex"), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "true",
    })
  }
  next()
}

export const requireCsrf = (req, res, next) => {
  if (req.path.startsWith("/api/auth")) return next()
  const hasBearer = req.headers.authorization?.startsWith("Bearer ")
  if (hasBearer || ["GET", "HEAD", "OPTIONS"].includes(req.method)) return next()

  const cookieToken = req.cookies[csrfCookie]
  const headerToken = req.headers["x-csrf-token"]
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError("Invalid CSRF token", 403, "CSRF_FAILED"))
  }
  next()
}
