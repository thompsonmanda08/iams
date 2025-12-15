/**
 * Audit Management Module Server Actions
 *
 * This file contains all server-side actions for the Audit Management Module.
 * Currently uses mock data for development. Replace with real API calls when backend is ready.
 *
 * @module audit-actions
 */

"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse, Pagination } from "@/lib/types";
import type {
  TemplateCategory,
  CreateUniversePayload,
  CreateUniverseItemPayload
} from "@/lib/types/audit-types";
import { handleBadRequest, handleError, successResponse } from "./api-config";
import authenticatedApiClient from "./api-config";

// ============================================================================
// AUDIT PLAN ACTIONS
// ============================================================================

interface CreateBudgetPayload {
  department_id: string;
  year: number;
  title: string;
  total_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface CreateBudgetLinePayload {
  name: string;
  description: string;
  allocated_amount: number;
  spent_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  category: string;
}

/**
 * Get all audit plans with optional filters
 */
export async function getAuditPlans(
  filters?: Partial<Pagination> & {
    year?: number;
    status?: string;
  }
): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.year) params.append("year", String(filters.year));
    if (filters?.status) params.append("status", filters.status);

    const queryString = params.toString();
    const url = `/api/v1/audit-plans${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data?.data, "Audit plans fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | AUDIT PLANS", "/api/v1/audit-plans");
  }
}

/**
 * Get single audit plan by ID
 */
export async function getAuditPlan(id: string): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Audit plan ID is required");
  }

  const url = `/api/v1/audit-plans/${id}`;

  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(response.data?.data, "Audit plan fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | AUDIT PLAN", `/api/v1/audit-plans/${id}`);
  }
}

/**
 * Create new audit plan
 */
export async function createAuditPlan(data: {
  year: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  ref_no: string;
  audit_plan_date: string;
  audit_area: string;
  audit_scope: string;
  audit_criteria: string;
  audit_objective: string;
  management_standard: string;
  audit_team_leader: string;
  audit_team_members?: string[];
  client_representative: string;
  audit_language: string;
  opening_meeting_datetime?: string;
  closing_meeting_datetime?: string;
  working_paper_template_id: string;
  department_id: string;
  audit_universe_item_ids?: string[];
  budget_item_ids?: string[];
}): Promise<APIResponse> {
  if (!data.year || !data.title || !data.start_date || !data.end_date || !data.ref_no) {
    return handleBadRequest("Year, title, start date, end date, and reference number are required");
  }

  if (!data?.working_paper_template_id) {
    return handleBadRequest("Working paper template ID is required");
  }

  if (
    !data.audit_area ||
    !data.audit_scope ||
    !data.audit_criteria ||
    !data.audit_objective ||
    !data.audit_team_leader
  ) {
    return handleBadRequest("Audit area, scope, criteria, objective, and team leader are required");
  }

  if (!data.management_standard) {
    return handleBadRequest("Management standard is required");
  }
  const url = "/api/v1/audit-plans";

  try {
    const response = await authenticatedApiClient({ method: "POST", url, data });

    console.log(response);

    revalidatePath("/dashboard/audit/plans");
    revalidatePath("/dashboard/home/audit");

    return successResponse(response.data, "Audit plan created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE AUDIT PLAN", url);
  }
}

/**
 * Update existing audit plan (Draft only)
 */
export async function updateAuditPlan(
  id: string,
  data: {
    title?: string;
    description?: string;
    audit_scope?: string;
    audit_objective?: string;
    [key: string]: any;
  }
): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Audit plan ID is required");
  }

  const url = `/api/v1/audit-plans/${id}`;

  try {
    const response = await authenticatedApiClient({ method: "PUT", url, data });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/engagement/${id}`);
    revalidatePath("/dashboard/home/audit");

    return successResponse(response.data, "Audit plan updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE AUDIT PLAN", url);
  }
}

/**
 * Delete audit plan (Draft only)
 */
export async function deleteAuditPlan(id: string): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/audit-plans/${id}`
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath("/dashboard/home/audit");

    return successResponse(null, "Audit plan deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | AUDIT PLAN", `/api/v1/audit-plans/${id}`);
  }
}

// ============================================================================
// WORKPAPER ACTIONS
// ============================================================================

/**
 * Get all workpapers, optionally filtered by audit
 */
export async function getWorkpapers(
  auditPlanId?: string,
  filters?: {
    status?: string;
    prepared_by?: string;
  }
): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (auditPlanId) params.append("audit_plan_id", auditPlanId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.prepared_by) params.append("prepared_by", filters.prepared_by);

    const queryString = params.toString();
    const url = `/api/v1/working-papers${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data?.data, "Workpapers fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | WORKPAPERS", "/api/v1/working-papers");
  }
}

/**
 * Get single workpaper by audit plan ID
 */
export async function getWorkpaperByAuditPlanId(audit_plan_id: string): Promise<APIResponse> {
  if (!audit_plan_id) {
    return handleBadRequest("Audit plan ID is required");
  }

  const url = `/api/v1/audit-plans/${audit_plan_id}/working-paper`;

  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(response.data?.data, "Workpaper fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | WORKPAPER", url);
  }
}
/**
 * Get single workpaper by ID
 */
export async function getWorkpaper(id: string): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Working paper ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/working-papers/${id}`
    });

    return successResponse(response.data?.data, "Workpaper fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | WORKPAPER", `/api/v1/working-papers/${id}`);
  }
}

/**
 * Get working paper statistics
 */
export async function getWorkpaperStatistics(id: string): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Working paper ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/working-papers/${id}/statistics`
    });

    return successResponse(response.data, "Working paper statistics fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | WORKPAPER STATISTICS",
      `/api/v1/working-papers/${id}/statistics`
    );
  }
}

