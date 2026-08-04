import { prisma } from "@/lib/prisma.js";
import { logger } from "@/lib/logger.js";

/**
 * Seed script, run via `npm run db:seed`. Left empty on purpose until
 * Phase 2 defines the actual models — an empty seed that runs successfully
 * is more honest than a fake one that inserts placeholder rows for models
 * that don't exist yet.
 */
async function main(): Promise<void> {
  logger.info("No models defined yet — seed will populate starting in Phase 2.");
}

main()
  .catch((err: unknown) => {
    logger.error(err, "Seed failed");
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
