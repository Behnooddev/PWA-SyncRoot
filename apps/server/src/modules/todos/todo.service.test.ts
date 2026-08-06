import { describe, expect, it, vi } from "vitest";
import { BadRequestError, NotFoundError } from "@/lib/errors.js";
import type { ActivityService } from "@/modules/activity/activity.service.js";
import type { ProjectEntity, ProjectRepository } from "@/modules/projects/project.repository.js";
import type { TaskEntity, TaskRepository } from "@/modules/tasks/task.repository.js";
import type { TodoEntity, TodoRepository } from "@/modules/todos/todo.repository.js";
import { TodoService } from "@/modules/todos/todo.service.js";

function makeTodo(overrides: Partial<TodoEntity> = {}): TodoEntity {
  return {
    id: "todo_1",
    title: "Test Todo",
    isDone: false,
    position: 0,
    projectId: "proj_1",
    taskId: null,
    createdById: "user_1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeProject(overrides: Partial<ProjectEntity> = {}): ProjectEntity {
  return {
    id: "proj_1",
    name: "Test Project",
    description: null,
    color: "#6E5AF0",
    createdById: "user_1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    deletedAt: null,
    ...overrides,
  };
}

function makeTask(overrides: Partial<TaskEntity> = {}): TaskEntity {
  return {
    id: "task_1",
    title: "Test Task",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    dueDate: null,
    projectId: "proj_1",
    createdById: "user_1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    deletedAt: null,
    ...overrides,
  };
}

/** Minimal fakes — only the methods TodoService actually calls. */
function makeFakes() {
  const todoRepository = {
    nextPosition: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    swapPositions: vi.fn(),
    delete: vi.fn(),
  } satisfies Partial<Record<keyof TodoRepository, unknown>>;

  const projectRepository = {
    findById: vi.fn(),
  } satisfies Partial<Record<keyof ProjectRepository, unknown>>;

  const taskRepository = {
    findById: vi.fn(),
  } satisfies Partial<Record<keyof TaskRepository, unknown>>;

  const activityService = {
    record: vi.fn(),
  } satisfies Partial<Record<keyof ActivityService, unknown>>;

  const service = new TodoService(
    // todoRepository's fake mocks every one of TodoRepository's seven methods, so it's
    // already structurally assignable — the other fakes only cover the one method
    // TodoService actually calls on them, so they still need the escape-hatch cast.
    todoRepository,
    projectRepository as unknown as ProjectRepository,
    taskRepository as unknown as TaskRepository,
    activityService as unknown as ActivityService,
  );

  return { service, todoRepository, projectRepository, taskRepository, activityService };
}

describe("TodoService.create", () => {
  it("throws NotFoundError instead of creating when the project doesn't exist", async () => {
    const { service, projectRepository, todoRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(null);

    await expect(
      service.create({ projectId: "missing", title: "Todo" }, "user_1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(todoRepository.create).not.toHaveBeenCalled();
  });

  it("throws BadRequestError when taskId points at a task from a different project", async () => {
    const { service, projectRepository, taskRepository, todoRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(makeProject({ id: "proj_1" }));
    taskRepository.findById.mockResolvedValue(makeTask({ projectId: "proj_OTHER" }));

    await expect(
      service.create({ projectId: "proj_1", taskId: "task_1", title: "Todo" }, "user_1"),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(todoRepository.create).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when taskId doesn't exist (e.g. it's soft-deleted)", async () => {
    const { service, projectRepository, taskRepository, todoRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(makeProject());
    taskRepository.findById.mockResolvedValue(null);

    await expect(
      service.create({ projectId: "proj_1", taskId: "missing", title: "Todo" }, "user_1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(todoRepository.create).not.toHaveBeenCalled();
  });

  it("assigns the next position in scope and records TODO_CREATED", async () => {
    const { service, projectRepository, todoRepository, activityService } = makeFakes();
    projectRepository.findById.mockResolvedValue(makeProject());
    todoRepository.nextPosition.mockResolvedValue(3);
    const created = makeTodo({ id: "todo_new", position: 3 });
    todoRepository.create.mockResolvedValue(created);

    const result = await service.create({ projectId: "proj_1", title: "Todo" }, "user_1");

    expect(todoRepository.nextPosition).toHaveBeenCalledWith({
      projectId: "proj_1",
      taskId: null,
    });
    expect(todoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Todo", projectId: "proj_1", position: 3 }),
    );
    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TODO_CREATED", projectId: "proj_1", todoId: "todo_new" }),
    );
    expect(result).toBe(created);
  });

  it("creates a task-scoped todo when taskId belongs to the project", async () => {
    const { service, projectRepository, taskRepository, todoRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(makeProject());
    taskRepository.findById.mockResolvedValue(makeTask({ projectId: "proj_1" }));
    todoRepository.nextPosition.mockResolvedValue(0);
    todoRepository.create.mockResolvedValue(makeTodo({ taskId: "task_1" }));

    await service.create({ projectId: "proj_1", taskId: "task_1", title: "Todo" }, "user_1");

    expect(todoRepository.nextPosition).toHaveBeenCalledWith({
      projectId: "proj_1",
      taskId: "task_1",
    });
    expect(todoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: "task_1" }),
    );
  });
});

describe("TodoService.list", () => {
  it("throws NotFoundError instead of listing when the project doesn't exist", async () => {
    const { service, projectRepository, todoRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(null);

    await expect(service.list({ projectId: "missing" })).rejects.toBeInstanceOf(NotFoundError);
    expect(todoRepository.list).not.toHaveBeenCalled();
  });

  it("defaults the scope to project-level (taskId: null) when no taskId is given", async () => {
    const { service, projectRepository, todoRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(makeProject());
    todoRepository.list.mockResolvedValue({ items: [], total: 0 });

    await service.list({ projectId: "proj_1" });

    expect(todoRepository.list).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: "proj_1", taskId: null }),
    );
  });

  it("scopes to the given task when taskId is provided", async () => {
    const { service, projectRepository, todoRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(makeProject());
    todoRepository.list.mockResolvedValue({ items: [], total: 0 });

    await service.list({ projectId: "proj_1", taskId: "task_1" });

    expect(todoRepository.list).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: "proj_1", taskId: "task_1" }),
    );
  });
});

describe("TodoService.update", () => {
  it("throws NotFoundError instead of writing when the todo doesn't exist", async () => {
    const { service, todoRepository } = makeFakes();
    todoRepository.findById.mockResolvedValue(null);

    await expect(service.update("missing", { title: "x" }, "user_1")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(todoRepository.update).not.toHaveBeenCalled();
  });

  it("records TODO_COMPLETED when isDone flips false -> true", async () => {
    const { service, todoRepository, activityService } = makeFakes();
    const existing = makeTodo({ isDone: false });
    todoRepository.findById.mockResolvedValue(existing);
    todoRepository.update.mockResolvedValue(makeTodo({ isDone: true }));

    await service.update(existing.id, { isDone: true }, "user_1");

    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TODO_COMPLETED" }),
    );
  });

  it("records TODO_REOPENED when isDone flips true -> false", async () => {
    const { service, todoRepository, activityService } = makeFakes();
    const existing = makeTodo({ isDone: true });
    todoRepository.findById.mockResolvedValue(existing);
    todoRepository.update.mockResolvedValue(makeTodo({ isDone: false }));

    await service.update(existing.id, { isDone: false }, "user_1");

    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TODO_REOPENED" }),
    );
  });

  it("does not record any activity for a title-only edit (no ActivityType exists for it)", async () => {
    const { service, todoRepository, activityService } = makeFakes();
    const existing = makeTodo();
    todoRepository.findById.mockResolvedValue(existing);
    todoRepository.update.mockResolvedValue(makeTodo({ title: "Renamed" }));

    await service.update(existing.id, { title: "Renamed" }, "user_1");

    expect(activityService.record).not.toHaveBeenCalled();
  });

  it("does not record activity when isDone is passed but unchanged", async () => {
    const { service, todoRepository, activityService } = makeFakes();
    const existing = makeTodo({ isDone: true });
    todoRepository.findById.mockResolvedValue(existing);
    todoRepository.update.mockResolvedValue(existing);

    await service.update(existing.id, { isDone: true }, "user_1");

    expect(activityService.record).not.toHaveBeenCalled();
  });
});

describe("TodoService.reorder", () => {
  it("swaps position with the previous sibling when moving up", async () => {
    const { service, todoRepository } = makeFakes();
    const first = makeTodo({ id: "a", position: 0 });
    const second = makeTodo({ id: "b", position: 1 });
    todoRepository.findById.mockResolvedValue(second);
    todoRepository.list.mockResolvedValue({ items: [first, second], total: 2 });

    await service.reorder("b", { direction: "up" });

    expect(todoRepository.swapPositions).toHaveBeenCalledWith(
      { id: "b", position: 1 },
      { id: "a", position: 0 },
    );
  });

  it("is a no-op when already first and moving up", async () => {
    const { service, todoRepository } = makeFakes();
    const first = makeTodo({ id: "a", position: 0 });
    todoRepository.findById.mockResolvedValue(first);
    todoRepository.list.mockResolvedValue({ items: [first], total: 1 });

    await service.reorder("a", { direction: "up" });

    expect(todoRepository.swapPositions).not.toHaveBeenCalled();
  });

  it("is a no-op when already last and moving down", async () => {
    const { service, todoRepository } = makeFakes();
    const only = makeTodo({ id: "a", position: 0 });
    todoRepository.findById.mockResolvedValue(only);
    todoRepository.list.mockResolvedValue({ items: [only], total: 1 });

    await service.reorder("a", { direction: "down" });

    expect(todoRepository.swapPositions).not.toHaveBeenCalled();
  });
});

describe("TodoService.delete", () => {
  it("throws NotFoundError instead of deleting when the todo doesn't exist", async () => {
    const { service, todoRepository } = makeFakes();
    todoRepository.findById.mockResolvedValue(null);

    await expect(service.delete("missing", "user_1")).rejects.toBeInstanceOf(NotFoundError);
    expect(todoRepository.delete).not.toHaveBeenCalled();
  });

  it("records TODO_DELETED before hard-deleting, not after", async () => {
    const { service, todoRepository, activityService } = makeFakes();
    const todo = makeTodo();
    todoRepository.findById.mockResolvedValue(todo);
    const callOrder: string[] = [];
    activityService.record.mockImplementation(() => {
      callOrder.push("record");
      return Promise.resolve();
    });
    todoRepository.delete.mockImplementation(() => {
      callOrder.push("delete");
      return Promise.resolve(todo);
    });

    await service.delete(todo.id, "user_1");

    expect(callOrder).toEqual(["record", "delete"]);
    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TODO_DELETED", todoId: todo.id }),
    );
  });
});
