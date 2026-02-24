"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse, Pagination } from "@/lib/types";
import { handleBadRequest, handleError, successResponse } from "./api-config";
import authenticatedApiClient from "./api-config";
import { updateFinding, updateFindingStatus } from "./audit-module-actions";

/**
 * Convert date to YYYY-MM-DD format if it's a Date object
 */
function formatDate(date: any): string | undefined {
  if (!date) return undefined;
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return date;
}

/**
 * Server action to save a finding for an audit plan
 * Handles the complete payload transformation and API call
 */
export async function handleSaveFinding(
  auditPlanId: string,
  workingPaperId: string,
  finding: any
): Promise<void> {
  if (!auditPlanId) {
    throw new Error("Audit plan ID is required");
  }

  if (!workingPaperId) {
    throw new Error("Working paper not found for this audit plan");
  }

  try {
    const response = await updateFinding({
      audit_plan_id: auditPlanId,
      working_paper_id: workingPaperId,
      category_name: finding.clauseTitle || finding.clause,
      finding_number: `F-${finding.clause}-${Date.now()}`,
      workings_and_test_results: finding.workings_and_test_results,
      conclusion: finding.conclusion,
      severity: finding.severity,
      recommendation: finding.recommendation,
      management_response: finding.management_response,
      action_plan: finding.action_plan,
      responsible_person: finding.responsible_person,
      due_date: formatDate(finding.due_date),
      status: finding.status,
      evidence_links: finding.evidence_links?.join(";")
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to save finding");
    }
  } catch (error: any) {
    throw new Error(error.message || "Error saving finding");
  }
}

/**
 * Server action to update an existing finding
 * Handles full updates to finding details
 */
export async function handleUpdateFinding(findingId: string, finding: any): Promise<void> {
  if (!findingId) {
    throw new Error("Finding ID is required");
  }

  try {
    const response = await updateFinding(findingId, {
      management_response: finding.management_response,
      action_plan: finding.action_plan,
      responsible_person: finding.responsible_person,
      due_date: formatDate(finding.due_date),
      status: finding.status,
      severity: finding.severity,
      recommendation: finding.recommendation
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to update finding");
    }
  } catch (error: any) {
    throw new Error(error.message || "Error updating finding");
  }
}

/**
 * Server action to update finding status only
 * Quick status updates without other changes
 */
export async function handleUpdateFindingStatus(findingId: string, status: string): Promise<void> {
  if (!findingId) {
    throw new Error("Finding ID is required");
  }

  if (!status) {
    throw new Error("Status is required");
  }

  try {
    const response = await updateFindingStatus(findingId, status);

    if (!response.success) {
      throw new Error(response.message || "Failed to update finding status");
    }
  } catch (error: any) {
    throw new Error(error.message || "Error updating finding status");
  }
}

/**
 * Server action to clear/reset a finding
 * Resets all finding fields to empty/default values instead of deleting
 */
export async function handleClearFinding(findingId: string): Promise<void> {
  if (!findingId) {
    throw new Error("Finding ID is required");
  }

  try {
    const response = await updateFinding(findingId, {
      management_response: "",
      action_plan: "",
      responsible_person: "",
      due_date: undefined,
      status: "OPEN",
      severity: "",
      recommendation: "",
      workings_and_test_results: "",
      conclusion: "",
      evidence_links: ""
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to clear finding");
    }
  } catch (error: any) {
    throw new Error(error.message || "Error clearing finding");
  }
}

/**
 * Submit working paper category findings for approval
 */
export async function submitCategoryFindingsForApproval(data: {
  category_id: string;
  objectives: string;
  conclusion: string;
}): Promise<APIResponse> {
  if (!data.category_id) {
    return handleBadRequest("Category ID is required");
  }

  const url = `/api/v1/working-paper-categories/${data.category_id}/conclusion`;

  try {
    const response = await authenticatedApiClient({
      method: "PATCH",
      url,
      data: {
        objectives: data.objectives,
        conclusion: data.conclusion
      }
    });

    revalidatePath("/dashboard/audit/plans/[id]", "page");

    return successResponse(response.data, "Findings submitted for approval successfully");
  } catch (error: any) {
    return handleError(error, "PATCH | SUBMIT WORKING-PAPER CATEGORY FINDINGS", url);
  }
}

// ============================================================================
// FINDING ACTION ACTIONS
// ============================================================================

import type {
  CreateFindingActionInput,
  UpdateFindingActionInput,
  CreateFindingActionEvidenceInput,
  UpdateFindingActionEvidenceInput,
  CreateFindingActionReviewInput,
  CreateFindingReassessmentInput,
  UpdateFindingReassessmentInput
} from "@/lib/types/audit-types";

/**
 * Get all finding actions with optional filters
 */
export async function getFindingActions(filters?: {
  status?: string;
  assigned_to?: string;
  finding_id?: string;
  page?: number;
  page_size?: number;
}): Promise<APIResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.assigned_to) params.append("assigned_to", filters.assigned_to);
  if (filters?.finding_id) params.append("finding_id", filters.finding_id);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.page_size) params.append("page_size", String(filters.page_size));

  const queryString = params.toString();
  const url = `/api/v1/finding-actions${queryString ? `?${queryString}` : ""}`;
  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(response.data?.data, "Finding actions fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | FINDING ACTIONS", url);
  }
}
/**
 * Get all follow up actions with optional filters
 */
