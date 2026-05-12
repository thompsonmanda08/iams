/**
 * Entity Preview Utility Functions
 *
 * Helper functions for entity preview modal functionality.
 * Includes routing, formatting, and entity type normalization.
 *
 * @module entity-preview-utils
 */

import type { EntityType, WorkflowEntityType, RiskScoreConfig } from "@/lib/types/entity-preview-types";

/**
 * Get the detail page route for an entity
 *
 * @param entityType - The type of entity
 * @param entityId - The entity ID
 * @param entityData - Optional entity data (needed for findings to get audit plan ID)
 * @returns The route path or null if not available
 */
export function getEntityDetailRoute(
  entityType: EntityType,
  entityId: string,
  entityData?: any
): string | null {
  switch (entityType) {
    case "RISK":
      return `/dashboard/risks/risk-registers/${entityId}`;

    case "AUDIT_PLAN":
      // Check if this is from an AUDIT_CLOSURE workflow
      const isClosureFlow = entityData?.original_entity_type === "AUDIT_CLOSURE";
      const baseRoute = `/dashboard/audit/plans/engagement/${entityId}`;
      return isClosureFlow ? `${baseRoute}?tab=closure` : baseRoute;

    case "BUDGET":
      return `/dashboard/audit/budgets/${entityId}`;

    case "FINDING":
      // Findings are displayed on the findings tab of the audit plan engagement page
      const auditPlanId = entityData?.audit_plan_id;
      if (auditPlanId) {
        // Route directly to the findings tab on the audit plan engagement page
        return `/dashboard/audit/plans/engagement/${auditPlanId}?tab=findings`;
      }
      return null;

    case "UNIVERSE":
      return `/dashboard/audit/universe/${entityId}`;

    case "ANNUAL_AUDIT_PLAN":
      return `/dashboard/audit/plans/annual/${entityId}`;

    case "REPORT":
      return `/dashboard/reports/${entityId}`;

    default:
      return null;
  }
}

/**
 * Normalize entity type from workflow representation to standard entity type
 *
 * @param entityType - The entity type from workflow data
 * @returns The normalized EntityType
 */
export function normalizeEntityType(entityType: string): EntityType {
  if (entityType.includes("RISK")) {
    return "RISK";
  }
  // Check ANNUAL_AUDIT_PLAN before AUDIT_PLAN since includes("AUDIT_PLAN") would match both
  if (entityType.includes("ANNUAL_AUDIT_PLAN")) {
    return "ANNUAL_AUDIT_PLAN";
  }
  if (entityType.includes("AUDIT_PLAN")) {
    return "AUDIT_PLAN";
  }
  if (entityType.includes("BUDGET")) {
    return "BUDGET";
  }
  if (entityType.includes("FINDING")) {
    return "FINDING";
  }
  if (entityType.includes("UNIVERSE")) {
    return "UNIVERSE";
  }
  if (entityType === "AUDIT_CLOSURE") {
    return "AUDIT_PLAN";
  }
  if (entityType === "REPORT_APPROVAL" || entityType.includes("REPORT")) {
    return "REPORT";
  }

  // Fallback for unknown types
  return "AUDIT_PLAN";
}

/**
 * Format a number as currency
 *
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns The formatted currency string
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "USD"
): string {
  if (amount === null || amount === undefined) {
    return "N/A";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return "N/A";
  }
}

/**
 * Format a risk score with label and color
 *
 * @param score - The numerical risk score
 * @returns Object with label and color class name
 */
export function formatRiskScore(score: number): RiskScoreConfig {
  if (score >= 15) {
    return { label: "High", color: "text-red-600" };
  }
  if (score >= 5) {
    return { label: "Medium", color: "text-yellow-600" };
  }
  return { label: "Low", color: "text-green-600" };
}

/**
 * Truncate text to a maximum length with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation (default: 150)
 * @returns The truncated text
 */
export function truncateText(text: string | null | undefined, maxLength: number = 150): string {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + "...";
}

/**
 * Get display label for entity type
 *
 * @param entityType - The entity type
 * @returns Human-readable label for the entity type
 */
export function getEntityTypeLabel(entityType: EntityType): string {
  const labels: Record<EntityType, string> = {
    RISK: "Risk",
    AUDIT_PLAN: "Audit Plan",
    BUDGET: "Budget",
    FINDING: "Finding",
    UNIVERSE: "Audit Universe",
    ANNUAL_AUDIT_PLAN: "Annual Audit Plan",
    REPORT: "Report"
  };

  return labels[entityType] || entityType;
}

/**
 * Get display label for status
 *
 * @param status - The status value
 * @returns Human-readable status label
 */
export function getStatusLabel(status: string | undefined): string {
  if (!status) {
    return "Unknown";
  }

  // Convert snake_case to Title Case
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Format a date string to a readable format
 *
 * @param date - The date string or Date object
 * @returns Formatted date string
 */
export { formatDate } from "./date-format";

/**
 * Get color variant for severity level
 *
 * @param severity - The severity level
 * @returns CSS class name for the severity color
 */
export function getSeverityColor(severity: string | undefined): string {
  if (!severity) {
    return "bg-gray-100 text-gray-800";
  }

  const lowerSeverity = severity.toLowerCase();

  if (lowerSeverity === "critical") {
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  }
  if (lowerSeverity === "high") {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
  }
  if (lowerSeverity === "medium") {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
  }
  if (lowerSeverity === "low") {
    return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  }

  return "bg-gray-100 text-gray-800";
}
