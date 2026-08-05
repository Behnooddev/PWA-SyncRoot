import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
  type CreateProjectPayload,
  type ListProjectsParams,
  type UpdateProjectPayload,
} from "@/features/projects/api";

const projectsKey = (params: ListProjectsParams) => ["projects", params] as const;

export function useProjects(params: ListProjectsParams) {
  return useQuery({
    queryKey: projectsKey(params),
    queryFn: () => listProjects(params),
    // No WebSocket sync in V1 (see PHASE_0_PLANNING.md) — poll so a
    // project created in another tab/device shows up without a manual
    // refresh. 15s is frequent enough to feel "synced" without hammering
    // the API for a list that changes rarely.
    refetchInterval: 15_000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["activity", "recent"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      updateProject(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["activity", "recent"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["activity", "recent"] });
    },
  });
}
