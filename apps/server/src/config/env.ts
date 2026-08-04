import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

/**
 * Load .env BEFORE anything else in this module runs — this file is the
 * single source of truth for environment loading in the whole server.
 *
 * Resolved relative to THIS FILE's own location (via import.meta.url),
 * never relative to process.cwd(). That matters because cwd differs
 * depending on how the process was started (`npm run dev` from the repo
 * root vs. from apps/server directly vs. `node dist/server.js` after a
 * build) — this file's position on disk does not change, so resolution is
 * deterministic no matter how the app is launched.
 *
 * Every other file in the codebase gets validated env vars by importing
 * `env` from here — nobody else touches dotenv or process.env directly,
 * and nobody needs to worry about *when* this file happens to be
 * imported relative to anything else: ES module semantics guarantee this
 * module's top-level code (including the dotenv.config() call below) runs
 * to completion before any module that imports it can execute its own body.
 */
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const result = dotenv.config({ path: path.resolve(currentDir, "../../.env") });

if (result.error && process.env.NODE_ENV !== "production") {
  // Not fatal on its own — process.env may already be populated by the
  // shell/host (common in production). The Zod validation below is what
  // actually enforces required vars are present, with a clear error.
  // eslint-disable-next-line no-console -- genuinely a warning, not an error; see comment above
  console.warn(`⚠️  No .env file found at apps/server/.env (${result.error.message}).`);
}

/**
 * Every environment variable the server depends on is declared here and
 * validated once, at boot. If something is missing or malformed, the
 * process fails immediately with a clear message instead of throwing a
 * confusing error three requests later when a route finally touches it.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z
    .string()
    .url({ message: "DATABASE_URL must be a valid postgres connection string" }),

  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  // Local storage provider (Phase 10). Path is relative to apps/server unless absolute.
  STORAGE_DRIVER: z.enum(["local"]).default("local"),
  STORAGE_LOCAL_PATH: z.string().default("./storage/uploads"),
  STORAGE_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(25),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();
