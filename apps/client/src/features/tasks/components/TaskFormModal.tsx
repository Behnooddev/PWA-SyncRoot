import { type FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { toDateInputValue } from "@/lib/format";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUSES,
} from "@/features/tasks/constants";
import type { TaskDto, TaskPriority, TaskStatus } from "@syncroot/shared-types";

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** "YYYY-MM-DD" or "" for no due date — see lib/format.ts's fromDateInputValue for the conversion back to an API payload. */
  dueDate: string;
}

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  isSubmitting: boolean;
  /** Present for edit mode, absent for create. */
  task?: TaskDto;
  /** Create-mode only: which column's "+" button opened this modal, so the new task lands in the right one without an extra click. */
  defaultStatus?: TaskStatus;
}

const STATUS_OPTIONS = TASK_STATUSES.map((status) => ({
  value: status,
  label: TASK_STATUS_LABEL[status],
}));
const PRIORITY_OPTIONS = TASK_PRIORITIES.map((priority) => ({
  value: priority,
  label: TASK_PRIORITY_LABEL[priority],
}));

export function TaskFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  task,
  defaultStatus,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  // Reset (or prefill for edit) whenever the modal is opened.
  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setStatus(task?.status ?? defaultStatus ?? "TODO");
      setPriority(task?.priority ?? "MEDIUM");
      setDueDate(toDateInputValue(task?.dueDate ?? null));
      setTitleError(null);
    }
  }, [open, task, defaultStatus]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError("Task title is required.");
      return;
    }
    onSubmit({ title: trimmed, description: description.trim(), status, priority, dueDate });
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit task" : "New task"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError(null);
          }}
          error={titleError ?? undefined}
          maxLength={200}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-text-secondary text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={4000}
            placeholder="What needs to happen? (optional)"
            className="border-border-strong bg-bg-elevated text-text-primary placeholder:text-text-tertiary focus:border-accent resize-none rounded-[var(--radius-control)] border px-3 py-2 text-sm transition-colors outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
        </div>

        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : task ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
