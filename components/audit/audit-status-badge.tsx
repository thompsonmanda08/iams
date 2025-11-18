"use client";

import { StatusBadge } from "@/components/status-badge";
import type { AuditStatus } from "@/lib/types/audit-types";
import { normalizeStatus } from "@/lib/statuses";

interface AuditStatusBadgeProps {
  status: AuditStatus;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTooltip?: boolean;
}

/**
 * Audit Status Badge Component
 *
 * Wrapper around StatusBadge for audit statuses.
 * Normalizes legacy kebab-case statuses to standardized UPPER_SNAKE_CASE.
 *
 * @deprecated Use StatusBadge directly. This component is provided for backward compatibility.
 *
 * @example
 * <AuditStatusBadge status="DRAFT" />
 * <AuditStatusBadge status="in-progress" /> // Legacy format - still supported
 */
export function AuditStatusBadge({
  status,
  className,
  size = "sm",
  showTooltip
}: AuditStatusBadgeProps) {
  // Normalize legacy kebab-case statuses to UPPER_SNAKE_CASE
  const normalizedStatus = normalizeStatus(status) || status.toUpperCase();

  return (
    <StatusBadge
      status={normalizedStatus}
      size={size}
      className={className}
      showTooltip={showTooltip}
    />
  );
}
