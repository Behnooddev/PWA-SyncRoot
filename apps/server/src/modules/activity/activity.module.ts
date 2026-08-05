import { ActivityRepository } from "@/modules/activity/activity.repository.js";
import { ActivityService } from "@/modules/activity/activity.service.js";

export const activityRepository = new ActivityRepository();
export const activityService = new ActivityService(activityRepository);
