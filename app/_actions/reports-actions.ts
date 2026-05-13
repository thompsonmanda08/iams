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
import {
  buildSnapshotFromCurrent,
  computeAggregateStatus,
  findVersionIndex,
  syncTopLevelToVersion,
  bootstrapV1FromTopLevel
} from "@/lib/config/version-helpers";
import { ensureVersionedShape } from "@/lib/config/ensure-versioned-shape";
import { verifySession } from "@/lib/session";
import { fetchSystemSetup } from "@/app/_actions/auth-actions";
import { buildPermissionMap } from "@/lib/permissions/build-permission-map";
import { MODULE_CODES, type ModuleCode } from "@/lib/constants/module-codes";
import type { PermissionAction } from "@/lib/types";
import type { ReportUserRef } from "@/lib/types/report-types";
import type { DataSource } from "@/lib/types/report-types";

/**
 * Server-side action-permission guard. Returns a denial APIResponse when the
 * caller lacks the requested permission, or null when allowed. Fails OPEN on
 * permission-fetch failures to avoid false denials during transient outages —
 * mirrors the posture of requireModuleView in lib/permissions/server.ts.
 *
 * BACKOFFICE_ADMIN bypasses the check.
 */
async function assertActionPermission(
  moduleCode: ModuleCode,
  action: PermissionAction
): Promise<APIResponse | null> {
  const { isAuthenticated, user_type } = await verifySession();
  if (!isAuthenticated) return handleBadRequest("Session required");
  if (user_type === "BACKOFFICE_ADMIN") return null;

  const setup = await fetchSystemSetup();
  if (!setup?.success) return null; // fail open on fetch failure

  const perms = (setup?.data as any)?.permissions as any[] | undefined;
  if (!Array.isArray(perms) || perms.length === 0) return null;

  const map = buildPermissionMap(perms);
  if (map.get(moduleCode)?.[action] !== true) {
    return handleBadRequest(`You do not have permission to ${action} this resource`);
  }
  return null;
}

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

// Internal helper: build a ReportUserRef from the current session object.
// Always returns a non-null ref — falls back to a sentinel when session details
// are sparse so saves/snapshots/publishes never get blocked solely on missing
// user metadata. The edit_log entry still records something traceable.
function buildUserRef(session: any): ReportUserRef {
  const user = session?.user;
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  return {
    user_id: user?.id ?? session?.user_id ?? session?.userId ?? "",
    name:
      fullName ||
      user?.username ||
      user?.email ||
      session?.username ||
      session?.email ||
      "Unknown User",
    email: user?.email ?? session?.email ?? ""
  };
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

    // Lazy-migrate report_content on each list item so consumers always see versioned shape
    const payload = response?.data?.data;
    if (payload && Array.isArray(payload?.data)) {
      payload.data = payload.data.map((rec: any) =>
        rec?.report_content
          ? { ...rec, report_content: ensureVersionedShape(rec.report_content) }
          : rec
      );
    } else if (Array.isArray(payload)) {
      for (let i = 0; i < payload.length; i++) {
        const rec = payload[i];
        if (rec?.report_content) {
          payload[i] = { ...rec, report_content: ensureVersionedShape(rec.report_content) };
        }
      }
    }

    return successResponse(payload, "Reports fetched successfully");
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

    // Lazy-migrate report_content shape so consumers always see { versions, current_version_number }
    if (response?.data?.data?.report_content) {
      response.data.data.report_content = ensureVersionedShape(response.data.data.report_content);
    }

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
      const fullReport = reportsList[0] as any;
      // Lazy-migrate report_content shape on the entity-based fetch path too
      if (fullReport?.report_content) {
        fullReport.report_content = ensureVersionedShape(fullReport.report_content);
      }
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
    const { isAuthenticated, session } = await verifySession();
    if (!isAuthenticated) {
      return handleBadRequest("Session required to save");
    }
    const userRef = buildUserRef(session);

    // Callers may pass either the raw ReportContent or the wrapper record
    // { id, title, report_type, entity_id, entity_type, report_content, ... }.
    // Detect the wrapper shape and operate on the nested content; otherwise treat
    // `data` itself as the content.
    const wrapper = data as any;
    const hasWrapper =
      wrapper &&
      typeof wrapper === "object" &&
      wrapper.report_content &&
      typeof wrapper.report_content === "object";
    const incomingContent: ReportContent = hasWrapper
      ? (wrapper.report_content as ReportContent)
      : (data as ReportContent);

    const topLevel = ensureVersionedShape(incomingContent);
    let synced: ReportContent;

    if ((topLevel.versions ?? []).length === 0) {
      synced = bootstrapV1FromTopLevel(topLevel, userRef);
    } else {
      const activeNum = topLevel.current_version_number;
      if (
        typeof activeNum !== "number" ||
        findVersionIndex(topLevel.versions ?? [], activeNum) === -1
      ) {
        // Fallback: pick highest existing version_number
        const highest = (topLevel.versions ?? []).reduce(
          (max, v) => (v.version_number > max ? v.version_number : max),
          0
        );
        synced = syncTopLevelToVersion(
          { ...topLevel, current_version_number: highest },
          highest,
          userRef
        );
      } else {
        synced = syncTopLevelToVersion(topLevel, activeNum, userRef);
      }
    }

    const aggregateStatus = computeAggregateStatus(synced.versions ?? []);

    const putBody = hasWrapper
      ? {
          ...wrapper,
          report_content: synced,
          status: aggregateStatus,
          is_active: wrapper.is_active ?? true
        }
      : {
          ...synced,
          status: aggregateStatus,
          is_active: (data as any).is_active ?? true
        };

    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data: putBody
    });

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

  const deny = await assertActionPermission(MODULE_CODES.AUDIT_REPORTS, "can_edit");
  if (deny) return deny;

  try {
    const reportRes = await getReport(reportId);
    if (!reportRes.success || !reportRes.data?.data?.report_content) {
      return handleBadRequest("Report not found");
    }

    const content = ensureVersionedShape(reportRes.data.data.report_content);
    const versions = content.versions ?? [];
    const active = content.current_version_number;

    if (versions.length === 0 || typeof active !== "number") {
      return handleBadRequest("Save the report first to create a version before publishing");
    }

    if (findVersionIndex(versions, active) === -1) {
      return handleBadRequest(`Active version ${active} not found`);
    }

    return publishReportVersion(reportId, active, generatePdf);
  } catch (error: any) {
    return handleError(error, "POST | PUBLISH REPORT", `/api/v1/reports/${reportId}/publish`);
  }
}

