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
