/**
 * Minimal className joiner. Deliberately not pulling in clsx + tailwind-merge
 * yet — this app doesn't have conditional-variant components complex
 * enough to need conflict resolution yet. Revisit if/when a component
 * needs to override a Tailwind class conditionally.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
