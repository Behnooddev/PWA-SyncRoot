import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import type { ActivityController } from "@/modules/activity/activity.controller.js";

export function createActivityRouter(controller: ActivityController): Router {
  const router = Router();
  router.get("/recent", asyncHandler(controller.listRecent));
  return router;
}
