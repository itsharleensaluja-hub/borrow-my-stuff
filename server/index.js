import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import { loadConfig } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { requireCsrf, setCsrfCookie } from "./middleware/csrfMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import { openapiDocument } from "./docs/openapi.js";
import { uploadDirectory } from "./middleware/uploadMiddleware.js";

export const createApp = (config = loadConfig()) => {
  const app = express();
  const clientOrigins = (
    config.clientUrls || [config.clientUrl]
  ).map((origin) => origin.trim().replace(/\/+$/, ""));
  app.locals.config = config;
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || clientOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(
    "/uploads/items",
    helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }),
    express.static(uploadDirectory),
  );
  app.use(cookieParser());
  app.use(setCsrfCookie);
  app.use(requireCsrf);

  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.authRateLimit || 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      code: "RATE_LIMITED",
      message: "Too many requests, try again later",
    },
  });

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      code: "RATE_LIMITED",
      message: "Too many requests, try again later",
    },
  });

  app.use("/api", globalLimiter);
  app.post("/api/auth/login", strictLimiter);
  app.post("/api/auth/register", strictLimiter);
  app.use("/api/auth", authRoutes);
  app.use("/api/items", itemRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/gigs", gigRoutes);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

  app.get("/", (req, res) => {
    res.json({ message: "Borrow My Stuff API is running!" });
  });
  app.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
};

export const startServer = async () => {
  const config = loadConfig();
  await connectDB(config.mongoUri);
  const app = createApp(config);
  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      try {
        await import("./config/db.js").then(({ disconnectDB }) =>
          disconnectDB(),
        );
        process.exit(0);
      } catch (error) {
        console.error("Shutdown error:", error.message);
        process.exit(1);
      }
    });
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  return server;
};

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  startServer().catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  });
}
