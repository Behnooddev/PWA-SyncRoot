/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
// Sandbox-only, file-wide: every method below calls the `any`-typed prisma
// client (see lib/prisma.ts for why). A real `prisma generate` with
// network access resolves this — delete this disable block at that point.
import { prisma } from "@/lib/prisma.js";

/**
 * Local interface matching the `users` table shape in schema.prisma.
 *
 * Deliberately NOT imported from `@prisma/client` here. In an environment
 * with working internet access, `prisma generate` produces a real,
 * properly-typed `User` model type and this interface becomes redundant
 * (feel free to switch to `import type { User } from "@prisma/client"` at
 * that point — the two are structurally identical). This sandbox can't
 * reach binaries.prisma.sh to generate that type, so this interface keeps
 * the repository layer fully type-checked regardless.
 */
export interface UserEntity {
  id: string;
  name: string;
  createdAt: Date;
}

export class UserRepository {
  findByName(name: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({ where: { name } });
  }
  create(name: string): Promise<UserEntity> {
    return prisma.user.create({ data: { name } });
  }

  /**
   * Atomic find-or-create via upsert — avoids the race where two
   * concurrent first-time requests from the same new username both see
   * "not found" and both try to create, tripping the unique constraint on
   * `name`. Exactly the kind of race a multi-user collaboration app needs
   * to not get wrong.
   */
  upsertByName(name: string): Promise<UserEntity> {
    return prisma.user.upsert({ where: { name }, update: {}, create: { name } });
  }
  findById(id: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}
