import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { loadConfig } from "../config/env.js";

const getToken = (req) => {
  if (req.cookies?.access_token) return req.cookies.access_token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const protect = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      });
  }

  try {
    const config = req.app.locals.config || loadConfig();
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,
          code: "AUTH_INVALID",
          message: "Authentication failed",
        });
    }
    req.authType = req.cookies?.access_token === token ? "cookie" : "bearer";
    return next();
  } catch (error) {
    const expired = error instanceof jwt.TokenExpiredError;
    return res
      .status(401)
      .json({
        success: false,
        code: expired ? "AUTH_EXPIRED" : "AUTH_INVALID",
        message: expired
          ? "Your session has expired. Please sign in again."
          : "Authentication failed",
      });
  }
};

export default protect;
