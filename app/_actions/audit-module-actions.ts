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
import type { APIResponse } from "@/lib/types";
import type {
  ReportTemplate,
  ReportParams,
  ScheduledReport,
  AuditSettings,
  SettingsInput,
  TeamMember,
  TeamMemberInput,
  TemplateCategory
} from "@/lib/types/audit-types";
import { handleBadRequest, handleError, successResponse } from "./api-config";
import authenticatedApiClient from "./api-config";

// ============================================================================
// AUDIT PLAN ACTIONS
// ============================================================================

/**
 * Get all audit plans with optional filters
 */
export async function getAuditPlans(filters?: {
  year?: number;
  status?: string;
}): Promise<APIResponse> {
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

    return successResponse(response.data, "Audit plans fetched successfully");
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

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/audit-plans/${id}`
    });

    return successResponse(response.data, "Audit plan fetched successfully");
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
  description?: string;
  start_date: string;
  end_date: string;
  ref_no: string;
  audit_area: string;
  audit_scope: string;
  audit_criteria: string;
  audit_objective: string;
  management_standard: string;
  audit_team_leader: string;
  audit_team_member?: string;
  client_representative?: string;
  audit_language?: string;
  opening_meeting_datetime?: string;
  closing_meeting_datetime?: string;
  working_paper_template_id?: string;
}): Promise<APIResponse> {
  if (!data.year || !data.title || !data.start_date || !data.end_date || !data.ref_no) {
    return handleBadRequest("Year, title, start date, end date, and reference number are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/audit-plans",
      data
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath("/dashboard/home/audit");

    return successResponse(response.data, "Audit plan created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE AUDIT PLAN", "/api/v1/audit-plans");
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

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/audit-plans/${id}`,
      data
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/${id}`);
    revalidatePath("/dashboard/home/audit");

    return successResponse(response.data, "Audit plan updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE AUDIT PLAN", `/api/v1/audit-plans/${id}`);
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

    return successResponse(response.data, "Workpapers fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | WORKPAPERS", "/api/v1/working-papers");
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

    return successResponse(response.data, "Workpaper fetched successfully");
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
    revalidatePath(`/dashboard/audit/plans/${data.audit_plan_id}`);

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
    revalidatePath(`/dashboard/audit/plans/${data.audit_plan_id}`);

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
  severity?: string;
  status?: string;
}): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.working_paper_id) params.append("working_paper_id", filters.working_paper_id);
    if (filters?.severity) params.append("severity", filters.severity);
    if (filters?.status) params.append("status", filters.status);

    const queryString = params.toString();
    const url = `/api/v1/working-paper-findings${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data, "Findings fetched successfully");
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
 * Create new finding
 */
export async function createFinding(data: {
  audit_plan_id: string;
  working_paper_id: string;
  category_name: string;
  finding_number: string;
  workings_and_test_results?: string;
  conclusion?: string;
  report?: boolean;
  severity?: string;
  recommendation?: string;
  management_response?: string;
  action_plan?: string;
  responsible_person?: string;
  due_date?: string;
  status?: string;
  evidence_links?: string;
}): Promise<APIResponse> {
  if (
    !data.audit_plan_id ||
    !data.working_paper_id ||
    !data.category_name ||
    !data.finding_number
  ) {
    return handleBadRequest(
      "Audit plan ID, working paper ID, category name, and finding number are required"
    );
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/working-paper-findings",
      data
    });

    revalidatePath("/dashboard/audit/findings");
    revalidatePath(`/dashboard/audit/plans/${data.audit_plan_id}`);
    revalidatePath("/dashboard/audit/workpapers");

    return successResponse(response.data, "Finding created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE FINDING", "/api/v1/working-paper-findings");
  }
}

/**
 * Update existing finding
 */
export async function updateFinding(
  id: string,
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
  if (!id) {
    return handleBadRequest("Finding ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/working-paper-findings/${id}`,
      data
    });

    revalidatePath("/dashboard/audit/findings");
    revalidatePath("/dashboard/audit/workpapers");

    return successResponse(response.data, "Finding updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE FINDING", `/api/v1/working-paper-findings/${id}`);
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

// ============================================================================
// REPORT ACTIONS
// ============================================================================

/**
 * Get report templates
 */
export async function getReportTemplates(): Promise<APIResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const templates: ReportTemplate[] = [
      {
        id: "1",
        name: "Summary Report",
        type: "summary",
        description: "High-level audit summary",
        parameters: ["auditId", "dateRange"]
      },
      {
        id: "2",
        name: "Detailed Audit Report",
        type: "detailed",
        description: "Complete audit details",
        parameters: ["auditId"]
      },
      {
        id: "3",
        name: "Non-Conformity Report",
        type: "non-conformity",
        description: "All findings",
        parameters: ["dateRange", "severity"]
      }
    ];

    return successResponse(templates, "Report templates fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | REPORT TEMPLATES", "/api/audits/templates");
  }
}