export async function getAuditFollowupLogs(filters?: {
  status?: string;
  assigned_to?: string;
  finding_id?: string;
  page?: number;
  page_size?: number;
}): Promise<APIResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.assigned_to) params.append("assigned_to", filters.assigned_to);
  if (filters?.finding_id) params.append("finding_id", filters.finding_id);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.page_size) params.append("page_size", String(filters.page_size));

  const queryString = params.toString();
  const url = `/api/v1/finding-actions/audit-followup-log${queryString ? `?${queryString}` : ""}`;
  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(response.data?.data, "Finding actions fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | AUDIT FOLLOW UP", url);
  }
}

/**
 * Send a follow up reminder for a finding action to the assigned user
 */

export async function sendFollowupReminder(action_id: string): Promise<APIResponse> {
  if (!action_id) {
    return handleBadRequest("Action ID is required");
  }

  const url = `/api/v1/finding-actions/${action_id}/remind`;
  try {
    await authenticatedApiClient({method: "POST", url});

    return successResponse(null, "Reminder sent successfully");
  } catch (error: any) {
    return handleError(error, "POST | SEND FOLLOW UP REMINDER", url);
  }
}
/**
 * Get finding actions by finding ID
 */
export async function getFindingActionsByFinding(finding_id: string): Promise<APIResponse> {
  if (!finding_id) {
    return handleBadRequest("Finding ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/findings/${finding_id}/actions`
    });

    return successResponse(response.data?.data, "Finding actions fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | FINDING ACTIONS BY FINDING",
      `/api/v1/findings/${finding_id}/actions`
    );
  }
}

/**
 * Get single finding action by ID
 */
export async function getFindingAction(action_id: string): Promise<APIResponse> {
  if (!action_id) {
    return handleBadRequest("Action ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/finding-actions/${action_id}`
    });

    return successResponse(response.data?.data, "Finding action fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | FINDING ACTION", `/api/v1/finding-actions/${action_id}`);
  }
}

/**
 * Create new finding action
 */
export async function createFindingAction(data: CreateFindingActionInput): Promise<APIResponse> {
  if (
    !data.finding_id ||
    !data.action_description ||
    !data.assigned_to ||
    !data.reviewer_id ||
    !data.due_date
  ) {
    return handleBadRequest(
      "Finding ID, action description, assigned user, reviewer, and due date are required"
    );
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/findings/${data.finding_id}/actions`,
      data: {
        action_description: data.action_description,
        assigned_to: data.assigned_to,
        reviewer_id: data.reviewer_id,
        due_date: data.due_date
      }
    });

    revalidatePath("/dashboard/actions/audit");
    revalidatePath(`/dashboard/audit/plans/engagement/`, "page");

    return successResponse(response.data?.data, "Finding action created successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE FINDING ACTION",
      `/api/v1/findings/${data.finding_id}/actions`
    );
  }
}

/**
 * Update finding action
 */
export async function updateFindingAction(
  action_id: string,
  data: UpdateFindingActionInput
): Promise<APIResponse> {
  if (!action_id) {
    return handleBadRequest("Action ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/finding-actions/${action_id}`,
      data
    });

    revalidatePath("/dashboard/actions/audit");
    revalidatePath(`/dashboard/audit/plans/engagement/`, "page");

    return successResponse(response.data?.data, "Finding action updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE FINDING ACTION",
      `/api/v1/finding-actions/${action_id}`
    );
  }
}

/**
 * Delete finding action
 */
export async function deleteFindingAction(action_id: string): Promise<APIResponse> {
  if (!action_id) {
    return handleBadRequest("Action ID is required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/finding-actions/${action_id}`
    });

    revalidatePath("/dashboard/actions/audit");
    revalidatePath(`/dashboard/audit/plans/engagement/`, "page");

    return successResponse(null, "Finding action deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | FINDING ACTION", `/api/v1/finding-actions/${action_id}`);
  }
}

// ============================================================================
// FINDING ACTION EVIDENCE ACTIONS
// ============================================================================

/**
 * Get evidence for a finding action
 */
