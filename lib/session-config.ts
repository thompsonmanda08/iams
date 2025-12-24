/**
 * Centralized session configuration
 * All timeout values are defined here for consistency and easy adjustment
 *
 * IMPORTANT: Backend tokens are valid for 1 hour, but we use 30-minute SESSION_TTL for UX
 * - Token refresh happens every 25 minutes to keep sessions alive
 * - Both JWT payload expiry and cookie expiry are synchronized to SESSION_TTL
 * - This prevents "token has expired" errors during active use
 */
export const SESSION_CONFIG = {
  // Idle detection: User must interact within 10 minutes or screen locks
  IDLE_TIMEOUT: 10 * 60 * 1000,

  // Screen lock countdown: User has 90 seconds to click "I'm still here"
  SCREEN_LOCK_COUNTDOWN: 90 * 1000,

  // Session TTL: Maximum session duration is 60 minutes
  // Note: Both JWT and cookie expirations are synchronized to this value
  SESSION_TTL: 60 * 60 * 1000,

  // Token refresh: Refresh at 30 minutes (before 60-minute expiry)
  // This ensures tokens are refreshed before they expire
  TOKEN_REFRESH_INTERVAL: 30 * 60 * 1000
} as const;

/**
 * Calculated constants derived from SESSION_CONFIG
 * Used for progress calculations and expiry time computation
 */

// ✅ Screen lock countdown in seconds (for progress circle calculation)
export const SCREEN_LOCK_COUNTDOWN_SECONDS = SESSION_CONFIG.SCREEN_LOCK_COUNTDOWN / 1000;

// ✅ SVG circular progress total (stroke dash array total)
export const PROGRESS_CIRCLE_TOTAL = 100.5;

// ✅ Session expiry time in milliseconds (used for cookie expiry)
export const SESSION_EXPIRY_MS = SESSION_CONFIG.SESSION_TTL;
