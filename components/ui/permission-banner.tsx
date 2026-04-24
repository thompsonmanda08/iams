"use client";

import { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface PermissionBannerProps {
  /** The message to display in the banner */
  message?: string;
  /** Optional title for the banner */
  title?: string;
  /** Visual variant */
  variant?: "warning" | "error" | "info";
  /** Whether the banner can be dismissed by the user */
  dismissible?: boolean;
  /** Callback when the banner is dismissed */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const variantStyles = {
  warning:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100",
  error:
    "border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100",
  info: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100"
};

const iconStyles = {
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400"
};

/**
 * A dismissible banner that warns users about restricted permissions.
 *
 * Use this at the top of pages or sections where users have limited access.
 * For action-level checks, use `checkPermission()` from the `usePermissions` hook instead.
 *
 * @example
 * ```tsx
 * import { PermissionBanner } from "@/components/ui/permission-banner";
 * import { usePermissions } from "@/hooks/use-permissions";
 *
 * function MyPage() {
 *   const { hasPermission } = usePermissions();
 *
 *   return (
 *     <div>
 *       {!hasPermission(MODULE_CODES.RISK_REGISTERS, "can_edit") && (
 *         <PermissionBanner
 *           title="Read-Only Access"
 *           message="You have view-only access to risk registers. Contact your administrator to request edit permissions."
 *           variant="warning"
 *           dismissible
 *         />
 *       )}
 *       {... rest of the page}
 *     </div>
 *   );
 * }
 * ```
 */
export function PermissionBanner({
  message = "You do not have full permissions for this section. Some actions may be restricted.",
  title = "Limited Access",
  variant = "warning",
  dismissible = true,
  onDismiss,
  className
}: PermissionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 rounded-lg border px-4 py-3",
        variantStyles[variant],
        className
      )}>
      <ShieldAlert className={cn("mt-0.5 h-5 w-5 shrink-0", iconStyles[variant])} />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-70 hover:opacity-100"
          onClick={handleDismiss}
          aria-label="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
