import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { validate } from "@/middleware/validate.js";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamSchema,
  updateProjectSchema,
} from "@/modules/projects/project.schema.js";
import type { ProjectController } from "@/modules/projects/project.controller.js";

export function createProjectRouter(controller: ProjectController): Router {
  const router = Router();

  router.post("/", validate({ body: createProjectSchema }), asyncHandler(controller.create));
  router.get("/", validate({ query: listProjectsQuerySchema }), asyncHandler(controller.list));
  router.get("/:id", validate({ params: projectIdParamSchema }), asyncHandler(controller.getById));
  router.patch(
    "/:id",
    validate({ params: projectIdParamSchema, body: updateProjectSchema }),
    asyncHandler(controller.update),
  );
  router.delete(
    "/:id",
    validate({ params: projectIdParamSchema }),
    asyncHandler(controller.remove),
  );

  return router;
}