/**
 * Generate report (mock)
 */
export async function generateReport(params: ReportParams): Promise<APIResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Longer delay for "generation"

    return successResponse(null, "Report generated successfully");
  } catch (error: any) {
    return handleError(error, "POST | GENERATE REPORT", "/api/audits/reports");
  }
}

/**
 * Get scheduled reports
 */
export async function getScheduledReports(): Promise<APIResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const reports: ScheduledReport[] = [];

    return successResponse(reports, "Scheduled reports fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | SCHEDULED REPORTS", "/api/audits/scheduled-reports");
  }
}

// ============================================================================
// SETTINGS ACTIONS
// ============================================================================

/**
 * Get audit settings
 */
export async function getAuditSettings(): Promise<APIResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const settings: AuditSettings = {
      notificationsEnabled: true,
      emailNotifications: true,
      dueDateReminderDays: 7,
      autoSaveInterval: 30,
      defaultStandard: "ISO 27001:2022",
      requireApproval: true,
      allowDraftWorkpapers: true
    };

    return successResponse(settings, "Settings fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | AUDIT SETTINGS", "/api/audits/settings");
  }
}

/**
 * Update audit settings
 */
export async function updateAuditSettings(data: SettingsInput): Promise<APIResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 400));

    revalidatePath("/dashboard/audit/settings");

    return successResponse(null, "Settings updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE AUDIT SETTINGS", "/api/audits/settings");
  }
}

/**
 * Get team members
 */
export async function getTeamMembers(): Promise<APIResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const members: TeamMember[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@company.com",
        role: "Lead Auditor",
        department: "Compliance",
        isActive: true
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@company.com",
        role: "Auditor",
        department: "IT Security",
        isActive: true
      },
      {
        id: "3",
        name: "Mike Johnson",
        email: "mike.johnson@company.com",
        role: "Auditor",
        department: "Risk Management",
        isActive: true
      }
    ];

    return successResponse(members, "Team members fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | TEAM MEMBERS", "/api/audits/settings/team");
  }
}

/**
 * Add team member
 */
export async function addTeamMember(data: TeamMemberInput): Promise<APIResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newMember: TeamMember = {
      id: String(Date.now()),
      ...data,
      isActive: true
    };

    revalidatePath("/dashboard/audit/settings");

    return successResponse(newMember, "Team member added successfully");
  } catch (error: any) {
    return handleError(error, "POST | ADD TEAM MEMBER", "/api/audits/settings/team");
  }
}

/**
 * Remove team member
 */
export async function removeTeamMember(id: string): Promise<APIResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    revalidatePath("/dashboard/audit/settings");

    return successResponse(null, "Team member removed successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | REMOVE TEAM MEMBER", `/api/audits/settings/team/${id}`);
  }
}

// ============================================================================
// WORKING PAPER TEMPLATE ACTIONS (API Integration)
// ============================================================================

/**
 * Get all working paper templates
 */
