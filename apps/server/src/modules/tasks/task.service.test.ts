import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/lib/errors.js";
import type { ProjectEntity, ProjectRepository } from "@/modules/projects/project.repository.js";
import type { TaskEntity, TaskRepository } from "@/modules/tasks/task.repository.js";
import { TaskService } from "@/modules/tasks/task.service.js";
import type { ActivityService } from "@/modules/activity/activity.service.js";

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

/** Minimal fakes — only the methods TaskService actually calls. */
function makeFakes() {
  const taskRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  } satisfies Partial<Record<keyof TaskRepository, unknown>>;

  const projectRepository = {
    findById: vi.fn(),
  } satisfies Partial<Record<keyof ProjectRepository, unknown>>;

  const activityService = {
    record: vi.fn(),
  } satisfies Partial<Record<keyof ActivityService, unknown>>;

  const service = new TaskService(
    // taskRepository's fake mocks every one of TaskRepository's five methods, so it's
    // already structurally assignable — the other two fakes only cover the one/two
    // methods TaskService actually calls, so they still need the escape-hatch cast.
    taskRepository,
    projectRepository as unknown as ProjectRepository,
    activityService as unknown as ActivityService,
  );

  return { service, taskRepository, projectRepository, activityService };
}

describe("TaskService.create", () => {
  it("throws NotFoundError instead of creating when the project doesn't exist", async () => {
    const { service, projectRepository, taskRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(null);

    await expect(
      service.create({ projectId: "missing", title: "Task" }, "user_1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(taskRepository.create).not.toHaveBeenCalled();
  });

  it("creates the task and records a TASK_CREATED activity when the project exists", async () => {
    const { service, projectRepository, taskRepository, activityService } = makeFakes();
    projectRepository.findById.mockResolvedValue(makeProject());
    const created = makeTask({ id: "task_new" });
    taskRepository.create.mockResolvedValue(created);

    const result = await service.create({ projectId: "proj_1", title: "Task" }, "user_1");

    expect(taskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Task", projectId: "proj_1", createdById: "user_1" }),
    );
    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TASK_CREATED", projectId: "proj_1", taskId: "task_new" }),
    );
    expect(result).toBe(created);
  });

  it("converts a date-only dueDate string into a real Date before writing", async () => {
    const { service, projectRepository, taskRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(makeProject());
    taskRepository.create.mockResolvedValue(makeTask());

    await service.create({ projectId: "proj_1", title: "Task", dueDate: "2026-08-10" }, "user_1");

    expect(taskRepository.create).toHaveBeenCalledWith(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any() is typed `any` by vitest, not a real type hole here.
      expect.objectContaining({ dueDate: expect.any(Date) }),
    );
  });
});

describe("TaskService.getById", () => {
  it("throws NotFoundError when the repository returns null", async () => {
    const { service, taskRepository } = makeFakes();
    taskRepository.findById.mockResolvedValue(null);

    await expect(service.getById("missing")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns the task when found", async () => {
    const { service, taskRepository } = makeFakes();
    const task = makeTask();
    taskRepository.findById.mockResolvedValue(task);

    await expect(service.getById(task.id)).resolves.toBe(task);
  });
});

describe("TaskService.list", () => {
  it("throws NotFoundError instead of listing when the project doesn't exist", async () => {
    const { service, projectRepository, taskRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(null);

    await expect(service.list({ projectId: "missing" })).rejects.toBeInstanceOf(NotFoundError);
    expect(taskRepository.list).not.toHaveBeenCalled();
  });

  it("passes the status filter through when provided", async () => {
    const { service, projectRepository, taskRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(makeProject());
    taskRepository.list.mockResolvedValue({ items: [], total: 0 });

    await service.list({ projectId: "proj_1", status: "DONE" });

    expect(taskRepository.list).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: "proj_1", status: "DONE" }),
    );
  });
});

describe("TaskService.update", () => {
  it("throws NotFoundError instead of writing when the task doesn't exist", async () => {
    const { service, taskRepository } = makeFakes();
    taskRepository.findById.mockResolvedValue(null);

    await expect(service.update("missing", { status: "DONE" }, "user_1")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it("updates the status (the board's 'move' action) and records TASK_UPDATED", async () => {
    const { service, taskRepository, activityService } = makeFakes();
    const existing = makeTask();
    const updated = makeTask({ status: "IN_PROGRESS" });
    taskRepository.findById.mockResolvedValue(existing);
    taskRepository.update.mockResolvedValue(updated);

    const result = await service.update(existing.id, { status: "IN_PROGRESS" }, "user_1");

    expect(taskRepository.update).toHaveBeenCalledWith(
      existing.id,
      expect.objectContaining({ status: "IN_PROGRESS" }),
    );
    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TASK_UPDATED", projectId: existing.projectId }),
    );
    expect(result).toBe(updated);
  });

  it("clears dueDate when explicitly set to null, but leaves it untouched when omitted", async () => {
    const { service, taskRepository } = makeFakes();
    taskRepository.findById.mockResolvedValue(makeTask());
    taskRepository.update.mockResolvedValue(makeTask());

    await service.update("task_1", { dueDate: null }, "user_1");
    expect(taskRepository.update).toHaveBeenCalledWith(
      "task_1",
      expect.objectContaining({ dueDate: null }),
    );

    taskRepository.update.mockClear();
    await service.update("task_1", { title: "Renamed" }, "user_1");
    expect(taskRepository.update).toHaveBeenCalledWith(
      "task_1",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- same vitest asymmetric-matcher `any` typing as above.
      expect.not.objectContaining({ dueDate: expect.anything() }),
    );
  });
});

describe("TaskService.softDelete", () => {
  it("throws NotFoundError instead of deleting when the task doesn't exist", async () => {
    const { service, taskRepository } = makeFakes();
    taskRepository.findById.mockResolvedValue(null);

    await expect(service.softDelete("missing", "user_1")).rejects.toBeInstanceOf(NotFoundError);
    expect(taskRepository.softDelete).not.toHaveBeenCalled();
  });

  it("soft-deletes and records a TASK_DELETED activity", async () => {
    const { service, taskRepository, activityService } = makeFakes();
    const task = makeTask();
    taskRepository.findById.mockResolvedValue(task);
    taskRepository.softDelete.mockResolvedValue(task);

    await service.softDelete(task.id, "user_1");

    expect(taskRepository.softDelete).toHaveBeenCalledWith(task.id);
    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TASK_DELETED", projectId: task.projectId }),
    );
  });
});
