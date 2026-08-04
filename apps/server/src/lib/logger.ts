import pino from "pino";
import { env } from "@/config/env.js";

/**
 * Single shared logger instance. In development, output is human-readable
 * via pino-pretty. In production, we emit structured JSON so it can be
 * ingested by a log aggregator without a transform step.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});
