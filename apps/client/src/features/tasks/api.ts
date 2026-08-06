import { api } from "@/lib/axios";
import type {
  ApiSuccess,
  OffsetPage,
  TaskDto,
  TaskPriority,
  TaskStatus,
} from "@syncroot/shared-types";

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  /** "YYYY-MM-DD" — see lib/format.ts's fromDateInputValue. */
  dueDate?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface ListTasksParams {
  projectId: string;
  status?: TaskStatus;
  limit?: number;
  offset?: number;
}

export async function listTasks(params: ListTasksParams): Promise<OffsetPage<TaskDto>> {
  const res = await api.get<ApiSuccess<OffsetPage<TaskDto>>>("/tasks", { params });
  return res.data.data;
}

export async function createTask(payload: CreateTaskPayload): Promise<TaskDto> {
  const res = await api.post<ApiSuccess<TaskDto>>("/tasks", payload);
  return res.data.data;
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<TaskDto> {
  const res = await api.patch<ApiSuccess<TaskDto>>(`/tasks/${id}`, payload);
  return res.data.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}
