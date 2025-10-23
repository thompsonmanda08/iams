"use client";

import { Badge } from "@/components/ui/badge";
import type { AuditStatus } from "@/lib/types/audit-types";
import { cn } from "@/lib/utils";

interface AuditStatusBadgeProps {
  status: AuditStatus;
  className?: string;
}

export function AuditStatusBadge({ status, className }: AuditStatusBadgeProps) {
  const config = {
    planned: {
      label: "Planned",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
  };

  const { label, className: statusClassName } = config[status] || config.planned;

  return (
    <Badge variant="outline" className={cn(statusClassName, className)}>
      {label}
    </Badge>
  );
}