/**
 * Create a new version snapshot from the current editor state.
 *
 * Branch-point semantics: the existing active version is left UNCHANGED on
 * the server. The supplied `draft` (in-memory editor state) becomes the
 * content of the new snapshot. The new snapshot is set as the active version.
 *
 * Without `draft`, the snapshot duplicates the server's current top-level
 * fields — useful for "duplicate active as a new version" workflows where
 * there are no in-memory edits.
 */
export async function snapshotReportVersion(
  reportId: string,
  label?: string,
  draft?: ReportContent
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const reportRes = await getReport(reportId);
    if (!reportRes.success || !reportRes.data?.data?.report_content) {
      return handleBadRequest("Report not found");
    }

    const { isAuthenticated, session } = await verifySession();
    if (!isAuthenticated) {
      return handleBadRequest("Session required to snapshot");
    }
    const userRef = buildUserRef(session);

    // Server's authoritative versions[] preserved as-is (no sync into active).
    // Draft top-level fields become the source for the new snapshot only.
    const serverContent = ensureVersionedShape(reportRes.data.data.report_content);
    const draftContent = draft ? ensureVersionedShape(draft) : null;
    const snapshotSource: ReportContent = draftContent
      ? {
          ...serverContent,
          title: draftContent.title,
          management_standard: draftContent.management_standard,
          branding: draftContent.branding,
          sections: draftContent.sections
        }
      : serverContent;

    const newSnapshot = buildSnapshotFromCurrent(snapshotSource, userRef, label);

    // Server's versions[] is preserved; only the new snapshot is appended.
    const updatedVersions = [...(serverContent.versions ?? []), newSnapshot];
    const updatedContent: ReportContent = {
      ...snapshotSource,
      versions: updatedVersions,
      current_version_number: newSnapshot.version_number
    };

    const aggregateStatus = computeAggregateStatus(updatedVersions);

    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data: {
        report_content: updatedContent,
        status: aggregateStatus,
        is_active: true
      }
    });

    revalidatePath("/dashboard/reports");
    revalidatePath(`/dashboard/reports/${reportId}`);
    return successResponse(response?.data, `Snapshot v${newSnapshot.version_number} created`);
  } catch (error: any) {
    return handleError(
      error,
      "POST | SNAPSHOT REPORT VERSION",
      `/api/v1/reports/${reportId}#snapshot`
    );
  }
}

/**
 * Publish a specific version. Optionally generates the PDF for that snapshot.
 * Idempotent if the version is already PUBLISHED (regenerates PDF when generatePdf=true).
 */
