import type { Request, Response } from "express";
import { toIso } from "@/lib/serializers.js";
import { clampLimit } from "@/lib/pagination.js";
import type { ActivityWithContext } from "@/modules/activity/activity.repository.js";
import type { ActivityService } from "@/modules/activity/activity.service.js";
import type { ApiSuccess, RecentActivityDto } from "@syncroot/shared-types";

function toRecentActivityDto(activity: ActivityWithContext): RecentActivityDto {
  return {
    id: activity.id,
    type: activity.type,
    projectId: activity.projectId,
    actorId: activity.actorId,
    taskId: activity.taskId,
    todoId: activity.todoId,
    commentId: activity.commentId,
    fileId: activity.fileId,
    metadata: activity.metadata,
    createdAt: toIso(activity.createdAt),
    projectName: activity.project.name,
    projectColor: activity.project.color,
    actorName: activity.actor.name,
  };
}

export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  listRecent = async (req: Request, res: Response): Promise<void> => {
    const limit = clampLimit(req.query.limit, 10);
    const activities = await this.activityService.listRecent(limit);
    const body: ApiSuccess<RecentActivityDto[]> = { data: activities.map(toRecentActivityDto) };
    res.json(body);
  };
}
