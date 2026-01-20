"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse } from "@/lib/types";
import type {
  ReportContent,
  ReportType,
  ReportStatus,
  ReportEntityType,
  ReportRecord
} from "@/lib/types/report-types";
import authenticatedApiClient, {
  handleError,
  successResponse,
  handleBadRequest
} from "./api-config";
import {
  normalizeManagementStandard,
  getTemplateForStandard
} from "@/components/reports/report-templates";
import { AVAILABLE_DATA_SOURCES, MOCK_FINDINGS } from "@/components/reports/report-mock-constants";
import type { DataSource } from "@/lib/types/report-types";

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

interface DashboardData {
  overview: {
    total_risks: number;
    total_audit_plans: number;
    total_kris: number;
    total_users: number;
    total_departments: number;
    total_branches: number;
    total_incidents: number;
  };
  risk_summary: {
    total_risks: number;
    risks_by_rating: {
      High: number;
      Low: number;
      Normal: number;
    };
    risks_by_status: {
      DRAFT: number;
      OPEN: number;
    };
    risks_by_department: Array<{
      department_id: string;
      department_name: string;
      risk_count: number;
      open_risk_count: number;
    }>;
  };
  audit_summary: {
    total_audit_plans: number;
    audit_plans_by_status: Record<string, number>;
    active_audit_plans: number;
    completed_audit_plans: number;
    total_findings: number;
    findings_by_severity: Record<string, number>;
    open_findings: number;
    overdue_action_plans: number;
    recent_audit_plans: Array<{
      title: string;
      status: string;
      start_date: string;
      progress_percentage: number;
      created_at: string;
    }>;
  };
  kri_summary: {
    total_kris: number;
    kris_by_status: Record<string, number>;
    kris_in_breach: number;
    kris_due_measurement: number;
    total_kri_registers: number;
    recent_kris: Array<{
      id: string;
      name: string;
      last_status: string;
      updated_at: string;
    }>;
  };
  system_health: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    locked_users: number;
    recent_logins: any[];
  };
  audit_findings: Array<{
    finding_number: string;
    status: string;
    due_date: string;
    conclusion: string;
    severity: string;
  }>;
}

// GET DASHBOARD STATISTICS
export async function getDashboardStats(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/dashboard/summary",
      method: "GET"
    });
    return successResponse(response?.data);
  } catch (error: any) {
    return handleError(error, "GET | GET DASHBOARD STATS", "/api/v1/dashboard/summary");
  }
}

// ============================================================================
// REPORTS CRUD OPERATIONS
// ============================================================================

interface GetReportsParams {
  page?: number;
  page_size?: number;
  status?: ReportStatus;
  report_type?: ReportType;
  entity_id?: string;
  entity_type?: ReportEntityType;
}

/**
 * Get all reports with pagination and optional filtering
 */
export async function getReports(params: GetReportsParams = {}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", String(params.page));
    if (params.page_size) queryParams.append("page_size", String(params.page_size));
    if (params.status) queryParams.append("status", params.status);
    if (params.report_type) queryParams.append("report_type", params.report_type);
    if (params.entity_id) queryParams.append("entity_id", params.entity_id);
    if (params.entity_type) queryParams.append("entity_type", params.entity_type);

    const url = `/api/v1/reports${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await authenticatedApiClient({
      url,
      method: "GET"
    });
    return successResponse(response?.data?.data, "Reports fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | GET REPORTS", "/api/v1/reports");
  }
}

/**
 * Get a single report by ID
 * @returns APIResponse with data: Report
 */
export async function getReport(reportId: string): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "GET"
    });

    return successResponse(response?.data);
  } catch (error: any) {
    return handleError(error, "GET | GET REPORT", `/api/v1/reports/${reportId}`);
  }
}

/**
 * Get report by entity ID and type (for the Report tab)
 */
export async function getReportByEntityId(
  entityId: string,
  entityType: ReportEntityType
): Promise<APIResponse> {
  if (!entityId) {
    return handleBadRequest("Entity ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/reports?entity_id=${entityId}&entity_type=${entityType}&page_size=1`,
      method: "GET"
    });

    // Return the first report if exists
    const reports = response?.data?.data || [];
    // const fullReport = reports?.data[0];

    // if (reports.data.length > 0) {
    //   // Fetch full report content
    //   // const fullReport = await getReport(reports?.data[0].id);

    //   console.log("getReportByEntityId:", fullReport);
    //   return fullReport;
    // }

    if (reports.data.length > 0) {
      const fullReport = reports?.data[0];
      return successResponse(fullReport as ReportRecord, ` Report fetched for entity ${entityId}`);
    }

    return successResponse(null, ` No report found for entity ${entityId}`);
  } catch (error: any) {
    return handleError(
      error,
      "GET | GET REPORT BY ENTITY",
      `/api/v1/reports?entity_id=${entityId}&entity_type=${entityType}`
    );
  }
}

