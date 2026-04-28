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

    // Handle both array and paginated response shapes
    const reportsData = response?.data?.data;
    const reportsList: ReportRecord[] = Array.isArray(reportsData)
      ? reportsData
      : Array.isArray(reportsData?.data)
        ? reportsData.data
        : [];

    if (reportsList.length > 0) {
      const fullReport = reportsList[0];
      return successResponse(fullReport, ` Report fetched for entity ${entityId}`);
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
      data: {
        ...data,
        is_active: data.is_active ?? true
      }
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
    return successResponse([]);
  }
}

interface FetchWidgetDataParams {
  dataSourceId: string;
  widgetType: "pie_chart" | "table" | "bar_chart" | "line_chart" | "risk_objective_mapping";
  entityId?: string;
  entityType?: ReportEntityType;
  riskRegisterId?: string;
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
    return handleError(error, "GET | FETCH WIDGET DATA", `/api/v1/data-sources/${dataSourceId}`);
  }
}

/**
 * Fetch all available data sources
 * Returns a unified list of all data sources with sample data for each widget type
 */
export async function getAllDataSources(): Promise<APIResponse> {
  console.log("🔍 [getAllDataSources] Fetching all data sources from API...");

  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/data-sources",
      method: "GET"
    });

    // Handle various response structures from the API
    const apiData = response?.data?.data || response?.data;

    console.log("🔍 [getAllDataSources] Raw API response:", {
      hasData: !!response?.data,
      dataType: typeof apiData,
      isArray: Array.isArray(apiData),
      length: Array.isArray(apiData) ? apiData.length : "N/A"
    });

    // Validate that we got an array
    if (!Array.isArray(apiData)) {
      console.warn("⚠️ [getAllDataSources] API returned invalid data format, using mock data");
      return successResponse([]);
    }

    // If API returns empty array, use mock data as fallback
    if (apiData.length === 0) {
      console.warn("⚠️ [getAllDataSources] API returned no data sources, using mock data");
      return successResponse([]);
    }

    console.log(
      `✅ [getAllDataSources] Successfully loaded ${apiData.length} data sources from API`
    );
    console.table(
      apiData.map((ds: any) => ({
        id: ds.id,
        name: ds.name,
        category: ds.category,
        compatible_widgets: ds.compatible_widgets?.join(", "),
        requires_entity: ds.requires_entity
      }))
    );

    return successResponse(apiData);
  } catch (error: any) {
    // Fallback to mock data sources if API not available
    console.error("❌ [getAllDataSources] API error:", error?.message || error);
    console.warn("⚠️ [getAllDataSources] Using mock data sources as fallback");
    return successResponse([]);
  }
}

/**
 * Get a specific data source by ID
 * @param dataSourceId - The ID of the data source (e.g., "risks_by_appetitie_status")
 * @returns The data source object with sample_data for all compatible widgets
 */
export async function getDataSourceById(dataSourceId: string): Promise<APIResponse> {
  if (!dataSourceId) {
    return handleBadRequest("Data source ID is required");
  }

  try {
    // Fetch all data sources
    const allSourcesRes = await getAllDataSources();

    console.log("DEBUG [getDataSourceById]:", {
      dataSourceId,
      success: allSourcesRes.success,
      dataType: typeof allSourcesRes.data,
      isArray: Array.isArray(allSourcesRes.data),
      dataLength: Array.isArray(allSourcesRes.data) ? allSourcesRes.data.length : "N/A",
      firstItem: Array.isArray(allSourcesRes.data) ? allSourcesRes.data[0] : "N/A"
    });

    if (!allSourcesRes.success || !Array.isArray(allSourcesRes.data)) {
      console.error("DEBUG [getDataSourceById] Failed:", {
        success: allSourcesRes.success,
        isArray: Array.isArray(allSourcesRes.data),
        data: allSourcesRes.data
      });
      return handleError(
        new Error("Failed to fetch data sources"),
        "GET | GET DATA SOURCE BY ID",
        `/api/v1/data-sources?id=${dataSourceId}`
      );
    }

    // Find the specific data source
    const dataSource = allSourcesRes.data.find((ds: any) => ds.id === dataSourceId);

    if (!dataSource) {
      // Log all available IDs for debugging
      const availableIds = allSourcesRes.data.map((ds: any) => ds.id);
      console.warn(
        `DEBUG [getDataSourceById] Not found. Looking for: "${dataSourceId}". Available IDs:`,
        availableIds
      );
      return handleBadRequest(`Data source with ID "${dataSourceId}" not found`);
    }

    console.log("DEBUG [getDataSourceById] Found data source:", dataSourceId);
    return successResponse(dataSource);
  } catch (error: any) {
    console.error("DEBUG [getDataSourceById] Exception:", error);
    return handleError(error, "GET | GET DATA SOURCE BY ID", `/data-sources?id=${dataSourceId}`);
  }
}

