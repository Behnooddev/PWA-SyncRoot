/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
// The rules above are disabled for this file only, and only temporarily:
// with zero models defined in schema.prisma (Phase 1), Prisma's generated
// client literally types `PrismaClient` as `any` (see
// node_modules/.prisma/client/default.d.ts). Once Phase 2 adds real
// models and we re-run `prisma generate`, PrismaClient becomes properly
// typed and these disables should be removed — flagging this explicitly
// rather than leaving an unexplained disable comment.
import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env.js";

/**
 * tsx watch restarts the module graph on every save, which would create a
 * fresh PrismaClient (and a fresh connection pool) each time without this
 * guard. Standard pattern: stash the instance on globalThis in development.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
