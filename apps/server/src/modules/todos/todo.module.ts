import { activityService } from "@/modules/activity/activity.module.js";
import { projectRepository } from "@/modules/projects/project.module.js";
import { taskRepository } from "@/modules/tasks/task.module.js";
import { TodoController } from "@/modules/todos/todo.controller.js";
import { TodoRepository } from "@/modules/todos/todo.repository.js";
import { createTodoRouter } from "@/modules/todos/todo.routes.js";
import { TodoService } from "@/modules/todos/todo.service.js";

export const todoRepository = new TodoRepository();
export const todoService = new TodoService(
  todoRepository,
  projectRepository,
  taskRepository,
  activityService,
);
export const todoController = new TodoController(todoService);
export const todoRouter = createTodoRouter(todoController);
