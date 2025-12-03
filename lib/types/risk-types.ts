// ============================================================================
// RISK REGISTER TYPES
// ============================================================================

export type RiskRegisterBranch = {
  id: string;
  name: string;
  code: string;
};

export type RiskRegister = {
  id: string;
  branch_id: string;
  name: string;
  description?: string;
  start_date: string;
  due_date: string;
  status: "OPEN" | "CLOSED";
  timeline_status: "ON_TRACK" | "AT_RISK" | "OVERDUE";
  department: RiskRegisterBranch;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
};

export type RiskRegistersResponse = {
  registers: RiskRegister[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

// ============================================================================
// RISK CATEGORY TYPES
// ============================================================================

export type RiskCategory = {
  id: string;
  name: string;
  code: string;
  color: string;
};

// ============================================================================
// RISK OWNER & USER TYPES
// ============================================================================

export type RiskOwner = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type Department = {
  id: string;
  name: string;
  code: string;
};

// ============================================================================
// RISK STATUS & RESPONSE TYPES
// ============================================================================

/**
 * Risk Status - Uses standardized status values from lib/statuses.ts
 *
 * Allowed statuses for risk entities:
 * - DRAFT: Risk being prepared
 * - PENDING: Awaiting action or approval
 * - OPEN: Risk is active and open
 * - IN_REVIEW: Risk is under review
 * - APPROVED: Risk has been approved
 * - ON_HOLD: Risk is paused
 * - CLOSED: Risk is closed and no longer active
 * - PENDING_REVIEW: Legacy - use IN_REVIEW
 * - MITIGATED: Legacy - use CLOSED
 *
 * @deprecated Prefer using StandardStatus from lib/statuses.ts for new code
 */
export type RiskStatus = "DRAFT" | "PENDING" | "OPEN" | "IN_REVIEW" | "APPROVED" | "ON_HOLD" | "CLOSED" | "PENDING_REVIEW" | "MITIGATED";

export type RiskResponse = "REDUCE" | "ACCEPT" | "AVOID" | "SHARE";
export type RiskMagnitude = "low" | "medium" | "high" | "critical";
export type DepartmentStatus = "OPEN" | "CLOSED";

// ============================================================================
// RISK TABLE TYPES (ActionsTable)
// ============================================================================

export type RiskTableRow = {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  department: Department;
  risk_owner: RiskOwner;
  status: string;
  department_status: DepartmentStatus;
  inherent_likelihood: number;
  inherent_impact: number;
  residual_likelihood: number;
  residual_impact: number;
  risk_response: RiskResponse;
  target_closing_date: string;
  treatment_plan: string;
  control_effectiveness: number;
  mitigation_cost: number;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// ACTION FINDINGS SUBMISSION TYPES
// ============================================================================

/**
 * Action Findings Status - Uses standardized status values from lib/statuses.ts
 *
 * Allowed statuses for action findings:
 * - OPEN: Finding is open and requires action
 * - PENDING: Finding is pending review
 * - IN_REVIEW: Finding is under review
 * - COMPLETED: Finding has been completed
 * - CLOSED: Finding is closed
 * - PENDING_REVIEW: Legacy - use IN_REVIEW
 * - NEEDS_REVISION: Legacy - use OPEN
 *
 * @deprecated Prefer using StandardStatus from lib/statuses.ts for new code
 */
export type ActionFindingsStatus = "OPEN" | "PENDING" | "IN_REVIEW" | "COMPLETED" | "CLOSED" | "PENDING_REVIEW" | "NEEDS_REVISION";

export type ActionFindings = {
  id: string;
  risk_id: string;
  action_owner_id: string;
  description: string;
  evidence_notes?: string;
  evidence_file_url?: string;
  evidence_file_name?: string;
  submission_date: Date | string;
  status: ActionFindingsStatus;
  reviewer_id?: string;
  reviewer_feedback?: string;
  assessment_score?: number; // 0-10 scale
  assessment_date?: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
};

export type SubmitActionFindingsInput = {
  risk_id: string;
  action_owner_id: string;
  description: string;
  evidence_notes?: string;
  evidence_file_url?: string;
  evidence_file_name?: string;
};

export type AssessActionFindingsInput = {
  reviewer_id: string;
  assessment_score: number; // 0-10
  reviewer_feedback: string;
  decision: "APPROVE" | "REQUEST_CHANGES";
};

// ============================================================================
// ACTION FINDINGS DIALOG TYPES
// ============================================================================

export type ActionFindingsFormData = {
  description: string;
  evidence_notes?: string;
  evidence_file?: File;
};

export type ActionFindingsFormErrors = {
  description?: string;
  evidence_notes?: string;
  evidence_file?: string;
};

// ============================================================================
// REVIEWER ASSESSMENT FORM TYPES
// ============================================================================

export type AssessmentFormData = {
  assessment_score: number; // 0-10
  reviewer_feedback: string;
  decision: "APPROVE" | "REQUEST_CHANGES";
};

export type AssessmentFormErrors = {
  assessment_score?: string;
  reviewer_feedback?: string;
  decision?: string;
};

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export type PaginationMeta = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export type RisksResponse = {
  data: RiskTableRow[];
  pagination: PaginationMeta;
};

export type ActionFindingsResponse = {
  data: ActionFindings[];
  pagination?: PaginationMeta;
};

export type SubmitActionFindingsResponse = {
  success: boolean;
  message: string;
  data?: ActionFindings;
};

export type AssessActionFindingsResponse = {
  success: boolean;
  message: string;
  data?: ActionFindings;
};

// ============================================================================
// RISK ACTION OWNER ASSIGNMENT
// ============================================================================

export type RiskActionOwnerAssignment = {
  risk_id: string;
  action_owner_id: string;
  assigned_at: string;
  assigned_by: string;
};

// ============================================================================
// RISK ACTION FILTER & QUERY TYPES
// ============================================================================

export type RiskActionQueryParams = {
  risk_action_owner_id?: string;
  status?: RiskStatus;
  department_id?: string;
  category_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export type ActionFindingsQueryParams = {
  risk_id?: string;
  action_owner_id?: string;
  reviewer_id?: string;
  status?: ActionFindingsStatus;
  page?: number;
  page_size?: number;
};

// ============================================================================
// RISK SEVERITY & SCORING TYPES
// ============================================================================

export type RiskScore = {
  inherent_score: number;
  residual_score: number;
  likelihood: number;
  impact: number;
};

export type RiskSeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// ============================================================================
// ACTION ASSIGNMENT TYPES
// ============================================================================

export type AssignActionFormErrors = {
  actionDescription?: string;
  actionOwnerIds?: string;
  reviewerIds?: string;
};

export type AssignActionInput = {
  risk_id: string;
  risk_register_id: string;
  action_description: string;
  action_owner_ids: string[]; // Users assigned to complete the action
  reviewer_ids: string[]; // Users who can review the action
  assigned_by: string; // User creating the assignment
};

export type RiskAction = {
  id: string;
  risk_id: string;
  risk_register_id: string;
  action_description: string;
  action_owner_ids: string[];
  reviewer_ids: string[];
  status: "OPEN" | "IN_PROGRESS" | "PENDING_REVIEW" | "COMPLETED";
  created_by: string;
  assigned_by: string;
  created_at: Date | string;
  updated_at: Date | string;
};

export type AssignActionResponse = {
  success: boolean;
  message: string;
  data?: RiskAction;
};

// ============================================================================
// MOCK DATA HELPERS (temporary, can be removed later)
// ============================================================================

export type MockRiskData = RiskTableRow & {
  riskId: string; // Legacy field from mock data
};
