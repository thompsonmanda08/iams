import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { getStatusConfig, type StandardStatus, getStatusLabel } from "@/lib/statuses";

type BadgeColor = "success" | "warning" | "danger" | "info" | "default";
type BadgeStyle = "solid" | "outline";

/* Custom badge variants for solid/outline with colors */
const coloredBadgeVariants = cva("", {
  variants: {
    color: {
      success: "",
      warning: "",
      danger: "",
      info: "",
      default: ""
    },
    style: {
      solid: "",
      outline: ""
    },
    size: {
      sm: "px-2 py-1 text-xs",
      md: "px-2.5 py-1.5 text-sm",
      lg: "px-3 py-2 text-base",
      xl: "px-4 py-2.5 text-lg"
    }
  },
  defaultVariants: {
    size: "md"
  },
  compoundVariants: [
    // Solid variants
    {
      color: "default",
      style: "solid",
      className: "bg-primary! text-white "
    },
    {
      color: "success",
      style: "solid",
      className: "border-transparent bg-green-600 text-white dark:bg-green-700 "
    },
    {
      color: "warning",
      style: "solid",
      className: "border-transparent bg-orange-600 text-white dark:bg-orange-700 "
    },
    {
      color: "danger",
      style: "solid",
      className: "border-transparent bg-red-600 text-white dark:bg-red-700 "
    },
    {
      color: "info",
      style: "solid",
      className: "border-transparent bg-blue-600 text-white dark:bg-blue-700 "
    },
    {
      color: "default",
      style: "solid",
      className: "border-transparent bg-gray-600 text-white dark:bg-gray-700 "
    },
    // Outline variants
    {
      color: "success",
      style: "outline",
      className:
        "border-green-400 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
    },
    {
      color: "warning",
      style: "outline",
      className:
        "border-orange-400 bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
    },
    {
      color: "danger",
      style: "outline",
      className:
        "border-red-400 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
    },
    {
      color: "info",
      style: "outline",
      className:
        "border-blue-400 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
    },
    {
      color: "default",
      style: "outline",
      className: "border-gray-400 bg-transparent text-foreground/80"
    }
  ]
});

export interface StatusBadgeProps {
  status: StandardStatus | string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTooltip?: boolean;
  variant?: VariantProps<typeof Badge>["variant"];
}

/**
 * Universal status badge component
 *
 * Displays a formatted status badge with consistent colors and styles across the platform.
 * Uses centralized status configuration from lib/statuses.ts
 *
 * @param status - The status value (e.g., 'DRAFT', 'APPROVED', 'IN_REVIEW')
 * @param size - Badge size ('sm' | 'md' | 'lg' | 'xl'). Default: 'sm'
 * @param className - Additional CSS classes
 * @param showTooltip - Show description as tooltip (future enhancement)
 *
 * @example
 * <StatusBadge status="APPROVED" />
 * <StatusBadge status="IN_REVIEW" size="lg" />
 * <StatusBadge status="DRAFT" className="mr-2" />
 */
export const StatusBadge = ({
  status = "",
  size = "sm",
  className,
  showTooltip,
  variant = "default"
}: StatusBadgeProps) => {
  // Get configuration from centralized status config
  const config = getStatusConfig(status);

  if (!config) {
    // Fallback for unknown status - log warning in dev
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `StatusBadge: Unknown status "${status}". Consider adding it to lib/statuses.ts`
      );
    }

    return (
      <Badge
        className={cn(
          "cursor-auto",
          coloredBadgeVariants({ size, color: "default", style: "outline" }),
          className
        )}
        variant="outline"
        title={`Unknown status: ${status}`}>
        {status}
      </Badge>
    );
  }

  const { color, style, description } = config;
  const label = getStatusLabel(status);

  return (
    <Badge
      variant={variant}
      className={cn("cursor-auto", coloredBadgeVariants({ color, style, size }), className)}
      title={showTooltip ? description : undefined}>
      {label}
    </Badge>
  );
};
