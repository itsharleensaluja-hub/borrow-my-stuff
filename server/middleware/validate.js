import mongoose from "mongoose"
import { AppError } from "./errorMiddleware.js"

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value)

export const requireObjectId = (field) => (req, res, next) => {
  const value = req.params[field] || req.body[field]
  if (!isValidObjectId(value)) {
    return next(new AppError(`Invalid ${field}`, 400, "INVALID_ID"))
  }
  next()
}

export const positiveNumber = (value, field, { allowZero = false } = {}) => {
  const number = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
    throw new AppError(`${field} must be a valid positive number`, 400, "INVALID_NUMBER")
  }
  return number
}

export const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter((field) => {
    const value = req.body[field]
    return value === undefined || value === null || (typeof value === "string" && !value.trim())
  })
  if (missing.length > 0) {
    return next(new AppError(`Missing required fields: ${missing.join(", ")}`, 400, "MISSING_FIELDS"))
  }
  next()
}