/**
 * Get actual data for a specific data source and widget type from the backend
 * @param dataSourceId - The ID of the data source (e.g., "risks_by_appetitie_status")
 * @param widgetType - The widget type (pie_chart, bar_chart, table, etc.)
 * @param entityId - Optional entity ID for filtering data
 * @param entityType - Type of entity (determines query param name)
 * @returns The actual data for the specified widget type
 */
export async function getDataSourceData(
  dataSourceId: string,
  widgetType:
    | "pie_chart"
    | "bar_chart"
    | "table"
    | "metric_card"
    | "line_chart"
    | "area_chart"
    | "risk_objective_mapping",
  entityId?: string,
  entityType?: ReportEntityType
): Promise<APIResponse> {
  console.log("🔍 [getDataSourceData] Fetching data:", {
    dataSourceId,
    widgetType,
    entityId,
    entityType
  });

  try {
    // Fetch actual data from the backend endpoint
    // Format: GET /data-sources/{dataSourceId}?widget_type={widgetType}&{entity_param}={id}

    const params = new URLSearchParams({
      widget_type: widgetType
    });

    if (entityId && entityType) {
      // Determine the query parameter name based on entity type
      const entityParamName =
        entityType === "audit_plan"
          ? "audit_plan_id"
          : entityType === "risk_register"
            ? "risk_register_id"
            : entityType === "control_register"
              ? "control_register_id"
              : "entity_id"; // Generic fallback

      params.append(entityParamName, entityId);
      console.log(`🔍 [getDataSourceData] Using entity param: ${entityParamName}=${entityId}`);
    }

    const url = `/api/v1/data-sources/${dataSourceId}?${params.toString()}`;
    console.log("🔍 [getDataSourceData] API URL:", url);

    const response = await authenticatedApiClient({
      url,
      method: "GET"
    });

    if (response?.data) {
      // Extract the actual widget data from nested response structure
      const widgetData = response.data?.data || response.data;

      console.log(
        `✅ [getDataSourceData] Successfully fetched REAL data for ${dataSourceId} (${widgetType})`
      );
      console.log("🔍 [getDataSourceData] Data structure:", {
        dataType: typeof widgetData,
        isArray: Array.isArray(widgetData),
        keys: typeof widgetData === "object" && widgetData !== null ? Object.keys(widgetData) : [],
        sampleData: Array.isArray(widgetData)
          ? `Array with ${widgetData.length} items`
          : typeof widgetData === "object"
            ? JSON.stringify(widgetData, null, 2).substring(0, 200) + "..."
            : widgetData
      });

      // Special logging for pie chart data to inspect colors
      if (widgetType === "pie_chart") {
        const slices = Array.isArray(widgetData) ? widgetData : widgetData?.slices || [];
        console.log(
          "🎨 [getDataSourceData] Pie chart slices with colors:",
          JSON.stringify(slices, null, 2)
        );
      }

      return successResponse(widgetData);
    }

    console.error("❌ [getDataSourceData] No data received from endpoint");
    return handleBadRequest("No data received from data source endpoint");
  } catch (error: any) {
    // Fallback to mock sample data if API fails
    console.error("❌ [getDataSourceData] API error:", error?.message || error);
    console.warn(
      `⚠️ [getDataSourceData] API failed for ${dataSourceId}, attempting to use mock sample data`
    );

    console.error(`❌ [getDataSourceData] No fallback data available for ${dataSourceId}`);
    return handleError(
      error,
      "GET | DATA SOURCE DATA",
      `/api/v1/data-sources/${dataSourceId}?widget_type=${widgetType}`
    );
  }
}

/**
 * Get data source sample data for a specific widget type
 * @param dataSourceId - The ID of the data source
 * @param widgetType - The widget type (pie_chart, bar_chart, table, etc.)
 * @returns The sample data for the specified widget type
 */
export async function getDataSourceSampleData(
  dataSourceId: string,
  widgetType:
    | "pie_chart"
    | "bar_chart"
    | "table"
    | "metric_card"
    | "line_chart"
    | "area_chart"
    | "risk_objective_mapping"
): Promise<APIResponse> {
  const dataSourceRes = await getDataSourceById(dataSourceId);

  if (!dataSourceRes.success || !dataSourceRes.data) {
    return dataSourceRes;
  }

  const dataSource = dataSourceRes.data;

  // Check if the widget type is compatible
  if (!dataSource.compatible_widgets?.includes(widgetType)) {
    return handleBadRequest(
      `Widget type "${widgetType}" is not compatible with data source "${dataSourceId}". Compatible types: ${dataSource.compatible_widgets?.join(", ")}`
    );
  }

  // Get the sample data for the widget type
  const sampleData = dataSource.sample_data?.[widgetType];

  if (!sampleData) {
    return handleBadRequest(
      `No sample data available for widget type "${widgetType}" in data source "${dataSourceId}"`
    );
  }

  return successResponse(sampleData);
}

