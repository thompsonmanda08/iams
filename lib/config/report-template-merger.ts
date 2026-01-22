import type { ReportContent, ReportSection, ReportStatus } from "@/lib/types/report-types";
import {
  normalizeManagementStandard,
  getTemplateForStandard
} from "@/components/reports/report-templates";

/**
 * Intelligently merges saved report data with template data
 *
 * Strategy:
 * 1. If report has no sections -> use all template sections
 * 2. If report has some sections -> merge with template:
 *    - Keep all user-edited sections (by section_id)
 *    - Add missing template sections that user hasn't created yet
 *    - Maintain proper ordering
 *
 * This ensures users get helpful placeholder content while preserving their work
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
      sections: template.default_sections
    };
  }

  // Report has sections - perform intelligent merge
  const mergedSections = mergeReportSections(savedReport.sections, template.default_sections);

  return {
    ...savedReport,
    version: savedReport.version || "1.0",
    report_type: template.type,
    management_standard:
      normalizeManagementStandard(savedReport.management_standard) || templateKey,
    sections: mergedSections
  };
}

/**
 * Merges user sections with template sections
 *
 * Logic:
 * - Keep all user sections (they have priority)
 * - Add template sections that don't exist in user sections
 * - Match by section_type for common sections (like cover_page)
 * - Maintain logical ordering
 */
function mergeReportSections(
  userSections: ReportSection[],
  templateSections: ReportSection[]
): ReportSection[] {
  const mergedSections: ReportSection[] = [];
  const userSectionsByType = new Map<string, ReportSection[]>();
  const userSectionIds = new Set<string>();

  // Index user sections by type and collect IDs
  userSections.forEach((section) => {
    userSectionIds.add(section.section_id);

    const existingSections = userSectionsByType.get(section.section_type) || [];
    userSectionsByType.set(section.section_type, [...existingSections, section]);
  });

  // First pass: Add all user sections (they take precedence)
  userSections.forEach((section) => {
    mergedSections.push(section);
  });

  // Second pass: Add template sections that don't exist in user sections
  templateSections.forEach((templateSection) => {
    // Skip if user already has a section with this exact ID
    if (userSectionIds.has(templateSection.section_id)) {
      return;
    }

    // For certain unique section types (like cover_page), don't duplicate if user has one
    const uniqueSectionTypes = new Set(["cover_page"]);
    if (uniqueSectionTypes.has(templateSection.section_type)) {
      const userHasThisType = userSectionsByType.has(templateSection.section_type);
      if (userHasThisType) {
        return; // User already has this unique section type, skip template version
      }
    }

    // Add template section as a helpful placeholder
    // Generate a unique ID to avoid conflicts
    const placeholderSection: ReportSection = {
      ...templateSection,
      section_id: `${templateSection.section_id}-template-${Date.now()}`
    };

    mergedSections.push(placeholderSection);
  });

  // Re-order sections based on their order property
  mergedSections.sort((a, b) => {
    // User sections keep their original order
    const aIsUserSection = userSectionIds.has(a.section_id.replace(/-template-\d+$/, ""));
    const bIsUserSection = userSectionIds.has(b.section_id.replace(/-template-\d+$/, ""));

    if (aIsUserSection && !bIsUserSection) return -1; // User sections first
    if (!aIsUserSection && bIsUserSection) return 1; // Template sections last

    return a.order - b.order;
  });

  // Reassign order numbers sequentially
  return mergedSections.map((section, index) => ({
    ...section,
    order: index
  }));
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
