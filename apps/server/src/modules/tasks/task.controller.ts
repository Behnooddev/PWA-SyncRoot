import type { Request, Response } from "express";
import { toIso } from "@/lib/serializers.js";
import type { TaskEntity } from "@/modules/tasks/task.repository.js";
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "@/modules/tasks/task.schema.js";
import type { TaskService } from "@/modules/tasks/task.service.js";
import type { ApiSuccess, OffsetPage, TaskDto } from "@syncroot/shared-types";

function toTaskDto(task: TaskEntity): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: toIso(task.dueDate),
    projectId: task.projectId,
    createdById: task.createdById,
    createdAt: toIso(task.createdAt),
    updatedAt: toIso(task.updatedAt),
    deletedAt: toIso(task.deletedAt),
  };
}

type IdParam = { id: string };

/** Controllers only: parse what validate() already checked, call exactly one service method, shape the response. See project.controller.ts for the full reasoning — identical pattern here. */
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  create = async (
    req: Request<unknown, unknown, CreateTaskInput>,
    res: Response,
  ): Promise<void> => {
    const task = await this.taskService.create(req.body, req.currentUser.id);
    const body: ApiSuccess<TaskDto> = { data: toTaskDto(task) };
    res.status(201).json(body);
  };

  list = async (
    req: Request<unknown, unknown, unknown, ListTasksQuery>,
    res: Response,
  ): Promise<void> => {
    const page = await this.taskService.list(req.query);
    const body: ApiSuccess<OffsetPage<TaskDto>> = {
      data: { ...page, items: page.items.map(toTaskDto) },
    };
    res.json(body);
  };

  getById = async (req: Request<IdParam>, res: Response): Promise<void> => {
    const task = await this.taskService.getById(req.params.id);
    const body: ApiSuccess<TaskDto> = { data: toTaskDto(task) };
    res.json(body);
  };

  update = async (
    req: Request<IdParam, unknown, UpdateTaskInput>,
    res: Response,
  ): Promise<void> => {
    const task = await this.taskService.update(req.params.id, req.body, req.currentUser.id);
    const body: ApiSuccess<TaskDto> = { data: toTaskDto(task) };
    res.json(body);
  };

  remove = async (req: Request<IdParam>, res: Response): Promise<void> => {
    await this.taskService.softDelete(req.params.id, req.currentUser.id);
    res.status(204).send();
  };
}