export async function getWorkingPaperTemplates(
  standard?: string,
  isActive?: boolean
): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (standard) params.append("standard", standard);
    if (isActive !== undefined) params.append("is_active", String(isActive));

    const queryString = params.toString();
    const url = `/api/v1/working-paper-templates${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data, "Working paper templates fetched successfully");
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
 * Get working paper template with categories
 */
export async function getWorkingPaperTemplateWithCategories(
  templateId: string
): Promise<APIResponse> {
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

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/working-paper-templates/${templateId}/categories-list`
    });

    return successResponse(response.data, "Template categories fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | TEMPLATE CATEGORIES",
      `/api/v1/working-paper-templates/${templateId}/categories-list`
    );
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
      url: `/api/v1/working-paper-categories/${categoryId}`
    });

    return successResponse(response.data, "Template category fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | TEMPLATE CATEGORY",
      `/api/v1/working-paper-categories/${categoryId}`
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

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/working-paper-categories",
      data
    });

    revalidatePath("/dashboard/audit/templates");
    revalidatePath(`/dashboard/audit/templates/${data.template_id}`);

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
  data: {
    name?: string;
    objectives?: string;
    scope?: string;
    documents_obtained?: string;
    source_documents?: string;
    sample_size?: string;
    frequency_of_control?: string;
    sampling_methodology?: string;
    audit_procedure?: string;
    sort_order?: number;
  }
): Promise<APIResponse> {
  if (!categoryId) {
    return handleBadRequest("Category ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/working-paper-categories/${categoryId}`,
      data
    });

    revalidatePath("/dashboard/audit/templates");

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

  try {
    await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/working-paper-categories/${categoryId}`
    });

    revalidatePath("/dashboard/audit/templates");

    return successResponse(null, "Template category deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | TEMPLATE CATEGORY",
      `/api/v1/working-paper-categories/${categoryId}`
    );
  }
}

/**
 * Create new clause template
 */
export async function createClauseTemplate(data: {
  clause: string;
  clauseTitle: string;
  category: string;
  objective: string;
  testProcedure: string;
}) {
  if (!data.clause || !data.clauseTitle || !data.objective || !data.testProcedure) {
    return handleBadRequest("Clause, title, objective, and test procedure are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/clause-templates",
      data
    });

    revalidatePath("/dashboard/audit/templates");
    return successResponse(response.data, "Clause template created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE CLAUSE TEMPLATE", "/api/v1/clause-templates");
  }
}

/**
 * Update clause template
 */
export async function updateClauseTemplate(
  templateId: string,
  data: Partial<{
    clause: string;
    clauseTitle: string;
    category: string;
    objective: string;
    testProcedure: string;
  }>
) {
  if (!templateId) {
    return handleBadRequest("Template ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/clause-templates/${templateId}`,
      data
    });

    revalidatePath("/dashboard/audit/templates");
    return successResponse(response.data, "Clause template updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE CLAUSE TEMPLATE", `/api/v1/clause-templates/${templateId}`);
  }
}

/**
 * Delete clause template
 */
export async function deleteClauseTemplate(templateId: string) {
  // This function seems to be missing from the original file.
  // Adding a placeholder implementation.
  return successResponse(null, "Clause template deleted successfully (mock).");
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

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/audit-plans/${auditPlanId}/submit`
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/${auditPlanId}`);

    return successResponse(response.data, "Audit plan submitted for approval successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | SUBMIT AUDIT PLAN",
      `/api/v1/audit-plans/${auditPlanId}/submit`
    );
  }
}

/**
 * HIAR approval for audit plan
 */
export async function hiarApproveAuditPlan(
  auditPlanId: string,
  comments?: string
): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/audit-plans/${auditPlanId}/approve/hiar`,
      data: { comments }
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/${auditPlanId}`);

    return successResponse(response.data, "Audit plan approved by HIAR successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | HIAR APPROVE AUDIT PLAN",
      `/api/v1/audit-plans/${auditPlanId}/approve/hiar`
    );
  }
}

/**
 * CEO approval for audit plan
 */
export async function ceoApproveAuditPlan(
  auditPlanId: string,
  comments?: string
): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/audit-plans/${auditPlanId}/approve/ceo`,
      data: { comments }
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/${auditPlanId}`);

    return successResponse(response.data, "Audit plan approved by CEO successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CEO APPROVE AUDIT PLAN",
      `/api/v1/audit-plans/${auditPlanId}/approve/ceo`
    );
  }
}

/**
 * Audit Chair approval for audit plan
 */
export async function auditChairApproveAuditPlan(
  auditPlanId: string,
  comments?: string
): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/audit-plans/${auditPlanId}/approve/audit-chair`,
      data: { comments }
    });

    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/${auditPlanId}`);

    return successResponse(response.data, "Audit plan approved by Audit Chair successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | AUDIT CHAIR APPROVE",
      `/api/v1/audit-plans/${auditPlanId}/approve/audit-chair`
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
    revalidatePath(`/dashboard/audit/plans/${auditPlanId}`);

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
    revalidatePath(`/dashboard/audit/plans/${auditPlanId}`);

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
    revalidatePath(`/dashboard/audit/plans/${auditPlanId}`);

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
