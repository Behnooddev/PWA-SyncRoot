import type { Request, Response } from "express";
import { toIso } from "@/lib/serializers.js";
import type { TodoEntity } from "@/modules/todos/todo.repository.js";
import type {
  CreateTodoInput,
  ListTodosQuery,
  ReorderTodoInput,
  UpdateTodoInput,
} from "@/modules/todos/todo.schema.js";
import type { TodoService } from "@/modules/todos/todo.service.js";
import type { ApiSuccess, OffsetPage, TodoDto } from "@syncroot/shared-types";

function toTodoDto(todo: TodoEntity): TodoDto {
  return {
    id: todo.id,
    title: todo.title,
    isDone: todo.isDone,
    position: todo.position,
    projectId: todo.projectId,
    taskId: todo.taskId,
    createdById: todo.createdById,
    createdAt: toIso(todo.createdAt),
    updatedAt: toIso(todo.updatedAt),
  };
}

type IdParam = { id: string };

/** Controllers only: parse what validate() already checked, call exactly one service method, shape the response. See task.controller.ts for the full reasoning — identical pattern here. */
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  create = async (
    req: Request<unknown, unknown, CreateTodoInput>,
    res: Response,
  ): Promise<void> => {
    const todo = await this.todoService.create(req.body, req.currentUser.id);
    const body: ApiSuccess<TodoDto> = { data: toTodoDto(todo) };
    res.status(201).json(body);
  };

  list = async (
    req: Request<unknown, unknown, unknown, ListTodosQuery>,
    res: Response,
  ): Promise<void> => {
    const page = await this.todoService.list(req.query);
    const body: ApiSuccess<OffsetPage<TodoDto>> = {
      data: { ...page, items: page.items.map(toTodoDto) },
    };
    res.json(body);
  };

  getById = async (req: Request<IdParam>, res: Response): Promise<void> => {
    const todo = await this.todoService.getById(req.params.id);
    const body: ApiSuccess<TodoDto> = { data: toTodoDto(todo) };
    res.json(body);
  };

  update = async (
    req: Request<IdParam, unknown, UpdateTodoInput>,
    res: Response,
  ): Promise<void> => {
    const todo = await this.todoService.update(req.params.id, req.body, req.currentUser.id);
    const body: ApiSuccess<TodoDto> = { data: toTodoDto(todo) };
    res.json(body);
  };

  reorder = async (
    req: Request<IdParam, unknown, ReorderTodoInput>,
    res: Response,
  ): Promise<void> => {
    const todos = await this.todoService.reorder(req.params.id, req.body);
    const body: ApiSuccess<TodoDto[]> = { data: todos.map(toTodoDto) };
    res.json(body);
  };

  remove = async (req: Request<IdParam>, res: Response): Promise<void> => {
    await this.todoService.delete(req.params.id, req.currentUser.id);
    res.status(204).send();
  };
}
