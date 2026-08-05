const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 hours ago", "2 days ago" — falls back to "just now" for anything under a minute. */
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
