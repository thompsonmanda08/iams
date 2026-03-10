"use client";
/**
 * Screen Lock Component
 *
 * Multi-tab idle detection using react-idle-timer's built-in crossTab support.
 * - crossTab: true + syncTimers: true shares activity events across all tabs
 * - If ANY tab is active, ALL tabs' idle timers reset (prevents false idle on active tabs)
 * - BroadcastChannel is used for LOCK, UNLOCK, and LOGOUT sync across tabs
 * - FIX #2: LOCK is the ONLY message type sent via the localStorage fallback.
 *   UNLOCK and LOGOUT are never sent via localStorage — any same-origin script can
 *   write to localStorage, so using it for security-sensitive unlocking is unsafe.
 * - FIX #1: SCREEN_LOGOUT broadcast causes all receiving tabs to redirect to /login,
 *   preventing dangling authenticated UI after the session has been deleted.
 * - FIX #3: Countdown uses a wall-clock deadline so hiding/minimizing the tab
 *   cannot defer auto-logout indefinitely.
 * - Persisted lock state (cookie) restores dialog on page reload WITHOUT broadcasting.
 */
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useIdleTimer } from "react-idle-timer";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRefreshToken } from "@/hooks/use-users-query-data";
import {
  lockScreenOnUserIdle,
  logUserOut,
  getRefreshToken,
  checkScreenLockState,
  unlockScreen,
  clearScreenLockState
} from "@/app/_actions/auth-actions";
import { AuthSession } from "@/lib/types";
import { notify } from "@/lib/utils";
import {
  SESSION_CONFIG,
  SCREEN_LOCK_COUNTDOWN_SECONDS,
  PROGRESS_CIRCLE_TOTAL
} from "@/lib/session-config";
import { logger } from "@/lib/logger";

const DEFAULT_TIMEOUT = SESSION_CONFIG.SCREEN_LOCK_COUNTDOWN;
const SCREEN_LOCK_CHANNEL = "screen-lock-state";

// FIX #1 + #2: Strict allowlist of valid broadcast types — unknown/injected types are rejected.
type BroadcastType = "SCREEN_LOCK" | "SCREEN_UNLOCK" | "SCREEN_LOGOUT";
const VALID_BROADCAST_TYPES = new Set<BroadcastType>(["SCREEN_LOCK", "SCREEN_UNLOCK", "SCREEN_LOGOUT"]);

// CRITICAL-3: Maximum age (ms) for a broadcast message before it is rejected as stale.
// Prevents replay attacks where an attacker re-injects an old SCREEN_UNLOCK message.
// BroadcastChannel messages are same-process (sub-millisecond delivery); 5 s is very generous.
const BROADCAST_MESSAGE_TTL_MS = 5_000;

// CRITICAL-4: Minimum interval (ms) between two messages of the same type.
// Prevents a malicious same-origin tab from spamming SCREEN_LOCK/UNLOCK and causing
// excessive state updates, re-renders, or concurrent API calls.
const BROADCAST_RATE_LIMIT_MS = 500;

interface ScreenLockProps {
  open: boolean;
  onStillHere?: () => Promise<void>;
  isLoading: boolean;
  handleUserLogOut: () => void;
  hasLoggedOutRef: React.MutableRefObject<boolean>;
}

/**
 * Custom hook for countdown timer logic
 *
 * FIX #3: Uses a wall-clock deadline instead of tick counting.
 * When a tab is hidden (minimized, background) and then restored, the elapsed
 * real-world time is accounted for — so hiding the browser cannot delay auto-logout.
 */
