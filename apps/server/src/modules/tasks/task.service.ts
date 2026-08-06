import { NotFoundError } from "@/lib/errors.js";
import { clampLimit } from "@/lib/pagination.js";
import type { ProjectRepository } from "@/modules/projects/project.repository.js";
import type { TaskEntity, TaskRepository } from "@/modules/tasks/task.repository.js";
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "@/modules/tasks/task.schema.js";
import type { ActivityService } from "@/modules/activity/activity.service.js";
import type { OffsetPage } from "@syncroot/shared-types";

export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Every create/list call is scoped to a projectId the client supplies —
   * this confirms that project actually exists (and isn't soft-deleted)
   * before doing anything else, so a bad/stale projectId 404s instead of
   * silently creating an orphaned task or returning an empty list that
   * looks like "no tasks yet" instead of "wrong project".
   */
  private async assertProjectExists(projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project", projectId);
  }

  async create(input: CreateTaskInput, actorId: string): Promise<TaskEntity> {
    await this.assertProjectExists(input.projectId);

    const task = await this.taskRepository.create({
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: new Date(input.dueDate) } : {}),
      projectId: input.projectId,
      createdById: actorId,
    });

    await this.activityService.record({
      type: "TASK_CREATED",
      projectId: task.projectId,
      actorId,
      taskId: task.id,
      metadata: { title: task.title },
    });

    return task;
  }

  async getById(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new NotFoundError("Task", id);
    return task;
  }

  async list(query: ListTasksQuery): Promise<OffsetPage<TaskEntity>> {
    await this.assertProjectExists(query.projectId);

    const limit = clampLimit(query.limit);
    const offsetParsed = query.offset ? Number.parseInt(query.offset, 10) : 0;
    const offset = Number.isNaN(offsetParsed) ? 0 : offsetParsed;

    const { items, total } = await this.taskRepository.list({
      projectId: query.projectId,
      limit,
      offset,
      ...(query.status ? { status: query.status } : {}),
    });

    return { items, total, limit, offset };
  }

  async update(id: string, input: UpdateTaskInput, actorId: string): Promise<TaskEntity> {
    // Confirms it exists (and isn't already soft-deleted) before writing,
    // and gives the activity record below a `projectId` to attach to
    // without a second lookup after the write.
    const existing = await this.getById(id);

    const task = await this.taskRepository.update(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined
        ? { dueDate: input.dueDate === null ? null : new Date(input.dueDate) }
        : {}),
    });

    await this.activityService.record({
      type: "TASK_UPDATED",
      projectId: existing.projectId,
      actorId,
      taskId: task.id,
      metadata: { changedFields: Object.keys(input) },
    });

    return task;
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    const task = await this.getById(id);

    await this.taskRepository.softDelete(id);

    await this.activityService.record({
      type: "TASK_DELETED",
      projectId: task.projectId,
      actorId,
      taskId: task.id,
      metadata: { title: task.title },
    });
  }
}
