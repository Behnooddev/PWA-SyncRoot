/**
 * @syncroot/shared-types
 *
 * Cross-cutting types shared between apps/client and apps/server.
 *
 * IMPORTANT: Domain entity types (Project, Task, Todo, Comment, FileAsset,
 * Activity) are intentionally NOT defined here yet. They will be derived
 * from the Prisma schema in Phase 2 and re-exported from this package, so
 * there is exactly one source of truth for entity shapes instead of two
 * hand-maintained copies drifting apart over time.
 *
 * What lives here for now: the generic envelope types every API response
 * uses, regardless of which entity it carries.
 */

/** Standard shape for every successful API response. */
export interface ApiSuccess<T> {
  data: T;
}

/** Standard shape for every failed API response. Thrown server-side as AppError subclasses. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | undefined;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

/** Offset-based pagination, used for bounded lists (projects, tasks, todos, comments). */
export interface OffsetPage<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/** Cursor-based pagination, used for the unbounded activity feed. */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

/** Every authenticated-in-spirit request carries this — no real auth in V1, see README. */
export interface CurrentUser {
  id: string;
  name: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Domain entity DTOs — Phase 2.
//
// These are hand-written to structurally mirror the Prisma models in
// apps/server/prisma/schema.prisma, NOT generated from them. The client
// deliberately never depends on @prisma/client (it pulls in the Prisma
// runtime/engine, which has no business in a browser bundle). Server-side
// repositories are responsible for returning data that matches these
// shapes — in practice that's usually a direct Prisma result, since the
// field names below match the schema field-for-field. If the two drift,
// it will surface as a type error at the controller/serialization
// boundary, not silently.
// ─────────────────────────────────────────────────────────────────────────

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ActivityType =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TODO_CREATED"
  | "TODO_COMPLETED"
  | "TODO_REOPENED"
  | "TODO_DELETED"
  | "COMMENT_CREATED"
  | "COMMENT_DELETED"
  | "FILE_UPLOADED"
  | "FILE_DELETED";

export interface UserDto {
  id: string;
  name: string;
  createdAt: string; // ISO 8601 — dates cross the wire as strings, never Date objects
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TodoDto {
  id: string;
  title: string;
  isDone: boolean;
  position: number;
  projectId: string;
  taskId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDto {
  id: string;
  content: string;
  authorId: string;
  projectId: string | null;
  taskId: string | null;
  todoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FileAssetDto {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  projectId: string;
  taskId: string | null;
  uploadedById: string;
  createdAt: string;
  /** Route the client fetches to download the file — see StorageProvider.getUrl(). */
  downloadUrl: string;
}

export interface ActivityDto {
  id: string;
  type: ActivityType;
  projectId: string;
  actorId: string;
  taskId: string | null;
  todoId: string | null;
  commentId: string | null;
  fileId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
