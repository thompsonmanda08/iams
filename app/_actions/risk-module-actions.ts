/**
 * Risk Management Module Server Actions
 *
 * This file contains all server-side actions for the Risk Management Module.
 * Currently uses mock data for development. Replace with real API calls when backend is ready.
 *
 * Based on INFRATEL Risk Management Framework API endpoints.
 * See: docs/API_DOCS.md for complete API documentation
 *
 * @module risk-actions
 */

"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse, Pagination } from "@/lib/types";
import authenticatedApiClient, {
  handleBadRequest,
  handleError,
  successResponse
} from "./api-config";
import { cache } from "react";
import { FormData } from "@/components/forms/risk-acceptance-form";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// NOTE: RiskStatus is now imported from lib/types/risk-types.ts to maintain single source of truth
// import type { RiskStatus } from "@/lib/types/risk-types";

export type RiskResponse = "REDUCE" | "ACCEPT" | "TRANSFER" | "AVOID" | "OPTIMIZE";
export type RiskRating = "LOW" | "MEDIUM" | "HIGH";
export type RegisterStatus = "OPEN" | "CLOSED";
export type TimelineStatus = "ON_TRACK" | "AT_RISK" | "OVERDUE";
export type KRIStatus = "Green" | "Amber" | "Red";
export type KRIFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annually" | "";

// Risk Category
export interface RiskCategory {
  id: string;
  name: string;
  code: string;
  color?: string;
  department_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RiskCategoryInput {
  name: string;
  code: string;
  color?: string;
  department_id?: string;
  is_active?: boolean;
}

// Risk
export interface Risk {
  id: string;
  riskId: string;
  title: string;
  description: string;
  category: string;
  category_id?: string;
  department_id?: string;
  risk_register_id?: string;
  macro_process?: string;
  sub_process?: string;
  strategic_objective?: string;
  root_cause?: string;
  recurrence?: "ongoing" | "one-time";

  // Inherent Risk
  inherentScore: number;
  inherentImpact: number;
  inherentLikelihood: number;
  inherent_rating?: RiskRating;

  // Residual Risk
  residualScore: number;
  residualImpact: number;
  residualLikelihood: number;
  residual_rating?: RiskRating;

  // Controls
  existing_controls?: string;
  control_effectiveness?: number;

  // Response
  treatment_plan?: string;
  risk_response?: RiskResponse;
  risk_owner_id?: string;
  risk_action_owner_id?: string; // User responsible for submitting action findings
  risk_appetite_status?: "WITHIN" | "ABOVE";
  mitigation_cost?: number;

  // Status and tracking
  riskMagnitude: string;
  status: string;
  owner: string;
  target_closing_date?: Date;
  revised_target_date?: Date;
  date_closed?: Date;
  department_status?: "OPEN" | "CLOSED";
  overdue_days?: number;
  review_date?: Date;
  latest_update?: string;
  step?: 1 | 2 | 3;

  created_at?: Date;
  updated_at?: Date;
}

export interface RiskInput {
  risk_register_id: string;
  title: string;
  description: string;
  category_id: string;
  department_id: string;
  macro_process_id: string;
  sub_process_id: string;
  strategic_objective_id: string;
  root_cause: string;
  recurrence: "ongoing" | "one-time";
}

export interface RiskStepTwoInput {
  inherent_likelihood: number;
  inherent_impact: number;
  existing_controls: string;
  control_effectiveness: number;
}

export interface RiskStepThreeInput {
  residual_likelihood?: number;
  residual_impact?: number;
  treatment_plan?: string;
  risk_response_id?: string;
  risk_owner_id?: string;
  risk_appetite_status?: "WITHIN" | "ABOVE";
  target_closing_date?: Date | string;
  mitigation_cost?: number;
}

export interface RiskQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  category?: string;
  category_id?: string;
  department_id?: string;
  status?: string;
  risk_owner_id?: string;
  risk_action_owner_id?: string; // Filter actions by action owner
}

