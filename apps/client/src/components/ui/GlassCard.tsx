import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * The one signature visual element (per PHASE_0_PLANNING.md UI strategy),
 * implemented once here rather than as repeated Tailwind utility stacks
 * across every card/modal in the app.
 */
export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-surface rounded-[var(--radius-card)] p-6 shadow-xl shadow-black/20",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
