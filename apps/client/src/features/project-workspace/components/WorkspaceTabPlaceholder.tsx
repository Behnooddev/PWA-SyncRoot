import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface WorkspaceTabPlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Which phase (per the master roadmap) builds this tab's real content. */
  phase: number;
}

/**
 * One shared placeholder for every not-yet-built workspace tab, instead of
 * five near-identical components. Phases 7–11 each replace exactly one
 * call site of this component with their real feature component — this
 * file itself doesn't change as those phases land.
 */
export function WorkspaceTabPlaceholder({
  icon: Icon,
  title,
  description,
  phase,
}: WorkspaceTabPlaceholderProps) {
  return (
    <GlassCard className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="bg-accent-muted flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="text-accent-glow h-5 w-5" />
      </div>
      <div>
        <h3 className="font-display text-text-primary text-base font-semibold">{title}</h3>
        <p className="text-text-secondary mx-auto mt-1.5 max-w-sm text-sm">{description}</p>
      </div>
      <span className="text-text-tertiary bg-bg-elevated rounded-full px-3 py-1 text-xs font-medium">
        Coming in Phase {phase}
      </span>
    </GlassCard>
  );
}
