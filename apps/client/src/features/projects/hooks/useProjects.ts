import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
  type CreateProjectPayload,
  type ListProjectsParams,
  type UpdateProjectPayload,
} from "@/features/projects/api";

const projectsKey = (params: ListProjectsParams) => ["projects", params] as const;
const projectKey = (id: string) => ["projects", "detail", id] as const;

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

/**
 * Single-project fetch for the Project Workspace page (Phase 6). A 404
 * (deleted, or a stale/bad link) is a terminal, expected outcome — not a
 * transient failure — so it's excluded from retry. Anything else (network
 * blip, 500) still gets React Query's default retry behavior.
 */
export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKey(id ?? ""),
    queryFn: () => getProject(id as string),
    enabled: Boolean(id),
    refetchInterval: 15_000,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 3;
    },
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
