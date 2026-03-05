/**
 * Entity Preview Modal Type Definitions
 *
 * Types and interfaces for the approval workflow entity preview modal.
 * Used to display entity details before approval/rejection actions.
 *
 * @module entity-preview-types
 */

/**
 * Supported entity types for workflow approvals
 */
export type EntityType = "RISK" | "AUDIT_PLAN" | "BUDGET" | "FINDING" | "UNIVERSE" | "ANNUAL_AUDIT_PLAN";

/**
 * Extended entity type that includes workflow variations
 * Used for normalization from backend values
 */
export type WorkflowEntityType = EntityType | "RISK_ACCEPTANCE" | "FINDINGS" | "AUDIT_CLOSURE" | "AUDIT_UNIVERSE";

/**
 * Entity preview data with type-specific fields
 * Uses optional fields to accommodate different entity structures
 */
export interface EntityPreviewData {
  // Common fields present in most entities
  id: string;
  status?: string;

  // Generic naming fields (varies by entity type)
  title?: string;
  name?: string;
  description?: string;

  // Risk-specific fields
  category?: string;
  inherentScore?: number;
  residualScore?: number;
  risk_owner?: string;
  owner?: string;

  // Audit Plan-specific fields
  ref_no?: string;
  year?: number;
  audit_area?: string;
  audit_scope?: string;
  audit_criteria?: string;
  audit_objective?: string;

  // Budget-specific fields
  total_amount?: number;
  currency?: string;
  start_date?: string | null;
  end_date?: string | null;

  // Finding-specific fields
  finding_number?: string;
  category_name?: string;
  severity?: string;
  recommendation?: string;
  audit_plan_id?: string;
  audit_plan_name?: string;
  working_paper_id?: string;
  working_paper_name?: string;
  management_response?: string;
  objectives?: string;
  conclusion?: string;
  conformity_status?: string;
  framework?: string;
  clause_number?: string;

  // Universe-specific fields
  universe_name?: string;
  is_active?: boolean;
  items_count?: number;

  // Annual Audit Plan-specific fields
  register_id?: string;
  items?: any[];

  // Allow additional fields
  [key: string]: any;
}

/**
 * Configuration for entity preview dialog
 */
export interface EntityPreviewConfig {
  entityType: EntityType;
  entityId: string;
  entityName: string;
}

/**
 * Props for entity preview dialog component
 */
export interface EntityPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  entityType: EntityType;
  entityName: string;
  action?: "APPROVE" | "REJECT" | "APPROVED" | "REJECTED" | null;
  onProceed?: () => void;
  initialData?: EntityPreviewData;
}

/**
 * Risk score formatting result
 */
export interface RiskScoreConfig {
  label: "Low" | "Medium" | "High";
  color: string;
}
