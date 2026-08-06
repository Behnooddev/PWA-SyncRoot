import type { TaskPriority, TaskStatus } from "@syncroot/shared-types";

/** Column order for the board — also the fallback sort order from the API (see task.repository.ts's `orderBy: [{ status: "asc" }, ...]`). */
export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

/** Badge classes (bg + text) per priority — low-key for LOW, escalating to the danger color for URGENT so the highest-priority items are scannable at a glance. */
export const TASK_PRIORITY_BADGE: Record<TaskPriority, string> = {
  LOW: "bg-white/5 text-text-tertiary",
  MEDIUM: "bg-accent-muted text-accent-glow",
  HIGH: "bg-warning/10 text-warning",
  URGENT: "bg-danger/10 text-danger",
};
