/**
 * Every DTO in @syncroot/shared-types uses ISO strings for dates (JSON has
 * no native Date type — sending a Date object serializes to the same
 * string anyway, but being explicit in the DTO type keeps client code
 * honest about what it's actually receiving). Repositories work with real
 * Date objects internally; controllers convert at the boundary using
 * these helpers instead of ad-hoc `.toISOString()` calls scattered around.
 */
export function toIso(date: Date): string;
export function toIso(date: Date | null): string | null;
export function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}