// Action Findings - For risk mitigation action tracking
export interface ActionFindings {
  id: string;
  risk_id: string;
  action_owner_id: string;
  description: string;
  evidence_notes?: string;
  evidence_file_url?: string;
  evidence_file_name?: string;
  submission_date: Date | string;
  status: "OPEN" | "PENDING_REVIEW" | "COMPLETED" | "NEEDS_REVISION";
  reviewer_id?: string;
  reviewer_feedback?: string;
  assessment_score?: number;
  assessment_date?: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ActionFindingsInput {
  action_id: string;
  task_id: string;
  evidence_description: string;
  evidence_file_url?: string | null;
  evidence_file_name?: string | null;
  evidence_file_type?: string | null;
}

export interface AssessActionFindingsInput {
  reviewer_id: string;
  assessment_score: number;
  reviewer_feedback: string;
  decision: "APPROVE" | "REQUEST_CHANGES";
}

// Action Task Type
export type TaskType = "EXECUTION" | "REVIEW";
export type ActionTaskStatus = "PENDING" | "COMPLETED";

// Action Task
export interface Task {
  id: string;
  organization_id: string;
  action_id: string;
  assigned_to: string;
  task_type: TaskType;
  status: ActionTaskStatus;
  due_date: string;
  created_at: string;
  updated_at: string;
}

// Action Execution
export interface Execution {
  id: string;
  organization_id: string;
  action_id: string;
  executor_id: string;
  evidence_description: string;
  evidence_file_url: string | null;
  evidence_file_name: string | null;
  evidence_file_type: string | null;
  status: "PENDING" | "SUBMITTED" | "REJECTED";
  submitted_at: string | null;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

// Main Action
export interface Action {
  id: string;
  organization_id: string;
  risk: string;
  risk_id: string;
  instructions: string;
  executer_id: string;
  reviewer_id: string | null;
  due_date: string;
  overdue_by: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  completion_date: string | null;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

// Complete Action Definition with all related data
export interface ActionDefinition {
  action: Action;
  task: Task;
  execution: Execution | null;
  risk_name: string;
  executer_name: string;
  executer_email: string;
  reviewer_name: string | null;
  reviewer_email: string | null;
}

// Query parameters for fetching actions
export interface ActionQueryParams {
  page?: number;
  page_size?: number;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  risk_id?: string;
  task_type?: TaskType;
}

// Risk Register
export interface RiskRegister {
  id: string;
  name: string;
  startDate: string;
  dueDate: string;
  status: "Overdue" | "Open" | "Closed";
  branch: string;
  branch_id?: string;
  timeline_status?: TimelineStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RiskRegisterInput {
  department_id: string;
  name: string;
  start_date: string;
  due_date: string;
  is_active?: boolean;
  status?: string;
}

// KRI Register
export interface KRIRegister {
  id: string;
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface KRIRegisterInput {
  name: string;
  description?: string;
  is_active?: boolean;
}

// KRI (Key Risk Indicator)
export type KRI = {
  // Original API fields
  id: string;
  name: string;
  description: string;
  kri_register_id: string;
  category_id: string;
  department_id: string;
  target_value: string;
  trigger_value: string;
  limit_value: string;
  monitoring_frequency: string;
  owner_id: string;
  is_active: boolean;
  last_measured_date: string | null;
  last_measured_value: number | null;
  last_status: KRIStatus | null;
  commentary: string;
  mitigant_plan: string;
  average_risk_score: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;

  // Nested objects
  category: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    color: string;
    sort_order: number;
    is_active: boolean;
  };
  department: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    parent_id: string | null;
    is_active: boolean;
  };
  owner: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    branch_id: string | null;
    department_id: string | null;
    role_id: string | null;
    is_active: boolean;
  };

