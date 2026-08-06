/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
// Sandbox-only, file-wide: every method below calls the `any`-typed prisma
// client (see lib/prisma.ts for why). A real `prisma generate` with
// network access resolves this — delete this disable block at that point.
import { prisma } from "@/lib/prisma.js";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/** Local interface matching the `tasks` table shape in schema.prisma — see ProjectEntity for why this isn't imported from @prisma/client in this sandbox. */
export interface TaskEntity {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  projectId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  projectId: string;
  createdById: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export interface ListTasksParams {
  projectId: string;
  status?: TaskStatus;
  limit: number;
  offset: number;
}

/** Every query in this repository goes through this — the ONE place that knows what "active" means. */
const notDeleted = { deletedAt: null } as const;

export class TaskRepository {
  create(input: CreateTaskData): Promise<TaskEntity> {
    return prisma.task.create({ data: input });
  }

  findById(id: string): Promise<TaskEntity | null> {
    return prisma.task.findFirst({ where: { id, ...notDeleted } });
  }

  /**
   * Ordered by status then createdAt — the client groups these into board
   * columns itself, but a stable server-side order means "recently added"
   * stays first within a column even before any client-side sort runs.
   */
  async list(params: ListTasksParams): Promise<{ items: TaskEntity[]; total: number }> {
    const where = {
      ...notDeleted,
      projectId: params.projectId,
      ...(params.status ? { status: params.status } : {}),
    };

    const [items, total]: [TaskEntity[], number] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: params.limit,
        skip: params.offset,
      }),
      prisma.task.count({ where }),
    ]);

    return { items, total };
  }

  update(id: string, input: UpdateTaskData): Promise<TaskEntity> {
    return prisma.task.update({ where: { id }, data: input });
  }

  /** Soft delete — sets deletedAt, never removes the row. Same reasoning as ProjectRepository.softDelete. */
  softDelete(id: string): Promise<TaskEntity> {
    return prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
