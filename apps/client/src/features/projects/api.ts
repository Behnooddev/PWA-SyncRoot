import { api } from "@/lib/axios";
import type { ApiSuccess, OffsetPage, ProjectDto } from "@syncroot/shared-types";

export interface CreateProjectPayload {
  name: string;
  description?: string;
  color?: string;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export interface ListProjectsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listProjects(params: ListProjectsParams): Promise<OffsetPage<ProjectDto>> {
  const res = await api.get<ApiSuccess<OffsetPage<ProjectDto>>>("/projects", { params });
  return res.data.data;
}

export async function getProject(id: string): Promise<ProjectDto> {
  const res = await api.get<ApiSuccess<ProjectDto>>(`/projects/${id}`);
  return res.data.data;
}

export async function createProject(payload: CreateProjectPayload): Promise<ProjectDto> {
  const res = await api.post<ApiSuccess<ProjectDto>>("/projects", payload);
  return res.data.data;
}

export async function updateProject(
  id: string,
  payload: UpdateProjectPayload,
): Promise<ProjectDto> {
  const res = await api.patch<ApiSuccess<ProjectDto>>(`/projects/${id}`, payload);
  return res.data.data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}