  // Computed fields for UI (added by transformation)
  currentValue: number;
  targetValue: number;
  threshold: number;
  triggerValue: number;
  status: "normal" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  unit: string;
  lastUpdated: string;
};

export interface KRIInput {
  name: string;
  description: string;
  kri_register_id: string;
  category_id: string;
  department_id: string;
  target_value: string;
  from_trigger_value: string;
  from_trigger_condition: string;
  to_trigger_value: string;
  to_trigger_condition: string;
  limit_value: string;
  measurement_type: string;
  currency_code: string;
  monitoring_frequency: KRIFrequency | "";
  owner_id: string;
  status_evaluation_method: string;
  use_moving_average: boolean;
  moving_average_days: number;
  invert_direction: boolean;
  auto_generate_risks: boolean;
  commentary: string;
  mitigant_plan: string;
}

export interface KRIMeasurement {
  id: string;
  kri_id: string;
  measurement_date: Date;
  measured_value: number;
  status: KRIStatus;
  notes?: string;
  measured_by: string;
  created_at: Date;
}

export interface KRIMeasurementInput {
  measured_value: number;
  measurement_date?: Date | undefined;
}

// Heat Map Data
export interface HeatMapData {
  impact: number;
  likelihood: number;
  count: number;
  risks: Array<{ id: string; title: string }>;
}

// Risk Matrix
export interface RiskMatrix {
  low: number;
  medium: number;
  high: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

type RiskRegisterParams = {
  branch_id?: string;
  status?: string;
  name?: string;
  page?: number;
  page_size?: number;
};

interface KRIDetail {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  kri_register_id: string;
  category_id: string;
  department_id: string;
  target_value: string;
  limit_value: string;
  from_trigger_value: string;
  from_trigger_condition: string;
  to_trigger_value: string;
  to_trigger_condition: string;
  measurement_type: string;
  currency_code: string;
  monitoring_frequency: string;
  owner_id: string;
  status_evaluation_method: string;
  use_moving_average: boolean;
  invert_direction: boolean;
  is_active: boolean;
  last_measured_date: string;
  last_measured_value: number;
  last_status: string;
  trend_direction: string | null;
  trend_calculated_at: string | null;
  variance_percentage: number | null;
  primary_risk_id: string | null;
  auto_generate_risks: boolean;
  last_breach_detected_at: string | null;
  breach_severity_score: number | null;
  consecutive_red_count: number | null;
  last_linked_incident_at: string;
  incident_correlation_score: number | null;
  commentary: string;
  mitigant_plan: string;
  average_risk_score: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  department_name: string;
  kri_register: any;
  category: any;
  department: any;
  owner: any;
}

interface Measurement {
  id: string;
  kri_id: string;
  incident_id: string | null;
  measurement_date: string;
  measured_value: number;
  status: string;
  notes: string;
  measured_by: string | null;
  created_at: string;
  user?: any;
}

interface StatusSummary {
  Green?: number;
  Amber?: number;
  Red?: number;
}

// ============================================================================
// MOCK ACTION FINDINGS DATA
// ============================================================================

/**
 * Mock data for action findings submissions
 * Demonstrates the complete workflow: OPEN → PENDING_REVIEW → COMPLETED
 */
const mockActionFindings: ActionFindings[] = [
  // Completed action - approved
  {
    id: "AF-2024-001",
    risk_id: "1",
    action_owner_id: "user-security-1",
    description:
      "Implemented multi-factor authentication (MFA) for all system access points. Updated authentication framework to require OTP verification in addition to password.",
    evidence_notes:
      "MFA implementation completed on 2024-11-01. All 150 users have been enrolled. Configuration screenshots and deployment logs available. Zero failed authentications reported in first week.",
    evidence_file_url: "https://example.com/files/mfa-deployment-report.pdf",
    evidence_file_name: "mfa-deployment-report.pdf",
    submission_date: new Date("2024-11-05"),
    status: "COMPLETED",
    reviewer_id: "user-reviewer-1",
    reviewer_feedback:
      "Excellent implementation of MFA across all systems. The deployment was executed flawlessly with comprehensive user training. Control effectiveness has increased from 2/5 to 4.5/5. This significantly reduces the risk of unauthorized access.",
    assessment_score: 9,
    assessment_date: new Date("2024-11-06"),
    created_at: new Date("2024-11-05"),
    updated_at: new Date("2024-11-06")
  },

  // Pending review action
  {
    id: "AF-2024-002",
    risk_id: "1",
    action_owner_id: "user-security-1",
    description:
      "Conducted security vulnerability assessment using automated scanning tools. Identified and patched 12 critical vulnerabilities, 35 high-severity issues, and 89 medium-severity issues.",
    evidence_notes:
      "Vulnerability scan performed on 2024-11-03 using Nessus and Qualys tools. All identified vulnerabilities have been patched and re-scanned for confirmation. Patches successfully applied to 98% of systems. Remaining 2% scheduled for next maintenance window.",
    evidence_file_url: "https://example.com/files/vuln-scan-report.pdf",
    evidence_file_name: "vulnerability-assessment-report.pdf",
    submission_date: new Date("2024-11-04"),
    status: "PENDING_REVIEW",
    created_at: new Date("2024-11-04"),
    updated_at: new Date("2024-11-04")
  },

  // Needs revision - rejected, more action needed
  {
    id: "AF-2024-003",
    risk_id: "2",
    action_owner_id: "user-compliance-1",
    description:
      "Updated data protection policy documentation to align with GDPR requirements. Added new sections on data handling procedures.",
    evidence_notes:
      "Policy document updated and circulated to stakeholders. Version 2.1 released on 2024-10-15. Initial feedback from legal team received.",
    evidence_file_url: "https://example.com/files/gdpr-policy-v2.1.docx",
    evidence_file_name: "gdpr-policy-v2.1.docx",
    submission_date: new Date("2024-10-20"),
    status: "NEEDS_REVISION",
    reviewer_id: "user-reviewer-2",
    reviewer_feedback:
      "The policy update covers basic GDPR requirements but lacks comprehensive data processing agreements (DPAs) with third-party vendors. Additionally, incident response procedures need to be more detailed. Please provide: (1) DPA templates, (2) Enhanced incident response plan, (3) Evidence of staff training completion. Once these items are addressed, this can be approved.",
    assessment_score: 5,
    assessment_date: new Date("2024-10-25"),
    created_at: new Date("2024-10-20"),
    updated_at: new Date("2024-10-25")
  },

  // Another completed action with high score
  {
    id: "AF-2024-004",
    risk_id: "1",
    action_owner_id: "user-security-1",
    description:
      "Implemented comprehensive security awareness training program for all employees. Mandatory training includes phishing simulation, password management, and social engineering tactics.",
    evidence_notes:
      "Training rollout completed on 2024-10-10. 98% of employees (147/150) completed the mandatory 2-hour training module. Average test score: 87%. Three low performers scheduled for follow-up training. Monthly simulated phishing tests show 12% click rate (industry average: 20%).",
    evidence_file_url: "https://example.com/files/security-training-completion-report.xlsx",
    evidence_file_name: "security-training-completion-report.xlsx",
    submission_date: new Date("2024-10-15"),
    status: "COMPLETED",
    reviewer_id: "user-reviewer-1",
    reviewer_feedback:
      "Outstanding security awareness program execution. The 98% completion rate and 87% average test score demonstrate strong engagement. The phishing click rate of 12% (well below industry average) shows the training is effective. This significantly improves the human security posture.",
    assessment_score: 10,
    assessment_date: new Date("2024-10-18"),
    created_at: new Date("2024-10-15"),
    updated_at: new Date("2024-10-18")
  },

  // Open action - not yet submitted
  {
    id: "AF-2024-005",
    risk_id: "2",
    action_owner_id: "user-compliance-1",
    description: "Conduct risk assessment for third-party data processors",
    status: "OPEN",
    submission_date: new Date("2024-11-07"),
    created_at: new Date("2024-11-07"),
    updated_at: new Date("2024-11-07")
  }
];

// ============================================================================
// RISK CATEGORY MANAGEMENT
// ============================================================================

/**
 * Get all risk categories
 */
export async function getRiskCategories(params?: {
  department_id?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}): Promise<APIResponse> {
  try {
     const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.page_size) queryParams.append("page_size", String(params.page_size));
    
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-categories${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`,
      params,
      method: "GET"
    });
    return successResponse(response.data?.data);
  } catch (error) {
    return handleError(error, "GET | GET RISK CATEGORIES", "/api/v1/risk-categories");
  }
}

/**
 * Get risk category by ID
 */
export async function getRiskCategory(id: string): Promise<APIResponse> {
  const url = `/api/v1/risk-categories/${id}`;
  try {
    const response = await authenticatedApiClient({
      url: url,
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET RISK CATEGORIES", url);
  }
}

/**
 * Create a new risk category
 */
export async function createRiskCategory(input: RiskCategoryInput): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risk-categories",
      data: input,
      method: "POST"
    });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "POST | CREATE RISK CATEGORY", "/api/v1/risk-categories");
  }
}

/**
 * Update a risk category
 */
export async function updateRiskCategory(
  id: string,
  input: Partial<RiskCategoryInput>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-categories/${id}`,
      data: input,
      method: "PUT"
    });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE RISK CATEGORY", `/api/v1/risk-categories/${id}`);
  }
}

/**
 * Get department risk categories
 */
export async function getDepartmentRiskCategories(departmentId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/departments/${departmentId}/risk-categories`,
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(
      error,
      "GET | GET DEPARTMENT RISK CATEGORIES",
      `/api/v1/departments/${departmentId}/risk-categories`
    );
  }
}

// ============================================================================
// RISK REGISTER MANAGEMENT
// ============================================================================

/**
 * Get all risks
 */
export async function getAllRisks(
  params?: RiskRegisterParams & {
    department_id?: string;
  }
): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.branch_id) queryParams.append("branch_id", params.branch_id);
    if (params?.department_id) queryParams.append("branch_id", params.department_id);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.name) queryParams.append("name", params.name);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.page_size) queryParams.append("page_size", String(params.page_size));

    const url = `/api/v1/risks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await authenticatedApiClient({
      url: url,
      method: "GET"
    });

    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET RISK REGISTERS", "/api/v1/risk-registers");
  }
}

