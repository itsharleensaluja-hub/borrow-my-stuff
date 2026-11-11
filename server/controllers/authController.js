import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { loadConfig } from "../config/env.js";

const config = loadConfig();

const getRuntimeConfig = (req) => ({
  ...config,
  ...(req.app.locals.config || {}),
  collegeEmailDomains:
    req.app.locals.config?.collegeEmailDomains || config.collegeEmailDomains,
});

const cookieOptions = (runtimeConfig) => ({
  httpOnly: true,
  secure: runtimeConfig.cookieSecure,
  sameSite: runtimeConfig.cookieSecure ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
});

const generateToken = (id, runtimeConfig) => {
  return jwt.sign({ id }, runtimeConfig.jwtSecret, { expiresIn: "30d" });
};

const isCollegeEmail = (email, runtimeConfig) => {
  const domain = email.toLowerCase().split("@").pop();
  return runtimeConfig.collegeEmailDomains.some(
    (allowedDomain) =>
      domain === allowedDomain,
  );
};

export const registerUser = async (req, res, next) => {
  try {
    const runtimeConfig = getRuntimeConfig(req);
    const { name, email, password, hostel } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, code: "MISSING_FIELDS", message: "Please fill all fields" })
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          code: "WEAK_PASSWORD",
          message: "Password must be at least 6 characters",
        });
    }

    if (!isCollegeEmail(normalizedEmail, runtimeConfig)) {
      return res
        .status(400)
        .json({
          success: false,
          code: "COLLEGE_EMAIL_REQUIRED",
          message: `Use an approved college email domain: ${runtimeConfig.collegeEmailDomains.map((domain) => `@${domain}`).join(", ")}`,
        });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res
        .status(400)
        .json({
          success: false,
          code: "USER_EXISTS",
          message: "An account already exists for this email. Sign in instead.",
        });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      hostel,
    });

    const token = generateToken(user._id, runtimeConfig);
    res.cookie("access_token", token, cookieOptions(runtimeConfig));
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      hostel: user.hostel,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const runtimeConfig = getRuntimeConfig(req);
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, code: "MISSING_FIELDS", message: "Please fill all fields" })
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, runtimeConfig);
      res.cookie("access_token", token, cookieOptions(runtimeConfig));
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        hostel: user.hostel,
        role: user.role,
      });
    } else {
      res.status(401).json({ success: false, code: "INVALID_CREDENTIALS", message: "Invalid email or password" })
    }
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const updateRoles = async (req, res, next) => {
  try {
    const validRoles = ["borrower", "lender", "seller", "helper"];
    const roles = Array.isArray(req.body.roles)
      ? [...new Set(req.body.roles)]
      : [];
    if (
      roles.length === 0 ||
      roles.some((role) => !validRoles.includes(role))
    ) {
      throw new AppError(
        "At least one valid role is required",
        400,
        "INVALID_ROLES",
      );
    }
    req.user.role = roles;
    await req.user.save();
    res.json({ roles: req.user.role });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("access_token", cookieOptions(getRuntimeConfig(req)));
  res.json({ message: "Logged out" });
};
