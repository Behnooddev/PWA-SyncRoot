import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { validate } from "@/middleware/validate.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamSchema,
  updateTaskSchema,
} from "@/modules/tasks/task.schema.js";
import type { TaskController } from "@/modules/tasks/task.controller.js";

export function createTaskRouter(controller: TaskController): Router {
  const router = Router();

  router.post("/", validate({ body: createTaskSchema }), asyncHandler(controller.create));
  router.get("/", validate({ query: listTasksQuerySchema }), asyncHandler(controller.list));
  router.get("/:id", validate({ params: taskIdParamSchema }), asyncHandler(controller.getById));
  router.patch(
    "/:id",
    validate({ params: taskIdParamSchema, body: updateTaskSchema }),
    asyncHandler(controller.update),
  );
  router.delete("/:id", validate({ params: taskIdParamSchema }), asyncHandler(controller.remove));

  return router;
}
