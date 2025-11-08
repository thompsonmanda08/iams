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
  branch: RiskRegisterBranch;
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

export type RiskStatus = "OPEN" | "CLOSED" | "PENDING_REVIEW" | "MITIGATED";
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

export type ActionFindingsStatus = "OPEN" | "PENDING_REVIEW" | "COMPLETED" | "NEEDS_REVISION";

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
// MOCK DATA HELPERS (temporary, can be removed later)
// ============================================================================

export type MockRiskData = RiskTableRow & {
  riskId: string; // Legacy field from mock data
};