/**
 * Get all risk registers
 */
export async function getRiskRegisters(params?: RiskRegisterParams): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.branch_id) queryParams.append("branch_id", params.branch_id);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.name) queryParams.append("name", params.name);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.page_size) queryParams.append("page_size", String(params.page_size));

    const url = `/api/v1/risk-registers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await authenticatedApiClient({
      url: url,
      method: "GET"
    });

    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET RISK REGISTERS", "/api/v1/risk-registers");
  }
}

/**
 * Get risk register by ID
 */
export async function getRiskRegister(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-registers/${id}`,
      method: "GET"
    });
    return successResponse(response.data);
  } catch (error) {
    return handleError(error, "GET | GET RISK REGISTER", `/api/v1/risk-registers/${id}`);
  }
}

/**
 * Create a new risk register
 */
export async function createRiskRegister(input: RiskRegisterInput): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risk-registers",
      method: "POST",
      data: input
    });
    revalidatePath("/dashboard/(modules)/risks/risk-registers");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "POST | CREATE RISK REGISTER", "/api/v1/risk-registers");
  }
}

/**
 * Update a risk register
 */
export async function updateRiskRegister(
  id: string,
  input: Partial<RiskRegisterInput>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-registers/${id}`,
      data: input,
      method: "PUT"
    });
    revalidatePath("/dashboard/(modules)/risks/risk-registers");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE RISK REGISTER", `/api/v1/risk-registers/${id}`);
  }
}

/**
 * Close a risk register
 */
export async function closeRiskRegister(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-registers/${id}/close`,
      method: "POST"
    });
    revalidatePath("/dashboard/(modules)/risks/risk-registers");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "POST | CLOSE RISK REGISTER", `/api/v1/risk-registers/${id}/close`);
  }
}

