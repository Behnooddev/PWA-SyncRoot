import type { OffsetPage } from "@syncroot/shared-types";
import { NotFoundError, BadRequestError } from "@/lib/errors.js";
import { clampLimit } from "@/lib/pagination.js";
import type { ActivityService } from "@/modules/activity/activity.service.js";
import type { ProjectRepository } from "@/modules/projects/project.repository.js";
import type { TaskRepository } from "@/modules/tasks/task.repository.js";
import type {
  CreateTodoInput,
  UpdateTodoInput,
  ListTodosQuery,
  ReorderTodoInput,
} from "./todo.schema.js";
import type { TodoEntity, TodoRepository } from "./todo.repository.js";

export class TodoService {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly taskRepository: TaskRepository,
    private readonly activityService: ActivityService,
  ) {}

  private async assertProjectExists(projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project", projectId);
  }

  /** Confirms the task exists, isn't soft-deleted, and actually belongs to the given project — prevents attaching a todo to a task from a different project. */
  private async assertTaskInProject(taskId: string, projectId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task", taskId);
    if (task.projectId !== projectId) {
      throw new BadRequestError("Task does not belong to the given project");
    }
  }

  async getById(id: string): Promise<TodoEntity> {
    const todo = await this.todoRepository.findById(id);
    if (!todo) throw new NotFoundError("Todo", id);
    return todo;
  }

  async create(input: CreateTodoInput, actorId: string): Promise<TodoEntity> {
    await this.assertProjectExists(input.projectId);
    if (input.taskId) {
      await this.assertTaskInProject(input.taskId, input.projectId);
    }

    const position = await this.todoRepository.nextPosition({
      projectId: input.projectId,
      taskId: input.taskId ?? null,
    });

    const todo = await this.todoRepository.create({
      title: input.title,
      position,
      projectId: input.projectId,
      ...(input.taskId !== undefined ? { taskId: input.taskId } : {}),
      createdById: actorId,
    });

    await this.activityService.record({
      type: "TODO_CREATED",
      projectId: todo.projectId,
      actorId,
      todoId: todo.id,
      ...(todo.taskId ? { taskId: todo.taskId } : {}),
      metadata: { title: todo.title },
    });

    return todo;
  }

  async list(query: ListTodosQuery): Promise<OffsetPage<TodoEntity>> {
    await this.assertProjectExists(query.projectId);

    const limit = clampLimit(query.limit);
    const offsetParsed = query.offset ? Number.parseInt(query.offset, 10) : 0;
    const offset = Number.isNaN(offsetParsed) ? 0 : offsetParsed;

    const { items, total } = await this.todoRepository.list({
      projectId: query.projectId,
      taskId: query.taskId ?? null,
      limit,
      offset,
    });

    return { items, total, limit, offset };
  }

  async update(id: string, input: UpdateTodoInput, actorId: string): Promise<TodoEntity> {
    const existing = await this.getById(id);

    const todo = await this.todoRepository.update(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.isDone !== undefined ? { isDone: input.isDone } : {}),
    });

    // No ActivityType exists for a plain title edit (see PHASE_8_HANDOFF.md) —
    // only an actual isDone transition gets logged, and only when it actually flips.
    if (input.isDone !== undefined && input.isDone !== existing.isDone) {
      await this.activityService.record({
        type: input.isDone ? "TODO_COMPLETED" : "TODO_REOPENED",
        projectId: todo.projectId,
        actorId,
        todoId: todo.id,
        ...(todo.taskId ? { taskId: todo.taskId } : {}),
        metadata: { title: todo.title },
      });
    }

    return todo;
  }

  /**
   * Swaps this todo's position with its immediate neighbour in the same
   * scope. No-ops silently at either edge of the list (nothing to swap
   * with) rather than throwing — the client just won't see the button do
   * anything, which is the expected behaviour for a disabled-looking
   * boundary case.
   */
  async reorder(id: string, input: ReorderTodoInput): Promise<TodoEntity[]> {
    const todo = await this.getById(id);

    const { items } = await this.todoRepository.list({
      projectId: todo.projectId,
      taskId: todo.taskId,
      limit: 1000,
      offset: 0,
    });

    const index = items.findIndex((item) => item.id === id);
    const neighborIndex = input.direction === "up" ? index - 1 : index + 1;

    if (neighborIndex < 0 || neighborIndex >= items.length) {
      return items;
    }

    const neighbor = items[neighborIndex];
    if (!neighbor) return items;

    await this.todoRepository.swapPositions(
      { id: todo.id, position: todo.position },
      { id: neighbor.id, position: neighbor.position },
    );

    const refreshed = await this.todoRepository.list({
      projectId: todo.projectId,
      taskId: todo.taskId,
      limit: 1000,
      offset: 0,
    });
    return refreshed.items;
  }

  async delete(id: string, actorId: string): Promise<void> {
    const todo = await this.getById(id);

    // Activity is recorded BEFORE the delete, not after. Todo is a hard
    // delete (no deletedAt column), so the row is gone the instant
    // todoRepository.delete() resolves — an Activity insert afterward
    // referencing todo.id would fail the foreign key. Recording first
    // lets Postgres's ON DELETE SET NULL do its job when the row goes
    // away, exactly like it does when a user or project is later purged.
    await this.activityService.record({
      type: "TODO_DELETED",
      projectId: todo.projectId,
      actorId,
      todoId: todo.id,
      ...(todo.taskId ? { taskId: todo.taskId } : {}),
      metadata: { title: todo.title },
    });

    await this.todoRepository.delete(id);
  }
}
