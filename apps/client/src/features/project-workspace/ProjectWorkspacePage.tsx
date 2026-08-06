import { useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Activity, CheckSquare, KanbanSquare, MessageSquare, Paperclip } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/hooks/useProjects";
import { ProjectFormModal } from "@/features/projects/components/ProjectFormModal";
import { ProjectHeader } from "@/features/project-workspace/components/ProjectHeader";
import {
  WorkspaceTabs,
  isWorkspaceTab,
  type WorkspaceTab,
} from "@/features/project-workspace/components/WorkspaceTabs";
import { WorkspaceTabPlaceholder } from "@/features/project-workspace/components/WorkspaceTabPlaceholder";

const DEFAULT_TAB: WorkspaceTab = "board";

export function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const projectQuery = useProject(id);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  // Tab lives in the URL (?tab=todos) so a link to a specific tab is
  // shareable and survives a reload — same reasoning as any other
  // deep-linkable view in the app. Falls back to "board" for a missing or
  // invalid value rather than erroring.
  const tabParam = searchParams.get("tab");
  const activeTab: WorkspaceTab = isWorkspaceTab(tabParam) ? tabParam : DEFAULT_TAB;

  function setActiveTab(tab: WorkspaceTab) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === DEFAULT_TAB) {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }
        return next;
      },
      { replace: true },
    );
  }

  function handleEditSubmit(values: { name: string; description: string; color: string }) {
    if (!id) return;
    updateProject.mutate(
      {
        id,
        payload: {
          name: values.name,
          description: values.description || undefined,
          color: values.color,
        },
      },
      { onSuccess: () => setEditOpen(false) },
    );
  }

  function handleConfirmDelete() {
    if (!id) return;
    deleteProject.mutate(id, { onSuccess: () => navigate("/") });
  }

  if (!id) {
    return (
      <GlassCard className="text-center">
        <p className="text-danger text-sm">No project id in the URL.</p>
      </GlassCard>
    );
  }

  if (projectQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-bg-elevated h-28 animate-pulse rounded-[var(--radius-card)]" />
        <div className="bg-bg-elevated h-64 animate-pulse rounded-[var(--radius-card)]" />
      </div>
    );
  }

  if (projectQuery.isError) {
    const notFound =
      isAxiosError(projectQuery.error) && projectQuery.error.response?.status === 404;

    return (
      <GlassCard className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-text-primary text-sm font-medium">
          {notFound ? "This project doesn't exist or was deleted." : "Couldn't load this project."}
        </p>
        <p className="text-text-secondary text-sm">
          {notFound ? "It may have been removed from the dashboard." : "Is the server running?"}
        </p>
        <Button variant="secondary" onClick={() => navigate("/")} className="mt-1">
          Back to Dashboard
        </Button>
      </GlassCard>
    );
  }

  const project = projectQuery.data;

  // Unreachable at runtime (isLoading/isError above cover every other
  // state) — this is here purely so TS narrows `project` from
  // `ProjectDto | undefined` without relying on isLoading/isError being
  // recognized as discriminant guards on the query result type.
  if (!project) return null;

  return (
    <div className="flex flex-col gap-4">
      <ProjectHeader
        project={project}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <div>
        <WorkspaceTabs active={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {activeTab === "board" && (
            <WorkspaceTabPlaceholder
              icon={KanbanSquare}
              title="Task board"
              description="Create, edit, and drag tasks between Todo / In Progress / In Review / Done, with priority and due dates."
              phase={7}
            />
          )}
          {activeTab === "todos" && (
            <WorkspaceTabPlaceholder
              icon={CheckSquare}
              title="Todo list"
              description="Quick checklist items, project-level or attached to a specific task, with reordering and completion tracking."
              phase={8}
            />
          )}
          {activeTab === "comments" && (
            <WorkspaceTabPlaceholder
              icon={MessageSquare}
              title="Comments"
              description="Threaded discussion on the project, a task, or a todo — with authorship and timestamps."
              phase={9}
            />
          )}
          {activeTab === "files" && (
            <WorkspaceTabPlaceholder
              icon={Paperclip}
              title="Files"
              description="Upload, preview, and download files attached to this project or one of its tasks."
              phase={10}
            />
          )}
          {activeTab === "activity" && (
            <WorkspaceTabPlaceholder
              icon={Activity}
              title="Activity timeline"
              description="The full, project-scoped history — every task, todo, comment, and file event, in order."
              phase={11}
            />
          )}
        </div>
      </div>

      <ProjectFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        isSubmitting={updateProject.isPending}
        project={project}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete project?"
        description={`"${project.name}" will be removed from your dashboard. This can't be undone from the UI.`}
        isConfirming={deleteProject.isPending}
      />
    </div>
  );
}
