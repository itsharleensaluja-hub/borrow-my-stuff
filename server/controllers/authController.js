import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { loadConfig } from "../config/env.js";

const config = loadConfig();

const cookieOptions = () => ({
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: config.cookieSecure ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: "30d" });
};

const isCollegeEmail = (email) => {
  const allowedDomains = ["@vitapstudent.ac.in", "@vitap.ac.in"];
  return allowedDomains.some((domain) => email.toLowerCase().endsWith(domain));
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, hostel } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, code: "MISSING_FIELDS", message: "Please fill all fields" })
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (!isCollegeEmail(normalizedEmail)) {
      return res
        .status(400)
        .json({ message: "Only college email addresses are allowed" });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      hostel,
    });

    const token = generateToken(user._id);
    res.cookie("access_token", token, cookieOptions());
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
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, code: "MISSING_FIELDS", message: "Please fill all fields" })
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.cookie("access_token", token, cookieOptions());
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
  res.clearCookie("access_token", cookieOptions());
  res.json({ message: "Logged out" });
};
