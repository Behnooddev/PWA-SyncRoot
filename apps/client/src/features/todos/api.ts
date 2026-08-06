import { api } from "@/lib/axios";
import type { ApiSuccess, OffsetPage, TodoDto } from "@syncroot/shared-types";

export interface CreateTodoPayload {
  projectId: string;
  /** Omitted -> project-level todo. Set -> scoped to that task (backend-ready; no UI surfaces this in Phase 8, see PHASE_8_HANDOFF.md). */
  taskId?: string;
  title: string;
}

export interface UpdateTodoPayload {
  title?: string;
  isDone?: boolean;
}

export interface ListTodosParams {
  projectId: string;
  taskId?: string;
  limit?: number;
  offset?: number;
}

export async function listTodos(params: ListTodosParams): Promise<OffsetPage<TodoDto>> {
  const res = await api.get<ApiSuccess<OffsetPage<TodoDto>>>("/todos", { params });
  return res.data.data;
}

export async function createTodo(payload: CreateTodoPayload): Promise<TodoDto> {
  const res = await api.post<ApiSuccess<TodoDto>>("/todos", payload);
  return res.data.data;
}

export async function updateTodo(id: string, payload: UpdateTodoPayload): Promise<TodoDto> {
  const res = await api.patch<ApiSuccess<TodoDto>>(`/todos/${id}`, payload);
  return res.data.data;
}

export async function reorderTodo(
  id: string,
  direction: "up" | "down",
): Promise<OffsetPage<TodoDto>["items"]> {
  const res = await api.patch<ApiSuccess<TodoDto[]>>(`/todos/${id}/reorder`, { direction });
  return res.data.data;
}

export async function deleteTodo(id: string): Promise<void> {
  await api.delete(`/todos/${id}`);
}
