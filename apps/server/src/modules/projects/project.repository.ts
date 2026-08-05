/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
// Sandbox-only, file-wide: every method below calls the `any`-typed prisma
// client (see lib/prisma.ts for why). A real `prisma generate` with
// network access resolves this — delete this disable block at that point.
import { prisma } from "@/lib/prisma.js";
import type { CreateProjectInput, UpdateProjectInput } from "@/modules/projects/project.schema.js";

/**
 * Local interface matching the `projects` table shape in schema.prisma.
 * See UserEntity in user.repository.ts for why this isn't imported from
 * @prisma/client in this sandbox.
 */
export interface ProjectEntity {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/** Every query in this repository goes through this — the ONE place that knows what "active" means. */
const notDeleted = { deletedAt: null } as const;

export class ProjectRepository {
  create(input: CreateProjectInput & { createdById: string }): Promise<ProjectEntity> {
    return prisma.project.create({ data: input });
  }

  findById(id: string): Promise<ProjectEntity | null> {
    return prisma.project.findFirst({ where: { id, ...notDeleted } });
  }

  async list(params: { limit: number; offset: number; search?: string }): Promise<{
    items: ProjectEntity[];
    total: number;
  }> {
    const where = {
      ...notDeleted,
      ...(params.search ? { name: { contains: params.search, mode: "insensitive" as const } } : {}),
    };

    const [items, total]: [ProjectEntity[], number] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: params.limit,
        skip: params.offset,
      }),
      prisma.project.count({ where }),
    ]);

    return { items, total };
  }

  update(id: string, input: UpdateProjectInput): Promise<ProjectEntity> {
    return prisma.project.update({ where: { id }, data: input });
  }

  /** Soft delete — sets deletedAt, never removes the row. See ProjectEntity comment / PHASE_0_PLANNING.md §4. */
  softDelete(id: string): Promise<ProjectEntity> {
    return prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