export async function publishReportVersion(
  reportId: string,
  versionNumber: number,
  generatePdf: boolean = true
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  const deny = await assertActionPermission(MODULE_CODES.AUDIT_REPORTS, "can_edit");
  if (deny) return deny;

  try {
    const reportRes = await getReport(reportId);
    if (!reportRes.success || !reportRes.data?.data?.report_content) {
      return handleBadRequest("Report not found");
    }

    const { isAuthenticated, session } = await verifySession();
    if (!isAuthenticated) {
      return handleBadRequest("Session required to publish version");
    }
    const userRef = buildUserRef(session);

    const current = ensureVersionedShape(reportRes.data.data.report_content);
    const versions = current.versions ?? [];
    const idx = findVersionIndex(versions, versionNumber);

    if (idx === -1) {
      return handleBadRequest(`Version ${versionNumber} not found`);
    }

    const now = new Date().toISOString();

    let pdfUrl: string | undefined = versions[idx].pdf_url;
    if (generatePdf) {
      try {
        const pdfRes = await authenticatedApiClient({
          url: `/api/v1/reports/${reportId}/publish`,
          method: "POST",
          data: { generate_pdf: true, version_number: versionNumber }
        });
        pdfUrl = pdfRes?.data?.data?.pdf_url ?? pdfUrl;
      } catch (pdfError: any) {
        console.warn("[publishReportVersion] PDF generation failed:", pdfError?.message);
        // Continue — publish status is still applied; pdf_url remains as it was
      }
    }

    const updatedVersion = {
      ...versions[idx],
      status: "PUBLISHED" as const,
      published_at: versions[idx].published_at ?? now,
      published_by: versions[idx].published_by ?? userRef,
      pdf_url: pdfUrl
    };

    const updatedVersions = [...versions];
    updatedVersions[idx] = updatedVersion;

    const updatedContent = { ...current, versions: updatedVersions };
    const aggregateStatus = computeAggregateStatus(updatedVersions);

    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data: {
        report_content: updatedContent,
        status: aggregateStatus,
        is_active: true
      }
    });

    revalidatePath(`/dashboard/reports/${reportId}`);
    revalidatePath("/dashboard/reports");
    return successResponse(response?.data, `Version ${versionNumber} published`);
  } catch (error: any) {
    return handleError(
      error,
      "POST | PUBLISH REPORT VERSION",
      `/api/v1/reports/${reportId}#publish-v${versionNumber}`
    );
  }
}

/**
 * Switch the active version pointer and mirror the chosen version's content
 * into the top-level fields so the editor reloads with it.
 */
export async function setActiveVersion(
  reportId: string,
  versionNumber: number
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  const deny = await assertActionPermission(MODULE_CODES.AUDIT_REPORTS, "can_edit");
  if (deny) return deny;

  try {
    const reportRes = await getReport(reportId);
    if (!reportRes.success || !reportRes.data?.data?.report_content) {
      return handleBadRequest("Report not found");
    }

    const current = ensureVersionedShape(reportRes.data.data.report_content);
    const versions = current.versions ?? [];
    const idx = findVersionIndex(versions, versionNumber);

    if (idx === -1) {
      return handleBadRequest(`Version ${versionNumber} not found`);
    }

    const target = versions[idx];
    const updatedContent: ReportContent = {
      ...current,
      title: target.title,
      management_standard: target.management_standard,
      branding: structuredClone(target.branding),
      sections: structuredClone(target.sections),
      current_version_number: versionNumber
    };

    const aggregateStatus = computeAggregateStatus(versions);

    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data: {
        report_content: updatedContent,
        status: aggregateStatus,
        is_active: true
      }
    });

    revalidatePath(`/dashboard/reports/${reportId}`);
    return successResponse(response?.data, `Active version set to v${versionNumber}`);
  } catch (error: any) {
    return handleError(
      error,
      "PUT | SET ACTIVE VERSION",
      `/api/v1/reports/${reportId}#active-v${versionNumber}`
    );
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
      let rawFindings = workpaper?.findings || [];

      // The /working-paper endpoint may not embed findings. Fall back to the
      // dedicated /working-paper-findings endpoint when the array is empty so
      // the report's Compliance Findings widget mirrors the Workpaper tab.
      if (rawFindings.length === 0) {
        try {
          const fallback = await authenticatedApiClient({
            url: `/api/v1/working-paper-findings?audit_plan_id=${auditPlanId}&page=1&page_size=200`,
            method: "GET"
          });
          const payload = fallback?.data?.data ?? fallback?.data;
          rawFindings = Array.isArray(payload?.findings)
            ? payload.findings
            : Array.isArray(payload)
              ? payload
              : [];
        } catch (fallbackError: any) {
          console.warn(
            "⚠️ [fetchFindingsForReport] Fallback /working-paper-findings failed:",
            fallbackError?.message
          );
        }
      }

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

  const report: ReportContent = ensureVersionedShape({
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
  });

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
    // Update existing — pass the nested ReportContent when present so updateReport
    // gets a type-safe Partial<ReportContent>. updateReport also handles the
    // wrapper shape defensively for older callers.
    const content = (report.report_content ?? (report as unknown)) as Partial<ReportContent>;
    return updateReport(report.id, content);
  } else {
    // Create new - requires entity_id and entity_type
    if (!entityId || !entityType) {
      return handleBadRequest("Entity ID and type are required for new reports");
    }
    return createReport({
      title: report.title,
      report_type: report.report_type,
      report_content: (report.report_content ?? report) as unknown as Partial<ReportContent>,
      entity_id: entityId,
      entity_type: entityType
    });
  }
}