/**
 * Delete a risk register
 */
export async function deleteRiskRegister(id: string): Promise<APIResponse> {
  try {
    await authenticatedApiClient({
      url: `/api/v1/risk-registers/${id}`,
      method: "DELETE"
    });
    revalidatePath("/dashboard/(modules)/risks/risk-registers");
    return successResponse(undefined);
  } catch (error) {
    return handleError(error, "DELETE | DELETE RISK REGISTER", `/api/v1/risk-registers/${id}`);
  }
}

/**
 * Get risk registers by branch
 */
export async function getBranchRiskRegisters(branchId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/branches/${branchId}/risk-registers`,
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(
      error,
      "GET | GET BRANCH RISK REGISTERS",
      `/api/v1/branches/${branchId}/risk-registers`
    );
  }
}

// ============================================================================
// RISK MANAGEMENT (3-STEP WORKFLOW)
// ============================================================================

/**
 * Create Risk - Step One: Identification
 */
export async function createRiskStepOne(input: RiskInput): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risks/step-one",
      data: input,
      method: "POST"
    });
    revalidatePath("/dashboard/(modules)/risks/[id]");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "POST | CREATE RISK STEP ONE", "/api/v1/risks/step-one");
  }
}

/**
 * Update Risk - Step Two: Evaluation
 */
export async function updateRiskStepTwo(id: string, input: RiskStepTwoInput): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risks/${id}/step-two`,
      data: input,
      method: "PUT"
    });
    revalidatePath("/dashboard/(modules)/risks/[id]");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE RISK STEP TWO", `/api/v1/risks/${id}/step-two`);
  }
}

/**
 * Update Risk - Step Three: Response Strategy
 */
export async function updateRiskStepThree(
  id: string,
  input: RiskStepThreeInput
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risks/${id}/step-three`,
      data: input,
      method: "PUT"
    });
    revalidatePath("/dashboard/(modules)/risks/[id]");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE RISK STEP THREE", `/api/v1/risks/${id}/step-three`);
  }
}

/**
 * Get risks in a risk register
 */
async function _getRisksInRegister(
  registerId: string,
  params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }
): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.page_size) queryParams.append("page_size", String(params.page_size));

    const url = `/api/v1/risk-registers/${registerId}/risks${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await authenticatedApiClient({
      url: url,
      method: "GET"
    });

    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET RISKS IN REGISTER", `/api/v1/risks/${registerId}`);
  }
}

export const getRisksInRegister = cache(_getRisksInRegister);

/**
 * Update risk status
 */
export async function updateRiskStatus(id: string, status: any): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risks/${id}/status`,
      data: { status },
      method: "PUT"
    });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE RISK STATUS", `/api/v1/risks/${id}/status`);
  }
}

/**
 * Submit department risks
 */
export async function submitDepartmentRisks(
  registerId: string,
  departmentId: string
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-registers/${registerId}/departments/${departmentId}/submit`,
      method: "POST"
    });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(
      error,
      "POST | SUBMIT DEPARTMENT RISKS",
      `/api/v1/risk-registers/${registerId}/departments/${departmentId}/submit`
    );
  }
}

// ============================================================================
// RISK MANAGEMENT (STANDARD CRUD)
// ============================================================================

/**
 * Get risk by ID
 */
export async function getRisk(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risks/${id}`,
      method: "GET"
    });
    return successResponse(response.data);
  } catch (error) {
    return handleError(error, "GET | GET RISK", `/api/v1/risks/${id}`);
  }
}

/**
 * Create a risk
 */
export async function createRisk(input: any): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risks",
      data: input,
      method: "POST"
    });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data);
  } catch (error) {
    return handleError(error, "POST | CREATE RISK", "/api/v1/risks");
  }
}

/**
 * Update a risk
 */
export async function updateRisk(id: string, input: Partial<Risk>): Promise<APIResponse> {
  try {
    // TODO: Replace with real API call
    const response = await authenticatedApiClient({
      url: `/api/v1/risks/${id}/step-one`,
      data: input,
      method: "PUT"
    });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE RISK", `/api/v1/risks/${id}/step-one`);
  }
}

/**
 * Delete a risk
 */
export async function deleteRisk(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risks/${id}`,
      method: "DELETE"
    });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "DELETE | DELETE RISK", `/api/v1/risks/${id}`);
  }
}

