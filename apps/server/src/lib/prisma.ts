/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
// The rules above are disabled for this file only, and only temporarily —
// and only in THIS development sandbox. schema.prisma now has real models
// (Phase 2), so a normal `prisma generate` with full internet access
// produces a properly-typed PrismaClient and these disables become
// unnecessary. They're only here because this sandbox's network blocks
// binaries.prisma.sh, so `prisma generate` can't finish and falls back to
// `PrismaClient: any` (see node_modules/.prisma/client/default.d.ts).
// ACTION FOR NEXT ENVIRONMENT WITH FULL NETWORK ACCESS: run
// `npm run db:generate` (workspace apps/server), confirm PrismaClient is
// properly typed, then delete this disable comment and the one in
// server.ts's shutdown handler.
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
