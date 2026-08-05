import cors from "cors";
import express, { type Express } from "express";
import { pinoHttp } from "pino-http";
import { env } from "@/config/env.js";
import { resolveCurrentUser } from "@/middleware/currentUser.js";
import { errorHandler, asyncHandler } from "@/middleware/errorHandler.js";
import { logger } from "@/lib/logger.js";
import { projectRouter } from "@/modules/projects/project.module.js";

/**
 * Builds and returns the Express app WITHOUT calling .listen(). server.ts
 * is the only file that binds a port. This split means integration tests
 * can import `app` and drive it with supertest without ever opening a
 * real socket.
 *
 * Route modules own their own router file and are mounted here under
 * /api/*; this function stays a thin assembly point, not a place where
 * route logic accumulates.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== "test" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Every route below this point requires X-User-Name (no auth in V1 — see
  // PHASE_0_PLANNING.md §1). Health check stays above so uptime monitors
  // don't need to fake a username.
  app.use("/api", asyncHandler(resolveCurrentUser));

  app.use("/api/projects", projectRouter);

  // Must be registered after all routes.
  app.use(errorHandler);

  return app;
}
