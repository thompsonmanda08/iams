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
export async function getAuditableAreas(params?: {
  page?: number;
  page_size?: number;
  department_id?: string;
  [key: string]: string | number | undefined;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page_size) queryParams.append("page_size", String(params?.page_size || 10));
  if (params?.page) queryParams.append("page", String(params?.page || 1));
  if (params?.department_id)
    queryParams.append("department_id", String(params?.department_id || ""));

  const url = `/api/v1/audit/auditable-areas${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
        department_id: data.department_id,
        name: data.name,
        description: data.description || "",
        process_type: data.process_type || "Process",
        risk_level: data.risk_level || "MEDIUM",
        is_active: data.is_active !== undefined ? data.is_active : true
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
export async function getStrategicPillars(
  pillarId?: string,
  params?: {
    page?: number;
    page_size?: number;
    department_id?: string;
    is_active?: boolean;
    [key: string]: any;
  }
): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page_size) queryParams.append("page_size", String(params?.page_size || 10));
  if (params?.is_active) queryParams.append("is_active", String(params?.is_active));
  if (params?.page) queryParams.append("page", String(params?.page || 1));
  if (params?.department_id)
    queryParams.append("department_id", String(params?.department_id || ""));

  const url = pillarId
    ? `/api/v1/audit/strategic-pillars/${pillarId}`
    : `/api/v1/audit/strategic-pillars${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data
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
        ...data
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
export async function getStrategicInitiatives(
  pillarId?: string,
  params?: { page?: number; page_size?: number; department_id?: string }
): Promise<APIResponse> {
  // If pillarId is provided, get initiatives for specific pillar
  // Otherwise, get all initiatives (we'll need to check if backend supports this)
  const queryParams = new URLSearchParams();

  if (params?.page_size) queryParams.append("page_size", String(params?.page_size || 10));
  if (params?.page) queryParams.append("page", String(params?.page || 1));
  if (params?.department_id)
    queryParams.append("department_id", String(params?.department_id || ""));

  if (!pillarId) {
    return handleBadRequest("Pillar ID is required");
  }

  const url = `/api/v1/audit/strategic-pillars/${pillarId}/initiatives${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient({ url, method: "GET" });
    revalidatePath("/dashboard/system-configs/audit-settings");
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

  if (!data.title) {
    return handleBadRequest("Title is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        ...data,
        start_date: data.start_date || new Date().toISOString(),
        end_date: data.end_date || new Date().toISOString(),
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
        ...data,
        start_date: data.start_date || new Date().toISOString(),
        end_date: data.end_date || new Date().toISOString(),
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
export async function getFindingsCategories(params?: {
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page_size) queryParams.append("page_size", String(params?.page_size || 10));
  if (params?.page) queryParams.append("page", String(params?.page || 1));

  const url = `/api/v1/findings-categories${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
  const url = `/api/v1/findings-categories`;

  if (!data.name) {
    return handleBadRequest("Name is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        ...data
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
  const url = `/api/v1/findings-categories/${data.id}`;

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
    return successResponse(response?.data, "Findings category updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete findings category
 */
export async function deleteFindingsCategory(id: string): Promise<APIResponse> {
  const url = `/api/v1/findings-categories/${id}`;

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
export async function getProcessActivities(params?: {
  page?: number;
  page_size?: number;
  department_id?: string;
  [key: string]: string | number | undefined;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page_size) queryParams.append("page_size", String(params?.page_size || 10));
  if (params?.page) queryParams.append("page", String(params?.page || 1));
  if (params?.department_id)
    queryParams.append("department_id", String(params?.department_id || ""));

  const url = `/api/v1/process-activities${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
  const url = `/api/v1/process-activities`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        ...data
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
  const url = `/api/v1/process-activities/${data.id}`;

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
    return successResponse(response?.data, "Process activity updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete process activity
 */
export async function deleteProcessActivity(id: string): Promise<APIResponse> {
  const url = `/api/v1/process-activities/${id}`;

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
export async function getIndicativeTargets(params?: {
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page_size) queryParams.append("page_size", String(params?.page_size || 10));
  if (params?.page) queryParams.append("page", String(params?.page || 1));

  const url = `/api/v1/audit/indicative-targets${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        ...data
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
  if (!data.id) {
    return handleBadRequest("ID is required");
  }

  const url = `/api/v1/audit/indicative-targets/${data.id}`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        ...data
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

// ============================================================================
// GENERAL WORK PAPER CONFIGS CRUD
// ============================================================================

export type WorkPaperFieldType = "text" | "number" | "date" | "boolean" | "select" | "textarea";

export interface WorkPaperConfigColumn {
  key: string;         // snake_case identifier, e.g. "invoice_number"
  name: string;        // Display label, e.g. "Invoice Number"
  type: WorkPaperFieldType;
  required: boolean;
  description?: string;
  order?: number;      // auto-generated from array position before sending
}

export interface WorkPaperConfigKey {
  key: string;
  name: string;
  type: WorkPaperFieldType;
  required: boolean;
  description?: string;
  order?: number;
}

export interface CreateGeneralWorkPaperConfigPayload {
  template_id: string;
  columns: WorkPaperConfigColumn[];
  keys: WorkPaperConfigKey[];   // required — defines the lookup/identifier fields
}

export interface UpdateGeneralWorkPaperConfigPayload {
  columns: WorkPaperConfigColumn[];
  keys: WorkPaperConfigKey[];
}

/**
 * Get all configs for a general work paper template
 * Endpoint: GET /api/v1/general-work-paper-templates/{template_id}/configs
 */
export async function getGeneralWorkPaperConfigsByTemplateId(
  templateId: string
): Promise<APIResponse> {
  const url = `/api/v1/general-work-paper-templates/${templateId}/configs`;

  if (!templateId) {
    return handleBadRequest("Template ID is required");
  }

  try {
    const response = await authenticatedApiClient({ url, method: "GET" });
    return successResponse(
      response?.data?.configs ?? response?.data?.data ?? response?.data,
      "Configs fetched successfully"
    );
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Get general work paper config by ID
 * Endpoint: GET /api/v1/general-work-paper-configs/{config_id}
 */
export async function getGeneralWorkPaperConfig(configId: string): Promise<APIResponse> {
  const url = `/api/v1/general-work-paper-configs/${configId}`;

  if (!configId) {
    return handleBadRequest("Config ID is required");
  }

  try {
    const response = await authenticatedApiClient({ url, method: "GET" });
    return successResponse(response?.data?.data ?? response?.data, "Config fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create general work paper config
 * Endpoint: POST /api/v1/general-work-paper-configs
 */
export async function createGeneralWorkPaperConfig(
  data: CreateGeneralWorkPaperConfigPayload
): Promise<APIResponse> {
  const url = `/api/v1/general-work-paper-configs`;

  if (!data.template_id) {
    return handleBadRequest("Template ID is required");
  }
  if (!data.columns?.length) {
    return handleBadRequest("At least one column is required");
  }
  if (!data.keys?.length) {
    return handleBadRequest("At least one key is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        template_id: data.template_id,
        columns: data.columns.map((col, i) => ({ ...col, order: i + 1 })),
        keys: data.keys.map((k, i) => ({ ...k, order: i + 1 }))
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings", "layout");
    return successResponse(response?.data?.data ?? response?.data, "Work paper config created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update general work paper config
 * Endpoint: PUT /api/v1/general-work-paper-configs/{config_id}
 */
export async function updateGeneralWorkPaperConfig(
  configId: string,
  data: UpdateGeneralWorkPaperConfigPayload
): Promise<APIResponse> {
  const url = `/api/v1/general-work-paper-configs/${configId}`;

  if (!configId) {
    return handleBadRequest("Config ID is required");
  }
  if (!data.columns?.length) {
    return handleBadRequest("At least one column is required");
  }
  if (!data.keys?.length) {
    return handleBadRequest("At least one key is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        columns: data.columns.map((col, i) => ({ ...col, order: i + 1 })),
        keys: data.keys.map((k, i) => ({ ...k, order: i + 1 }))
      }
    });
    revalidatePath("/dashboard/system-configs/audit-settings", "layout");
    return successResponse(response?.data?.data ?? response?.data, "Work paper config updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete general work paper config
 * Endpoint: DELETE /api/v1/general-work-paper-configs/{config_id}
 */
export async function deleteGeneralWorkPaperConfig(configId: string): Promise<APIResponse> {
  const url = `/api/v1/general-work-paper-configs/${configId}`;

  if (!configId) {
    return handleBadRequest("Config ID is required");
  }

  try {
    const response = await authenticatedApiClient({ url, method: "DELETE" });
    revalidatePath("/dashboard/system-configs/audit-settings");
    return successResponse(response?.data, "Work paper config deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}
