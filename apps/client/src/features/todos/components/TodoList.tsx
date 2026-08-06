import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TodoItem } from "@/features/todos/components/TodoItem";
import {
  useCreateTodo,
  useDeleteTodo,
  useReorderTodo,
  useTodos,
  useUpdateTodo,
} from "@/features/todos/hooks/useTodos";
import type { TodoDto } from "@syncroot/shared-types";

interface TodoListProps {
  projectId: string;
}

/**
 * Project-level todos only in Phase 8 (taskId omitted everywhere here) —
 * task-scoped todos are a fast-follow the backend already supports but no
 * UI surfaces yet. See handoffs/PHASE_8_HANDOFF.md.
 */
export function TodoList({ projectId }: TodoListProps) {
  const todosQuery = useTodos(projectId);
  const createTodo = useCreateTodo(projectId);
  const updateTodo = useUpdateTodo(projectId);
  const reorderTodo = useReorderTodo(projectId);
  const deleteTodo = useDeleteTodo(projectId);

  const [newTitle, setNewTitle] = useState("");
  const [deletingTodo, setDeletingTodo] = useState<TodoDto | undefined>(undefined);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    createTodo.mutate({ projectId, title }, { onSuccess: () => setNewTitle("") });
  }

  function handleConfirmDelete() {
    if (!deletingTodo) return;
    deleteTodo.mutate(deletingTodo.id, { onSuccess: () => setDeletingTodo(undefined) });
  }

  if (todosQuery.isLoading) {
    return <div className="bg-bg-elevated h-40 animate-pulse rounded-[var(--radius-card)]" />;
  }

  if (todosQuery.isError) {
    return (
      <GlassCard className="text-center">
        <p className="text-danger text-sm">Couldn't load todos. Is the server running?</p>
      </GlassCard>
    );
  }

  const todos = todosQuery.data?.items ?? [];
  const doneCount = todos.filter((t) => t.isDone).length;
  const progress = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {todos.length > 0 && (
        <GlassCard className="py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              {doneCount} of {todos.length} done
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

      <GlassCard className="p-3">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a todo…"
            aria-label="New todo title"
            className="flex-1"
          />
          <Button
            type="submit"
            size="md"
            disabled={!newTitle.trim() || createTodo.isPending}
            aria-label="Add todo"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {todos.length > 0 && (
          <div className="mt-2 flex flex-col">
            <AnimatePresence initial={false}>
              {todos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  isFirst={index === 0}
                  isLast={index === todos.length - 1}
                  onToggle={() =>
                    updateTodo.mutate({ id: todo.id, payload: { isDone: !todo.isDone } })
                  }
                  onRename={(title) => updateTodo.mutate({ id: todo.id, payload: { title } })}
                  onMove={(direction) => reorderTodo.mutate({ id: todo.id, direction })}
                  onDelete={() => setDeletingTodo(todo)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {todos.length === 0 && (
          <p className="text-text-tertiary mt-3 px-1 text-xs">
            No todos yet — add one above to get started.
          </p>
        )}
      </GlassCard>

      <ConfirmDialog
        open={Boolean(deletingTodo)}
        onClose={() => setDeletingTodo(undefined)}
        onConfirm={handleConfirmDelete}
        title="Delete todo?"
        description={`"${deletingTodo?.title}" will be removed. This can't be undone from the UI.`}
        isConfirming={deleteTodo.isPending}
      />
    </div>
  );
}