export async function getFindingActionEvidence(action_id: string): Promise<APIResponse> {
  if (!action_id) {
    return handleBadRequest("Action ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/finding-actions/${action_id}/evidence`
    });

    return successResponse(response.data?.data, "Finding action evidence fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | FINDING ACTION EVIDENCE",
      `/api/v1/finding-actions/${action_id}/evidence`
    );
  }
}

/**
 * Get single evidence by ID
 */
export async function getFindingActionEvidenceById(evidence_id: string): Promise<APIResponse> {
  if (!evidence_id) {
    return handleBadRequest("Evidence ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/finding-action-evidence/${evidence_id}`
    });

    return successResponse(response.data?.data, "Evidence fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | FINDING ACTION EVIDENCE BY ID",
      `/api/v1/finding-action-evidence/${evidence_id}`
    );
  }
}

/**
 * Submit evidence for a finding action
 */
export async function createFindingActionEvidence(
  data: CreateFindingActionEvidenceInput
): Promise<APIResponse> {
  if (!data.finding_action_id) {
    return handleBadRequest("Action ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/finding-actions/${data.finding_action_id}/evidence`,
      data
    });

    revalidatePath("/dashboard/actions/audit");

    return successResponse(response.data?.data, "Evidence submitted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE FINDING ACTION EVIDENCE",
      `/api/v1/finding-actions/${data.finding_action_id}/evidence`
    );
  }
}

/**
 * Update finding action evidence
 */
export async function updateFindingActionEvidence(
  evidence_id: string,
  data: UpdateFindingActionEvidenceInput
): Promise<APIResponse> {
  if (!evidence_id) {
    return handleBadRequest("Evidence ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/finding-action-evidence/${evidence_id}`,
      data
    });

    revalidatePath("/dashboard/actions/audit");

    return successResponse(response.data?.data, "Evidence updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE FINDING ACTION EVIDENCE",
      `/api/v1/finding-action-evidence/${evidence_id}`
    );
  }
}

/**
 * Delete finding action evidence
 */
export async function deleteFindingActionEvidence(evidence_id: string): Promise<APIResponse> {
  if (!evidence_id) {
    return handleBadRequest("Evidence ID is required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/finding-action-evidence/${evidence_id}`
    });

    revalidatePath("/dashboard/actions/audit");

    return successResponse(null, "Evidence deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | FINDING ACTION EVIDENCE",
      `/api/v1/finding-action-evidence/${evidence_id}`
    );
  }
}

// ============================================================================
// FINDING ACTION REVIEW ACTIONS
// ============================================================================

/**
 * Get reviews for a finding action
 */
export async function getFindingActionReviews(action_id: string): Promise<APIResponse> {
  if (!action_id) {
    return handleBadRequest("Action ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/finding-actions/${action_id}/reviews`
    });

    return successResponse(response.data?.data, "Reviews fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | FINDING ACTION REVIEWS",
      `/api/v1/finding-actions/${action_id}/reviews`
    );
  }
}

/**
 * Create review for evidence
 */
export async function createFindingActionReview(
  data: CreateFindingActionReviewInput
): Promise<APIResponse> {
  if (!data.finding_action_evidence_id || !data.review_status) {
    return handleBadRequest("Evidence ID and review status are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/finding-action-evidence/${data.finding_action_evidence_id}/review`,
      data: {
        review_status: data.review_status,
        review_comments: data.review_comments
      }
    });

    revalidatePath("/dashboard/actions/audit");

    return successResponse(response.data?.data, "Review submitted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE FINDING ACTION REVIEW",
      `/api/v1/finding-action-evidence/${data.finding_action_evidence_id}/review`
    );
  }
}

/**
 * Approve evidence
 */
export async function reviewFindingActionEvidence({
  evidence_id,
  finding_action_id,
  approval_status,
  reviewer_comments
}: {
  evidence_id: string;
  reviewer_comments: string;
  finding_action_id: string;
  approval_status: "APPROVED" | "REJECTED";
}): Promise<APIResponse> {
  if (!evidence_id) {
    return handleBadRequest("Evidence ID is required");
  }

  const url = `/api/v1/finding-action-evidence/${evidence_id}/review`;

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url,
      data: { approval_status, reviewer_comments, finding_action_id }
    });

    revalidatePath("/dashboard/actions/audit");

    return successResponse(response.data?.data, "Evidence reviewed successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | APPROVE FINDING ACTION EVIDENCE",
      `/api/v1/finding-action-evidence/${evidence_id}/approve`
    );
  }
}

/**
 * Update finding action review
 * Updates an existing review for evidence with new approval status and comments
 */
