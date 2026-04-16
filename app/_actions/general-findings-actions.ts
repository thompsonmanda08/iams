"use server";

import type { APIResponse } from "@/lib/types";
import authenticatedApiClient, {
  handleError,
  successResponse,
  handleBadRequest
} from "./api-config";
import { revalidatePath } from "next/cache";

// ============================================================================
// GENERAL WORK PAPER FINDINGS CRUD
// ============================================================================

/**
 * List general findings for a working paper
 */
export async function listGeneralFindings(
  workingPaperId: string,
  params?: { page?: number; page_size?: number; status?: string }
): Promise<APIResponse> {
  if (!workingPaperId) {
    return handleBadRequest("Working paper ID is required");
  }

  const searchParams = new URLSearchParams();
  searchParams.append("working_paper_id", workingPaperId);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.page_size) searchParams.append("page_size", String(params.page_size));
  if (params?.status) searchParams.append("status", params.status);

  const url = `/api/v1/general-work-paper-findings?${searchParams.toString()}`;

  try {
    const response = await authenticatedApiClient({ method: "GET", url });
    return successResponse(response?.data?.data ?? response?.data, "General findings fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Get a single general finding by ID
 */
export async function getGeneralFinding(findingId: string): Promise<APIResponse> {
  if (!findingId) {
    return handleBadRequest("Finding ID is required");
  }

  const url = `/api/v1/general-work-paper-findings/${findingId}`;

  try {
    const response = await authenticatedApiClient({ method: "GET", url });
    return successResponse(response?.data?.data ?? response?.data, "General finding fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create a new general finding (one row in the evidence grid)
 */
export async function createGeneralFinding(data: {
  audit_plan_id: string;
  working_paper_id: string;
  columns: Record<string, any>[];
  keys: Record<string, any>[];
  audit_observation?: string;
  audit_comments?: string;
  evidence?: string;
  status?: string;
}): Promise<APIResponse> {
  if (!data.audit_plan_id || !data.working_paper_id) {
    return handleBadRequest("Audit plan ID and working paper ID are required");
  }

  const url = "/api/v1/general-work-paper-findings";

  try {
    const response = await authenticatedApiClient({ method: "POST", url, data });

    revalidatePath("/dashboard/audit/plans", "layout");

    return successResponse(
      response?.data?.data ?? response?.data,
      "General finding created successfully"
    );
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update an existing general finding
 */
export async function updateGeneralFinding(
  findingId: string,
  data: {
    columns?: Record<string, any>[];
    keys?: Record<string, any>[];
    audit_observation?: string;
    audit_comments?: string;
    evidence?: string;
    status?: string;
    is_marked_complete?: boolean;
    is_active?: boolean;
  }
): Promise<APIResponse> {
  if (!findingId) {
    return handleBadRequest("Finding ID is required");
  }

  const url = `/api/v1/general-work-paper-findings/${findingId}`;

  try {
    const response = await authenticatedApiClient({ 
      method: "PUT", 
      url, 
      data: {
        ...data,
        is_active: data.is_active ?? true
      }
    });

    revalidatePath("/dashboard/audit/plans", "layout");

    return successResponse(
      response?.data?.data ?? response?.data,
      "General finding updated successfully"
    );
  } catch (error: any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete a general finding
 */
export async function deleteGeneralFinding(findingId: string): Promise<APIResponse> {
  if (!findingId) {
    return handleBadRequest("Finding ID is required");
  }

  const url = `/api/v1/general-work-paper-findings/${findingId}`;

  try {
    const response = await authenticatedApiClient({ method: "DELETE", url });

    revalidatePath("/dashboard/audit/plans", "layout");

    return successResponse(
      response?.data?.data ?? response?.data,
      "General finding deleted successfully"
    );
  } catch (error: any) {
    return handleError(error, "DELETE", url);
  }
}

/**
 * Submit a single general finding for approval
 */
export async function submitGeneralFinding(findingId: string): Promise<APIResponse> {
  if (!findingId) {
    return handleBadRequest("Finding ID is required");
  }

  const url = `/api/v1/general-work-paper-findings/${findingId}/submit`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url });

    revalidatePath("/dashboard/audit/plans", "layout");

    return successResponse(
      response?.data?.data ?? response?.data,
      "General finding submitted for approval"
    );
  } catch (error: any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Submit entire general workpaper for approval
 * TODO: Uncomment API call when backend endpoint is ready
 */
export async function submitGeneralWorkpaperForApproval(
  workingPaperId: string
): Promise<APIResponse> {
  if (!workingPaperId) {
    return handleBadRequest("Working paper ID is required");
  }

  // STUB — endpoint does not exist yet
  // const url = `/api/v1/general-work-papers/${workingPaperId}/submit`;
  // try {
  //   const response = await authenticatedApiClient({ method: "POST", url });
  //   revalidatePath("/dashboard/audit/plans", "layout");
  //   return successResponse(response?.data?.data ?? response?.data, "Workpaper submitted for approval");
  // } catch (error: any) {
  //   return handleError(error, "POST", url);
  // }

  return handleBadRequest(
    "Workpaper-level submission is not yet supported. Submit individual findings instead."
  );
}

// ============================================================================
// WORKPAPER METADATA
// ============================================================================

/**
 * Update workpaper metadata (work done, conclusion, etc.)
 */
export async function updateWorkpaperMetadata(
  workingPaperId: string,
  metadata: Record<string, any>
): Promise<APIResponse> {
  if (!workingPaperId) {
    return handleBadRequest("Working paper ID is required");
  }

  const url = `/api/v1/working-papers/${workingPaperId}/metadata`;

  try {
    const response = await authenticatedApiClient({
      method: "PATCH",
      url,
      data: { metadata }
    });

    revalidatePath("/dashboard/audit/plans", "layout");

    return successResponse(
      response?.data?.data ?? response?.data,
      "Workpaper metadata updated successfully"
    );
  } catch (error: any) {
    return handleError(error, "PATCH", url);
  }
}
