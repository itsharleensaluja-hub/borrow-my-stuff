import dotenv from "dotenv"

dotenv.config()

const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"]

export const loadConfig = () => {
  const missing = required.filter((name) => !process.env[name]?.trim())
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long")
  }

  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL,
    nodeEnv: process.env.NODE_ENV || "development",
    cookieSecure: process.env.COOKIE_SECURE === "true",
    uploadDirectory: process.env.UPLOAD_DIR || "uploads/items",
    maxImageSizeMb: Number(process.env.MAX_IMAGE_SIZE_MB) || 5,
    maxItemImages: Number(process.env.MAX_ITEM_IMAGES) || 6,
  }
}
