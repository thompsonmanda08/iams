"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

function ScreenLock({ open }: { open: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [seconds, setSeconds] = useState(90);

  async function handleRefreshAuthToken() {
    setIsLoading(true);
    await lockScreenOnUserIdle(false);
    setIsLoading(false);
  }

  async function handleUserLogOut() {
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const res = await fetch("/api/logout", {
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
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((x) => x - 1);
    }, 1000);

    if (seconds == 0) {
      handleUserLogOut();
    }

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Are you still there?</DialogTitle>
          <DialogDescription>
            You have been idle for some time. You will be logged out soon.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="relative h-36 w-36">
            <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36">
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
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-semibold">{seconds}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-center text-sm">
            To protect your account, you will be logged out automatically.
          </p>
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

export function IdleTimerContainer({ authSession }: { authSession: any }) {
  const pathname = usePathname();

  const [state, setState] = useState("Active");
  const [count, setCount] = useState(0);
  const [remaining, setRemaining] = useState(0);

  const loggedIn = authSession?.accessToken;
  const isIdle = state === "Idle";

  useRefreshToken(Boolean(loggedIn && !isIdle));

  const onIdle = async () => {
    setState("Idle");
    await lockScreenOnUserIdle(true);
  };

  const onActive = () => {
    setState("Active");
  };

  const onAction = async () => setCount(count + 1);

  const { getRemainingTime } = useIdleTimer({
    onIdle,
    onActive,
    onAction,
    timeout: 60 * 1000 * 5, // 5MINS
    throttle: 500,
    disabled: !loggedIn
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000));
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  /* NO TIMER ON EXTERNAL ROUTES */
  if (pathname.startsWith("/checkout")) return null;
  if (pathname.startsWith("/invoice")) return null;
  if (pathname.startsWith("/subscriptions")) return null;

  return <></>;
}

export default ScreenLock;
