"use client";
/**
 * Screen Lock Component
 *
 * Multi-tab idle detection using react-idle-timer's built-in crossTab support.
 * - crossTab: true + syncTimers: true shares activity events across all tabs
 * - If ANY tab is active, ALL tabs' idle timers reset (prevents false idle on active tabs)
 * - BroadcastChannel is used only for UNLOCK sync (when user clicks "I'm still here")
 * - Lock events are NOT broadcast — only the tab that goes idle shows its own dialog
 * - Persisted lock state (cookie) restores dialog on page reload WITHOUT broadcasting
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

interface ScreenLockProps {
  open: boolean;
  onStillHere?: () => Promise<void>;
  isLoading: boolean;
  handleUserLogOut: () => void;
  hasLoggedOutRef: React.MutableRefObject<boolean>;
}

/**
 * Custom hook for countdown timer logic
 * Handles timer state, interval cleanup, and timeout callbacks
 *
 * Only executes timeout if dialog is still open (prevents logout from hidden dialogs)
 */
const useCountdownTimer = (
  open: boolean,
  onTimeout: () => void,
  hasLoggedOutRef: React.MutableRefObject<boolean>,
  timeoutSeconds: number = DEFAULT_TIMEOUT / 1000
) => {
  const [seconds, setSeconds] = useState(timeoutSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setSeconds(timeoutSeconds);
      hasLoggedOutRef.current = false;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prevSeconds) => {
        const newSeconds = prevSeconds - 1;

        if (newSeconds <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }

        return newSeconds;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, timeoutSeconds]);

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
 * Custom hook for multi-tab UNLOCK synchronization.
 *
 * KEY DESIGN: This hook ONLY handles unlock broadcasts.
 * Lock events are NOT broadcast — react-idle-timer's crossTab handles activity sharing.
 * When one tab unlocks (user clicks "I'm still here"), all tabs unlock.
 */
const useUnlockSync = (loggedIn: boolean) => {
  const [isLocked, setIsLocked] = useState(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (!loggedIn || typeof window === "undefined") return;

    let storageListener: ((e: StorageEvent) => void) | null = null;

    const handleUnlockMessage = (isUnlocked: boolean) => {
      if (isUnlocked) {
        logger.info("Received unlock broadcast from another tab", {
          component: "useUnlockSync"
        });
        setIsLocked(false);
      }
    };

    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data.type === "SCREEN_UNLOCK") {
        handleUnlockMessage(true);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SCREEN_LOCK_CHANNEL) {
        try {
          const data = event.newValue ? JSON.parse(event.newValue) : null;
          if (data?.type === "SCREEN_UNLOCK") {
            handleUnlockMessage(true);
          }
        } catch {
          logger.debug("Failed to parse storage event data", {
            component: "useUnlockSync"
          });
        }
      }
    };

    try {
      broadcastChannelRef.current = new BroadcastChannel(SCREEN_LOCK_CHANNEL);
      broadcastChannelRef.current.addEventListener("message", handleBroadcastMessage);
      logger.debug("BroadcastChannel initialized for unlock sync", {
        component: "useUnlockSync"
      });
    } catch {
      logger.warn("BroadcastChannel not supported, using localStorage fallback", {
        component: "useUnlockSync"
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

  const broadcastUnlock = useCallback(() => {
    const message = {
      type: "SCREEN_UNLOCK",
      timestamp: Date.now()
    };

    // Try BroadcastChannel first, fall back to localStorage
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(message);
        logger.debug("Broadcasted unlock via BroadcastChannel", {
          component: "useUnlockSync"
        });
      } catch {
        // Fall through to localStorage
        _broadcastViaLocalStorage(message);
      }
    } else {
      _broadcastViaLocalStorage(message);
    }
  }, []);

  return { isLocked, setIsLocked, broadcastUnlock };
};

function _broadcastViaLocalStorage(message: Record<string, unknown>) {
  try {
    localStorage.setItem(SCREEN_LOCK_CHANNEL, JSON.stringify(message));
    // Clean up localStorage after a short delay to avoid stale data
    setTimeout(() => {
      try {
        localStorage.removeItem(SCREEN_LOCK_CHANNEL);
      } catch {
        // Ignore cleanup errors
      }
    }, 1000);
  } catch {
    logger.debug("Failed to broadcast via localStorage", {
      component: "useUnlockSync"
    });
  }
}

export function IdleTimerContainer({ session }: { session: AuthSession | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const hasLoggedOutRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof useIdleTimer> | null>(null);

  const loggedIn = !!session?.accessToken;

  // Unlock sync hook — only broadcasts/receives UNLOCK events across tabs
  const { isLocked, setIsLocked, broadcastUnlock } = useUnlockSync(loggedIn);

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

  // Idle timeout callback — only locks THIS tab, no cross-tab broadcast
  const onIdle = useCallback(async () => {
    logger.debug("Idle timeout detected, locking screen", {
      component: "IdleTimerContainer.onIdle"
    });

    // Lock this tab immediately
    setIsLocked(true);

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
  }, [setIsLocked]);

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
    disabled: !loggedIn || isLocked
  });

  // Keep ref in sync for use in callbacks
  idleTimerRef.current = idleTimer;

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
      // Clear state and broadcast unlock AFTER logout completes
      setIsLocked(false);
      broadcastUnlock();
      setIsLoading(false);
      window.location.replace("/login");
    }
  }, [broadcastUnlock, setIsLocked]);

  const handleStillHere = useCallback(async () => {
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

      logger.error("Both unlock and refresh failed", {
        component: "IdleTimerContainer.handleStillHere"
      });

      notify({ description: "Session expired. Please log in again.", type: "error" });
      await handleUserLogOut();
    } catch (error) {
      logger.error("Critical error in handleStillHere", error, {
        component: "IdleTimerContainer.handleStillHere"
      });
      notify({ description: "An unexpected error occurred. Logging out...", type: "error" });
      await handleUserLogOut();
    } finally {
      setIsLoading(false);
    }
  }, [handleUserLogOut, broadcastUnlock, setIsLocked]);

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
