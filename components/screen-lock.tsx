"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
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
import { lockScreenOnUserIdle, logUserOut, getRefreshToken, checkScreenLockState } from "@/app/_actions/auth-actions";
import { AuthSession } from "@/lib/types";
import { toast } from "sonner";
import { SESSION_CONFIG, SCREEN_LOCK_COUNTDOWN_SECONDS, PROGRESS_CIRCLE_TOTAL } from "@/lib/session-config";
import { logger } from "@/lib/logger";

const DEFAULT_TIMEOUT = SESSION_CONFIG.SCREEN_LOCK_COUNTDOWN;

interface ScreenLockProps {
  open: boolean;
  onStillHere?: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleUserLogOut: () => void;
  hasLoggedOutRef: React.MutableRefObject<boolean>;
}

function ScreenLock({
  open,
  onStillHere,
  isLoading,
  setIsLoading,
  handleUserLogOut,
  hasLoggedOutRef
}: ScreenLockProps) {
  const [seconds, setSeconds] = useState(DEFAULT_TIMEOUT / 1000); // REMAINING SECONDS

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset countdown when dialog opens or closes
  useEffect(() => {
    if (open) {
      setSeconds(DEFAULT_TIMEOUT / 1000);
      hasLoggedOutRef.current = false;
    } else {
      // Clear interval when dialog closes
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [open]);

  const handleRefreshAuthToken = useCallback(async () => {
    setIsLoading(true);

    // Call the parent's onStillHere callback if provided
    if (onStillHere) {
      await onStillHere();
    } else {
      // Fallback to original behavior
      await lockScreenOnUserIdle(false);
    }

    setIsLoading(false);
  }, [onStillHere]);

  useEffect(() => {
    if (!open) {
      // Clear any existing interval when dialog closes
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Clear any existing interval before starting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prevSeconds) => {
        const newSeconds = prevSeconds - 1;

        console.log("Remaining seconds:", newSeconds);

        // Trigger logout when reaching 0
        if (newSeconds <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          handleUserLogOut();
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
  }, [open, handleUserLogOut]);

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
                strokeDasharray={`${(seconds / SCREEN_LOCK_COUNTDOWN_SECONDS) * PROGRESS_CIRCLE_TOTAL}, ${PROGRESS_CIRCLE_TOTAL}`}
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
                {"seconds"}
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

export function IdleTimerContainer({ session }: { session: AuthSession | null }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const hasLoggedOutRef = useRef(false);
  const [state, setState] = useState("Active");
  const [count, setCount] = useState(0);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const loggedIn = session?.accessToken || false;
  const isIdle = state === "Idle";

  // ✅ Check for persisted lock state on mount (survives page reload)
  useEffect(() => {
    const checkPersistedLockState = async () => {
      try {
        const isLocked = await checkScreenLockState();
        if (isLocked && loggedIn) {
          logger.info("Screen lock state detected from cookie, restoring lock", {
            component: "IdleTimerContainer",
            isLocked
          });
          setState("Idle");
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
  }, [loggedIn]);

  // ✅ Setup BroadcastChannel for multi-tab synchronization
  useEffect(() => {
    if (!loggedIn || typeof window === "undefined") return;

    try {
      // Create BroadcastChannel for cross-tab communication
      broadcastChannelRef.current = new BroadcastChannel("screen-lock-state");

      // Listen for messages from other tabs
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === "SCREEN_LOCK_CHANGED") {
          const { isLocked } = event.data;
          logger.info("Screen lock state changed in another tab, syncing", {
            component: "IdleTimerContainer",
            isLocked
          });
          setState(isLocked ? "Idle" : "Active");
        }
      };

      broadcastChannelRef.current.addEventListener("message", handleMessage);

      return () => {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.removeEventListener("message", handleMessage);
          broadcastChannelRef.current.close();
          broadcastChannelRef.current = null;
        }
      };
    } catch (error) {
      logger.warn("BroadcastChannel not supported, multi-tab sync disabled", {
        component: "IdleTimerContainer",
        error: (error as Error)?.message
      });
    }
  }, [loggedIn]);

  // ✅ Broadcast state changes to other tabs
  useEffect(() => {
    if (!broadcastChannelRef.current || !loggedIn) return;

    try {
      broadcastChannelRef.current.postMessage({
        type: "SCREEN_LOCK_CHANGED",
        isLocked: isIdle
      });
    } catch (error) {
      logger.debug("Failed to broadcast screen lock state change", {
        component: "IdleTimerContainer",
        error: (error as Error)?.message
      });
    }
  }, [isIdle, loggedIn]);

  // ✅ Extract all values from refresh token hook for error handling
  const {
    data: refreshData,
    error: refreshError,
    isLoading: isRefreshing
  } = useRefreshToken(Boolean(loggedIn && !isIdle));

  // ✅ Handle refresh errors
  useEffect(() => {
    if (refreshError) {
      logger.error("Background token refresh failed", refreshError, {
        component: "IdleTimerContainer"
      });

      // Optional: Show warning to user if refresh fails repeatedly
      // toast.warning("Your session may be expiring. Please save your work.");
    }
  }, [refreshError]);

  // ✅ Optional: Log refresh state for debugging
  useEffect(() => {
    if (isRefreshing) {
      logger.debug("Background token refresh in progress", {
        component: "IdleTimerContainer"
      });
    }
  }, [isRefreshing]);

  const onIdle = async () => {
    setState("Idle");
    await lockScreenOnUserIdle(true);
  };

  const onActive = () => {
    if (state === "Idle") return;
    // Reset local idle state if not idle
    setState("Active");
  };

  const onAction = async () => setCount(count + 1);

  const idleTimer = useIdleTimer({
    onIdle,
    onActive,
    onAction,
    timeout: SESSION_CONFIG.IDLE_TIMEOUT, // 5 minutes
    throttle: 500,
    disabled: !loggedIn
  });

  const handleUserLogOut = useCallback(async () => {
    if (hasLoggedOutRef.current) return; // Prevent multiple logout calls
    hasLoggedOutRef.current = true;

    setIsLoading(true);

    try {
      // Use server action for proper session cleanup (deletes cookies & JWT)
      const response = await logUserOut("User session timed out.");

      // Redirect to login regardless of response (session is already deleted)
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even on error
      window.location.replace("/login");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Callback to handle "I'm still here" button click
  const handleStillHere = useCallback(async () => {
    // First reset local idle state to close the dialog immediately
    setState("Active");

    try {
      // Try to unlock (refresh token server-side)
      const success = await lockScreenOnUserIdle(false);

      if (success) {
        // Unlock succeeded, reset idle timer
        idleTimer.reset();
        toast.success("Session extended. Welcome back!");
        return;
      }

      // Unlock failed - try manual fallback refresh as backup
      console.warn("Initial unlock failed, attempting fallback token refresh...");

      try {
        // Attempt fallback: manually call getRefreshToken
        const refreshResponse = await getRefreshToken();

        if (refreshResponse.success) {
          // Fallback refresh succeeded
          idleTimer.reset();
          toast.success("Session restored. You're all set!");
          return;
        }

        // Both unlock and refresh failed - user must logout
        console.error("Both unlock and refresh failed:", refreshResponse.message);
        toast.error("Session expired. Please log in again.");
        handleUserLogOut();
      } catch (fallbackError) {
        console.error("Fallback refresh error:", fallbackError);
        toast.error("Unable to restore session. Logging out...");
        handleUserLogOut();
      }
    } catch (error) {
      console.error("Critical error in handleStillHere:", error);
      toast.error("An unexpected error occurred. Logging out...");
      handleUserLogOut();
    }
  }, [idleTimer, handleUserLogOut]);

  /* NO TIMER ON EXTERNAL ROUTES */
  // if (pathname.startsWith("/checkout")) return null;
  // if (pathname.startsWith("/invoice")) return null;
  // if (pathname.startsWith("/subscriptions")) return null;

  // Render the ScreenLock component when idle
  if (isIdle) {
    return (
      <ScreenLock
        open={isIdle}
        onStillHere={handleStillHere}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        handleUserLogOut={handleUserLogOut}
        hasLoggedOutRef={hasLoggedOutRef}
      />
    );
  }

  return null;
}

export default ScreenLock;
