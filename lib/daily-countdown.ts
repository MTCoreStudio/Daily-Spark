/**
 * Daily "New Spark" countdown helpers.
 *
 * A fresh Quote of the Day is revealed every local midnight — the same day
 * boundary used by `getDailyQuote()` and the home-screen daily card. These
 * helpers are pure and testable; the ticking UI lives in
 * `hooks/useNextSparkCountdown.ts`.
 */

/** Milliseconds until the next local midnight (the next daily reveal). */
export function getMsUntilNextSpark(now: Date = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, next.getTime() - now.getTime());
}

/**
 * Compact human-readable countdown, e.g. "6h 12m", "42m", "24h".
 * Rounds up to the minute so the label never shows a stale "0m".
 */
export function formatSparkCountdown(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes === 0) return `${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes >= 1) return `${minutes}m`;
  return "just now";
}