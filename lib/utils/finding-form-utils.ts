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

  // Extract all framework-specific fields
  const allFields = [
    ...config.complianceFields,
    ...config.managementFields,
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
 * Build complete payload with framework-specific fields
 */
export function buildFindingPayload(
  finding: WorkpaperFinding,
  formData: Record<string, any>,
  framework: FrameworkType
): Record<string, any> {
  const config = getFrameworkFieldConfig(framework);
  const payload: Record<string, any> = {
    // Base fields (always included)
    finding_number: finding.finding_number,
    category_name: finding.category_name,
    status: formData.status,
    report: true,

    // Standard fields from management section
    severity: formData.severity,
    recommendation: formData.recommendation || "",
    management_response: formData.management_response || "",
    action_plan: formData.action_plan || "",
    responsible_person: formData.responsible_person || "",
    due_date: formData.due_date ? new Date(formData.due_date).toISOString().split("T")[0] : "",

    // Audit working paper fields
    workings_and_test_results: formData.workings_and_test_results || "",
    conclusion: formData.conclusion || "",
    evidence_links: formData.evidence_links || ""
  };

  // Add framework-specific compliance fields
  config.complianceFields.forEach((field) => {
    if (formData[field.name] !== undefined && formData[field.name] !== null) {
      payload[field.name] = formData[field.name];
    }
  });

  // Add framework-specific management fields
  config.managementFields.forEach((field) => {
    if (formData[field.name] !== undefined && formData[field.name] !== null) {
      payload[field.name] = formData[field.name];
    }
  });

  // Add framework-specific evidence fields
  config.evidenceFields.forEach((field) => {
    if (formData[field.name] !== undefined && formData[field.name] !== null) {
      payload[field.name] = formData[field.name];
    }
  });

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
 */
export function getVisibleFieldsForFramework(framework: FrameworkType) {
  const config = getFrameworkFieldConfig(framework);
  return {
    compliance: config.complianceFields.map(f => f.name),
    management: config.managementFields.map(f => f.name),
    evidence: config.evidenceFields.map(f => f.name)
  };
}

/**
 * Validate required fields for a framework
 */
export function validateFrameworkRequiredFields(
  formData: Record<string, any>,
  framework: FrameworkType
): { valid: boolean; errors: Record<string, string> } {
  const config = getFrameworkFieldConfig(framework);
  const errors: Record<string, string> = {};
  const allFields = [
    ...config.complianceFields,
    ...config.managementFields,
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
