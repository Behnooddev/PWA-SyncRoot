import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatRelativeTime } from "@/lib/format";
import type { ProjectDto } from "@syncroot/shared-types";

interface ProjectCardProps {
  project: ProjectDto;
  onEdit: (project: ProjectDto) => void;
  onDelete: (project: ProjectDto) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <GlassCard className="group relative overflow-hidden p-5">
        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: project.color }} />

        <div className="absolute top-4 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(project)}
            aria-label={`Edit ${project.name}`}
            className="text-text-tertiary hover:text-text-primary rounded-md p-1.5 hover:bg-white/5"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.name}`}
            className="text-text-tertiary hover:bg-danger/10 hover:text-danger rounded-md p-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <Link to={`/projects/${project.id}`} className="block">
          <h3 className="font-display text-text-primary pr-14 text-base font-semibold">
            {project.name}
          </h3>
          <p className="text-text-secondary mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm">
            {project.description || "No description"}
          </p>
          <p className="text-text-tertiary mt-3 text-xs">
            Created {formatRelativeTime(project.createdAt)}
          </p>
        </Link>
      </GlassCard>
    </motion.div>
  );
}
