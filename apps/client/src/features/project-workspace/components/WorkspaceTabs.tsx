import type { LucideIcon } from "lucide-react";
import { Activity, CheckSquare, KanbanSquare, MessageSquare, Paperclip } from "lucide-react";
import { cn } from "@/lib/cn";

export const WORKSPACE_TABS = ["board", "todos", "comments", "files", "activity"] as const;
export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];

export function isWorkspaceTab(value: string | null): value is WorkspaceTab {
  return WORKSPACE_TABS.includes(value as WorkspaceTab);
}

const TAB_META: Record<WorkspaceTab, { label: string; icon: LucideIcon }> = {
  board: { label: "Board", icon: KanbanSquare },
  todos: { label: "Todos", icon: CheckSquare },
  comments: { label: "Comments", icon: MessageSquare },
  files: { label: "Files", icon: Paperclip },
  activity: { label: "Activity", icon: Activity },
};

interface WorkspaceTabsProps {
  active: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
}

/**
 * Underlined tab strip, not the Sidebar's nav-item style — this is a
 * secondary navigation level (within one project), and reusing the
 * primary nav's visual language here would make the two levels hard to
 * tell apart at a glance.
 */
export function WorkspaceTabs({ active, onChange }: WorkspaceTabsProps) {
  return (
    <div role="tablist" className="border-border-subtle flex gap-1 overflow-x-auto border-b">
      {WORKSPACE_TABS.map((tab) => {
        const { label, icon: Icon } = TAB_META[tab];
        const isActive = tab === active;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-accent text-text-primary"
                : "text-text-secondary hover:text-text-primary border-transparent",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
