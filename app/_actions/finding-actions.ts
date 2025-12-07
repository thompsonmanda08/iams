"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse } from "@/lib/types";
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
