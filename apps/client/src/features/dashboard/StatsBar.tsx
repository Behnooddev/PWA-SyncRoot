import { GlassCard } from "@/components/ui/GlassCard";
import { FolderKanban } from "lucide-react";

interface StatsBarProps {
  totalProjects: number;
}

/**
 * Deliberately just one stat for now. Task-completion-rate, overdue-count,
 * etc. would be more interesting but need Task data, which doesn't exist
 * until Phase 7 — showing a fabricated or page-limited "this week" count
 * here would be misleading rather than useful. Extend this once Tasks exist.
 */
export function StatsBar({ totalProjects }: StatsBarProps) {
  return (
    <GlassCard className="flex items-center gap-4 py-4">
      <div className="bg-accent-muted flex h-10 w-10 items-center justify-center rounded-full">
        <FolderKanban className="text-accent-glow h-5 w-5" />
      </div>
      <div>
        <p className="text-text-primary text-2xl font-semibold">{totalProjects}</p>
        <p className="text-text-tertiary text-xs">Total projects</p>
      </div>
    </GlassCard>
  );
}
