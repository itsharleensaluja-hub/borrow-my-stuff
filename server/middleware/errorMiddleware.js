export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export const notFound = (req, res) => {
  res.status(404).json({ success: false, code: "NOT_FOUND", message: "Route not found" })
}

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error)

  const isUploadError = error.name === "MulterError" || error.code === "LIMIT_FILE_SIZE" || error.code === "LIMIT_FILE_COUNT"
  const statusCode = error.statusCode ||
    (error.name === "ValidationError" || error.name === "CastError" || isUploadError ? 400 : error.code === 11000 ? 409 : 500)
  const code = error.code && typeof error.code === "string"
    ? error.code
    : error.name === "CastError"
      ? "INVALID_ID"
      : isUploadError
        ? "INVALID_UPLOAD"
        : error.name === "ValidationError"
        ? "VALIDATION_ERROR"
        : error.code === 11000
          ? "DUPLICATE_RESOURCE"
          : "INTERNAL_ERROR"
  const message = statusCode >= 500 && process.env.NODE_ENV === "production"
    ? "An unexpected server error occurred"
    : error.message

  if (statusCode >= 500) console.error("Request error:", error.message)
  res.status(statusCode).json({ success: false, code, message })
}
