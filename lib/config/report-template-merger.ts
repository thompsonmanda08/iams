import type { ReportContent, ReportStatus } from "@/lib/types/report-types";
import {
  normalizeManagementStandard,
  getTemplateForStandard
} from "@/components/reports/report-templates";

/**
 * Hydrates a saved report with template defaults only when the saved report
 * has no sections of its own. Once the user has saved sections, those are
 * authoritative: deleted sections must stay deleted across reloads, so the
 * template is not re-merged.
 */
export function mergeReportWithTemplate(
  savedReport: ReportContent | null | undefined,
  managementStandard?: string,
  entityMetadata?: {
    id: string;
    title: string;
    created_at?: string;
    updated_at?: string;
    status?: string;
  }
): ReportContent {
  // Get the appropriate template
  // Use report_type as fallback if management_standard not provided
  let templateStandard = managementStandard;

  // If no management standard, derive from report_type
  if (!templateStandard && savedReport?.report_type) {
    const reportTypeToStandard: Record<string, string> = {
      risk: "RISK ASSESSMENT",
      general_audit: "GENERAL",
      compliance_audit: "ISO 27001",
      followup: "FOLLOW-UP"
    };
    templateStandard = reportTypeToStandard[savedReport.report_type];
  }

  const templateKey = normalizeManagementStandard(templateStandard);
  const template = getTemplateForStandard(templateStandard);

  // If no saved report exists, create a new one from template
  if (!savedReport) {
    return {
      report_id: entityMetadata?.id || `rep-${Date.now()}`,
      report_type: template.type,
      title: entityMetadata?.title || `${template.name} Report`,
      version: "1.0",
      status: (entityMetadata?.status as ReportStatus) || "DRAFT",
      management_standard: templateKey,
      branding: {
        primary_color: "#1a365d",
        secondary_color: "#2563eb",
        font_family: "Inter"
      },
      sections: template.default_sections,
      created_at: entityMetadata?.created_at || new Date().toISOString().split("T")[0],
      updated_at: entityMetadata?.updated_at || new Date().toISOString().split("T")[0]
    };
  }

  // If saved report exists but has no sections or empty sections array
  if (!savedReport.sections || savedReport.sections.length === 0) {
    return {
      ...savedReport,
      version: savedReport.version || "1.0",
      report_type: template.type,
      management_standard:
        normalizeManagementStandard(savedReport.management_standard) || templateKey,
      sections: template.default_sections,
      // Use entity metadata timestamps as fallback when report_content doesn't have them
      created_at: savedReport.created_at || entityMetadata?.created_at,
      updated_at: savedReport.updated_at || entityMetadata?.updated_at
    };
  }

  // Report has user sections - treat them as authoritative.
  // Re-injecting missing template sections here would resurrect anything the
  // user deleted on every load.
  return {
    ...savedReport,
    version: savedReport.version || "1.0",
    report_type: template.type,
    management_standard:
      normalizeManagementStandard(savedReport.management_standard) || templateKey,
    sections: savedReport.sections,
    // Use entity metadata timestamps as fallback when report_content doesn't have them
    created_at: savedReport.created_at || entityMetadata?.created_at,
    updated_at: savedReport.updated_at || entityMetadata?.updated_at
  };
}

/**
 * Checks if a report needs template enrichment
 * Returns true if report would benefit from template sections
 */
export function shouldEnrichWithTemplate(report: ReportContent | null | undefined): boolean {
  if (!report) return true;
  if (!report.sections || report.sections.length === 0) return true;

  // If report has very few sections (less than 3), it might benefit from template sections
  if (report.sections.length < 3) return true;

  return false;
}

/**
 * Creates a minimal report placeholder when entity exists but report doesn't
 */
export function createMinimalReportPlaceholder(
  entityId: string,
  entityTitle: string,
  entityType: "audit_plan" | "risk_register",
  managementStandard?: string
): ReportContent {
  const templateKey = normalizeManagementStandard(managementStandard);
  const template = getTemplateForStandard(managementStandard);

  return {
    report_id: `placeholder-${entityId}`,
    report_type: template.type,
    title: `${entityTitle} - Report`,
    version: "1.0",
    status: "DRAFT",
    management_standard: templateKey,
    branding: {
      primary_color: "#1a365d",
      secondary_color: "#2563eb",
      font_family: "Inter"
    },
    sections: template.default_sections,
    created_at: new Date().toISOString().split("T")[0],
    updated_at: new Date().toISOString().split("T")[0]
  };
}