/**
 * Report payload for creating/updating reports
 */
interface CreateReport {
  title: string;
  report_type: ReportType;
  report_content: Partial<ReportContent>;
  entity_id: string;
  entity_type: ReportEntityType;
  description?: string;
  pdf_url?: string;
}

/**
 * Create a new report
 */
export async function createReport(params: CreateReport): Promise<APIResponse> {
  if (!params.title || !params.report_type || !params.entity_id) {
    return handleBadRequest("Title, Entity and Report type are required fields");
  }

  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/reports",
      method: "POST",
      data: params
    });

    console.log("Create Report Response:", response.data);
    return successResponse(response?.data?.data, "Report created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE REPORT", "/api/v1/reports");
  }
}

/**
 * Update an existing report
 */
export async function updateReport(
  reportId: string,
  data: Partial<ReportContent>
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data
    });

    // Revalidate all report-related pages
    revalidatePath("/dashboard/reports");
    revalidatePath(`/dashboard/reports/${reportId}`);
    revalidatePath("/dashboard/audit/plans", "layout");

    return successResponse(response?.data, "Report updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE REPORT", `/api/v1/reports/${reportId}`);
  }
}

/**
 * Delete a report (only DRAFT reports)
 */
export async function deleteReport(reportId: string): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "DELETE"
    });
    return successResponse(response?.data, "Report deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | DELETE REPORT", `/api/v1/reports/${reportId}`);
  }
}

/**
 * Publish a report (change status from DRAFT to PUBLISHED)
 */
export async function publishReport(
  reportId: string,
  generatePdf: boolean = true
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}/publish`,
      method: "POST",
      data: { generate_pdf: generatePdf }
    });

    // Revalidate all report-related pages
    revalidatePath("/dashboard/reports");
    revalidatePath(`/dashboard/reports/${reportId}`);
    revalidatePath("/dashboard/audit/plans", "layout");

    return successResponse(response?.data, "Report published successfully");
  } catch (error: any) {
    return handleError(error, "POST | PUBLISH REPORT", `/api/v1/reports/${reportId}/publish`);
  }
}

/**
 * Duplicate a report
 */
export async function duplicateReport(reportId: string): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}/duplicate`,
      method: "POST"
    });
    return successResponse(response?.data, "Report duplicated successfully");
  } catch (error: any) {
    return handleError(error, "POST | DUPLICATE REPORT", `/api/v1/reports/${reportId}/duplicate`);
  }
}

// ============================================================================
// DATA SOURCES
// ============================================================================

/**
 * Get all available data sources
 */
export async function getDataSources(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/data-sources",
      method: "GET"
    });
    return successResponse(response?.data);
  } catch (error: any) {
    // Fallback to local data sources if API not available
    console.warn("Data sources API not available, using local data sources");
    return successResponse(AVAILABLE_DATA_SOURCES);
  }
}

interface FetchWidgetDataParams {
  dataSourceId: string;
  widgetType: "pie_chart" | "table" | "bar_chart" | "line_chart";
  entityId?: string;
  entityType?: ReportEntityType;
}

/**
 * Fetch widget data from a data source
 */
export async function fetchWidgetData(params: FetchWidgetDataParams): Promise<APIResponse> {
  const { dataSourceId, widgetType, entityId, entityType } = params;

  if (!dataSourceId) {
    return handleBadRequest("Data source ID is required");
  }

  try {
    const queryParams = new URLSearchParams({ widget_type: widgetType });
    if (entityId && entityType) {
      queryParams.append("entity_id", entityId);
      queryParams.append("entity_type", entityType);
    }

    const response = await authenticatedApiClient({
      url: `/api/v1/data-sources/${dataSourceId}?${queryParams.toString()}`,
      method: "GET"
    });
    return successResponse(response?.data);
  } catch (error: any) {
    // Fallback to mock data if API not available
    console.warn("Widget data API not available, using mock data");
    const dataSource = AVAILABLE_DATA_SOURCES.find((ds) => ds.id === dataSourceId);
    if (dataSource?.sample_data) {
      const sampleData = dataSource.sample_data[widgetType] || dataSource.sample_data;
      return successResponse(sampleData);
    }
    return handleError(error, "GET | FETCH WIDGET DATA", `/api/v1/data-sources/${dataSourceId}`);
  }
}