/**
 * Get audit plan working paper summary
 */
export async function getAuditPlanWorkpaperSummary(auditPlanId: string): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/audit-plans/${auditPlanId}/working-papers/summary`
    });

    return successResponse(response.data, "Audit plan workpaper summary fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | AUDIT PLAN WP SUMMARY",
      `/api/v1/audit-plans/${auditPlanId}/working-papers/summary`
    );
  }
}

/**
 * Create new workpaper
 */
export async function createWorkpaper(data: {
  audit_plan_id: string;
  template_id: string;
  ref_number: string;
  working_paper_date: string;
  prepared_by: string;
  reviewed_by?: string;
  status?: string;
}): Promise<APIResponse> {
  if (!data.audit_plan_id || !data.template_id || !data.ref_number) {
    return handleBadRequest("Audit plan ID, template ID, and reference number are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/working-papers",
      data
    });

    revalidatePath("/dashboard/audit/workpapers");
    revalidatePath(`/dashboard/audit/plans/engagement/${data.audit_plan_id}`);

    return successResponse(response.data, "Workpaper created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE WORKPAPER", "/api/v1/working-papers");
  }
}

/**
 * Create workpaper from template
 */
export async function createWorkpaperFromTemplate(data: {
  audit_plan_id: string;
  template_id: string;
}): Promise<APIResponse> {
  if (!data.audit_plan_id || !data.template_id) {
    return handleBadRequest("Audit plan ID and template ID are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/working-papers/from-template",
      data
    });

    revalidatePath("/dashboard/audit/workpapers");
    revalidatePath(`/dashboard/audit/plans/engagement/${data.audit_plan_id}`);

    return successResponse(response.data, "Workpaper created from template successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE WORKPAPER FROM TEMPLATE",
      "/api/v1/working-papers/from-template"
    );
  }
}

/**
 * Update existing workpaper
 */
export async function updateWorkpaper(
  id: string,
  data: {
    reviewed_by?: string;
    status?: string;
    [key: string]: any;
  }
): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Working paper ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/working-papers/${id}`,
      data
    });

    revalidatePath("/dashboard/audit/workpapers");
    revalidatePath(`/dashboard/audit/workpapers/${id}`);

    return successResponse(response.data, "Workpaper updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE WORKPAPER", `/api/v1/working-papers/${id}`);
  }
}

/**
 * Update workpaper status only
 */
export async function updateWorkpaperStatus(id: string, status: string): Promise<APIResponse> {
  if (!id || !status) {
    return handleBadRequest("Working paper ID and status are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PATCH",
      url: `/api/v1/working-papers/${id}/status`,
      data: { status }
    });

    revalidatePath("/dashboard/audit/workpapers");
    revalidatePath(`/dashboard/audit/workpapers/${id}`);

    return successResponse(response.data, "Workpaper status updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PATCH | UPDATE WORKPAPER STATUS",
      `/api/v1/working-papers/${id}/status`
    );
  }
}

/**
 * Delete workpaper
 */
export async function deleteWorkpaper(id: string): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Working paper ID is required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/working-papers/${id}`
    });

    revalidatePath("/dashboard/audit/workpapers");

    return successResponse(null, "Workpaper deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | WORKPAPER", `/api/v1/working-papers/${id}`);
  }
}

// ============================================================================
// FINDING ACTIONS
// ============================================================================

/**
 * Get all findings with optional filters
 */
export async function getFindings(filters?: {
  working_paper_id?: string;
  audit_plan_id?: string;
  severity?: string;
  status?: string;
}): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.working_paper_id) params.append("working_paper_id", filters.working_paper_id);
    if (filters?.audit_plan_id) params.append("audit_plan_id", filters.audit_plan_id);
    if (filters?.severity) params.append("severity", filters.severity);
    if (filters?.status) params.append("status", filters.status);

    const queryString = params.toString();
    const url = `/api/v1/working-paper-findings${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data?.data, "Findings fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | FINDINGS", "/api/v1/working-paper-findings");
  }
}

/**
 * Get findings by category within a working paper
 */
export async function getFindingsByCategory(
  workingPaperId: string,
  categoryName: string
): Promise<APIResponse> {
  if (!workingPaperId || !categoryName) {
    return handleBadRequest("Working paper ID and category name are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/working-papers/${workingPaperId}/categories/${categoryName}/findings`
    });

    return successResponse(response.data, "Category findings fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | CATEGORY FINDINGS",
      `/api/v1/working-papers/${workingPaperId}/categories/${categoryName}/findings`
    );
  }
}

/**
 * Get single finding by ID
 */
export async function getFinding(id: string): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Finding ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/working-paper-findings/${id}`
    });

    return successResponse(response.data, "Finding fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | FINDING", `/api/v1/working-paper-findings/${id}`);
  }
}

/**
 * Update existing finding
 */
export async function updateFinding(
  finding_id: string,
  data: {
    management_response?: string;
    action_plan?: string;
    responsible_person?: string;
    due_date?: string;
    status?: string;
    severity?: string;
    recommendation?: string;
    [key: string]: any;
  }
): Promise<APIResponse> {
  if (!finding_id) {
    return handleBadRequest("Finding ID is required");
  }

  const url = `/api/v1/working-paper-findings/${finding_id}`;

  if (!data) {
    return handleBadRequest("Data is required");
  }

  try {
    const response = await authenticatedApiClient({ method: "PUT", url, data });

    revalidatePath("/dashboard/audit/findings");
    revalidatePath("/dashboard/audit/workpapers");

    return successResponse(response.data, "Finding updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE FINDING", url);
  }
}

/**
 * Update finding status only
 */
export async function updateFindingStatus(id: string, status: string): Promise<APIResponse> {
  if (!id || !status) {
    return handleBadRequest("Finding ID and status are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PATCH",
      url: `/api/v1/working-paper-findings/${id}/status`,
      data: { status }
    });

    revalidatePath("/dashboard/audit/findings");
    revalidatePath("/dashboard/audit/workpapers");

    return successResponse(response.data, "Finding status updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PATCH | UPDATE FINDING STATUS",
      `/api/v1/working-paper-findings/${id}/status`
    );
  }
}

/**
 * Delete finding
 */
export async function deleteFinding(id: string): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Finding ID is required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/working-paper-findings/${id}`
    });

    revalidatePath("/dashboard/audit/findings");
    revalidatePath("/dashboard/audit/workpapers");

    return successResponse(null, "Finding deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | FINDING", `/api/v1/working-paper-findings/${id}`);
  }
}

