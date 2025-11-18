"use client";

import { StatusBadge } from "@/components/status-badge";
import type { AuditPlanStatus } from "@/lib/types/audit-types";

interface AuditPlanStatusBadgeProps {
  status: AuditPlanStatus;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTooltip?: boolean;
}

/**
 * Audit Plan Status Badge Component
 *
 * Wrapper around StatusBadge for audit plan statuses.
 * Uses centralized status configuration for consistent styling.
 *
 * @deprecated Use StatusBadge directly. This component is provided for backward compatibility.
 *
 * @example
 * <AuditPlanStatusBadge status="APPROVED" />
 * <AuditPlanStatusBadge status="DRAFT" size="lg" />
 */
export function AuditPlanStatusBadge({
  status,
  className,
  size = "sm",
  showTooltip
}: AuditPlanStatusBadgeProps) {
  return (
    <StatusBadge
      status={status}
      size={size}
      className={className}
      showTooltip={showTooltip}
    />
  );
}
