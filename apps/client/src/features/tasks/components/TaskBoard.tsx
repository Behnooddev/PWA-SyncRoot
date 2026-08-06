import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "@/features/tasks/hooks/useTasks";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import { TaskFormModal, type TaskFormValues } from "@/features/tasks/components/TaskFormModal";
import { fromDateInputValue } from "@/lib/format";
import { TASK_STATUS_LABEL, TASK_STATUSES } from "@/features/tasks/constants";
import type { TaskDto, TaskStatus } from "@syncroot/shared-types";

interface TaskBoardProps {
  projectId: string;
}

export function TaskBoard({ projectId }: TaskBoardProps) {
  const tasksQuery = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | undefined>(undefined);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("TODO");
  const [deletingTask, setDeletingTask] = useState<TaskDto | undefined>(undefined);

  function openCreateModal(status: TaskStatus) {
    setEditingTask(undefined);
    setCreateStatus(status);
    setFormOpen(true);
  }

  function openEditModal(task: TaskDto) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleFormSubmit(values: TaskFormValues) {
    if (editingTask) {
      // Edit mode: an empty description/date means "the user cleared it",
      // which must be sent as an explicit null (see UpdateTaskInput —
      // omitting a field means "leave unchanged", not "clear it").
      updateTask.mutate(
        {
          id: editingTask.id,
          payload: {
            title: values.title,
            description: values.description || null,
            status: values.status,
            priority: values.priority,
            dueDate: fromDateInputValue(values.dueDate) ?? null,
          },
        },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      // Create mode: an empty description/date means "never had one",
      // so it's simply omitted rather than sent as an explicit null.
      createTask.mutate(
        {
          projectId,
          title: values.title,
          description: values.description || undefined,
          status: values.status,
          priority: values.priority,
          dueDate: fromDateInputValue(values.dueDate),
        },
        { onSuccess: () => setFormOpen(false) },
      );
    }
  }

  function handleStatusChange(task: TaskDto, status: TaskStatus) {
    updateTask.mutate({ id: task.id, payload: { status } });
  }

  function handleConfirmDelete() {
    if (!deletingTask) return;
    deleteTask.mutate(deletingTask.id, { onSuccess: () => setDeletingTask(undefined) });
  }

  if (tasksQuery.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TASK_STATUSES.map((status) => (
          <div
            key={status}
            className="bg-bg-elevated h-48 animate-pulse rounded-[var(--radius-card)]"
          />
        ))}
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <GlassCard className="text-center">
        <p className="text-danger text-sm">Couldn't load tasks. Is the server running?</p>
      </GlassCard>
    );
  }

  const tasks = tasksQuery.data?.items ?? [];
  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {tasks.length > 0 && (
        <GlassCard className="py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              {doneCount} of {tasks.length} tasks done
            </span>
            <span className="text-text-tertiary">{progress}%</span>
          </div>
          <div className="bg-bg-elevated mt-2 h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-accent h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TASK_STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-text-secondary text-xs font-semibold tracking-wide uppercase">
                  {TASK_STATUS_LABEL[status]}
                  <span className="text-text-tertiary ml-1.5 font-normal normal-case">
                    {columnTasks.length}
                  </span>
                </h3>
                <button
                  onClick={() => openCreateModal(status)}
                  aria-label={`Add task to ${TASK_STATUS_LABEL[status]}`}
                  className="text-text-tertiary hover:text-text-primary rounded-md p-1 hover:bg-white/5"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(next) => handleStatusChange(task, next)}
                      onEdit={() => openEditModal(task)}
                      onDelete={() => setDeletingTask(task)}
                    />
                  ))}
                </AnimatePresence>

                {columnTasks.length === 0 && (
                  <p className="text-text-tertiary px-1 text-xs">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={createTask.isPending || updateTask.isPending}
        task={editingTask}
        defaultStatus={createStatus}
      />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        onClose={() => setDeletingTask(undefined)}
        onConfirm={handleConfirmDelete}
        title="Delete task?"
        description={`"${deletingTask?.title}" will be removed from the board. This can't be undone from the UI.`}
        isConfirming={deleteTask.isPending}
      />
    </div>
  );
}
