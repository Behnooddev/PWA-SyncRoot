import { useParams } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";

/** Placeholder — Phase 6 builds the task board, todos, comments, files, and activity timeline here. */
export function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <GlassCard>
      <h2 className="font-display text-text-primary text-lg font-semibold">Project workspace</h2>
      <p className="text-text-secondary mt-1 text-sm">
        Project <code className="font-mono text-xs">{id}</code> — task board, todos, comments,
        files, and activity land in Phases 6–11.
      </p>
    </GlassCard>
  );
}