// ============================================================================
// ANALYTICS ACTIONS
// ============================================================================

/**
 * Get audit metrics
 */
export async function getAuditMetrics(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: "/api/v1/audit-dashboard/overview"
    });

    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "GET | AUDIT METRICS", "/api/v1/audit-dashboard/overview");
  }
}

// ============================================================================
// WORKING PAPER TEMPLATE ACTIONS (API Integration)
// ============================================================================

/**
 * Get all working paper templates
 */
export async function getWorkingPaperTemplates(params?: {
  framework_type?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}): Promise<APIResponse> {
  try {
    const urlParams = new URLSearchParams();

    if (params?.framework_type) urlParams.append("framework_type", params.framework_type);
    if (params?.is_active !== undefined) urlParams.append("is_active", String(params.is_active));
    if (params?.page) urlParams.append("page", String(params.page));
    if (params?.page_size) urlParams.append("page_size", String(params.page_size));

    const queryString = urlParams.toString();
    const url = `/api/v1/working-paper-templates${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({ url });

    return successResponse(response.data?.data, "Working paper templates fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | WORKING PAPER TEMPLATES", "/api/v1/working-paper-templates");
  }
}

/**
 * Get single working paper template by ID
 */
export async function getWorkingPaperTemplate(templateId: string): Promise<APIResponse> {
  if (!templateId) {
    return handleBadRequest("Template ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/working-paper-templates/${templateId}`
    });

    return successResponse(response.data, "Working paper template fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | WORKING PAPER TEMPLATE",
      `/api/v1/working-paper-templates/${templateId}`
    );
  }
}

/**
 * Get working paper template categories
 */
export async function getWorkpaperTemplateCategories(templateId: string): Promise<APIResponse> {
  if (!templateId) {
    return handleBadRequest("Template ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/working-paper-templates/${templateId}/categories`
    });

    return successResponse(response.data, "Template with categories fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | TEMPLATE WITH CATEGORIES",
      `/api/v1/working-paper-templates/${templateId}/categories`
    );
  }
}

/**
 * Create new working paper template
 */
export async function createWorkingPaperTemplate(data: {
  name: string;
  standard: string;
  framework_type: string;
  description?: string;
  version?: string;
  is_active?: boolean;
}): Promise<APIResponse> {
  if (!data.name || !data.standard) {
    return handleBadRequest("Template name and standard are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/working-paper-templates",
      data
    });

    revalidatePath("/dashboard/audit/templates");
    revalidatePath("/dashboard/system-configs/audit-settings");

    return successResponse(response.data, "Working paper template created successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE WORKING PAPER TEMPLATE",
      "/api/v1/working-paper-templates"
    );
  }
}

/**
 * Update working paper template
 */
export async function updateWorkingPaperTemplate(
  templateId: string,
  data: {
    name?: string;
    standard?: string;
    description?: string;
    framework_type?: string;
    version?: string;
    is_active?: boolean;
  }
): Promise<APIResponse> {
  if (!templateId) {
    return handleBadRequest("Template ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/working-paper-templates/${templateId}`,
      data
    });

    revalidatePath("/dashboard/audit/templates");
    revalidatePath(`/dashboard/audit/templates/${templateId}`);

    return successResponse(response.data, "Working paper template updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE WORKING PAPER TEMPLATE",
      `/api/v1/working-paper-templates/${templateId}`
    );
  }
}

/**
 * Delete working paper template
 */
export async function deleteWorkingPaperTemplate(templateId: string): Promise<APIResponse> {
  if (!templateId) {
    return handleBadRequest("Template ID is required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/working-paper-templates/${templateId}`
    });

    revalidatePath("/dashboard/audit/templates");

    return successResponse(null, "Working paper template deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | WORKING PAPER TEMPLATE",
      `/api/v1/working-paper-templates/${templateId}`
    );
  }
}

// ============================================================================
// TEMPLATE CATEGORY ACTIONS (API Integration)
// ============================================================================

/**
 * Get all categories for a template
 */
export async function getTemplateCategories(templateId: string): Promise<APIResponse> {
  if (!templateId) {
    return handleBadRequest("Template ID is required");
  }

  const url = `/api/v1/working-paper-templates/${templateId}/categories`;

  try {
    const response = await authenticatedApiClient({ method: "GET", url });

    return successResponse(response.data, "Template categories fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | TEMPLATE CATEGORIES", url);
  }
}

/**
 * Get single template category by ID
 */
export async function getTemplateCategory(categoryId: string): Promise<APIResponse> {
  if (!categoryId) {
    return handleBadRequest("Category ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/template-categories/${categoryId}`
    });

    return successResponse(response.data, "Template category fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | TEMPLATE CATEGORY",
      `/api/v1/template-categories/${categoryId}`
    );
  }
}

/**
 * Create new template category
 */