/**
 * Close a risk
 */
export async function closeRisk(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risks/${id}/close`,
      method: "POST"
    });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "POST | CLOSE RISK", `/api/v1/risks/${id}/close`);
  }
}

/**
 * Get risk matrix data
 * Endpoint: GET /api/v1/risk-matrix
 */
export async function getRiskMatrix(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risk-matrix",
      method: "GET"
    });
    return successResponse(response.data.data, "Risk matrix fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET RISK MATRIX", "/api/v1/risk-matrix");
  }
}

/**
 * Get heat map data
 * Endpoint: GET /api/v1/heatmap
 */
export async function getHeatMap(): Promise<APIResponse> {
  try {
    // TODO: Replace with real API call when backend is ready
    const response = await authenticatedApiClient({
      url: "/api/v1/risks/heatmap",
      method: "GET"
    });
    return successResponse(response.data.data, "Heat map fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET HEAT MAP", "/api/v1/risks/heatmap");
  }
}

// ============================================================================
// KRI REGISTER MANAGEMENT
// ============================================================================

/**
 * Get all KRI registers
 */
export async function getKRIRegisters(params?: {
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.page_size) queryParams.append("page_size", String(params.page_size));

    const url = `/api/v1/kri-registers${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await authenticatedApiClient({
      url: url,
      method: "GET"
    });

    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET KRI REGISTERS", "/api/v1/kri-registers");
  }
}

/**
 * Get KRI register by ID
 */
export async function getKRIRegister(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/kri-registers/${id}`,
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET KRI REGISTER", `/api/v1/kri-registers/${id}`);
  }
}

/**
 * Get KRI stats
 */

export async function getKRIStats(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/kris/stats",
      method: "GET"
    });

    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET KRI STATS", "/api/v1/kris/stats");
  }
}

/**
 * Create a new KRI register
 */
export async function createKRIRegister(input: KRIRegisterInput): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/kri-registers",
      data: input,
      method: "POST"
    });
    revalidatePath("/dashboard/(modules)/risks/kri");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "POST | CREATE KRI REGISTER", "/api/v1/kri-registers");
  }
}

/**
 * Update a KRI register
 */
export async function updateKRIRegister(
  id: string,
  input: Partial<KRIRegisterInput>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/kri-registers/${id}`,
      data: input,
      method: "PUT"
    });
    revalidatePath("/dashboard/(modules)/risks/kri");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE KRI REGISTER", `/api/v1/kri-registers/${id}`);
  }
}

/**
 * Delete a KRI register
 */
export async function deleteKRIRegister(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/kri-registers/${id}`,
      method: "DELETE"
    });
    revalidatePath("/dashboard/(modules)/risks/kri");
    return successResponse(response.data.data, "KRI Register deleted successfully");
  } catch (error) {
    return handleError(error, "DELETE | DELETE KRI REGISTER", `/api/v1/kri-registers/${id}`);
  }
}

// ============================================================================
// KRI MANAGEMENT
// ============================================================================

/**
 * Get all KRIs with filters
 */
export async function _getKRIs(
  params?: Partial<Pagination> & {
    category_id?: string;
    department_id?: string;
    kri_register_id?: string;
    status?: string;
    frequency?: KRIFrequency;
    breached?: boolean;
  }
): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.category_id) queryParams.append("category_id", params.category_id);
  if (params?.department_id) queryParams.append("department_id", params.department_id);
  if (params?.kri_register_id) queryParams.append("kri_register_id", params.kri_register_id);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.frequency) queryParams.append("frequency", params.frequency);
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.page_size) queryParams.append("page_size", String(params.page_size));
  if (params?.breached) queryParams.append("breached", Boolean(params.breached).toString());

  const url = `/api/v1/kris${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  try {
    const response = await authenticatedApiClient({ url, params });
    return successResponse(response.data.data, "KRIs fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET KRIs", url);
  }
}

export const getKRIs = cache(_getKRIs);

/**
 * Get KRI by ID
 */
async function _getKRI(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/kris/${id}`,
      method: "GET"
    });
    return successResponse(response);
  } catch (error) {
    return handleError(error, "GET | GET KRI", `/api/v1/kris/${id}`);
  }
}

export const getKRI = cache(_getKRI);

/**
 * Create a new KRI
 */
export async function createKRI(input: KRIInput): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/kris",
      data: input,
      method: "POST"
    });
    revalidatePath("/dashboard/(modules)/risks/kri");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "POST | CREATE KRI", "/api/v1/kris");
  }
}

/**
 * Update a KRI
 */
export async function updateKRI(id: string, input: Partial<KRIInput>): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/kris/${id}`,
      data: input,
      method: "PUT"
    });
    revalidatePath("/dashboard/(modules)/risks/kri");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE KRI", `/api/v1/kris/${id}`);
  }
}

