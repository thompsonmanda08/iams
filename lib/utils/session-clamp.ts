/**
 * Bounded helpers for session-timeout values that arrive from the backend.
 *
 * The backend sends `session_timeout` in minutes. Without bounds-checking, a
 * misconfigured value (e.g. 0, NaN, or 999_999) could either trigger a refresh
 * storm or set a 2-year cookie. These helpers normalize the value into safe
 * ranges before it reaches the cookie or the refresh interval.
 */

export const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(Math.max(n, lo), hi);

/** 1 minute floor, 24 hour ceiling. Returns ms, or undefined for invalid input. */
export const sessionTimeoutMs = (rawMinutes?: number): number | undefined => {
  if (rawMinutes === undefined || rawMinutes === null) return undefined;
  if (!Number.isFinite(rawMinutes) || rawMinutes <= 0) return undefined;
  return clamp(rawMinutes * 60_000, 60_000, 24 * 60 * 60_000);
};
