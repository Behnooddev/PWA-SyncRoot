import "dotenv/config";
import { z } from "zod";

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