export async function updateFindingActionReview({
  evidence_id,
  approval_status,
  reviewer_comments
}: {
  evidence_id: string;
  approval_status: "APPROVED" | "REJECTED";
  reviewer_comments: string;
}): Promise<APIResponse> {
  if (!evidence_id) {
    return handleBadRequest("Evidence ID is required");
  }

  if (!approval_status) {
    return handleBadRequest("Approval status is required");
  }

  const url = `/api/v1/finding-action-reviews/${evidence_id}`;

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url,
      data: { approval_status, reviewer_comments }
    });

    revalidatePath("/dashboard/actions/audit");

    return successResponse(response.data?.data, "Review updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE FINDING ACTION REVIEW", url);
  }
}

/**
 * Delete finding action review
 */
export async function deleteFindingActionReview(review_id: string): Promise<APIResponse> {
  if (!review_id) {
    return handleBadRequest("Review ID is required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/finding-action-reviews/${review_id}`
    });

    revalidatePath("/dashboard/actions/audit");

    return successResponse(null, "Review deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | FINDING ACTION REVIEW",
      `/api/v1/finding-action-reviews/${review_id}`
    );
  }
}

// ============================================================================
// FINDING REASSESSMENT ACTIONS
// ============================================================================

/**
 * Get reassessments for a finding
 */
export async function getFindingReassessments(finding_id: string): Promise<APIResponse> {
  if (!finding_id) {
    return handleBadRequest("Finding ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/findings/${finding_id}/reassessments`
    });

    return successResponse(response.data?.data, "Reassessments fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | FINDING REASSESSMENTS",
      `/api/v1/findings/${finding_id}/reassessments`
    );
  }
}

/**
 * Get latest reassessment for a finding
 */
export async function getLatestFindingReassessment(finding_id: string): Promise<APIResponse> {
  if (!finding_id) {
    return handleBadRequest("Finding ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/findings/${finding_id}/reassessments/latest`
    });

    return successResponse(response.data?.data, "Latest reassessment fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | LATEST FINDING REASSESSMENT",
      `/api/v1/findings/${finding_id}/reassessments/latest`
    );
  }
}

/**
 * Get single reassessment by ID
 */
export async function getFindingReassessment(reassessment_id: string): Promise<APIResponse> {
  if (!reassessment_id) {
    return handleBadRequest("Reassessment ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/finding-reassessments/${reassessment_id}`
    });

    return successResponse(response.data?.data, "Reassessment fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | FINDING REASSESSMENT",
      `/api/v1/finding-reassessments/${reassessment_id}`
    );
  }
}

/**
 * Create finding reassessment
 */
export async function createFindingReassessment(
  data: CreateFindingReassessmentInput
): Promise<APIResponse> {
  if (
    !data.finding_id ||
    !data.finding_action_id ||
    !data.compliance_status ||
    !data.auditor_comments
  ) {
    return handleBadRequest(
      "Finding ID, action ID, compliance status, and auditor comments are required"
    );
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/findings/${data.finding_id}/reassess`,
      data: {
        finding_action_id: data.finding_action_id,
        compliance_status: data.compliance_status,
        auditor_comments: data.auditor_comments,
        new_severity: data.new_severity,
        new_recommendation: data.new_recommendation,
        compliance_percentage: data.compliance_percentage
      }
    });

    revalidatePath("/dashboard/actions/audit");
    revalidatePath(`/dashboard/audit/plans/engagement/`, "page");

    return successResponse(response.data?.data, "Reassessment created successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE FINDING REASSESSMENT",
      `/api/v1/findings/${data.finding_id}/reassess`
    );
  }
}

/**
 * Update finding reassessment
 */
export async function updateFindingReassessment(
  reassessment_id: string,
  data: UpdateFindingReassessmentInput
): Promise<APIResponse> {
  if (!reassessment_id) {
    return handleBadRequest("Reassessment ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/finding-reassessments/${reassessment_id}`,
      data
    });

    revalidatePath("/dashboard/actions/audit");
    revalidatePath(`/dashboard/audit/plans/engagement/`, "page");

    return successResponse(response.data?.data, "Reassessment updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE FINDING REASSESSMENT",
      `/api/v1/finding-reassessments/${reassessment_id}`
    );
  }
}

/**
 * Delete finding reassessment
 */
export async function deleteFindingReassessment(reassessment_id: string): Promise<APIResponse> {
  if (!reassessment_id) {
    return handleBadRequest("Reassessment ID is required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/finding-reassessments/${reassessment_id}`
    });

    revalidatePath("/dashboard/actions/audit");
    revalidatePath(`/dashboard/audit/plans/engagement/`, "page");

    return successResponse(null, "Reassessment deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | FINDING REASSESSMENT",
      `/api/v1/finding-reassessments/${reassessment_id}`
    );
  }
}