export async function createTemplateCategory(data: TemplateCategory): Promise<APIResponse> {
  if (!data.template_id || !data.name) {
    return handleBadRequest("Template ID and category name are required");
  }

  const url = `/api/v1/working-paper-templates/${data.template_id}/categories`;

  try {
    // Build payload with only the required fields for new metadata structure
    const payload = {
      name: data.name,
      sort_order: data.sort_order || 0,
      // New structure: metadata with framework-type as key containing array of clauses
      metadata: data.metadata || {}
    };

    const response = await authenticatedApiClient({ method: "POST", url, data: payload });

    revalidatePath("/dashboard/audit/templates");
    revalidatePath(`/dashboard/audit/templates/${data.template_id}`);
    revalidatePath(`/dashboard/system-configs/audit-settings/templates/${data.template_id}`);
    revalidatePath(
      `/dashboard/system-configs/audit-settings/templates/${data.template_id}/categories`
    );

    return successResponse(response.data, "Template category created successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE TEMPLATE CATEGORY",
      "/api/v1/working-paper-categories"
    );
  }
}

/**
 * Update template category
 */
export async function updateTemplateCategory(
  categoryId: string,
  data: TemplateCategory
): Promise<APIResponse> {
  if (!categoryId) {
    return handleBadRequest("Category ID is required");
  }

  const url = `/api/v1/template-categories/${categoryId}`;

  try {
    // Build payload with only the required fields for new metadata structure
    const payload = {
      name: data.name,
      sort_order: data.sort_order || 0,
      // New structure: metadata with framework-type as key containing array of clauses
      metadata: data.metadata || {}
    };

    const response = await authenticatedApiClient({
      method: "PUT",
      url,
      data: payload
    });

    revalidatePath("/dashboard/audit/templates");
    revalidatePath(`/dashboard/audit/templates/${data.template_id}`);
    revalidatePath(
      `/dashboard/system-configs/audit-settings/templates/${data.template_id}/categories`
    );
    revalidatePath(
      `/dashboard/system-configs/audit-settings/templates/${data.template_id}/categories/${categoryId}`
    );

    return successResponse(response.data, "Template category updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE TEMPLATE CATEGORY",
      `/api/v1/working-paper-categories/${categoryId}`
    );
  }
}

/**
 * Delete template category
 */
export async function deleteTemplateCategory(categoryId: string): Promise<APIResponse> {
  if (!categoryId) {
    return handleBadRequest("Category ID is required");
  }

  const url = `/api/v1/template-categories/${categoryId}`;

  try {
    await authenticatedApiClient({ method: "DELETE", url });

    revalidatePath("/dashboard/audit/templates");
    revalidatePath(`/dashboard/audit/templates/[templateId]`);
    revalidatePath(`/dashboard/system-configs/audit-settings/templates/[templateId]/categories`);
    revalidatePath(
      `/dashboard/system-configs/audit-settings/templates/[templateId]}/categories/[categoryId]`,
      "page"
    );

    return successResponse(null, "Template category deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | TEMPLATE CATEGORY",
      `/api/v1/working-paper-categories/${categoryId}`
    );
  }
}

// ============================================================================
// AUDIT PLAN APPROVAL WORKFLOW ACTIONS (API Integration)
// ============================================================================

/**
 * Submit audit plan for approval
 */
export async function submitAuditPlanForApproval(auditPlanId: string): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  const url = `/api/v1/audit-plans/${auditPlanId}/submit-for-approval`;

  try {
    const response = await authenticatedApiClient({ method: "GET", url });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/engagement/${auditPlanId}`);

    return successResponse(response.data, "Audit plan submitted for approval successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | SUBMIT AUDIT PLAN",
      `/api/v1/audit-plans/${auditPlanId}/submit-for-approval`
    );
  }
}

/**
 * Reject audit plan
 */
export async function rejectAuditPlan(auditPlanId: string, reason: string): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }
  if (!reason) {
    return handleBadRequest("Rejection reason is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/audit-plans/${auditPlanId}/reject`,
      data: { reason }
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/engagement/${auditPlanId}`);

    return successResponse(response.data, "Audit plan rejected successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | REJECT AUDIT PLAN",
      `/api/v1/audit-plans/${auditPlanId}/reject`
    );
  }
}

/**
 * Activate audit plan
 */
export async function activateAuditPlan(auditPlanId: string): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/audit-plans/${auditPlanId}/activate`
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/engagement/${auditPlanId}`);

    return successResponse(response.data, "Audit plan activated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | ACTIVATE AUDIT PLAN",
      `/api/v1/audit-plans/${auditPlanId}/activate`
    );
  }
}

/**
 * Complete audit plan
 */
export async function completeAuditPlan(auditPlanId: string): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/audit-plans/${auditPlanId}/complete`
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/engagement/${auditPlanId}`);

    return successResponse(response.data, "Audit plan completed successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | COMPLETE AUDIT PLAN",
      `/api/v1/audit-plans/${auditPlanId}/complete`
    );
  }
}

// ============================================================================
// SYSTEM AUDIT LOG ACTIONS (API Integration)
// ============================================================================

/**
 * Get all audit logs with filters
 */
export async function getAuditLogs(filters?: {
  action?: string;
  entity_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.action) params.append("action", filters.action);
    if (filters?.entity_type) params.append("entity_type", filters.entity_type);
    if (filters?.user_id) params.append("user_id", filters.user_id);
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));

    const queryString = params.toString();
    const url = `/api/v1/audit-logs${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data, "Audit logs fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | AUDIT LOGS", "/api/v1/audit-logs");
  }
}

/**
 * Get audit logs by user
 */
