import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatRelativeTime } from "@/lib/format";
import type { ProjectDto } from "@syncroot/shared-types";

interface ProjectHeaderProps {
  project: ProjectDto;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectHeader({ project, onEdit, onDelete }: ProjectHeaderProps) {
  return (
    <div>
      <Link
        to="/"
        className="text-text-tertiary hover:text-text-primary mb-3 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Dashboard
      </Link>

      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: project.color }} />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-text-primary text-xl font-semibold break-words">
              {project.name}
            </h1>
            <p className="text-text-secondary mt-1.5 text-sm break-words">
              {project.description || "No description"}
            </p>
            <p className="text-text-tertiary mt-3 text-xs">
              Created {formatRelativeTime(project.createdAt)}
              {project.updatedAt !== project.createdAt &&
                ` · Updated ${formatRelativeTime(project.updatedAt)}`}
            </p>
          </div>

          <div className="flex shrink-0 gap-1">
            <button
              onClick={onEdit}
              aria-label="Edit project"
              className="text-text-tertiary hover:text-text-primary rounded-md p-2 hover:bg-white/5"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              aria-label="Delete project"
              className="text-text-tertiary hover:bg-danger/10 hover:text-danger rounded-md p-2"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
