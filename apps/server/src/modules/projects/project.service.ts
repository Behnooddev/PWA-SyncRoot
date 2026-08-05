import { NotFoundError } from "@/lib/errors.js";
import { clampLimit } from "@/lib/pagination.js";
import type { ProjectEntity, ProjectRepository } from "@/modules/projects/project.repository.js";
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from "@/modules/projects/project.schema.js";
import type { ActivityService } from "@/modules/activity/activity.service.js";
import type { OffsetPage } from "@syncroot/shared-types";

const DEFAULT_PROJECT_COLOR = "#6E5AF0";

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly activityService: ActivityService,
  ) {}

  async create(input: CreateProjectInput, actorId: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.create({
      ...input,
      color: input.color ?? DEFAULT_PROJECT_COLOR,
      createdById: actorId,
    });

    await this.activityService.record({
      type: "PROJECT_CREATED",
      projectId: project.id,
      actorId,
      metadata: { name: project.name },
    });

    return project;
  }

  async getById(id: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundError("Project", id);
    return project;
  }

  list(query: ListProjectsQuery): Promise<OffsetPage<ProjectEntity>> {
    const limit = clampLimit(query.limit);
    const offsetParsed = query.offset ? Number.parseInt(query.offset, 10) : 0;
    const offset = Number.isNaN(offsetParsed) ? 0 : offsetParsed;

    return this.projectRepository
      .list({ limit, offset, ...(query.search ? { search: query.search } : {}) })
      .then(({ items, total }) => ({ items, total, limit, offset }));
  }

  async update(id: string, input: UpdateProjectInput, actorId: string): Promise<ProjectEntity> {
    // Confirms it exists (and isn't already soft-deleted) before writing —
    // throws NotFoundError otherwise, same 404 whether it never existed or
    // was already deleted, which is the right ambiguity for a client to see.
    await this.getById(id);

    const project = await this.projectRepository.update(id, input);

    await this.activityService.record({
      type: "PROJECT_UPDATED",
      projectId: project.id,
      actorId,
      metadata: { changedFields: Object.keys(input) },
    });

    return project;
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    const project = await this.getById(id);

    await this.projectRepository.softDelete(id);

    await this.activityService.record({
      type: "PROJECT_DELETED",
      projectId: project.id,
      actorId,
      metadata: { name: project.name },
    });
  }
}
