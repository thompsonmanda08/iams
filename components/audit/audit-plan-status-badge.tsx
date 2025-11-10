"use client";

import { Badge } from "@/components/ui/badge";
import type { AuditPlanStatus } from "@/lib/types/audit-types";
import { cn } from "@/lib/utils";

interface AuditPlanStatusBadgeProps {
  status: AuditPlanStatus;
  className?: string;
}

export function AuditPlanStatusBadge({ status, className }: AuditPlanStatusBadgeProps) {
  const config: Record<AuditPlanStatus, { label: string; className: string }> = {
    "DRAFT": {
      label: "Draft",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
    "SUBMITTED": {
      label: "Submitted",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    "APPROVED": {
      label: "Approved",
      className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    },
    "COMPLETED": {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    "REJECTED": {
      label: "Rejected",
      className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    },
  };

  const { label, className: statusClassName } = config[status] || config["DRAFT"];

  return (
    <Badge variant="outline" className={cn(statusClassName, className)}>
      {label}
    </Badge>
  );
}
