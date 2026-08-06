import { z } from "zod";

const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

/**
 * Deliberately not z.string().datetime() — that requires a full ISO-8601
 * datetime with a timezone, but a <input type="date"> on the client sends
 * a plain "YYYY-MM-DD". Date.parse() accepts both that and a full ISO
 * datetime, so this validates "is this string a real date at all" without
 * being stricter than the client's actual input format.
 */
const dateLikeString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: "must be a valid date" });

export const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1, "title is required").max(200),
  description: z.string().trim().max(4000).optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: dateLikeString.optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    dueDate: dateLikeString.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided",
  });
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listTasksQuerySchema = z.object({
  projectId: z.string().min(1),
  status: taskStatusEnum.optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
