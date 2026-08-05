/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
// Sandbox-only, file-wide: every method below calls the `any`-typed prisma
// client (see lib/prisma.ts for why). A real `prisma generate` with
// network access resolves this — delete this disable block at that point.
import { prisma } from "@/lib/prisma.js";

export type ActivityType =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TODO_CREATED"
  | "TODO_COMPLETED"
  | "TODO_REOPENED"
  | "TODO_DELETED"
  | "COMMENT_CREATED"
  | "COMMENT_DELETED"
  | "FILE_UPLOADED"
  | "FILE_DELETED";

export interface ActivityEntity {
  id: string;
  type: ActivityType;
  projectId: string;
  actorId: string;
  taskId: string | null;
  todoId: string | null;
  commentId: string | null;
  fileId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface RecordActivityInput {
  type: ActivityType;
  projectId: string;
  actorId: string;
  taskId?: string;
  todoId?: string;
  commentId?: string;
  fileId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * NO update(), NO delete() — intentionally. Activity is an append-only
 * audit/feed log (see schema.prisma and PHASE_0_PLANNING.md §4). Every
 * other module's service calls `record()` after a state change; nothing
 * ever mutates a row here afterward.
 */
export class ActivityRepository {
  record(input: RecordActivityInput): Promise<ActivityEntity> {
    return prisma.activity.create({ data: input });
  }

  /** Cursor-paginated feed for one project — see lib/pagination.ts. */
  listForProject(projectId: string, limit: number, cursor?: string): Promise<ActivityEntity[]> {
    return prisma.activity.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }
}
