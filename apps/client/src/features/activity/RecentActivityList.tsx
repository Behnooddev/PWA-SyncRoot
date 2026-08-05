import { GlassCard } from "@/components/ui/GlassCard";
import { formatRelativeTime } from "@/lib/format";
import { useRecentActivity } from "@/features/activity/useRecentActivity";
import type { RecentActivityDto, ActivityType } from "@syncroot/shared-types";

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  PROJECT_CREATED: "created project",
  PROJECT_UPDATED: "updated project",
  PROJECT_DELETED: "deleted project",
  TASK_CREATED: "created a task in",
  TASK_UPDATED: "updated a task in",
  TASK_DELETED: "deleted a task in",
  TODO_CREATED: "added a todo in",
  TODO_COMPLETED: "completed a todo in",
  TODO_REOPENED: "reopened a todo in",
  TODO_DELETED: "removed a todo in",
  COMMENT_CREATED: "commented in",
  COMMENT_DELETED: "deleted a comment in",
  FILE_UPLOADED: "uploaded a file in",
  FILE_DELETED: "removed a file in",
};

function ActivityRow({ activity }: { activity: RecentActivityDto }) {
  return (
    <li className="flex items-start gap-2.5 py-2 text-sm">
      <span
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: activity.projectColor }}
      />
      <span className="min-w-0">
        <span className="text-text-primary">{activity.actorName}</span>{" "}
        <span className="text-text-secondary">{ACTIVITY_LABELS[activity.type]}</span>{" "}
        <span className="text-text-primary font-medium">{activity.projectName}</span>
        <span className="text-text-tertiary block text-xs">
          {formatRelativeTime(activity.createdAt)}
        </span>
      </span>
    </li>
  );
}

export function RecentActivityList() {
  const { data, isLoading, isError } = useRecentActivity(8);

  return (
    <GlassCard>
      <h3 className="font-display text-text-primary text-sm font-semibold">Recent activity</h3>

      {isLoading && <p className="text-text-tertiary mt-3 text-sm">Loading…</p>}
      {isError && <p className="text-text-tertiary mt-3 text-sm">Couldn't load activity.</p>}
      {data && data.length === 0 && <p className="text-text-tertiary mt-3 text-sm">Nothing yet.</p>}

      {data && data.length > 0 && (
        <ul className="divide-border-subtle mt-1 divide-y">
          {data.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
