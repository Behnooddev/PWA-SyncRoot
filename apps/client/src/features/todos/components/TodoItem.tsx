import { useState } from "react";
import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TodoDto } from "@syncroot/shared-types";

interface TodoItemProps {
  todo: TodoDto;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onRename: (title: string) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}

export function TodoItem({
  todo,
  isFirst,
  isLast,
  onToggle,
  onRename,
  onMove,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  function startEditing() {
    setDraft(todo.title);
    setIsEditing(true);
  }

  function commitEdit() {
    const trimmed = draft.trim();
    // Empty or unchanged -> silently revert rather than firing a no-op
    // PATCH; matches ProjectHeader's edit-in-place behaviour.
    if (trimmed && trimmed !== todo.title) {
      onRename(trimmed);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setDraft(todo.title);
      setIsEditing(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="group flex items-center gap-2.5 rounded-[var(--radius-control)] px-2 py-2 hover:bg-white/5"
    >
      <button
        onClick={onToggle}
        aria-label={
          todo.isDone ? `Mark "${todo.title}" as not done` : `Mark "${todo.title}" as done`
        }
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          todo.isDone
            ? "border-accent bg-accent text-white"
            : "border-border-strong hover:border-accent-glow text-transparent",
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>

      {isEditing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="text-text-primary border-accent flex-1 border-b bg-transparent text-sm outline-none"
        />
      ) : (
        <button
          onClick={startEditing}
          className={cn(
            "flex-1 truncate text-left text-sm",
            todo.isDone ? "text-text-tertiary line-through" : "text-text-primary",
          )}
        >
          {todo.title}
        </button>
      )}

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onMove("up")}
          disabled={isFirst}
          aria-label={`Move "${todo.title}" up`}
          className="text-text-tertiary hover:text-text-primary rounded-md p-1 hover:bg-white/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onMove("down")}
          disabled={isLast}
          aria-label={`Move "${todo.title}" down`}
          className="text-text-tertiary hover:text-text-primary rounded-md p-1 hover:bg-white/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          aria-label={`Delete "${todo.title}"`}
          className="text-text-tertiary hover:bg-danger/10 hover:text-danger rounded-md p-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
