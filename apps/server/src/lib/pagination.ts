import type { CursorPage, OffsetPage } from "@syncroot/shared-types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Clamps a client-supplied limit into a sane range — never trust it directly in a query. */
export function clampLimit(limit: unknown, fallback = DEFAULT_LIMIT): number {
  const n = typeof limit === "string" ? Number.parseInt(limit, 10) : limit;
  if (typeof n !== "number" || Number.isNaN(n) || n <= 0) return fallback;
  return Math.min(n, MAX_LIMIT);
}

export interface OffsetParams {
  limit: number;
  offset: number;
}

/** Parses raw offset-pagination query params, applying safe defaults/clamps. */
export function parseOffsetParams(query: { limit?: unknown; offset?: unknown }): OffsetParams {
  const offsetRaw =
    typeof query.offset === "string" ? Number.parseInt(query.offset, 10) : query.offset;
  const offset =
    typeof offsetRaw === "number" && !Number.isNaN(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;
  return { limit: clampLimit(query.limit), offset };
}

/** Wraps a fetched page of rows + total count into the shared OffsetPage envelope. */
export function toOffsetPage<T>(items: T[], total: number, params: OffsetParams): OffsetPage<T> {
  return { items, total, limit: params.limit, offset: params.offset };
}

/**
 * Cursor pagination for the activity feed: we fetch `limit + 1` rows
 * ordered by createdAt/id, and if the extra row exists, its id becomes the
 * next cursor. This avoids a separate COUNT query on a table that's
 * expected to grow unbounded.
 */
export function buildCursorPage<T extends { id: string }>(
  rowsFetchedWithExtra: T[],
  limit: number,
): CursorPage<T> {
  const hasMore = rowsFetchedWithExtra.length > limit;
  const items = hasMore ? rowsFetchedWithExtra.slice(0, limit) : rowsFetchedWithExtra;
  const last = items[items.length - 1];
  return {
    items,
    nextCursor: hasMore && last ? last.id : null,
  };
}