const useCountdownTimer = (
  open: boolean,
  onTimeout: () => void,
  hasLoggedOutRef: React.MutableRefObject<boolean>,
  timeoutSeconds: number = DEFAULT_TIMEOUT / 1000
) => {
  const [seconds, setSeconds] = useState(timeoutSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const deadlineRef = useRef<number | null>(null); // FIX #3: wall-clock deadline

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      // FIX #3: Compute remaining time from wall-clock deadline, not tick count
      if (deadlineRef.current === null) return;
      const remaining = Math.ceil((deadlineRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setSeconds(0);
      } else {
        setSeconds(remaining);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    if (!open) {
      stopInterval();
      return;
    }

    // FIX #3: Record wall-clock deadline so elapsed time while hidden is accounted for
    deadlineRef.current = Date.now() + timeoutSeconds * 1000;
    setSeconds(timeoutSeconds);
    hasLoggedOutRef.current = false;

    if (document.visibilityState === "visible") {
      startInterval();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopInterval();
      } else {
        // FIX #3: On resume, check if deadline already passed while the tab was hidden
        if (deadlineRef.current !== null && deadlineRef.current <= Date.now()) {
          setSeconds(0); // triggers onTimeout via the effect below
        } else {
          startInterval();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [open, timeoutSeconds, startInterval, stopInterval]);

  useEffect(() => {
    if (seconds <= 0 && open && !hasLoggedOutRef.current) {
      onTimeout();
    }
  }, [seconds, open, onTimeout, hasLoggedOutRef]);

  return seconds;
};

function ScreenLock({
  open,
  onStillHere,
  isLoading,
  handleUserLogOut,
  hasLoggedOutRef
}: ScreenLockProps) {
  const seconds = useCountdownTimer(open, handleUserLogOut, hasLoggedOutRef);

  const handleRefreshAuthToken = useCallback(async () => {
    try {
      if (onStillHere) {
        await onStillHere();
      } else {
        await lockScreenOnUserIdle(false);
      }
    } catch (error) {
      logger.error("Error in handleRefreshAuthToken", error, {
        component: "ScreenLock"
      });
      throw error;
    }
  }, [onStillHere]);

  const progress = useMemo(
    () => (seconds / SCREEN_LOCK_COUNTDOWN_SECONDS) * PROGRESS_CIRCLE_TOTAL,
    [seconds]
  );

  return (
    // MEDIUM-5: role="alertdialog" tells screen readers this is a time-sensitive alert
    // requiring immediate attention. aria-modal prevents virtual-cursor escape.
    // aria-labelledby / aria-describedby wire the title and description for AT.
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        hideCloseButton
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="lock-dialog-title"
        aria-describedby="lock-dialog-desc"
      >
        <DialogHeader>
          <DialogTitle id="lock-dialog-title">Are you still there?</DialogTitle>
          <DialogDescription id="lock-dialog-desc">
            You have been idle for some time now, you will be logged out automatically in
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="relative h-36 w-36">
            <svg className="h-full w-full" width="32" height="32" viewBox="0 0 36 36">
              <circle
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="4"
                fill="transparent"
                r="16"
                cx="18"
                cy="18"
              />
              <circle
                className="stroke-primary"
                strokeWidth="4"
                strokeDasharray={`${progress}, ${PROGRESS_CIRCLE_TOTAL}`}
                strokeLinecap="round"
                fill="transparent"
                r="16"
                cx="18"
                cy="18"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black">{seconds}</span>
              <span className="text-muted-foreground border-input/50 mt-1 rounded-full border p-2 py-1 text-xs font-medium">
                seconds
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleUserLogOut}
            aria-label="Log out immediately and end the session"
          >
            Log Out
          </Button>
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleRefreshAuthToken}
            aria-label="Confirm you are still present and extend the session"
          >
            I'm still here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Custom hook for multi-tab screen-lock synchronization.
 *
 * FIX #1: Handles SCREEN_LOGOUT broadcast — receiving tabs call window.location.replace("/login")
 * so they don't stay on the dashboard after the session cookie has been deleted.
 *
 * FIX #2: Message type is validated against an allowlist before acting.
 * localStorage fallback is restricted to LOCK-only — UNLOCK and LOGOUT are never sent
 * via localStorage because any same-origin script can write to it.
 */
const useScreenLockSync = (
  loggedIn: boolean,
  idleTimerRef: React.RefObject<ReturnType<typeof useIdleTimer> | null>
) => {
  const [isLocked, setIsLocked] = useState(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // CRITICAL-4: Tracks the last processed time per broadcast type to enforce rate limiting.
  // Defined at hook level (not inside useEffect) so it persists across effect re-runs.
  const lastMessageTimeRef = useRef<Record<BroadcastType, number>>({
    SCREEN_LOCK: 0,
    SCREEN_UNLOCK: 0,
    SCREEN_LOGOUT: 0
  });

  useEffect(() => {
    if (!loggedIn || typeof window === "undefined") return;

    let storageListener: ((e: StorageEvent) => void) | null = null;

    const handleMessage = (type: string) => {
      // FIX #2: Reject any message type not in the allowlist
      if (!VALID_BROADCAST_TYPES.has(type as BroadcastType)) {
        logger.warn("Ignoring unknown broadcast type", { type, component: "useScreenLockSync" });
        return;
      }
      if (type === "SCREEN_UNLOCK") {
        logger.info("Received SCREEN_UNLOCK broadcast from another tab", {
          component: "useScreenLockSync"
        });
        setIsLocked(false);
        // CRITICAL-2: Reset idle timer on receiving tab so the 10-min idle window
        // restarts from unlock, not from whenever the tab was last interacted with.
        idleTimerRef.current?.reset();
      } else if (type === "SCREEN_LOCK") {
        logger.info("Received SCREEN_LOCK broadcast from another tab", {
          component: "useScreenLockSync"
        });
        setIsLocked(true);
      } else if (type === "SCREEN_LOGOUT") {
        // FIX #1: Redirect this tab to login when another tab's session is terminated
        logger.info("Received SCREEN_LOGOUT broadcast — redirecting to login", {
          component: "useScreenLockSync"
        });
        window.location.replace("/login");
      }
    };

    const handleBroadcastMessage = (event: MessageEvent) => {
      const message = event.data as { type: string; timestamp?: number };
      const type = message.type as BroadcastType;

      // CRITICAL-4: Reject if same type arrived within the rate-limit window.
      // Guards against a malicious same-origin tab spamming messages to force
      // excessive state updates or concurrent API calls.
      const now = Date.now();
      const lastTime = lastMessageTimeRef.current[type] ?? 0;
      if (now - lastTime < BROADCAST_RATE_LIMIT_MS) {
        logger.warn(`Rate limited: ${type} received within ${BROADCAST_RATE_LIMIT_MS}ms`, {
          component: "useScreenLockSync",
          msSinceLast: now - lastTime
        });
        return;
      }

      // CRITICAL-3: Reject messages with no timestamp, future timestamps (clock skew),
      // or timestamps older than the TTL window — prevents replay attacks where an
      // attacker re-injects a captured SCREEN_UNLOCK message.
      const msgAge = now - (message.timestamp ?? 0);
      if (!message.timestamp || msgAge < 0) {
        logger.warn("Broadcast rejected: missing or future timestamp (possible clock skew)", {
          component: "useScreenLockSync",
          type,
          timestamp: message.timestamp
        });
        return;
      }
      if (msgAge > BROADCAST_MESSAGE_TTL_MS) {
        logger.warn(`Stale broadcast rejected: ${msgAge}ms old (TTL: ${BROADCAST_MESSAGE_TTL_MS}ms)`, {
          component: "useScreenLockSync",
          type
        });
        return;
      }

      // Update rate-limit tracker AFTER all validation so rejected messages don't
      // consume the slot (an invalid message could otherwise block a valid one).
      lastMessageTimeRef.current[type] = now;
      handleMessage(type);
    };

    // FIX #2: Only process SCREEN_LOCK from localStorage.
    // UNLOCK and LOGOUT are intentionally excluded — any same-origin script can write
    // to localStorage, so processing those types here would be a bypass vector.
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SCREEN_LOCK_CHANNEL) {
        try {
          const data = event.newValue ? JSON.parse(event.newValue) : null;
          if (data?.type === "SCREEN_LOCK") handleMessage(data.type);
        } catch {
          logger.debug("Failed to parse storage event data", {
            component: "useScreenLockSync"
          });
        }
      }
    };

    try {
      broadcastChannelRef.current = new BroadcastChannel(SCREEN_LOCK_CHANNEL);
      broadcastChannelRef.current.addEventListener("message", handleBroadcastMessage);
      logger.debug("BroadcastChannel initialized for screen-lock sync", {
        component: "useScreenLockSync"
      });
    } catch {
      logger.warn("BroadcastChannel not supported, using localStorage fallback", {
        component: "useScreenLockSync"
      });
    }

    window.addEventListener("storage", handleStorageChange);
    storageListener = handleStorageChange;

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.removeEventListener("message", handleBroadcastMessage);
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
      if (storageListener) {
        window.removeEventListener("storage", storageListener);
        storageListener = null;
      }
    };
  }, [loggedIn]);

  const broadcast = useCallback((type: BroadcastType) => {
    const message = { type, timestamp: Date.now() };

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(message);
        logger.debug(`Broadcasted ${type} via BroadcastChannel`, {
          component: "useScreenLockSync"
        });
      } catch (broadcastError) {
        logger.warn("BroadcastChannel postMessage failed, falling back to localStorage", {
          error: broadcastError instanceof Error ? broadcastError.message : String(broadcastError),
          messageType: type,
          component: "useScreenLockSync"
        });
        // FIX #2: Only LOCK events fall back to localStorage — UNLOCK/LOGOUT are unsafe there
        if (type === "SCREEN_LOCK") _broadcastViaLocalStorage(message);
      }
    } else {
      // FIX #2: Same restriction applies when BroadcastChannel is unavailable
      if (type === "SCREEN_LOCK") _broadcastViaLocalStorage(message);
    }
  }, []);

  const broadcastLock = useCallback(() => broadcast("SCREEN_LOCK"), [broadcast]);
  const broadcastUnlock = useCallback(() => broadcast("SCREEN_UNLOCK"), [broadcast]);
  // FIX #1: New broadcast type — tells all other tabs to redirect to /login
  const broadcastLogout = useCallback(() => broadcast("SCREEN_LOGOUT"), [broadcast]);

  return { isLocked, setIsLocked, broadcastLock, broadcastUnlock, broadcastLogout };
};

