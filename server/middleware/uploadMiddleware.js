import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { AppError } from "./errorMiddleware.js";

export const uploadDirectory = path.resolve(
  process.env.UPLOAD_DIR || "uploads/items",
);
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) =>
    callback(null, `${crypto.randomUUID()}${allowedTypes.get(file.mimetype)}`),
});

const imageUpload = multer({
  storage,
  limits: {
    files: Number(process.env.MAX_ITEM_IMAGES) || 6,
    fileSize: (Number(process.env.MAX_IMAGE_SIZE_MB) || 5) * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(
        new AppError(
          "Only JPEG, PNG, and WebP images are allowed",
          400,
          "INVALID_IMAGE_TYPE",
        ),
      );
    }
    callback(null, true);
  },
});

export const uploadItemImages = (req, res, next) => {
  imageUpload.array(
    "images",
    Number(process.env.MAX_ITEM_IMAGES) || 6,
  )(req, res, async (error) => {
    if (error && req.files?.length) {
      await Promise.allSettled(
        req.files.map((file) => fs.promises.rm(file.path, { force: true })),
      );
    }
    next(error);
  });
};
export const getUploadUrl = (filename) => `/uploads/items/${filename}`;
export const removeUploadedFile = async (url) => {
  if (!url?.startsWith("/uploads/items/")) return;
  const filename = path.basename(url);
  await fs.promises.rm(path.join(uploadDirectory, filename), { force: true });
};
