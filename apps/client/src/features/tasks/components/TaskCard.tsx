import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  TASK_PRIORITY_BADGE,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUSES,
} from "@/features/tasks/constants";
import type { TaskDto, TaskStatus } from "@syncroot/shared-types";

interface TaskCardProps {
  task: TaskDto;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_OPTIONS = TASK_STATUSES.map((status) => ({
  value: status,
  label: TASK_STATUS_LABEL[status],
}));

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const isOverdue =
    task.dueDate !== null && task.status !== "DONE" && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="glass-surface group rounded-[var(--radius-card)] p-3.5"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-text-primary text-sm font-medium break-words">{task.title}</h4>
        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            aria-label={`Edit ${task.title}`}
            className="text-text-tertiary hover:text-text-primary rounded-md p-1 hover:bg-white/5"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            aria-label={`Delete ${task.title}`}
            className="text-text-tertiary hover:bg-danger/10 hover:text-danger rounded-md p-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-text-secondary mt-1 line-clamp-2 text-xs">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            TASK_PRIORITY_BADGE[task.priority],
          )}
        >
          {TASK_PRIORITY_LABEL[task.priority]}
        </span>
        {task.dueDate && (
          <span className={cn("text-xs", isOverdue ? "text-danger" : "text-text-tertiary")}>
            {isOverdue ? "Overdue: " : "Due "}
            {formatRelativeTime(task.dueDate)}
          </span>
        )}
      </div>

      <div className="mt-3">
        <Select
          aria-label={`Change status of ${task.title}`}
          options={STATUS_OPTIONS}
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          className="h-8 text-xs"
        />
      </div>
    </motion.div>
  );
}
