import { Badge, badgeVariants } from "./ui/badge";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

type BadgeColor = "success" | "warning" | "danger" | "info" | "default";
type BadgeStyle = "solid" | "outline";

type StatusConfig = {
  label: string;
  color: BadgeColor;
  style: BadgeStyle;
};

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
    }
  },
  compoundVariants: [
    // Solid variants
    {
      color: "success",
      style: "solid",
      className:
        "border-transparent bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
    },
    {
      color: "warning",
      style: "solid",
      className:
        "border-transparent bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
    },
    {
      color: "danger",
      style: "solid",
      className:
        "border-transparent bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
    },
    {
      color: "info",
      style: "solid",
      className:
        "border-transparent bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
    },
    {
      color: "default",
      style: "solid",
      className:
        "border-transparent bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800"
    },
    // Outline variants
    {
      color: "success",
      style: "outline",
      className:
        "border-green-400 bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
    },
    {
      color: "warning",
      style: "outline",
      className:
        "border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
    },
    {
      color: "danger",
      style: "outline",
      className:
        "border-red-400 bg-red-50 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
    },
    {
      color: "info",
      style: "outline",
      className:
        "border-blue-400 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
    },
    {
      color: "default",
      style: "outline",
      className:
        "border-gray-400 bg-gray-50 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700"
    }
  ]
});

/* ADD STATUS VALUES HERE */
const statusConfig: Record<string, StatusConfig> = {
  UNDER_REVIEW: { label: "Under Review", color: "warning", style: "outline" },
  UNIVERSE_CREATION: { label: "Universe Creation", color: "info", style: "outline" },
  APPROVED: { label: "Approved", color: "success", style: "solid" },
  ACTIVE: { label: "Active", color: "success", style: "outline" },
  INACTIVE: { label: "Inactive", color: "default", style: "outline" },
  REJECTED: { label: "Rejected", color: "danger", style: "solid" },
  PENDING: { label: "Pending", color: "warning", style: "outline" },
  COMPLETED: { label: "Completed", color: "success", style: "solid" },
  IN_PROGRESS: { label: "In Progress", color: "info", style: "outline" }
};

export const StatusBadge = ({
  status,
  className
}: {
  status: keyof typeof statusConfig;
  className?: string;
}) => {
  const config = statusConfig[status];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  const { label, color, style } = config;

  return <Badge className={cn(coloredBadgeVariants({ color, style }), className)}>{label}</Badge>;
};
