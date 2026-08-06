import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/features/tasks/api";

/**
 * 100 is the server's clampLimit() ceiling (see lib/pagination.ts) — the
 * board shows every task for one project at once rather than paginating,
 * so this asks for as many as the API will ever return in one page. Fine
 * for V1's scale; a project regularly exceeding 100 open+closed tasks
 * would need real pagination or virtualization — out of scope for Phase 7
 * (flagged in handoffs/PHASE_7_HANDOFF.md).
 */
const BOARD_PAGE_SIZE = 100;

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => listTasks({ projectId, limit: BOARD_PAGE_SIZE }),
    enabled: Boolean(projectId),
    // Same reasoning as useProjects: no WebSocket sync in V1, so poll.
    refetchInterval: 15_000,
  });
}

function useInvalidateTasks(projectId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    // A task change is also an activity event — the Dashboard's Recent
    // Activity widget (Phase 5) should reflect it without waiting for its
    // own 15s poll to happen to land after this mutation.
    void queryClient.invalidateQueries({ queryKey: ["activity", "recent"] });
  };
}

export function useCreateTask(projectId: string) {
  const invalidate = useInvalidateTasks(projectId);
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTask(projectId: string) {
  const invalidate = useInvalidateTasks(projectId);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      updateTask(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTask(projectId: string) {
  const invalidate = useInvalidateTasks(projectId);
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: invalidate,
  });
}
