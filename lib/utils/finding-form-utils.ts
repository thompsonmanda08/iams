/**
 * Utilities for handling framework-specific finding form fields
 */

import { WorkpaperFinding } from "@/lib/types/audit-types";
import { getFrameworkFieldConfig, FrameworkType } from "@/lib/config/finding-framework-fields";

/**
 * Extract framework-specific fields from a finding object
 */
export function extractFrameworkFields(
  finding: WorkpaperFinding,
  framework: FrameworkType
): Record<string, any> {
  const config = getFrameworkFieldConfig(framework);
  const result: Record<string, any> = {};

  // Extract all framework-specific fields (compliance and evidence)
  const allFields = [
    ...config.complianceFields,
    ...config.evidenceFields
  ];

  allFields.forEach((field) => {
    const value = (finding as any)[field.name];
    if (value !== undefined && value !== null) {
      result[field.name] = value;
    }
  });

  return result;
}

/**
 * Build payload with ONLY required update fields
 * Keeps payload minimal and consistent across all framework types
 *
 * ALWAYS included:
 * - severity: Impact level of the finding
 * - recommendation: What should be done to remediate
 * - compliance_status: Assessment of compliance level
 * - compliance_percentage: Percentage of requirements met
 *
 * These fields are the same across ALL framework types.
 * Framework-specific fields (clause_number, coso_component, etc.)
 * are displayed in the UI but NOT included in the API payload.
 */
export function buildFindingPayload(
  formData: Record<string, any>
): Record<string, any> {
  const payload: Record<string, any> = {};

  // ===== STANDARD FIELDS FOR ALL FRAMEWORKS =====
  // These 4 fields are ALWAYS sent in the payload, regardless of framework type

  // Severity is required for all frameworks
  if (formData.severity) {
    payload.severity = formData.severity;
  }

  // Recommendation is required for all frameworks
  if (formData.recommendation) {
    payload.recommendation = formData.recommendation;
  }

  // Compliance Status (same for all frameworks)
  if (formData.compliance_status !== undefined && formData.compliance_status !== null && formData.compliance_status !== "") {
    payload.compliance_status = formData.compliance_status;
  }

  // Compliance Percentage (same for all frameworks)
  if (formData.compliance_percentage !== undefined && formData.compliance_percentage !== null && formData.compliance_percentage !== "") {
    payload.compliance_percentage = formData.compliance_percentage;
  }

  return payload;
}

/**
 * Initialize form data from an existing finding
 */
export function initializeFormDataFromFinding(finding: WorkpaperFinding): Record<string, any> {
  return {
    // Management fields
    workings_and_test_results: finding.workings_and_test_results || "",
    conclusion: finding.conclusion || "",
    severity: finding.severity || "MEDIUM",
    recommendation: finding.recommendation || "",
    management_response: finding.management_response || "",
    action_plan: finding.action_plan || "",
    responsible_person: finding.responsible_person || "",
    due_date: finding.due_date ? new Date(finding.due_date) : null,
    evidence_links: finding.evidence_links || "",
    status: finding.status || "OPEN",

    // Framework-specific compliance fields
    // ISO27001
    clause_number: finding.clause_number || "",
    clause_description: finding.clause_description || "",
    compliance_status: finding.compliance_status || "",
    compliance_percentage: finding.compliance_percentage || 0,

    // COSO
    coso_component: finding.coso_component || "",
    coso_principle: finding.coso_principle || "",
    control_type: finding.control_type || "",
    entity_level_control: finding.entity_level_control || "",
    control_deficiency_type: finding.control_deficiency_type || "",

    // COBIT
    cobit_domain: finding.cobit_domain || "",
    cobit_process: finding.cobit_process || "",
    cobit_process_name: finding.cobit_process_name || "",
    capability_level: finding.capability_level || "",
    target_capability_level: finding.target_capability_level || "",

    // NIST
    nist_function: finding.nist_function || "",
    nist_category: finding.nist_category || "",
    nist_subcategory: finding.nist_subcategory || "",
    control_number: finding.control_number || "",
    control_enhancement: finding.control_enhancement || "",
    assessment_type: finding.assessment_type || "",

    // General/Custom
    finding_category: finding.finding_category || ""
  };
}

/**
 * Determine which fields to display based on framework type
 * TODO: Add managementFields support when available
 */
// export function getVisibleFieldsForFramework(framework: FrameworkType) {
//   const config = getFrameworkFieldConfig(framework);
//   return {
//     compliance: config.complianceFields.map(f => f.name),
//     management: config.managementFields.map(f => f.name),
//     evidence: config.evidenceFields.map(f => f.name)
//   };
// }

/**
 * Validate required fields for a framework
 * TODO: Add managementFields validation when available
 */
export function validateFrameworkRequiredFields(
  formData: Record<string, any>,
  framework: FrameworkType
): { valid: boolean; errors: Record<string, string> } {
  const config = getFrameworkFieldConfig(framework);
  const errors: Record<string, string> = {};
  // Validate compliance and evidence fields only (managementFields commented out)
  const allFields = [
    ...config.complianceFields,
    // ...config.managementFields,  // TODO: Add when available
    ...config.evidenceFields
  ];

  allFields.forEach((field) => {
    if (field.required) {
      const value = formData[field.name];
      if (!value || (typeof value === "string" && !value.trim())) {
        errors[field.name] = `${field.label} is required`;
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Extract framework-specific compliance fields for sidebar display
 */
export function getFrameworkSidebarFields(
  finding: WorkpaperFinding,
  framework: FrameworkType
): Array<{ label: string; value: string }> {
  const config = getFrameworkFieldConfig(framework);
  const sidebarFields: Array<{ label: string; value: string }> = [];

  // Show only compliance fields (first 2-3 for sidebar display)
  config.complianceFields.forEach((field) => {
    const value = (finding as any)[field.name];
    if (value !== undefined && value !== null && value !== "") {
      sidebarFields.push({
        label: field.label,
        value: String(value)
      });
    }
  });

  return sidebarFields;
}
