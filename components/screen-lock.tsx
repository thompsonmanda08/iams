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
import { lockScreenOnUserIdle } from "@/app/_actions/auth-actions";
import { AuthSession } from "@/lib/types";

const DEFAULT_TIMEOUT = 90 * 1000; // SECONDS

function ScreenLock({ open }: { open: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [seconds, setSeconds] = useState(DEFAULT_TIMEOUT / 1000); // REMAINING SECONDS
  const hasLoggedOutRef = useRef(false);

  // Reset countdown when dialog opens
  useEffect(() => {
    if (open) {
      setSeconds(DEFAULT_TIMEOUT / 1000);
      hasLoggedOutRef.current = false;
    }
  }, [open]);

  const handleRefreshAuthToken = useCallback(async () => {
    setIsLoading(true);
    await lockScreenOnUserIdle(false);
    setIsLoading(false);
  }, []);

  const handleUserLogOut = useCallback(async () => {
    if (hasLoggedOutRef.current) return; // Prevent multiple logout calls
    hasLoggedOutRef.current = true;

    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: "User session timed out." }),
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const response = await res.json();

      if (response?.redirect) {
        window.location.href = response.redirect;
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even on error
      window.location.href = "/login";
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        const newSeconds = prevSeconds - 1;

        console.log("Remaining seconds:", newSeconds);

        // Trigger logout when reaching 0
        if (newSeconds <= 0) {
          clearInterval(interval);
          handleUserLogOut();
          return 0;
        }

        return newSeconds;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
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
                strokeDasharray={`${(seconds / 90) * 100.5}, 100.5`}
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

  const [state, setState] = useState("Active");
  const [count, setCount] = useState(0);

  const loggedIn = session?.accessToken || false;
  const isIdle = state === "Idle";

  const { data } = useRefreshToken(Boolean(loggedIn && !isIdle));
  

  const onIdle = async () => {
    setState("Idle");
    await lockScreenOnUserIdle(true);
  };

  const onActive = () => {
    if (!isIdle) {
      setState("Active");
    }
  };

  const onAction = async () => setCount(count + 1);

  useIdleTimer({
    onIdle,
    onActive,
    onAction,
    timeout: 60 * 1000 * 5, // 5MINS
    // timeout: 1 * 1000 * 5, // 5SEC
    throttle: 500,
    disabled: !loggedIn
  });

  /* NO TIMER ON EXTERNAL ROUTES */
  // if (pathname.startsWith("/checkout")) return null;
  // if (pathname.startsWith("/invoice")) return null;
  // if (pathname.startsWith("/subscriptions")) return null;

  // Render the ScreenLock component when idle
  if (isIdle && session?.screen_locked) {
    return <ScreenLock open={isIdle} />;
  }

  return null;
}

export default ScreenLock;