// ============================================================================
// FINDINGS (for report integration)
// ============================================================================

/**
 * Fetch findings for an audit plan (for report widget data)
 */
export async function fetchFindingsForReport(auditPlanId?: string): Promise<APIResponse> {
  try {
    if (auditPlanId) {
      const response = await authenticatedApiClient({
        url: `/api/v1/audit-plans/${auditPlanId}/findings`,
        method: "GET"
      });

      // Transform findings to match FindingSummary format
      const findings = (response?.data?.data || response?.data || []).map((f: any) => ({
        id: f.id,
        reference_code: f.finding_number || f.reference_code,
        title: f.title || f.category_name || "Untitled Finding",
        severity: f.severity?.toLowerCase() || "medium",
        status: f.status || "OPEN",
        category_name: f.category_name || f.category?.name,
        is_selected: false,
        clause_number: f.clause_number,
        clause: f.clause,
        observation: f.conclusion || f.observation,
        recommendation: f.recommendation,
        management_response: f.management_response,
        conformity_status: f.conformity_status,
        compliance_status: f.compliance_status,
        category: f.category
      }));

      return successResponse(findings);
    }

    // Return mock findings if no audit plan ID
    return successResponse(MOCK_FINDINGS);
  } catch (error: any) {
    console.warn("Findings API not available, using mock data");
    return successResponse(MOCK_FINDINGS);
  }
}

// ============================================================================
// REPORT INITIALIZATION HELPERS
// ============================================================================

/**
 * Initialize a new report with default template based on management standard
 */
export async function initializeReport(
  managementStandard: string = "GENERAL",
  entityId: string,
  entityType: ReportEntityType,
  title?: string
): Promise<APIResponse> {
  // Normalize the management standard to match template keys
  const normalizedStandard = normalizeManagementStandard(managementStandard);
  const template = getTemplateForStandard(managementStandard);

  const now = new Date().toISOString();

  const report: ReportContent = {
    report_id: `rep-${Date.now()}`,
    report_type: template.type,
    title: title || `${template.name} Report`,
    version: "1.0",
    status: "DRAFT",
    management_standard: normalizedStandard,
    created_at: now.split("T")[0],
    updated_at: now.split("T")[0],
    branding: {
      primary_color: "#1a365d",
      secondary_color: "#2563eb",
      font_family: "Inter"
    },
    sections: template.default_sections
  };

  // Return report content along with entity references (stored separately in DB)
  return successResponse({ ...report, _entity_id: entityId, _entity_type: entityType });
}

/**
 * Fetch initial report - either existing or create new
 */
export async function fetchInitialReport(
  entityId: string,
  entityType: ReportEntityType
): Promise<APIResponse> {
  // If entity ID provided, try to fetch existing report
  if (entityId) {
    const existingReport = await getReportByEntityId(entityId, entityType);
    if (existingReport.success && existingReport.data) {
      return existingReport;
    }
  }

  // Return a new initialized report
  return initializeReport("GENERAL", entityId, entityType);
}

/**
 * Save report (create or update)
 * Note: entity_id and entity_type must be passed separately as they're not part of ReportContent
 */
export async function saveReport(
  report: ReportContent,
  entityId?: string,
  entityType?: ReportEntityType
): Promise<APIResponse> {
  if (!report.report_id) {
    return handleBadRequest("Report ID is required");
  }

  // Check if this is an existing report or new
  const existingReport = await getReport(report.report_id);

  if (existingReport.success && existingReport.data) {
    // Update existing
    return updateReport(report.report_id, report);
  } else {
    // Create new - requires entity_id and entity_type
    if (!entityId || !entityType) {
      return handleBadRequest("Entity ID and type are required for new reports");
    }
    return createReport({
      title: report.title,
      report_type: report.report_type,
      report_content: report,
      entity_id: entityId,
      entity_type: entityType
    });
  }
}
