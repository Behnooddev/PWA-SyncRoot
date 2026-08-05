import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/lib/errors.js";
import type { ProjectEntity, ProjectRepository } from "@/modules/projects/project.repository.js";
import { ProjectService } from "@/modules/projects/project.service.js";
import type { ActivityService } from "@/modules/activity/activity.service.js";

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

/** Minimal fakes — only the methods ProjectService actually calls. */
function makeFakes() {
  const projectRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  } satisfies Partial<Record<keyof ProjectRepository, unknown>>;

  const activityService = {
    record: vi.fn(),
  } satisfies Partial<Record<keyof ActivityService, unknown>>;

  const service = new ProjectService(
    projectRepository,
    activityService as unknown as ActivityService,
  );

  return { service, projectRepository, activityService };
}

describe("ProjectService.create", () => {
  it("defaults the color when none is given, and records a PROJECT_CREATED activity", async () => {
    const { service, projectRepository, activityService } = makeFakes();
    const created = makeProject({ id: "proj_new" });
    projectRepository.create.mockResolvedValue(created);

    const result = await service.create({ name: "Test Project" }, "user_1");

    expect(projectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Test Project", color: "#6E5AF0", createdById: "user_1" }),
    );
    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "PROJECT_CREATED",
        projectId: "proj_new",
        actorId: "user_1",
      }),
    );
    expect(result).toBe(created);
  });

  it("respects an explicitly provided color instead of the default", async () => {
    const { service, projectRepository } = makeFakes();
    projectRepository.create.mockResolvedValue(makeProject());

    await service.create({ name: "Test Project", color: "#FF0000" }, "user_1");

    expect(projectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ color: "#FF0000" }),
    );
  });
});

describe("ProjectService.getById", () => {
  it("throws NotFoundError when the repository returns null", async () => {
    const { service, projectRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(null);

    await expect(service.getById("missing")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns the project when found", async () => {
    const { service, projectRepository } = makeFakes();
    const project = makeProject();
    projectRepository.findById.mockResolvedValue(project);

    await expect(service.getById(project.id)).resolves.toBe(project);
  });
});

describe("ProjectService.update", () => {
  it("throws NotFoundError instead of writing when the project doesn't exist", async () => {
    const { service, projectRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(null);

    await expect(service.update("missing", { name: "New name" }, "user_1")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(projectRepository.update).not.toHaveBeenCalled();
  });

  it("updates and records a PROJECT_UPDATED activity when the project exists", async () => {
    const { service, projectRepository, activityService } = makeFakes();
    const existing = makeProject();
    const updated = makeProject({ name: "New name" });
    projectRepository.findById.mockResolvedValue(existing);
    projectRepository.update.mockResolvedValue(updated);

    const result = await service.update(existing.id, { name: "New name" }, "user_1");

    expect(result).toBe(updated);
    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "PROJECT_UPDATED", projectId: existing.id }),
    );
  });
});

describe("ProjectService.softDelete", () => {
  it("throws NotFoundError instead of deleting when the project doesn't exist", async () => {
    const { service, projectRepository } = makeFakes();
    projectRepository.findById.mockResolvedValue(null);

    await expect(service.softDelete("missing", "user_1")).rejects.toBeInstanceOf(NotFoundError);
    expect(projectRepository.softDelete).not.toHaveBeenCalled();
  });

  it("soft-deletes and records a PROJECT_DELETED activity", async () => {
    const { service, projectRepository, activityService } = makeFakes();
    const project = makeProject();
    projectRepository.findById.mockResolvedValue(project);
    projectRepository.softDelete.mockResolvedValue(project);

    await service.softDelete(project.id, "user_1");

    expect(projectRepository.softDelete).toHaveBeenCalledWith(project.id);
    expect(activityService.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "PROJECT_DELETED", projectId: project.id }),
    );
  });
});
