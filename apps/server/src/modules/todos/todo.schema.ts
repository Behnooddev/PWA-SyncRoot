import { z } from "zod";

export const createTodoSchema = z.object({
  projectId: z.string().min(1),
  /** Optional — presence makes this todo task-scoped instead of project-level. See TodoService.assertTaskInProject for the cross-project guard. */
  taskId: z.string().min(1).optional(),
  title: z.string().trim().min(1, "title is required").max(200),
});
export type CreateTodoInput = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    isDone: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided",
  });
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

export const reorderTodoSchema = z.object({
  direction: z.enum(["up", "down"]),
});
export type ReorderTodoInput = z.infer<typeof reorderTodoSchema>;

export const todoIdParamSchema = z.object({
  id: z.string().min(1),
});

/**
 * `taskId` here is a scope filter, not a value being written. Omitted ->
 * project-level todos only (taskId IS NULL). Provided -> todos scoped to
 * that one task. There is deliberately no "give me everything regardless
 * of scope" option in V1 — see handoffs/PHASE_8_HANDOFF.md.
 */
export const listTodosQuerySchema = z.object({
  projectId: z.string().min(1),
  taskId: z.string().min(1).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});
export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>;
