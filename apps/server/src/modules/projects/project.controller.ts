import type { Request, Response } from "express";
import { toIso } from "@/lib/serializers.js";
import type { ProjectEntity } from "@/modules/projects/project.repository.js";
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from "@/modules/projects/project.schema.js";
import type { ProjectService } from "@/modules/projects/project.service.js";
import type { ApiSuccess, OffsetPage, ProjectDto } from "@syncroot/shared-types";

function toProjectDto(project: ProjectEntity): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    color: project.color,
    createdById: project.createdById,
    createdAt: toIso(project.createdAt),
    updatedAt: toIso(project.updatedAt),
    deletedAt: toIso(project.deletedAt),
  };
}

type IdParam = { id: string };

/**
 * Controllers only: parse what validate() already checked, call exactly
 * one service method, shape the response. No Prisma, no business rules,
 * no res.status().json() for error cases (that's errorHandler's job — see
 * asyncHandler wrapping these in project.routes.ts).
 */
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  create = async (
    req: Request<unknown, unknown, CreateProjectInput>,
    res: Response,
  ): Promise<void> => {
    const project = await this.projectService.create(req.body, req.currentUser.id);
    const body: ApiSuccess<ProjectDto> = { data: toProjectDto(project) };
    res.status(201).json(body);
  };

  list = async (
    req: Request<unknown, unknown, unknown, ListProjectsQuery>,
    res: Response,
  ): Promise<void> => {
    const page = await this.projectService.list(req.query);
    const body: ApiSuccess<OffsetPage<ProjectDto>> = {
      data: { ...page, items: page.items.map(toProjectDto) },
    };
    res.json(body);
  };

  getById = async (req: Request<IdParam>, res: Response): Promise<void> => {
    const project = await this.projectService.getById(req.params.id);
    const body: ApiSuccess<ProjectDto> = { data: toProjectDto(project) };
    res.json(body);
  };

  update = async (
    req: Request<IdParam, unknown, UpdateProjectInput>,
    res: Response,
  ): Promise<void> => {
    const project = await this.projectService.update(req.params.id, req.body, req.currentUser.id);
    const body: ApiSuccess<ProjectDto> = { data: toProjectDto(project) };
    res.json(body);
  };

  remove = async (req: Request<IdParam>, res: Response): Promise<void> => {
    await this.projectService.softDelete(req.params.id, req.currentUser.id);
    res.status(204).send();
  };
}
