import { activityService } from "@/modules/activity/activity.module.js";
import { projectRepository } from "@/modules/projects/project.module.js";
import { TaskController } from "@/modules/tasks/task.controller.js";
import { TaskRepository } from "@/modules/tasks/task.repository.js";
import { createTaskRouter } from "@/modules/tasks/task.routes.js";
import { TaskService } from "@/modules/tasks/task.service.js";

export const taskRepository = new TaskRepository();
export const taskService = new TaskService(taskRepository, projectRepository, activityService);
export const taskController = new TaskController(taskService);
export const taskRouter = createTaskRouter(taskController);
