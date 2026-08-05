import type {
  ActivityEntity,
  ActivityRepository,
  RecordActivityInput,
} from "@/modules/activity/activity.repository.js";
import { buildCursorPage } from "@/lib/pagination.js";
import type { CursorPage } from "@syncroot/shared-types";

export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  /**
   * Fire-and-record: called by other modules' services right after a
   * mutation succeeds (e.g. ProjectService.create calls this after the
   * project row is written). Never called from a controller directly —
   * keeping that call inside the service that owns the business
   * transaction is what makes it impossible to change a Project without
   * also logging it.
   */
  record(input: RecordActivityInput): Promise<ActivityEntity> {
    return this.activityRepository.record(input);
  }

  async listForProject(
    projectId: string,
    limit: number,
    cursor?: string,
  ): Promise<CursorPage<ActivityEntity>> {
    const rows = await this.activityRepository.listForProject(projectId, limit, cursor);
    return buildCursorPage(rows, limit);
  }
}
