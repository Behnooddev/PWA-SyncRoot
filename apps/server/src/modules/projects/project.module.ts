import { activityService } from "@/modules/activity/activity.module.js";
import { ProjectController } from "@/modules/projects/project.controller.js";
import { ProjectRepository } from "@/modules/projects/project.repository.js";
import { createProjectRouter } from "@/modules/projects/project.routes.js";
import { ProjectService } from "@/modules/projects/project.service.js";

export const projectRepository = new ProjectRepository();
export const projectService = new ProjectService(projectRepository, activityService);
export const projectController = new ProjectController(projectService);
export const projectRouter = createProjectRouter(projectController);
