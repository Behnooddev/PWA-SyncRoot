const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 hours ago", "2 days ago" — falls back to "just now" for anything under a minute. Also works for future dates (e.g. a due date): numeric:"auto" renders those as "in 3 days". */
export function formatRelativeTime(isoDate: string): string {
  const seconds = Math.round((new Date(isoDate).getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(seconds);

  for (const [unit, secondsInUnit] of units) {
    if (absSeconds >= secondsInUnit) {
      return rtf.format(Math.round(seconds / secondsInUnit), unit);
    }
  }
  return "just now";
}

/**
 * Converts an ISO datetime string (what the API sends) to the
 * "YYYY-MM-DD" shape a native <input type="date"> needs for its `value`.
 * Slicing the ISO string is intentional over using date-fns/Date getters:
 * it avoids any local-timezone shift moving the date to the day before or
 * after, which matters for a due date where the calendar day is the only
 * thing that means anything (there's no time-of-day component in the UI).
 */
export function toDateInputValue(isoDate: string | null): string {
  return isoDate ? isoDate.slice(0, 10) : "";
}

/**
 * Reverse of toDateInputValue — the date input gives back "YYYY-MM-DD",
 * and the API expects a string it can pass to `new Date(...)` (see
 * task.schema.ts's dateLikeString). Passed through as-is; Date.parse
 * treats a date-only string as UTC midnight, which is what we want.
 */
export function fromDateInputValue(value: string): string | undefined {
  return value.length > 0 ? value : undefined;
}
