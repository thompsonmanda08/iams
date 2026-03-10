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
  checkScreenLockState
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
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Are you still there?</DialogTitle>
          <DialogDescription>
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
          <Button variant="destructive" disabled={isLoading} onClick={handleUserLogOut}>
            Log Out
          </Button>
          <Button disabled={isLoading} isLoading={isLoading} onClick={handleRefreshAuthToken}>
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
const useScreenLockSync = (loggedIn: boolean) => {
  const [isLocked, setIsLocked] = useState(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

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
      handleMessage(event.data.type);
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
      } catch {
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

export function IdleTimerContainer({ session }: { session: AuthSession | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const hasLoggedOutRef = useRef(false);
  // FIX #8: Prevents concurrent invocations of handleStillHere (e.g. double-click)
  const isStillHereInProgressRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof useIdleTimer> | null>(null);

  const loggedIn = !!session?.accessToken;

  // FIX #1: Destructure broadcastLogout for use in logout flows
  const { isLocked, setIsLocked, broadcastLock, broadcastUnlock, broadcastLogout } =
    useScreenLockSync(loggedIn);

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
          logger.info("Screen lock state detected from cookie, restoring lock locally", {
            component: "IdleTimerContainer"
          });
          setIsLocked(true);
          // Do NOT broadcast — other tabs manage their own state
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
  }, [loggedIn, setIsLocked]);

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
      logger.error("Exception while setting screen lock cookie", lockError, {
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

  // FIX #1: broadcastLogout instead of broadcastUnlock — other tabs redirect to /login
  // rather than simply dismissing the lock dialog with an invalid session.
  const handleUserLogOut = useCallback(async () => {
    if (hasLoggedOutRef.current) return;
    hasLoggedOutRef.current = true;

    setIsLoading(true);

    try {
      logger.info("Logging user out - session timed out", {
        component: "IdleTimerContainer.handleUserLogOut"
      });

      // Perform logout FIRST before clearing state
      const response = await logUserOut("User session timed out.");

      if (response.success) {
        logger.info("Logout successful", {
          component: "IdleTimerContainer.handleUserLogOut"
        });
      } else {
        logger.warn("Logout response indicated failure, proceeding with redirect", {
          component: "IdleTimerContainer.handleUserLogOut"
        });
      }
    } catch (error) {
      logger.error("Logout error", error, {
        component: "IdleTimerContainer.handleUserLogOut"
      });
    } finally {
      setIsLocked(false);
      // FIX #1: SCREEN_LOGOUT causes other tabs to redirect — not just dismiss the dialog
      broadcastLogout();
      setIsLoading(false);
      window.location.replace("/login");
    }
  }, [broadcastLogout, setIsLocked]);

  // FIX #7: Restructured to avoid calling handleUserLogOut from inside this function.
  // Previously the nested call caused a double setIsLoading(false) and ambiguous
  // finally-ordering. Logout logic is now inlined in both the failure and error paths.
  // FIX #8: isStillHereInProgressRef prevents concurrent calls from double-clicks.
  const handleStillHere = useCallback(async () => {
    if (isStillHereInProgressRef.current) return; // FIX #8
    isStillHereInProgressRef.current = true;

    setIsLoading(true);
    try {
      logger.debug("User clicked 'I'm still here' - attempting to unlock screen", {
        component: "IdleTimerContainer.handleStillHere"
      });

      const success = await lockScreenOnUserIdle(false);

      if (success) {
        logger.info("Screen unlocked and session refreshed", {
          component: "IdleTimerContainer.handleStillHere"
        });
        setIsLocked(false);
        broadcastUnlock();
        idleTimerRef.current?.reset();
        notify({ description: "Session extended. Welcome back!", type: "success" });
        return;
      }

      logger.warn("Screen unlock returned false, attempting fallback token refresh", {
        component: "IdleTimerContainer.handleStillHere"
      });

      const refreshResponse = await getRefreshToken();

      if (refreshResponse.success) {
        logger.info("Fallback: Token refreshed successfully", {
          component: "IdleTimerContainer.handleStillHere"
        });
        setIsLocked(false);
        broadcastUnlock();
        idleTimerRef.current?.reset();
        notify({ description: "Session restored. You're all set!", type: "success" });
        return;
      }

      // FIX #7: Inline logout — no nested handleUserLogOut call avoids double-finally issues
      logger.error("Both unlock and refresh failed — logging out", {
        component: "IdleTimerContainer.handleStillHere"
      });
      notify({ description: "Session expired. Please log in again.", type: "error" });
      hasLoggedOutRef.current = true;
      setIsLocked(false);
      broadcastLogout(); // FIX #1: other tabs redirect to /login
      await logUserOut("Session expired after idle.").catch((e) =>
        logger.error("Logout error during session expiry", e, {
          component: "IdleTimerContainer.handleStillHere"
        })
      );
      window.location.replace("/login");
    } catch (error) {
      logger.error("Critical error in handleStillHere", error, {
        component: "IdleTimerContainer.handleStillHere"
      });
      notify({ description: "An unexpected error occurred. Logging out...", type: "error" });
      // FIX #7: Inline logout in error path as well
      hasLoggedOutRef.current = true;
      setIsLocked(false);
      broadcastLogout(); // FIX #1
      await logUserOut("Critical error during session restore.").catch((e) =>
        logger.error("Logout error during critical failure", e, {
          component: "IdleTimerContainer.handleStillHere"
        })
      );
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

  if (!isLocked) return null;

  return (
    <ScreenLock
      open={isLocked}
      onStillHere={handleStillHere}
      isLoading={isLoading}
      handleUserLogOut={handleUserLogOut}
      hasLoggedOutRef={hasLoggedOutRef}
    />
  );
}

export default ScreenLock;