export async function getAuditLogsByUser(
  userId: string,
  limit?: number,
  offset?: number
): Promise<APIResponse> {
  if (!userId) {
    return handleBadRequest("User ID is required");
  }

  try {
    const params = new URLSearchParams();
    if (limit) params.append("limit", String(limit));
    if (offset) params.append("offset", String(offset));

    const queryString = params.toString();
    const url = `/api/v1/audit-logs/user/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data, "User audit logs fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | USER AUDIT LOGS", `/api/v1/audit-logs/user/${userId}`);
  }
}

/**
 * Get audit logs by entity
 */
export async function getAuditLogsByEntity(
  entityType: string,
  entityId: string
): Promise<APIResponse> {
  if (!entityType || !entityId) {
    return handleBadRequest("Entity type and ID are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/audit-logs/entity/${entityType}/${entityId}`
    });

    return successResponse(response.data, "Entity audit logs fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | ENTITY AUDIT LOGS",
      `/api/v1/audit-logs/entity/${entityType}/${entityId}`
    );
  }
}

/**
 * Create a new budget
 */
export async function createBudget(payload: CreateBudgetPayload): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/audit/budgets",
      data: payload
    });

    revalidatePath("/dashboard/audit/budgets");
    revalidatePath("/dashboard/audit/budgets/new");
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "POST | CREATE BUDGET", "/api/v1/audit/budgets");
  }
}

/**
 * Create a budget line for a specific budget
 */
export async function createBudgetLine(
  budgetId: string,
  payload: CreateBudgetLinePayload
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/audit/budgets/${budgetId}/lines`,
      data: payload
    });

    revalidatePath("/dashboard/audit/budgets/new");
    revalidatePath(`/dashboard/audit/budgets/${budgetId}`);

    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE BUDGET LINE",
      `/api/v1/audit/budgets/${budgetId}/lines`
    );
  }
}

/**
 * Get all budgets
 */
export async function getBudgets(params?: {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  department_id?: string;
  status?: string;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.page_size) queryParams.append("page_size", String(params.page_size));
  if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
  if (params?.department_id) queryParams.append("department_id", params.department_id);
  if (params?.status) queryParams.append("status", params.status);

  const url = `/api/v1/audit/budgets${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  try {
    const response = await authenticatedApiClient({ url });
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "GET | FETCH BUDGETS", "/api/v1/audit/budgets");
  }
}

/**
 * Get a single budget by ID
 */
export async function getBudgetById(budgetId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/audit/budgets/${budgetId}`
    });

    return successResponse(response.data, "Budget fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | FETCH BUDGET", `/api/v1/audit/budgets/${budgetId}`);
  }
}

/**
 * Get budget lines for a specific budget
 */
export async function getBudgetLines(
  budgetId: string,
  params?: {
    page?: number;
    page_size?: number;
    is_active?: boolean;
    department_id?: string;
    status?: string;
  }
): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.page_size) queryParams.append("page_size", String(params.page_size));
  if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
  if (params?.department_id) queryParams.append("department_id", params.department_id);
  if (params?.status) queryParams.append("status", params.status);

  const url = `/api/v1/audit/budgets/${budgetId}/lines`;

  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(response.data, "Budget lines fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | FETCH BUDGET LINES", url);
  }
}

/**
 * Update a budget
 */
export async function updateBudget(
  budgetId: string,
  payload: Partial<CreateBudgetPayload>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/audit/budgets/${budgetId}`,
      data: payload
    });

    return successResponse(response.data, "Budget updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE BUDGET", `/api/v1/audit/budgets/${budgetId}`);
  }
}

/**
 * Update a budget line
 */
export async function updateBudgetLine(
  lineId: string,
  payload: Partial<CreateBudgetLinePayload>,
  budgetId: string
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/audit/budget-lines/${lineId}`,
      data: payload
    });

    revalidatePath("/dashboard/audit/budgets");
    revalidatePath(`/dashboard/audit/budgets/${budgetId}`);

    return successResponse(response.data, "Budget line updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE BUDGET LINE", `/api/v1/audit/budget-lines/${lineId}`);
  }
}

/**
 * Delete a budget
 */
export async function deleteBudget(budgetId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/audit/budgets/${budgetId}`
    });

    revalidatePath("/dashboard/audit/budgets");

    return successResponse(response.data, "Budget deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | DELETE BUDGET", `/api/v1/audit/budgets/${budgetId}`);
  }
}

/**
 * Delete a budget line
 */
export async function deleteBudgetLine(budgetId: string, lineId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/audit/budget-lines/${lineId}`
    });

    revalidatePath("/dashboard/audit/budgets");
    revalidatePath(`/dashboard/audit/budgets/${budgetId}`);

    return successResponse(response.data, "Budget line deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | DELETE BUDGET LINE",
      `/api/v1/audit/budget-lines/${lineId}`
    );
  }
}

// ============================================================================
// AUDIT UNIVERSE ACTIONS
// ============================================================================

/**
 * Create a new audit universe
 */
export async function createUniverse(payload: CreateUniversePayload): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/audit/universes",
      data: payload
    });

    revalidatePath("/dashboard/audit/universe");
    revalidatePath("/dashboard/audit/universe/new");
    return successResponse(response.data.data, "Universe created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE UNIVERSE", "/api/v1/audit/universes");
  }
}

/**
 * Get all audit universes
 */
export async function getUniverses(params?: {
  page?: number;
  page_size?: number;
  is_active?: boolean;
}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());

    const url = `/api/v1/audit/universes${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data.data, "Universes fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | FETCH UNIVERSES", "/api/v1/audit/universes");
  }
}

/**
 * Get a single audit universe by ID
 */
