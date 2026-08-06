/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
// Sandbox-only, file-wide: every method below calls the `any`-typed prisma
// client (see lib/prisma.ts for why). A real `prisma generate` with
// network access resolves this — delete this disable block at that point.
import { prisma } from "@/lib/prisma.js";

/** Local interface matching the `todos` table shape in schema.prisma — see TaskEntity for why this isn't imported from @prisma/client in this sandbox. */
export interface TodoEntity {
  id: string;
  title: string;
  isDone: boolean;
  position: number;
  projectId: string;
  taskId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoData {
  title: string;
  position: number;
  projectId: string;
  taskId?: string;
  createdById: string;
}

export interface UpdateTodoData {
  title?: string;
  isDone?: boolean;
}

/** Identifies which list a todo belongs to — project-level (taskId: null) or one specific task. */
export interface TodoScope {
  projectId: string;
  taskId: string | null;
}

export interface ListTodosParams extends TodoScope {
  limit: number;
  offset: number;
}

export class TodoRepository {
  /**
   * Next position value for a new todo in this scope. Reads the current
   * max rather than a row count — a count would collide with an existing
   * position once any todo in the middle of the list has been deleted
   * (hard delete leaves a gap, it doesn't renumber survivors).
   */
  async nextPosition(scope: TodoScope): Promise<number> {
    const result = await prisma.todo.aggregate({
      where: { projectId: scope.projectId, taskId: scope.taskId },
      _max: { position: true },
    });
    const currentMax: number | null = result._max.position;
    return currentMax === null ? 0 : currentMax + 1;
  }

  create(input: CreateTodoData): Promise<TodoEntity> {
    return prisma.todo.create({ data: input });
  }

  findById(id: string): Promise<TodoEntity | null> {
    return prisma.todo.findUnique({ where: { id } });
  }

  async list(params: ListTodosParams): Promise<{ items: TodoEntity[]; total: number }> {
    const where = { projectId: params.projectId, taskId: params.taskId };

    const [items, total]: [TodoEntity[], number] = await Promise.all([
      prisma.todo.findMany({
        where,
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        take: params.limit,
        skip: params.offset,
      }),
      prisma.todo.count({ where }),
    ]);

    return { items, total };
  }

  update(id: string, input: UpdateTodoData): Promise<TodoEntity> {
    return prisma.todo.update({ where: { id }, data: input });
  }

  /**
   * Swaps the `position` values of two todos in one transaction — this is
   * the whole "move up/down" operation. Only ever called with two todos
   * from the same scope (TodoService.reorder enforces that by reading
   * both from the same list() call), so there's no cross-list corruption
   * risk here.
   */
  async swapPositions(
    a: { id: string; position: number },
    b: { id: string; position: number },
  ): Promise<void> {
    await prisma.$transaction([
      prisma.todo.update({ where: { id: a.id }, data: { position: b.position } }),
      prisma.todo.update({ where: { id: b.id }, data: { position: a.position } }),
    ]);
  }

  /** Hard delete — Todo has no deletedAt column (see schema.prisma / master doc: soft-delete is Project + Task only). */
  delete(id: string): Promise<TodoEntity> {
    return prisma.todo.delete({ where: { id } });
  }
}
