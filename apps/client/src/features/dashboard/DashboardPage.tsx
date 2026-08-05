import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FolderPlus, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/features/projects/hooks/useProjects";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { ProjectFormModal } from "@/features/projects/components/ProjectFormModal";
import { StatsBar } from "@/features/dashboard/StatsBar";
import { RecentActivityList } from "@/features/activity/RecentActivityList";
import type { ProjectDto } from "@syncroot/shared-types";

export function DashboardPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDto | undefined>(undefined);
  const [deletingProject, setDeletingProject] = useState<ProjectDto | null>(null);

  const projectsQuery = useProjects(search ? { search } : {});
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  function openCreateForm() {
    setEditingProject(undefined);
    setFormOpen(true);
  }

  function openEditForm(project: ProjectDto) {
    setEditingProject(project);
    setFormOpen(true);
  }

  function handleFormSubmit(values: { name: string; description: string; color: string }) {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      color: values.color,
    };

    if (editingProject) {
      updateProject.mutate(
        { id: editingProject.id, payload },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createProject.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  }

  function confirmDelete() {
    if (!deletingProject) return;
    deleteProject.mutate(deletingProject.id, { onSuccess: () => setDeletingProject(null) });
  }

  const projects = projectsQuery.data?.items ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-text-tertiary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search projects…"
              className="border-border-strong bg-bg-elevated text-text-primary placeholder:text-text-tertiary focus:border-accent h-10 w-full rounded-[var(--radius-control)] border pr-3 pl-9 text-sm transition-colors outline-none"
            />
          </div>
          <Button onClick={openCreateForm} className="shrink-0">
            <FolderPlus className="h-4 w-4" />
            New project
          </Button>
        </div>

        <div className="mt-4">
          <StatsBar totalProjects={projectsQuery.data?.total ?? 0} />
        </div>

        <div className="mt-6">
          {projectsQuery.isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-bg-elevated h-32 animate-pulse rounded-[var(--radius-card)]"
                />
              ))}
            </div>
          )}

          {projectsQuery.isError && (
            <GlassCard className="text-center">
              <p className="text-danger text-sm">Couldn't load projects. Is the server running?</p>
            </GlassCard>
          )}

          {projectsQuery.isSuccess && projects.length === 0 && (
            <GlassCard className="text-center">
              <p className="text-text-secondary text-sm">
                {search
                  ? `No projects match "${search}".`
                  : "No projects yet — create your first one."}
              </p>
            </GlassCard>
          )}

          {projects.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={openEditForm}
                    onDelete={setDeletingProject}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div>
        <RecentActivityList />
      </div>

      <ProjectFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={createProject.isPending || updateProject.isPending}
        project={editingProject}
      />

      <ConfirmDialog
        open={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onConfirm={confirmDelete}
        title="Delete project?"
        description={`"${deletingProject?.name}" will be removed from your dashboard. This can't be undone from the UI.`}
        isConfirming={deleteProject.isPending}
      />
    </div>
  );
}
