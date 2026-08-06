import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTodo,
  deleteTodo,
  listTodos,
  reorderTodo,
  updateTodo,
  type CreateTodoPayload,
  type UpdateTodoPayload,
} from "@/features/todos/api";

/** Same reasoning as useTasks's BOARD_PAGE_SIZE — one page covers V1's realistic scale. */
const TODO_PAGE_SIZE = 100;

function todosQueryKey(projectId: string, taskId?: string) {
  return ["todos", projectId, taskId ?? null] as const;
}

export function useTodos(projectId: string, taskId?: string) {
  return useQuery({
    queryKey: todosQueryKey(projectId, taskId),
    queryFn: () => listTodos({ projectId, taskId, limit: TODO_PAGE_SIZE }),
    enabled: Boolean(projectId),
    // Same reasoning as useTasks/useProjects: no WebSocket sync in V1, so poll.
    refetchInterval: 15_000,
  });
}

function useInvalidateTodos(projectId: string, taskId?: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: todosQueryKey(projectId, taskId) });
    // A todo change is also an activity event (except plain title edits and
    // reorders, which the service intentionally doesn't log — see
    // TodoService.update / handoffs/PHASE_8_HANDOFF.md) — refresh the
    // Dashboard's Recent Activity widget the same way useTasks does.
    void queryClient.invalidateQueries({ queryKey: ["activity", "recent"] });
  };
}

export function useCreateTodo(projectId: string, taskId?: string) {
  const invalidate = useInvalidateTodos(projectId, taskId);
  return useMutation({
    mutationFn: (payload: CreateTodoPayload) => createTodo(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTodo(projectId: string, taskId?: string) {
  const invalidate = useInvalidateTodos(projectId, taskId);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTodoPayload }) =>
      updateTodo(id, payload),
    onSuccess: invalidate,
  });
}

export function useReorderTodo(projectId: string, taskId?: string) {
  const invalidate = useInvalidateTodos(projectId, taskId);
  return useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: "up" | "down" }) =>
      reorderTodo(id, direction),
    onSuccess: invalidate,
  });
}

export function useDeleteTodo(projectId: string, taskId?: string) {
  const invalidate = useInvalidateTodos(projectId, taskId);
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: invalidate,
  });
}