/**
 * Delete a KRI
 */
export async function deleteKRI(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/kris/${id}`,
      method: "DELETE"
    });
    revalidatePath("/dashboard/(modules)/risks/kri");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "DELETE | DELETE KRI", `/api/v1/kris/${id}`);
  }
}

// ============================================================================
// KRI MEASUREMENTS
// ============================================================================

/**
 * Add a KRI measurement
 */
export async function addKRIMeasurement(
  kri_id: string,
  input: KRIMeasurementInput
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/kris/${kri_id}/measurements`,
      data: input,
      method: "POST"
    });
    revalidatePath("/dashboard/(modules)/risks/kri");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "POST | ADD KRI MEASUREMENT", `/api/v1/kris/${kri_id}/measurements`);
  }
}

/**
 * Get KRI measurements
 */
export async function getKRIMeasurements(
  kriId: string,
  params?: {
    start_date?: string;
    end_date?: string;
  }
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/kris/${kriId}/measurements`,
      params,
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET KRI MEASUREMENTS", `/api/v1/kris/${kriId}/measurements`);
  }
}

/**
 * Get KRIs due for measurement
 */
export async function getKRIsDueMeasurement(params?: {
  as_of_date?: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/kris/due-measurement",
      params,
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET KRIs DUE MEASUREMENT", "/api/v1/kris/due-measurement");
  }
}

/**
 * Get KRI status summary
 */
export async function getKRIStatusSummary(params?: {
  department_id?: string;
  kri_register_id?: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/kris/status-summary",
      params,
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET KRI STATUS SUMMARY", "/api/v1/kris/status-summary");
  }
}

// ============================================================================
// ACTION FINDINGS - RISK MITIGATION TRACKING
// ============================================================================

/**
 * Submit action findings/evidence for a risk mitigation action
 * Changes status from OPEN to PENDING_REVIEW
 */
export async function submitActionFindings(data: ActionFindingsInput): Promise<APIResponse> {
  if (!data.action_id) {
    return handleBadRequest("Action ID is required");
  }

  if (!data.task_id) {
    return handleBadRequest("Task ID is required");
  }

  const url = `/api/v1/risk-actions/${data.action_id}/executions`;

  try {
    // Call the actual API endpoint to submit action findings/executions
    const response = await authenticatedApiClient({ url, method: "POST", data });

    revalidatePath("/dashboard/actions/risk");
    revalidatePath("/dashboard/actions/risk/logs");
    return successResponse(response?.data, "Action findings submitted successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | SUBMIT ACTION FINDINGS", url);
  }
}

/**
 * Get action findings for a specific risk
 */
export async function getActionFindings(riskId: string): Promise<APIResponse> {
  try {
    // Mock implementation - Replace with real API call when backend is ready
    const findings = mockActionFindings.filter((f) => f.risk_id === riskId);
    return successResponse(findings);
  } catch (error) {
    return handleError(error, "GET | GET ACTION FINDINGS", `/api/v1/risks/${riskId}/findings`);
  }
}

/**
 * Assess action findings as a reviewer
 * Updates status based on decision
 */
export async function assessActionFindings(
  findingsId: string,
  input: AssessActionFindingsInput
): Promise<APIResponse> {
  try {
    // Mock implementation - Replace with real API call when backend is ready
    const status = input.decision === "APPROVE" ? "COMPLETED" : "NEEDS_REVISION";

    const assessment = {
      findingsId,
      reviewer_id: input.reviewer_id,
      assessment_score: input.assessment_score,
      reviewer_feedback: input.reviewer_feedback,
      decision: input.decision,
      status,
      assessment_date: new Date()
    };

    revalidatePath("/dashboard/actions/risk");
    return successResponse(assessment, "Action assessment completed successfully");
  } catch (error) {
    return handleError(
      error,
      "PUT | ASSESS ACTION FINDINGS",
      `/api/v1/action-findings/${findingsId}/assess`
    );
  }
}

/**
 * Submit action review as a reviewer
 * Updates execution status and provides feedback
 * POST /api/v1/reviews/{review_id}/submit
 */
export async function submitActionReview(data: {
  task_id: string;
  execution_id: string;
  approval_status: "COMPLETE";
  remarks: string;
}): Promise<APIResponse> {
  if (!data.task_id) {
    return handleBadRequest("Task ID is required");
  }

  if (!data.execution_id) {
    return handleBadRequest("Execution ID is required");
  }

  const url = `/api/v1/reviews/${data.execution_id}/submit`;

  try {
    const response = await authenticatedApiClient({ url, method: "POST", data });

    revalidatePath("/dashboard/actions/risk");
    revalidatePath("/dashboard/actions/risk/logs");
    return successResponse(response?.data, "Action review submitted successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | SUBMIT ACTION REVIEW", url);
  }
}

// ============================================================================
// RISK ACTION MANAGEMENT
// ============================================================================

/**
 * Create a risk action - Assign action owners and reviewers to a risk
 * POST /api/v1/risks/{risk_id}/actions
 *
 * API expects:
 * {
 *   "risk_id": "string",
 *   "instructions": "string",
 *   "executor_ids": ["string[]"],
 *   "reviewer_id": "string",
 *   "due_date": "ISO date string"
 * }
 */
export async function createRiskAction(data: {
  risk_id: string;
  instructions: string;
  executer_id: string;
  reviewer_id: string;
  due_date?: string;
}): Promise<APIResponse> {
  if (!data?.risk_id) {
    return handleBadRequest("Risk ID is required");
  }

  const url = `/api/v1/risks/${data.risk_id}/actions`;
  try {
    const response = await authenticatedApiClient({ url, data, method: "POST" });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data.data, "Risk action created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE RISK ACTION", url);
  }
}

/**
 * Get all actions for the logged-in user with pagination
 * GET /api/v1/risks/actions?page=1&page_size=50&status=PENDING&risk_id=""&task_type="EXECUTION|REVIEW"
 */
export async function getActions(params: ActionQueryParams): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", String(params.page));
  if (params.page_size) queryParams.append("page_size", String(params.page_size));
  if (params.status) queryParams.append("status", params.status);
  if (params.risk_id) queryParams.append("risk_id", params.risk_id);
  if (params.task_type) queryParams.append("task_type", params.task_type);

  const url = `/api/v1/risk-actions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(response.data?.data, "Actions retrieved successfully");
  } catch (error) {
    return handleError(error, "GET | GET ACTIONS", url);
  }
}

