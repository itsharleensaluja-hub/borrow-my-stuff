import mongoose from "mongoose";
import { AppError } from "./errorMiddleware.js";

export const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

export const positiveNumber = (value, field, { allowZero = false } = {}) => {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
    throw new AppError(
      `${field} must be a valid positive number`,
      400,
      "INVALID_NUMBER",
    );
  }
  return number;
};