export async function getUniverseById(universeId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/audit/universes/${universeId}`
    });

    return successResponse(response.data.data, "Universe fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | FETCH UNIVERSE", `/api/v1/audit/universes/${universeId}`);
  }
}

/**
 * Update an audit universe
 */
export async function updateUniverse(
  universeId: string,
  payload: Partial<CreateUniversePayload>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "PATCH",
      url: `/api/v1/audit/universes/${universeId}`,
      data: payload
    });

    revalidatePath("/dashboard/audit/universe");
    revalidatePath(`/dashboard/audit/universe/${universeId}`);

    return successResponse(response.data.data, "Universe updated successfully");
  } catch (error: any) {
    return handleError(error, "PATCH | UPDATE UNIVERSE", `/api/v1/audit/universes/${universeId}`);
  }
}

/**
 * Delete an audit universe
 */
export async function deleteUniverse(universeId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/audit/universes/${universeId}`
    });

    revalidatePath("/dashboard/audit/universe");

    return successResponse(response.data, "Universe deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | DELETE UNIVERSE", `/api/v1/audit/universes/${universeId}`);
  }
}

// ============================================================================
// AUDIT UNIVERSE ITEM ACTIONS
// ============================================================================

/**
 * Create a new universe item
 */
export async function createUniverseItem(payload: CreateUniverseItemPayload): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/audit/universe-items",
      data: payload
    });

    revalidatePath("/dashboard/audit/universe");
    revalidatePath("/dashboard/audit/universe/new");
    if (payload.audit_universe_id) {
      revalidatePath(`/dashboard/audit/universe/${payload.audit_universe_id}`);
    }

    return successResponse(response.data.data, "Universe item created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE UNIVERSE ITEM", "/api/v1/audit/universe-items");
  }
}

/**
 * Get all universe items
 */
export async function getUniverseItems(params?: {
  page?: number;
  page_size?: number;
  audit_universe_id?: string;
  department_id?: string;
}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.department_id) queryParams.append("department_id", params.department_id);
    if (params?.audit_universe_id)
      queryParams.append("audit_universe_id", params.audit_universe_id);

    const url = `/api/v1/audit/universe-items${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(
      response.data.data || response?.data,
      "Universe items fetched successfully"
    );
  } catch (error: any) {
    return handleError(error, "GET | FETCH UNIVERSE ITEMS", "/api/v1/audit/universe-items");
  }
}

/**
 * Get a single universe item by ID
 */
export async function getUniverseItemById(itemId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/audit/universe-items/${itemId}`
    });

    return successResponse(response.data.data, "Universe item fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | FETCH UNIVERSE ITEM",
      `/api/v1/audit/universe-items/${itemId}`
    );
  }
}

/**
 * Update a universe item
 */
export async function updateUniverseItem(
  itemId: string,
  payload: Partial<CreateUniverseItemPayload>,
  universeId?: string
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/audit/universe-items/${itemId}`,
      data: payload
    });

    revalidatePath("/dashboard/audit/universe");
    if (universeId) {
      revalidatePath(`/dashboard/audit/universe/${universeId}`);
    }

    return successResponse(response.data.data, "Universe item updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE UNIVERSE ITEM",
      `/api/v1/audit/universe-items/${itemId}`
    );
  }
}

/**
 * Delete a universe item
 */
export async function deleteUniverseItem(
  itemId: string,
  universeId?: string
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/audit/universe-items/${itemId}`
    });

    revalidatePath("/dashboard/audit/universe");
    if (universeId) {
      revalidatePath(`/dashboard/audit/universe/${universeId}`);
    }

    return successResponse(response.data, "Universe item deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | DELETE UNIVERSE ITEM",
      `/api/v1/audit/universe-items/${itemId}`
    );
  }
}

/**
 * Submit budget for approval
 */
export async function submitBudgetForApproval(budgetId: string): Promise<APIResponse> {
  if (!budgetId) {
    return handleBadRequest("Budget ID is required");
  }

  const url = `/api/v1/audit/budgets/${budgetId}/submit-for-approval`;

  try {
    const response = await authenticatedApiClient({ method: "GET", url });

    revalidatePath("/dashboard/audit/budgets");
    revalidatePath(`/dashboard/audit/budgets/${budgetId}`);

    return successResponse(response.data, "Budget submitted for approval successfully");
  } catch (error: any) {
    return handleError(error, "GET | SUBMIT BUDGET", url);
  }
}

/**
 * Submit universe for approval
 */
export async function submitUniverseForApproval(universeId: string): Promise<APIResponse> {
  if (!universeId) {
    return handleBadRequest("Universe ID is required");
  }

  const url = `/api/v1/audit/universes/${universeId}/submit-for-approval`;

  try {
    const response = await authenticatedApiClient({ method: "GET", url });

    revalidatePath("/dashboard/audit/universe");
    revalidatePath(`/dashboard/audit/universe/${universeId}`);

    return successResponse(response.data, "Universe submitted for approval successfully");
  } catch (error: any) {
    return handleError(error, "GET | SUBMIT UNIVERSE", url);
  }
}

// ============================================================================
// FINDING EVIDENCE ACTIONS
// ============================================================================

/**
 * Get all evidence for a finding
 */
export async function getFindingEvidence(finding_id: string): Promise<APIResponse> {
  if (!finding_id) {
    return handleBadRequest("Finding ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/working-paper-findings/${finding_id}/evidence`
    });

    return successResponse(response.data?.data, "Finding evidence fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | FINDING EVIDENCE",
      `/api/v1/working-paper-findings/${finding_id}/evidence`
    );
  }
}

/**
 * Get single evidence by ID
 */
export async function getEvidence(evidence_id: string): Promise<APIResponse> {
  if (!evidence_id) {
    return handleBadRequest("Evidence ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/finding-evidence/${evidence_id}`
    });

    return successResponse(response.data?.data, "Evidence fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | EVIDENCE", `/api/v1/finding-evidence/${evidence_id}`);
  }
}

/**
 * Create finding evidence
 */