/**
 * Get risk-specific data sources
 * Filters all data sources to return only risk-related ones
 */
export async function getRiskDataSources(): Promise<APIResponse> {
  const allSourcesRes = await getAllDataSources();

  if (!allSourcesRes.success || !Array.isArray(allSourcesRes.data)) {
    return allSourcesRes;
  }

  const riskSources = allSourcesRes.data.filter((ds: any) => ds.category === "risk");

  return successResponse(riskSources);
}

/**
 * Get audit-specific data sources
 * Filters all data sources to return only audit-related ones
 */
export async function getAuditDataSources(): Promise<APIResponse> {
  const allSourcesRes = await getAllDataSources();

  if (!allSourcesRes.success || !Array.isArray(allSourcesRes.data)) {
    return allSourcesRes;
  }

  const auditSources = allSourcesRes.data.filter((ds: any) => ds.category === "audit");

  return successResponse(auditSources);
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
      // Use correct endpoint - working paper contains findings
      const response = await authenticatedApiClient({
        url: `/api/v1/audit-plans/${auditPlanId}/working-paper`,
        method: "GET"
      });

      // Extract findings from workpaper response
      const workpaper = response?.data?.data || response?.data;
      const rawFindings = workpaper?.findings || [];

      console.log(
        `📋 [fetchFindingsForReport] Found ${rawFindings.length} findings for audit plan ${auditPlanId}`
      );

      // Helper function to normalize conformity status
      const normalizeConformityStatus = (
        status: string | null | undefined
      ): "CONFORMITY" | "NON_CONFORMITY" | "PARTIAL_CONFORMITY" | null => {
        if (!status) return null;

        const normalized = status.toUpperCase().trim();

        // Map various formats to standard values
        if (normalized === "CONFORMITY" || normalized === "COMPLIANT" || normalized === "CONFORM") {
          return "CONFORMITY";
        }
        if (
          normalized === "NON_CONFORMITY" ||
          normalized === "NON-CONFORMITY" ||
          normalized === "NON_COMPLIANT" ||
          normalized === "NON-COMPLIANT" ||
          normalized === "NONCONFORMITY"
        ) {
          return "NON_CONFORMITY";
        }
        if (
          normalized === "PARTIAL_CONFORMITY" ||
          normalized === "PARTIAL-CONFORMITY" ||
          normalized === "PARTIALLY_COMPLIANT" ||
          normalized === "PARTIALLY-COMPLIANT"
        ) {
          return "PARTIAL_CONFORMITY";
        }

        return null;
      };

      // Transform findings to match FindingSummary format
      const findings = rawFindings.map((f: any) => {
        const rawConformityStatus = f.conformity_status || f.compliance_status;
        const normalizedConformityStatus = normalizeConformityStatus(rawConformityStatus);

        return {
          id: f.id,
          reference_code: f.finding_number || f.reference_code || `F-${f.id}`,
          title: f.title || f.category_name || "Untitled Finding",
          severity: f.severity?.toLowerCase() || "medium",
          status: f.status || "OPEN",
          category_name: f.category_name || f.category?.name,
          is_selected: false,
          // Compliance-specific fields
          clause_number: f.clause_number,
          clause: f.clause_number || f.clause,
          clause_description: f.clause_description,
          observation: f.conclusion || f.workings_and_test_results || f.observation,
          recommendation: f.recommendation,
          management_response: f.management_response,
          conformity_status: normalizedConformityStatus,
          compliance_status: f.compliance_status,
          compliance_percentage: f.compliance_percentage,
          // Additional metadata
          action_plan: f.action_plan,
          responsible_person: f.responsible_person,
          due_date: f.due_date,
          evidence_links: f.evidence_links,
          evidence_summary: f.evidence_summary,
          framework: f.framework,
          category: f.category
        };
      });

      return successResponse(findings);
    }

    // Return mock findings if no audit plan ID
    console.warn("⚠️ [fetchFindingsForReport] No audit plan ID provided, using mock data");
    return successResponse([]);
  } catch (error: any) {
    console.error("❌ [fetchFindingsForReport] API error:", error?.message || error);
    console.warn("⚠️ [fetchFindingsForReport] Using mock data as fallback");
    return successResponse([]);
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
  report: ReportRecord,
  entityId?: string,
  entityType?: ReportEntityType
): Promise<APIResponse> {
  if (report.id.trim()) {
    // Update existing
    return updateReport(report.id, report);
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
