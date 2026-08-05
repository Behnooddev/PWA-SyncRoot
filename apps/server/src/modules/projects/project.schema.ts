import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "color must be a 6-digit hex code, e.g. #6E5AF0");

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  description: z.string().trim().max(2000).optional(),
  color: hexColor.optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    color: hexColor.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided",
  });
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listProjectsQuerySchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
  search: z.string().trim().max(200).optional(),
});
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