function _broadcastViaLocalStorage(message: Record<string, unknown>) {
  try {
    localStorage.setItem(SCREEN_LOCK_CHANNEL, JSON.stringify(message));
    // FIX #5: Increased from 1000ms to 3000ms so slow or background tabs have enough
    // time to pick up the storage event before it is cleaned up.
    setTimeout(() => {
      try {
        localStorage.removeItem(SCREEN_LOCK_CHANNEL);
      } catch {
        // Ignore cleanup errors
      }
    }, 3000);
  } catch {
    logger.debug("Failed to broadcast via localStorage", {
      component: "useScreenLockSync"
    });
  }
}

/**
 * Races a promise against a timeout. Rejects with a descriptive error if the
 * promise does not settle within `ms` milliseconds.
 * Used to ensure API calls in handleStillHere never hang indefinitely.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
}

/**
 * CRITICAL-1: Clear any client-accessible auth artifacts from localStorage /
 * sessionStorage on logout. httpOnly cookies (AUTH_SESSION, USER_SESSION, etc.)
 * cannot be accessed from JavaScript and are already cleared server-side by the
 * logUserOut → deleteSession() server action — no client-side cookie clearing needed.
 * This helper handles any non-httpOnly storage that could be exploited by XSS.
 */
function clearClientSideStorage() {
  try {
    // Remove auth-related keys if they ever end up in client-accessible storage.
    // The primary session data lives in httpOnly cookies (server-cleared on logout),
    // but defensive clearing here guards against future changes that store tokens
    // in localStorage/sessionStorage.
    const authKeys = ["accessToken", "refreshToken", "user", "permissions"];
    authKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    logger.debug("Client-side auth storage cleared", { function: "clearClientSideStorage" });
  } catch {
    // Ignore — storage APIs can throw in private-browsing or restricted environments.
  }
}