// RISK ACCEPTANCES MANAGEMENT

export async function getRiskAcceptances(params?: ActionQueryParams): Promise<APIResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params?.page));
  if (params?.page_size) queryParams.append("page_size", String(params?.page_size));

  const url = `/api/v1/risk-acceptances${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(response.data?.data);
  } catch (error) {
    return handleError(error, "GET | GET RISK ACCEPTANCES", url);
  }
}

export async function createRiskAcceptance(id: string, data: any): Promise<APIResponse> {
  const url = `/api/v1/risks/${id}/accept`;
  try {
    const response = await authenticatedApiClient({ url, data, method: "POST" });
    revalidatePath("/dashboard/(modules)/risks");
    return successResponse(response.data.data, "Acceptance risk created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE RISK ACCEPTANCE", url);
  }
}

export async function updateRiskAcceptance(
  id: string,
  input: Partial<FormData>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-acceptances/${id}`,
      data: input,
      method: "PUT"
    });
    revalidatePath("/dashboard/(modules)/risks/risk-registers");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE RISK ACCEPTANCE", `/api/v1/risk-acceptances/${id}`);
  }
}

/**
 * Submit risk acceptance for approval
 */
export async function submitRiskAcceptanceForApproval(acceptanceId: string): Promise<APIResponse> {
  if (!acceptanceId) {
    return handleBadRequest("Risk acceptance ID is required");
  }

  const url = `/api/v1/risk-acceptances/${acceptanceId}/submit-for-approval`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url });

    revalidatePath("/dashboard/risks/risk-acceptances");
    revalidatePath(`/dashboard/risks/risk-acceptances/${acceptanceId}`);

    return successResponse(response.data, "Risk acceptance submitted for approval successfully");
  } catch (error: any) {
    return handleError(error, "POST | SUBMIT RISK ACCEPTANCE", url);
  }
}

/**
 * Get KRI details by ID
 */
export async function getKRIDetails(kriId: string): Promise<APIResponse> {
  const url = `/api/v1/kris/${kriId}`;

  try {
    const response = await authenticatedApiClient({ method: "GET", url });

    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "GET | KRI DETAILS", url);
  }
}

/**
 * Get KRI status summary by department
 */
export async function getKRIStatusDepartmentSummary(departmentId: string): Promise<APIResponse> {
  const url = `/api/v1/kris/status-summary?department_id=${departmentId}`;
  try {
    const response = await authenticatedApiClient({ method: "GET", url });

    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "GET | KRI STATUS SUMMARY", url);
  }
}

export async function getRiskOverview(start_date: string, end_date: string): Promise<APIResponse> {
  const url = `/api/v1/dashboard/risk-overview?start_date=${start_date}&end_date=${end_date}`;

  try {
    const response = await authenticatedApiClient({ method: "GET", url });
    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "GET | RISK OVERVIEW", url);
  }
}
