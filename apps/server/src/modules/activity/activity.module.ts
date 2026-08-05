import { ActivityController } from "@/modules/activity/activity.controller.js";
import { ActivityRepository } from "@/modules/activity/activity.repository.js";
import { createActivityRouter } from "@/modules/activity/activity.routes.js";
import { ActivityService } from "@/modules/activity/activity.service.js";

export const activityRepository = new ActivityRepository();
export const activityService = new ActivityService(activityRepository);
export const activityController = new ActivityController(activityService);
export const activityRouter = createActivityRouter(activityController);