/**
 * MEDIUM-4: Fire-and-forget analytics event for screen lock observability.
 * Uses navigator.sendBeacon so it doesn't block the lock/unlock critical path.
 * If the analytics endpoint doesn't exist, the beacon fails silently.
 * The logger.info call always runs and serves as the primary audit trail.
 */
function trackLockEvent(
  eventType: "lock" | "unlock" | "timeout" | "error",
  metadata?: Record<string, unknown>
) {
  try {
    logger.info(`[analytics] screen_lock_${eventType}`, { eventType, ...metadata });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/v1/analytics/events",
        JSON.stringify({ event: `screen_lock_${eventType}`, timestamp: Date.now(), ...metadata })
      );
    }
  } catch {
    // Analytics failures must never affect the lock/unlock flow.
  }
}

export function IdleTimerContainer({ session }: { session: AuthSession | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const hasLoggedOutRef = useRef(false);
  // HIGH-5: Controls whether the logout confirmation dialog is visible.
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // FIX #8: Prevents concurrent invocations of handleStillHere (e.g. double-click)
  const isStillHereInProgressRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof useIdleTimer> | null>(null);

  const loggedIn = !!session?.accessToken;

  // FIX #1: Destructure broadcastLogout for use in logout flows
  const { isLocked, setIsLocked, broadcastLock, broadcastUnlock, broadcastLogout } =
    useScreenLockSync(loggedIn, idleTimerRef);

  // Token refresh is paused when locked (uses isLocked, not a separate isIdle)
  const { error: refreshError } = useRefreshToken(
    Boolean(loggedIn && !isLocked),
    session?.session_timeout ? session.session_timeout * 60 * 1000 : undefined
  );

  useEffect(() => {
    if (refreshError) {
      logger.error("Background token refresh failed - session may be expiring", refreshError, {
        component: "IdleTimerContainer"
      });
      notify({
        description: "Your session may be expiring. Please save your work and log back in if needed.",
        type: "warning"
      });
    }
  }, [refreshError]);

  // Check for persisted lock state on mount (survives page reload)
  // Does NOT broadcast — only restores this tab's own dialog
  useEffect(() => {
    const checkPersistedLockState = async () => {
      try {
        const persistedLock = await checkScreenLockState();
        logger.debug("Checking persisted lock state on mount", {
          component: "IdleTimerContainer",
          isLocked: persistedLock,
          loggedIn
        });

        if (persistedLock && loggedIn) {
          logger.info("Screen lock state detected from cookie, restoring lock and syncing tabs", {
            component: "IdleTimerContainer"
          });
          setIsLocked(true);
          // HIGH-5: Broadcast so tabs that missed the original SCREEN_LOCK (e.g. opened
          // after the idle event, or after a BroadcastChannel failure) are also locked.
          broadcastLock();
        }
      } catch (error) {
        logger.error("Error checking persisted lock state", error, {
          component: "IdleTimerContainer"
        });
      }
    };

    if (loggedIn) {
      checkPersistedLockState();
    }
  }, [loggedIn, setIsLocked, broadcastLock]);

  // FIX #10: onIdle implementation — kept in a ref so useIdleTimer's stable wrapper
  // always dispatches to the latest version without re-registering the timer.
  const onIdleImpl = useCallback(async () => {
    // Guard: already locked (e.g. fired again after tab becomes visible)
    if (isLocked) return;

    logger.debug("Idle timeout detected, locking screen and broadcasting to all tabs", {
      component: "IdleTimerContainer.onIdle"
    });

    // Lock this tab immediately and notify all other open tabs
    setIsLocked(true);
    broadcastLock();
    trackLockEvent("lock", { reason: "idle_timeout" }); // MEDIUM-4

    // Persist to server cookie (async, dialog already shown)
    try {
      const lockSuccess = await lockScreenOnUserIdle(true);
      if (!lockSuccess) {
        logger.warn("Screen lock cookie not set, but showing modal anyway", {
          component: "IdleTimerContainer.onIdle"
        });
      } else {
        logger.info("Screen lock activated successfully", {
          component: "IdleTimerContainer.onIdle"
        });
      }
    } catch (lockError) {
      // MEDIUM-1: narrow the unknown error before accessing .message / .stack
      const errMsg = lockError instanceof Error ? lockError.message : String(lockError);
      const errStack = lockError instanceof Error ? lockError.stack : undefined;
      logger.error("Exception while setting screen lock cookie", { message: errMsg, stack: errStack }, {
        component: "IdleTimerContainer.onIdle"
      });
    }
  }, [isLocked, setIsLocked, broadcastLock]);

  // FIX #10: Keep ref current so the stable wrapper always calls the latest onIdleImpl
  const onIdleRef = useRef(onIdleImpl);
  onIdleRef.current = onIdleImpl;

  // FIX #10: Stable callback with no deps — useIdleTimer receives a reference that never
  // changes, avoiding the risk of the timer holding a stale onIdle closure.
  const onIdle = useCallback(() => onIdleRef.current(), []);

  const onActive = useCallback(() => {
    // No-op: we don't need to manually reset because crossTab + syncTimers
    // handles activity propagation automatically. The timer only fires onIdle
    // once all tabs are idle.
  }, []);

  const idleTimer = useIdleTimer({
    onIdle,
    onActive,
    timeout: SESSION_CONFIG.IDLE_TIMEOUT,
    throttle: 500,
    crossTab: true,
    syncTimers: 200,
    // Keep timer enabled even when locked so this tab stays in the crossTab network
    // and continues syncing activity events from other tabs.
    disabled: !loggedIn
  });

  // Keep ref in sync for use in callbacks
  idleTimerRef.current = idleTimer;

  // HIGH-5: cancelLogout dismisses the confirmation dialog and resets the guard so
  // the user can still click "I'm still here" or trigger another logout request.
  const cancelLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    hasLoggedOutRef.current = false;
  }, []);

  // HIGH-5: requestLogout shows the confirmation dialog instead of logging out
  // immediately. Called by both the "Log Out" button and the countdown timeout.
  // This replaces the old handleUserLogOut as the prop passed to ScreenLock.
  const requestLogout = useCallback(() => {
    if (hasLoggedOutRef.current) return;
    hasLoggedOutRef.current = true; // prevent double-trigger while dialog is open
    setShowLogoutConfirm(true);
  }, []);

  // HIGH-2: Redirect is now gated on a successful logout response.
  // If logUserOut fails (network error, 500) we show an error toast and keep the
  // lock screen open so the user can retry — the session may still be active.
  // FIX #1: broadcastLogout → other tabs redirect to /login (not just dismiss dialog).
  // CRITICAL-1: clearClientSideStorage() removes any non-httpOnly auth artifacts.
  //   httpOnly session cookies (AUTH_SESSION etc.) are cleared server-side by
  //   logUserOut → deleteSession() and cannot be touched from JavaScript.
  const performLogout = useCallback(async () => {
    setIsLoading(true);
    let logoutSuccess = false;

    try {
      logger.info("Logging user out - session timed out", {
        component: "IdleTimerContainer.performLogout"
      });

      const response = await logUserOut("User session timed out.");

      if (response.success) {
        logoutSuccess = true;
        logger.info("Logout successful", {
          component: "IdleTimerContainer.performLogout"
        });
        trackLockEvent("timeout", { reason: "user_confirmed_logout" });
      } else {
        logger.warn("Logout response indicated failure — keeping lock screen open for retry", {
          component: "IdleTimerContainer.performLogout"
        });
        notify({
          description: "Logout failed. Session may still be active. Please close your browser if the issue persists.",
          type: "error"
        });
      }
    } catch (error) {
      logger.error("Logout error", error, {
        component: "IdleTimerContainer.performLogout"
      });
      notify({
        description: "Logout error. Please close your browser if the issue persists.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
      if (logoutSuccess) {
        // CRITICAL-1: Clear any client-accessible auth artifacts before redirect.
        clearClientSideStorage();
        setIsLocked(false);
        // FIX #1: SCREEN_LOGOUT causes other tabs to redirect — not just dismiss dialog.
        broadcastLogout();
        window.location.replace("/login");
      } else {
        // Allow retry: release hasLoggedOutRef so user can trigger again.
        hasLoggedOutRef.current = false;
      }
    }
  }, [broadcastLogout, setIsLocked]);

  // FIX #7: Restructured to avoid calling handleUserLogOut from inside this function.
  // Previously the nested call caused a double setIsLoading(false) and ambiguous
  // finally-ordering. Logout logic is now inlined in both the failure and error paths.
  // FIX #8: isStillHereInProgressRef prevents concurrent calls from double-clicks.
  // HIGH-3: Primary unlock path uses unlockScreen() which records an audit log entry.
  //   Fallback path (getRefreshToken) is kept for resilience when unlock returns false.
  // HIGH-1: clearScreenLockState() is called in the fallback path because
  //   unlockScreen → lockScreenOnUserIdle(false) already clears the cookie on the
  //   primary path; the fallback must clear it explicitly to prevent stale lock on reload.
  // MEDIUM-1: Error objects are narrowed with instanceof before accessing .message/.stack
  //   so TypeScript's unknown-typed catch variables are handled safely.
  const handleStillHere = useCallback(async () => {
    if (isStillHereInProgressRef.current) return; // FIX #8
    isStillHereInProgressRef.current = true;

    setIsLoading(true);
    try {
      logger.debug("User clicked 'I'm still here' - attempting to unlock screen", {
        component: "IdleTimerContainer.handleStillHere"
      });

      // HIGH-3: unlockScreen() wraps lockScreenOnUserIdle(false) and adds structured
      // audit logging. Also clears the lock cookie internally on success.
      const success = await withTimeout(unlockScreen(), 8000, "unlockScreen");

      if (success) {
        logger.info("Screen unlocked and session refreshed", {
          component: "IdleTimerContainer.handleStillHere"
        });
        setIsLocked(false);
        broadcastUnlock();
        idleTimerRef.current?.reset();
        notify({ description: "Session extended. Welcome back!", type: "success" });
        trackLockEvent("unlock", { method: "unlockScreen" });
        return;
      }

      logger.warn("Screen unlock returned false, attempting fallback token refresh", {
        component: "IdleTimerContainer.handleStillHere"
      });

      const refreshResponse = await withTimeout(getRefreshToken(), 8000, "getRefreshToken");

      if (refreshResponse.success) {
        logger.info("Fallback: Token refreshed successfully", {
          component: "IdleTimerContainer.handleStillHere"
        });
        // HIGH-1: Primary unlock path (unlockScreen) clears the cookie internally.
        // This fallback path does not go through lockScreenOnUserIdle, so we must
        // clear the lock cookie explicitly to prevent the dialog re-opening on reload.
        await clearScreenLockState();
        setIsLocked(false);
        broadcastUnlock();
        idleTimerRef.current?.reset();
        notify({ description: "Session restored. You're all set!", type: "success" });
        trackLockEvent("unlock", { method: "getRefreshToken_fallback" });
        return;
      }

      // FIX #7: Inline logout — no nested call avoids double-finally issues.
      // CRITICAL-1: clearClientSideStorage before redirect.
      logger.error("Both unlock and refresh failed — logging out", {
        component: "IdleTimerContainer.handleStillHere"
      });
      notify({ description: "Session expired. Please log in again.", type: "error" });
      trackLockEvent("error", { reason: "unlock_and_refresh_both_failed" });
      hasLoggedOutRef.current = true;
      setIsLocked(false);
      broadcastLogout(); // FIX #1: other tabs redirect to /login
      await logUserOut("Session expired after idle.").catch((e) => {
        // MEDIUM-1: narrow the unknown error before logging
        const msg = e instanceof Error ? e.message : String(e);
        logger.error("Logout error during session expiry", { message: msg }, {
          component: "IdleTimerContainer.handleStillHere"
        });
      });
      clearClientSideStorage(); // CRITICAL-1
      window.location.replace("/login");
    } catch (error) {
      // MEDIUM-1: narrow error type before accessing .message / .stack
      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      logger.error("Critical error in handleStillHere", { message: errMsg, stack: errStack }, {
        component: "IdleTimerContainer.handleStillHere"
      });
      notify({ description: "An unexpected error occurred. Logging out...", type: "error" });
      trackLockEvent("error", { reason: "handleStillHere_exception", message: errMsg });
      // FIX #7: Inline logout in error path as well.
      // CRITICAL-1: clearClientSideStorage before redirect.
      hasLoggedOutRef.current = true;
      setIsLocked(false);
      broadcastLogout(); // FIX #1
      await logUserOut("Critical error during session restore.").catch((e) => {
        // MEDIUM-1: narrow the unknown error before logging
        const msg = e instanceof Error ? e.message : String(e);
        logger.error("Logout error during critical failure", { message: msg }, {
          component: "IdleTimerContainer.handleStillHere"
        });
      });
      clearClientSideStorage(); // CRITICAL-1
      window.location.replace("/login");
    } finally {
      setIsLoading(false);
      isStillHereInProgressRef.current = false; // FIX #8
    }
  }, [broadcastUnlock, broadcastLogout, setIsLocked]);

  // Debug logging for state changes
  useEffect(() => {
    logger.debug("Screen lock state changed", {
      component: "IdleTimerContainer.render",
      isLocked,
      loggedIn
    });
  }, [isLocked, loggedIn]);

  // Fix D: Reset in-flight guards on unmount so a remounted component starts clean.
  // In practice the component unmounts only during navigation, but guards left true
  // would permanently block handleStillHere on the next mount.
  useEffect(() => {
    return () => {
      isStillHereInProgressRef.current = false;
      hasLoggedOutRef.current = false;
    };
  }, []);

  if (!isLocked) return null;

  return (
    <>
      {/* HIGH-5: requestLogout is passed — clicking "Log Out" or countdown-0 shows
          the confirmation dialog first rather than logging out immediately. */}
      <ScreenLock
        open={isLocked}
        onStillHere={handleStillHere}
        isLoading={isLoading}
        handleUserLogOut={requestLogout}
        hasLoggedOutRef={hasLoggedOutRef}
      />

      {/* HIGH-5: Logout confirmation dialog — shown when countdown reaches 0 or
          the user explicitly clicks "Log Out". Gives one last chance to cancel. */}
      <Dialog open={showLogoutConfirm} onOpenChange={cancelLogout}>
        <DialogContent
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          aria-describedby="logout-confirm-desc"
        >
          <DialogHeader>
            <DialogTitle id="logout-confirm-title">Confirm Logout</DialogTitle>
            <DialogDescription id="logout-confirm-desc">
              Your session has timed out. Are you sure you want to log out now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelLogout}
              aria-label="Cancel logout and return to the lock screen"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              isLoading={isLoading}
              onClick={() => {
                setShowLogoutConfirm(false);
                performLogout();
              }}
              aria-label="Confirm logout and end the session"
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ScreenLock;