export async function createFindingEvidence(
  finding_id: string,
  data: {
    evidence_type: string;
    title: string;
    description?: string;
    external_link?: string;
    file_link?: string;
    collection_date?: string;
    notes?: string;
  }
): Promise<APIResponse> {
  if (!finding_id) {
    return handleBadRequest("Finding ID is required");
  }

  if (!data.title) {
    return handleBadRequest("Evidence title is required");
  }

  const url = `/api/v1/finding-evidence`;

  try {
    // Include finding_id in the payload
    const payload = {
      finding_id,
      ...data
    };

    const response = await authenticatedApiClient({ method: "POST", url, data: payload });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath("/dashboard/audit/workpapers");

    return successResponse(response.data?.data, "Evidence created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE EVIDENCE", `/api/v1/finding-evidence`);
  }
}

/**
 * Update finding evidence
 */
export async function updateFindingEvidence(
  evidence_id: string,
  data: {
    evidence_type?: string;
    title?: string;
    description?: string;
    external_link?: string;
    file_link?: string;
    collection_date?: string;
    notes?: string;
  }
): Promise<APIResponse> {
  if (!evidence_id) {
    return handleBadRequest("Evidence ID is required");
  }

  const url = `/api/v1/finding-evidence/${evidence_id}`;

  try {
    const response = await authenticatedApiClient({ method: "PUT", url, data });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath("/dashboard/audit/workpapers");

    return successResponse(response.data?.data, "Evidence updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE EVIDENCE", `/api/v1/finding-evidence/${evidence_id}`);
  }
}

/**
 * Delete finding evidence
 */
export async function deleteFindingEvidence(evidence_id: string): Promise<APIResponse> {
  if (!evidence_id) {
    return handleBadRequest("Evidence ID is required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/finding-evidence/${evidence_id}`
    });

    revalidatePath("/dashboard/audit/findings");
    revalidatePath("/dashboard/audit/workpapers");

    return successResponse(null, "Evidence deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | EVIDENCE", `/api/v1/finding-evidence/${evidence_id}`);
  }
}

// ============================================================================
// ANNUAL AUDIT PLAN ACTIONS
// ============================================================================

/**
 * Get all annual audit plan registers with optional filters
 */
export async function getAnnualAuditPlans(filters?: {
  year?: number;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.year) params.append("year", String(filters.year));
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.page_size) params.append("page_size", String(filters.page_size));

    const queryString = params.toString();
    const url = `/api/v1/annual-audit-plans${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data?.data, "Annual audit plans fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | ANNUAL AUDIT PLANS", "/api/v1/annual-audit-plans");
  }
}

/**
 * Get annual audit plan register by ID or year
 */
export async function getAnnualAuditPlan(filter: {
  register_id?: string;
  year?: number;
}): Promise<APIResponse> {
  if (!filter.register_id && !filter.year) {
    return handleBadRequest("Either register_id or year is required");
  }

  try {
    const params = new URLSearchParams();
    if (filter.register_id) params.append("register_id", filter.register_id);
    if (filter.year) params.append("year", String(filter.year));

    const queryString = params.toString();
    const url = `/api/v1/annual-audit-plans/get${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data?.data, "Annual audit plan fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | ANNUAL AUDIT PLAN", "/api/v1/annual-audit-plans/get");
  }
}

/**
 * Create annual audit plan register status
 */
export async function createAnnualAuditPlan(year: number): Promise<APIResponse> {
  if (!year) {
    return handleBadRequest("Year is required");
  }

  const url = `/api/v1/annual-audit-plans/init`;

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url,
      data: {
        year
      }
    });

    revalidatePath("/dashboard/audit/annual-plans");

    return successResponse(response.data, "Annual audit plan created successfully");
  } catch (error: any) {
    return handleError(error, "PATCH | UPDATE ANNUAL AUDIT PLAN", url);
  }
}
/**
 * Update annual audit plan register status
 */
export async function updateAnnualAuditPlan(
  registerId: string,
  data: {
    status?: string;
    [key: string]: any;
  }
): Promise<APIResponse> {
  if (!registerId) {
    return handleBadRequest("Register ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PATCH",
      url: `/api/v1/annual-audit-plans/${registerId}`,
      data
    });

    revalidatePath("/dashboard/audit/annual-plans");

    return successResponse(response.data, "Annual audit plan updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PATCH | UPDATE ANNUAL AUDIT PLAN",
      `/api/v1/annual-audit-plans/${registerId}`
    );
  }
}

/**
 * Submit annual audit plan for approval
 */
export async function submitAnnualAuditPlanForApproval(
  registerId: string,
  comments?: string
): Promise<APIResponse> {
  if (!registerId) {
    return handleBadRequest("Register ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/annual-audit-plans/${registerId}/submit`,
      data: {
        comments: comments || ""
      }
    });

    revalidatePath("/dashboard/audit/annual-plans");

    return successResponse(response.data, "Annual audit plan submitted for approval successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | SUBMIT ANNUAL AUDIT PLAN",
      `/api/v1/annual-audit-plans/${registerId}/submit`
    );
  }
}

/**
 * Approve annual audit plan
 */
export async function approveAnnualAuditPlan(
  registerId: string,
  comments?: string
): Promise<APIResponse> {
  if (!registerId) {
    return handleBadRequest("Register ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/annual-audit-plans/${registerId}/approve`,
      data: {
        comments: comments || "Approved"
      }
    });

    revalidatePath("/dashboard/audit/annual-plans");

    return successResponse(response.data, "Annual audit plan approved successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | APPROVE ANNUAL AUDIT PLAN",
      `/api/v1/annual-audit-plans/${registerId}/approve`
    );
  }
}

/**
 * Reject annual audit plan
 */
