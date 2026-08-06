import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { validate } from "@/middleware/validate.js";
import {
  createTodoSchema,
  listTodosQuerySchema,
  reorderTodoSchema,
  todoIdParamSchema,
  updateTodoSchema,
} from "@/modules/todos/todo.schema.js";
import type { TodoController } from "@/modules/todos/todo.controller.js";

export function createTodoRouter(controller: TodoController): Router {
  const router = Router();

  router.post("/", validate({ body: createTodoSchema }), asyncHandler(controller.create));
  router.get("/", validate({ query: listTodosQuerySchema }), asyncHandler(controller.list));
  router.get("/:id", validate({ params: todoIdParamSchema }), asyncHandler(controller.getById));
  router.patch(
    "/:id",
    validate({ params: todoIdParamSchema, body: updateTodoSchema }),
    asyncHandler(controller.update),
  );
  router.patch(
    "/:id/reorder",
    validate({ params: todoIdParamSchema, body: reorderTodoSchema }),
    asyncHandler(controller.reorder),
  );
  router.delete("/:id", validate({ params: todoIdParamSchema }), asyncHandler(controller.remove));

  return router;
}
