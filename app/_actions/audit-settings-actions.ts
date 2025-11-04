"use server";

import type { APIResponse } from "@/lib/types";
import authenticatedApiClient, {
  handleError,
  successResponse,
  handleBadRequest
} from "./api-config";
import { revalidatePath } from "next/cache";

// ============================================================================
// AUDITABLE AREAS CRUD
// ============================================================================

/**
 * Get all auditable areas
 * Endpoint: GET /api/v1/audit/auditable-areas
 */
export async function getAuditableAreas(): Promise<APIResponse> {
  const url = `/api/v1/audit/auditable-areas`;

  try {
    const response = await authenticatedApiClient({ url, method: "GET" });
    return successResponse(response?.data?.data, "Auditable areas fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new auditable area
 * Endpoint: POST /api/v1/audit/auditable-areas
 */
export async function createAuditableArea(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/auditable-areas`;

  if (!data.name) {
    return handleBadRequest("Name is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        department_id: data.department_id,
        name: data.name,
        description: data.description || "",
        process_type: data.process_type || "Process",
        risk_level: data.risk_level || "MEDIUM",
        is_active: data.is_active !== undefined ? data.is_active : true
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Auditable area created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update auditable area
 * Endpoint: PUT /api/v1/audit/auditable-areas/{id}
 */
export async function updateAuditableArea(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/auditable-areas/${data.id}`;

  if (!data.id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        ...data
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Auditable area updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete auditable area
 * Endpoint: DELETE /api/v1/audit/auditable-areas/{id}
 */
export async function deleteAuditableArea(id: string): Promise<APIResponse> {
  const url = `/api/v1/audit/auditable-areas/${id}`;

  if (!id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Auditable area deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

// ============================================================================
// STRATEGIC PILLARS CRUD
// ============================================================================

/**
 * Get all strategic pillars
 * Endpoint: GET /api/v1/audit/strategic-pillars
 */
export async function getStrategicPillars(): Promise<APIResponse> {
  const url = `/api/v1/audit/strategic-pillars`;

  try {
    const response = await authenticatedApiClient({ url, method: "GET" });
    return successResponse(response?.data?.data, "Strategic pillars fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new strategic pillar
 * Endpoint: POST /api/v1/audit/strategic-pillars
 */
export async function createStrategicPillar(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/strategic-pillars`;

  if (!data.name) {
    return handleBadRequest("Title is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        title: data.name,
        description: data.description || "",
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        sort_order: data.sort_order || 1
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data?.data, "Strategic pillar created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update strategic pillar
 * Endpoint: PUT /api/v1/audit/strategic-pillars/{id}
 */
export async function updateStrategicPillar(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/strategic-pillars/${data.id}`;

  if (!data.id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        title: data.name,
        description: data.description,
        is_active: data.is_active
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Strategic pillar updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete strategic pillar
 * Endpoint: DELETE /api/v1/audit/strategic-pillars/{id}
 */
export async function deleteStrategicPillar(id: string): Promise<APIResponse> {
  const url = `/api/v1/audit/strategic-pillars/${id}`;

  if (!id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Strategic pillar deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

// ============================================================================
// STRATEGIC INITIATIVES CRUD
// ============================================================================

/**
 * Get all strategic initiatives for a pillar
 * Endpoint: GET /api/v1/audit/strategic-pillars/{pillar_id}/initiatives
 */
export async function getStrategicInitiatives(pillarId?: string): Promise<APIResponse> {
  // If pillarId is provided, get initiatives for specific pillar
  // Otherwise, get all initiatives (we'll need to check if backend supports this)
  const url = pillarId
    ? `/api/v1/audit/strategic-pillars/${pillarId}/initiatives`
    : `/api/v1/audit/strategic-initiatives`;

  try {
    const response = await authenticatedApiClient({ url, method: "GET" });
    return successResponse(response?.data?.data, "Strategic initiatives fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new strategic initiative
 * Endpoint: POST /api/v1/audit/strategic-pillars/{pillar_id}/initiatives
 */
export async function createStrategicInitiative(data: any): Promise<APIResponse> {
  if (!data.pillar_id) {
    return handleBadRequest("Pillar ID is required");
  }

  const url = `/api/v1/audit/strategic-pillars/${data.pillar_id}/initiatives`;

  if (!data.name) {
    return handleBadRequest("Title is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        title: data.name,
        description: data.description || "",
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        is_active: data.is_active !== undefined ? data.is_active : true
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Strategic initiative created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update strategic initiative
 * Endpoint: PUT /api/v1/audit/strategic-initiatives/{id}
 */
export async function updateStrategicInitiative(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/strategic-initiatives/${data.id}`;

  if (!data.id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        title: data.name,
        description: data.description,
        is_active: data.is_active
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Strategic initiative updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete strategic initiative
 * Endpoint: DELETE /api/v1/audit/strategic-initiatives/{id}
 */
export async function deleteStrategicInitiative(id: string): Promise<APIResponse> {
  const url = `/api/v1/audit/strategic-initiatives/${id}`;

  if (!id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Strategic initiative deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

// ============================================================================
// FINDINGS CATEGORIES CRUD
// ============================================================================

/**
 * Get all findings categories
 * Note: Endpoint may not be in Postman collection yet
 */
export async function getFindingsCategories(): Promise<APIResponse> {
  const url = `/api/v1/audit/findings-categories`;

  try {
    const response = await authenticatedApiClient({ url, method: "GET" });
    return successResponse(response?.data?.data, "Findings categories fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new findings category
 */
export async function createFindingsCategory(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/findings-categories`;

  if (!data.name) {
    return handleBadRequest("Name is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        name: data.name,
        description: data.description || ""
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Findings category created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update findings category
 */
export async function updateFindingsCategory(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/findings-categories/${data.id}`;

  if (!data.id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        name: data.name,
        description: data.description
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Findings category updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete findings category
 */
export async function deleteFindingsCategory(id: string): Promise<APIResponse> {
  const url = `/api/v1/audit/findings-categories/${id}`;

  if (!id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Findings category deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

// ============================================================================
// PROCESS/ACTIVITY CRUD
// ============================================================================

/**
 * Get all process activities
 * Note: Endpoint may not be in Postman collection yet
 */
export async function getProcessActivities(): Promise<APIResponse> {
  const url = `/api/v1/audit/process-activities`;

  try {
    const response = await authenticatedApiClient({ url, method: "GET" });
    return successResponse(response?.data?.data, "Process activities fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new process activity
 */
export async function createProcessActivity(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/process-activities`;

  if (!data.name) {
    return handleBadRequest("Process name is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        name: data.name,
        department_id: data.department_id,
        auditable_area_id: data.auditable_area_id,
        pillar_id: data.pillar_id,
        description: data.description || "",
        activities: data.activities || []
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Process activity created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update process activity
 */
export async function updateProcessActivity(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/process-activities/${data.id}`;

  if (!data.id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        name: data.name,
        department_id: data.department_id,
        auditable_area_id: data.auditable_area_id,
        pillar_id: data.pillar_id,
        description: data.description,
        activities: data.activities
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Process activity updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete process activity
 */
export async function deleteProcessActivity(id: string): Promise<APIResponse> {
  const url = `/api/v1/audit/process-activities/${id}`;

  if (!id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Process activity deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

// ============================================================================
// INDICATIVE TARGETS CRUD
// ============================================================================

/**
 * Get all indicative targets
 * Endpoint: GET /api/v1/audit/indicative-targets
 */
export async function getIndicativeTargets(): Promise<APIResponse> {
  const url = `/api/v1/audit/indicative-targets`;

  try {
    const response = await authenticatedApiClient({ url, method: "GET" });
    return successResponse(response?.data?.data, "Indicative targets fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new indicative target
 * Endpoint: POST /api/v1/audit/indicative-targets
 */
export async function createIndicativeTarget(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/indicative-targets`;

  if (!data.name) {
    return handleBadRequest("Name is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        department_id: data.department_id,
        name: data.name,
        metric_type: data.metric_type || "Performance",
        target_value: data.target_value || "",
        measurement_unit: data.measurement_unit || "",
        frequency_of_review: data.frequency_of_review || "QUARTERLY",
        is_active: data.is_active !== undefined ? data.is_active : true
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Indicative target created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update indicative target
 * Endpoint: PUT /api/v1/audit/indicative-targets/{id}
 */
export async function updateIndicativeTarget(data: any): Promise<APIResponse> {
  const url = `/api/v1/audit/indicative-targets/${data.id}`;

  if (!data.id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        name: data.name,
        target_value: data.target_value,
        frequency_of_review: data.frequency_of_review,
        is_active: data.is_active
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Indicative target updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete indicative target
 * Endpoint: DELETE /api/v1/audit/indicative-targets/{id}
 */
export async function deleteIndicativeTarget(id: string): Promise<APIResponse> {
  const url = `/api/v1/audit/indicative-targets/${id}`;

  if (!id) {
    return handleBadRequest("ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Indicative target deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}