export async function rejectAnnualAuditPlan(
  registerId: string,
  reason: string
): Promise<APIResponse> {
  if (!registerId) {
    return handleBadRequest("Register ID is required");
  }

  if (!reason) {
    return handleBadRequest("Rejection reason is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/annual-audit-plans/${registerId}/reject`,
      data: {
        reason
      }
    });

    revalidatePath("/dashboard/audit/annual-plans");

    return successResponse(response.data, "Annual audit plan rejected successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | REJECT ANNUAL AUDIT PLAN",
      `/api/v1/annual-audit-plans/${registerId}/reject`
    );
  }
}

// ============================================================================
// ANNUAL AUDIT PLAN ITEM ACTIONS
// ============================================================================

/**
 * Create annual audit plan item
 */
export async function createAnnualAuditPlanItem(
  registerId: string,
  data: {
    department_id: string;
    universe_item_ids: string[];
    engagement_date: string;
    responsible_person: string;
    [key: string]: any;
  }
): Promise<APIResponse> {
  if (!registerId) {
    return handleBadRequest("Register ID is required");
  }

  if (!data.department_id || !data.universe_item_ids || !data.engagement_date) {
    return handleBadRequest("Department ID, universe items, and engagement date are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/annual-audit-plans/${registerId}/items`,
      data
    });

    revalidatePath("/dashboard/audit/annual-plans");
    revalidatePath(`/dashboard/audit/annual-plans/${registerId}`);

    return successResponse(response.data, "Annual audit plan item created successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE ANNUAL AUDIT PLAN ITEM",
      `/api/v1/annual-audit-plans/${registerId}/items`
    );
  }
}

/**
 * Get all annual audit plan items for a register
 */
export async function getAnnualAuditPlanItems(
  registerId: string,
  filters?: {
    page?: number;
    page_size?: number;
  }
): Promise<APIResponse> {
  if (!registerId) {
    return handleBadRequest("Register ID is required");
  }

  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.page_size) params.append("page_size", String(filters.page_size));

    const queryString = params.toString();
    const url = `/api/v1/annual-audit-plans/${registerId}/items${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data?.data, "Annual audit plan items fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | ANNUAL AUDIT PLAN ITEMS",
      `/api/v1/annual-audit-plans/${registerId}/items`
    );
  }
}

/**
 * Get single annual audit plan item by ID
 */
export async function getAnnualAuditPlanItem(
  registerId: string,
  itemId: string
): Promise<APIResponse> {
  if (!registerId || !itemId) {
    return handleBadRequest("Register ID and Item ID are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/annual-audit-plans/${registerId}/items/${itemId}`
    });

    return successResponse(response.data?.data, "Annual audit plan item fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | ANNUAL AUDIT PLAN ITEM",
      `/api/v1/annual-audit-plans/${registerId}/items/${itemId}`
    );
  }
}

/**
 * Update annual audit plan item
 */
export async function updateAnnualAuditPlanItem(
  registerId: string,
  itemId: string,
  data: {
    department_id?: string;
    universe_item_ids?: string[];
    engagement_date?: string;
    responsible_person?: string;
    [key: string]: any;
  }
): Promise<APIResponse> {
  if (!registerId || !itemId) {
    return handleBadRequest("Register ID and Item ID are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/annual-audit-plans/${registerId}/items/${itemId}`,
      data
    });

    revalidatePath("/dashboard/audit/annual-plans");
    revalidatePath(`/dashboard/audit/annual-plans/${registerId}`);

    return successResponse(response.data, "Annual audit plan item updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE ANNUAL AUDIT PLAN ITEM",
      `/api/v1/annual-audit-plans/${registerId}/items/${itemId}`
    );
  }
}

/**
 * Generate audit plan from annual audit plan item
 */
export async function generateAuditPlanFromItem(
  registerId: string,
  itemId: string,
  data: {
    title: string;
    description?: string;
    ref_no: string;
    end_date: string;
    audit_plan_date: string;
    audit_area: string;
    audit_scope: string;
    audit_criteria: string;
    audit_objective: string;
    management_standard: string;
    audit_team_members?: string[];
    client_representative: string;
    budget_item_ids?: string[];
    [key: string]: any;
  }
): Promise<APIResponse> {
  if (!registerId || !itemId) {
    return handleBadRequest("Register ID and Item ID are required");
  }

  if (
    !data.title ||
    !data.ref_no ||
    !data.end_date ||
    !data.audit_plan_date ||
    !data.audit_area ||
    !data.audit_scope
  ) {
    return handleBadRequest("Required fields for audit plan generation are missing");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/annual-audit-plans/${registerId}/items/${itemId}/generate-audit-plan`,
      data
    });

    revalidatePath("/dashboard/audit/annual-plans");
    revalidatePath(`/dashboard/audit/annual-plans/${registerId}`);
    revalidatePath("/dashboard/audit/plans");

    return successResponse(response.data, "Audit plan generated successfully from annual item");
  } catch (error: any) {
    return handleError(
      error,
      "POST | GENERATE AUDIT PLAN FROM ITEM",
      `/api/v1/annual-audit-plans/${registerId}/items/${itemId}/generate-audit-plan`
    );
  }
}

/**
 * Delete annual audit plan item
 */
export async function deleteAnnualAuditPlanItem(
  registerId: string,
  itemId: string
): Promise<APIResponse> {
  if (!registerId || !itemId) {
    return handleBadRequest("Register ID and Item ID are required");
  }

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/annual-audit-plans/${registerId}/items/${itemId}`
    });

    revalidatePath("/dashboard/audit/annual-plans");
    revalidatePath(`/dashboard/audit/annual-plans/${registerId}`);

    return successResponse(null, "Annual audit plan item deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | ANNUAL AUDIT PLAN ITEM",
      `/api/v1/annual-audit-plans/${registerId}/items/${itemId}`
    );
  }
}
