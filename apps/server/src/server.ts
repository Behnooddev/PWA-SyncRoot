import { createApp } from "@/app.js";
import { env } from "@/config/env.js";
import { logger } from "@/lib/logger.js";
import { prisma } from "@/lib/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 SyncRoot server listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(() => {
    // See lib/prisma.ts for why PrismaClient is `any` until Phase 2 adds models.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    void (prisma.$disconnect() as Promise<void>).then(() => {
      logger.info("Shutdown complete");
      process.exit(0);
    });
  });

  // Force-exit if graceful shutdown hangs.
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
