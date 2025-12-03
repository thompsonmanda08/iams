/**
 * Framework-Specific Finding Fields Configuration
 *
 * Defines which fields are relevant for each compliance framework (ISO27001, COSO, COBIT, NIST).
 * This ensures findings capture the appropriate compliance-specific information.
 */

import { id } from "date-fns/locale";
import { ComplianceStatus } from "../types/audit-types";

export type FrameworkType = "ISO27001" | "COSO" | "COBIT" | "NIST" | "GENERAL" | "CUSTOM";

export interface FindingField {
  name: string;
  label: string;
  description?: string;
  required: boolean;
  disabled?: boolean;
  type: "text" | "textarea" | "date" | "select" | "number" | "checkbox";
  placeholder?: string;
  validation?: string;
  options?: any[];
}

export interface FrameworkFieldConfig {
  framework: FrameworkType;
  label: string;
  complianceFields: FindingField[];
  // managementFields: FindingField[];
  evidenceFields: FindingField[];
}

/**
 * Framework field configurations
 * Each framework has specific compliance-related fields that should be captured
 */
export const FRAMEWORK_FINDING_FIELDS: Record<FrameworkType, FrameworkFieldConfig> = {
  ISO27001: {
    framework: "ISO27001",
    label: "ISO 27001:2022",
    complianceFields: [
      {
        name: "clause_number",
        label: "Clause Number",
        description: "ISO 27001 clause reference (e.g., 4.1, 5.2)",
        required: true,
        disabled: true,
        type: "text",
        placeholder: "e.g., 4.1"
      },
      {
        name: "clause_description",
        label: "Clause Description",
        description: "Full title/description of the ISO 27001 clause",
        required: false,
        disabled: true,
        type: "textarea",
        placeholder: "e.g., Conforms - The organization and its context is well understood"
      },
      {
        name: "compliance_status",
        label: "Compliance Status",
        description: "Assessment of compliance level",
        required: false,
        type: "checkbox",
        options: [
          { id: "Compliant", name: "Compliant" },
          { id: "Partial", name: "Partial" },
          { id: "Non-Compliant", name: "Non-Compliant" }
        ] as Record<string, ComplianceStatus>[]
      },
      {
        name: "compliance_percentage",
        label: "Compliance Percentage",
        description: "Percentage of clause requirements that are met (0-100)",
        required: false,
        type: "number"
      }
    ],
    // managementFields: [
    //   {
    //     name: "severity",
    //     label: "Severity Level",
    //     description: "Critical, High, Medium, or Low impact",
    //     required: true,
    //     type: "select",
    //     options: [{ id: "Critical", name: "Critical" }]
    //   },
    //   {
    //     name: "workings_and_test_results",
    //     label: "Workings & Test Results",
    //     description: "Audit procedures performed and test findings",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "conclusion",
    //     label: "Conclusion",
    //     description: "Audit conclusion for this clause",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "recommendation",
    //     label: "Recommendation",
    //     description: "Recommendation to address the finding",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "management_response",
    //     label: "Management Response",
    //     description: "Organization's response to the finding",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "action_plan",
    //     label: "Action Plan",
    //     description: "Corrective action plan and timeline",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "responsible_person",
    //     label: "Responsible Person",
    //     description: "Person responsible for implementing corrective actions",
    //     required: false,
    //     type: "select"
    //   },
    //   {
    //     name: "due_date",
    //     label: "Due Date",
    //     description: "Expected completion date for corrective actions",
    //     required: false,
    //     type: "date"
    //   }
    // ],
    evidenceFields: [
      {
        name: "evidence_links",
        label: "Evidence Links",
        description: "Links to supporting evidence and documentation",
        required: false,
        type: "textarea"
      },
      {
        name: "evidence_summary",
        label: "Evidence Summary",
        description: "Summary of evidence reviewed",
        required: false,
        type: "textarea"
      }
    ]
  },

  COSO: {
    framework: "COSO",
    label: "COSO Framework",
    complianceFields: [
      {
        name: "coso_component",
        label: "COSO Component",
        description:
          "Control Environment, Risk Assessment, Control Activities, Information & Communication, or Monitoring",
        required: true,
        type: "select"
      },
      {
        name: "coso_principle",
        label: "COSO Principle",
        description: "Specific principle within the component",
        required: true,
        type: "select"
      },
      {
        name: "compliance_status",
        label: "Compliance Status",
        description: "Assessment of compliance level",
        required: false,
        type: "checkbox",
        options: [
          { id: "Compliant", name: "Compliant" },
          { id: "Partial", name: "Partial" },
          { id: "Non-Compliant", name: "Non-Compliant" }
        ] as Record<string, ComplianceStatus>[]
      },
      {
        name: "compliance_percentage",
        label: "Compliance Percentage",
        description: "Percentage of requirements that are met (0-100)",
        required: false,
        type: "number"
      }
    ],
    // managementFields: [
    //   {
    //     name: "severity",
    //     label: "Severity Level",
    //     description: "Critical, High, Medium, or Low impact",
    //     required: true,
    //     type: "select"
    //   },
    //   {
    //     name: "control_deficiency_type",
    //     label: "Control Deficiency Type",
    //     description: "Deficiency, Significant Deficiency, or Material Weakness",
    //     required: false,
    //     type: "select"
    //   },
    //   {
    //     name: "workings_and_test_results",
    //     label: "Control Testing Results",
    //     description: "Results of control testing performed",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "conclusion",
    //     label: "Conclusion",
    //     description: "Assessment conclusion regarding control effectiveness",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "recommendation",
    //     label: "Recommendation",
    //     description: "Recommended improvements to control",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "management_response",
    //     label: "Management Response",
    //     description: "Management's planned response to deficiency",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "action_plan",
    //     label: "Remediation Plan",
    //     description: "Plan to remediate the control deficiency",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "responsible_person",
    //     label: "Responsible Person",
    //     description: "Person responsible for remediation",
    //     required: false,
    //     type: "select"
    //   },
    //   {
    //     name: "due_date",
    //     label: "Target Remediation Date",
    //     description: "Expected date for remediation completion",
    //     required: false,
    //     type: "date"
    //   }
    // ],
    evidenceFields: [
      {
        name: "evidence_links",
        label: "Supporting Documentation",
        description: "Links to control documentation and test evidence",
        required: false,
        type: "textarea"
      }
    ]
  },

  COBIT: {
    framework: "COBIT",
    label: "COBIT 2019",
    complianceFields: [
      {
        name: "cobit_domain",
        label: "COBIT Domain",
        description:
          "Evaluate, Direct & Monitor (EDM), Align, Plan & Organize (APO), Build, Acquire & Implement (BAI), Deliver, Service & Support (DSS), or Monitor, Evaluate & Assess (MEA)",
        required: true,
        type: "select"
      },
      {
        name: "cobit_process",
        label: "COBIT Process",
        description: "Specific COBIT process code (e.g., EDM01, APO01)",
        required: true,
        type: "select"
      },
      {
        name: "cobit_process_name",
        label: "Process Name",
        description: "Full name of the COBIT process",
        required: false,
        type: "text"
      },
      {
        name: "capability_level",
        label: "Current Capability Level",
        description:
          "0 - Incomplete, 1 - Performed, 2 - Managed, 3 - Established, 4 - Predictable, 5 - Optimizing",
        required: false,
        type: "select"
      },
      {
        name: "target_capability_level",
        label: "Target Capability Level",
        description: "Desired/required capability level",
        required: false,
        type: "select"
      },
      {
        name: "compliance_status",
        label: "Compliance Status",
        description: "Assessment of compliance level",
        required: false,
        type: "checkbox",
        options: [
          { id: "Compliant", name: "Compliant" },
          { id: "Partial", name: "Partial" },
          { id: "Non-Compliant", name: "Non-Compliant" }
        ] as Record<string, ComplianceStatus>[]
      },
      {
        name: "compliance_percentage",
        label: "Compliance Percentage",
        description: "Percentage of requirements that are met (0-100)",
        required: false,
        type: "number"
      }
    ],
    // managementFields: [
    //   {
    //     name: "severity",
    //     label: "Impact Level",
    //     description: "Critical, High, Medium, or Low impact on IT governance",
    //     required: true,
    //     type: "select"
    //   },
    //   {
    //     name: "workings_and_test_results",
    //     label: "Assessment Findings",
    //     description: "Details of assessment methodology and findings",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "conclusion",
    //     label: "Assessment Conclusion",
    //     description: "Assessment conclusion for this process",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "recommendation",
    //     label: "Improvement Recommendation",
    //     description: "Recommended improvements to raise capability level",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "management_response",
    //     label: "Management Response",
    //     description: "Management's response to improvement recommendations",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "action_plan",
    //     label: "Improvement Plan",
    //     description: "Detailed plan to improve process capability",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "responsible_person",
    //     label: "Responsible Person",
    //     description: "Process owner responsible for improvements",
    //     required: false,
    //     type: "select"
    //   },
    //   {
    //     name: "due_date",
    //     label: "Target Improvement Date",
    //     description: "Expected date to achieve target capability level",
    //     required: false,
    //     type: "date"
    //   }
    // ],
    evidenceFields: [
      {
        name: "evidence_links",
        label: "Assessment Evidence",
        description: "Links to assessment documentation and evidence",
        required: false,
        type: "textarea"
      }
    ]
  },

  NIST: {
    framework: "NIST",
    label: "NIST CSF / SP 800-53",
    complianceFields: [
      {
        name: "nist_function",
        label: "NIST Function",
        description: "Identify, Protect, Detect, Respond, or Recover",
        required: true,
        type: "select"
      },
      {
        name: "nist_category",
        label: "NIST Category",
        description: "Specific category code (e.g., ID.AM-1, PR.AC-1)",
        required: true,
        type: "select"
      },
      {
        name: "nist_subcategory",
        label: "NIST Subcategory",
        description: "Detailed subcategory description",
        required: false,
        type: "text"
      },
      {
        name: "control_number",
        label: "Control Number (SP 800-53)",
        description: "Applicable NIST SP 800-53 control reference (e.g., AC-1)",
        required: false,
        type: "text"
      },
      {
        name: "control_enhancement",
        label: "Control Enhancement",
        description: "Specific control enhancement level if applicable",
        required: false,
        type: "select"
      },
      {
        name: "compliance_status",
        label: "Compliance Status",
        description: "Assessment of compliance level",
        required: false,
        type: "checkbox",
        options: [
          { id: "Compliant", name: "Compliant" },
          { id: "Partial", name: "Partial" },
          { id: "Non-Compliant", name: "Non-Compliant" }
        ] as Record<string, ComplianceStatus>[]
      },
      {
        name: "compliance_percentage",
        label: "Compliance Percentage",
        description: "Percentage of requirements that are met (0-100)",
        required: false,
        type: "number"
      }
    ],
    // managementFields: [
    //   {
    //     name: "severity",
    //     label: "Risk Level",
    //     description: "Critical, High, Medium, or Low risk",
    //     required: true,
    //     type: "select"
    //   },
    //   {
    //     name: "assessment_type",
    //     label: "Assessment Type",
    //     description: "Examination, Interview, Testing, or Review",
    //     required: false,
    //     type: "select"
    //   },
    //   {
    //     name: "workings_and_test_results",
    //     label: "Assessment Details",
    //     description: "Assessment procedures and findings",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "conclusion",
    //     label: "Assessment Result",
    //     description: "Compliant, Non-Compliant, or Partially Compliant",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "recommendation",
    //     label: "Remediation Recommendation",
    //     description: "Recommended actions to achieve compliance",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "management_response",
    //     label: "Management Response",
    //     description: "Organization's response to assessment results",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "action_plan",
    //     label: "Remediation Plan",
    //     description: "Detailed remediation plan and timeline",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "responsible_person",
    //     label: "Responsible Person",
    //     description: "CISO or control owner responsible for remediation",
    //     required: false,
    //     type: "select"
    //   },
    //   {
    //     name: "due_date",
    //     label: "Remediation Due Date",
    //     description: "Target date for remediation completion",
    //     required: false,
    //     type: "date"
    //   }
    // ],
    evidenceFields: [
      {
        name: "evidence_links",
        label: "Assessment Evidence",
        description: "Links to assessment reports and supporting documentation",
        required: false,
        type: "textarea"
      }
    ]
  },

  GENERAL: {
    framework: "GENERAL",
    label: "General Audit",
    complianceFields: [
      {
        name: "finding_category",
        label: "Finding Category",
        description: "Category or area of focus for this finding",
        required: false,
        type: "text"
      }
    ],
    // managementFields: [
    //   {
    //     name: "severity",
    //     label: "Severity Level",
    //     description: "Critical, High, Medium, or Low",
    //     required: true,
    //     type: "select"
    //   },
    //   {
    //     name: "workings_and_test_results",
    //     label: "Audit Evidence",
    //     description: "Evidence and observations supporting this finding",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "conclusion",
    //     label: "Conclusion",
    //     description: "Audit conclusion",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "recommendation",
    //     label: "Recommendation",
    //     description: "Recommended actions",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "management_response",
    //     label: "Management Response",
    //     description: "Organization's response",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "action_plan",
    //     label: "Action Plan",
    //     description: "Plan to address the finding",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "responsible_person",
    //     label: "Responsible Person",
    //     description: "Person responsible for actions",
    //     required: false,
    //     type: "select"
    //   },
    //   {
    //     name: "due_date",
    //     label: "Due Date",
    //     description: "Target completion date",
    //     required: false,
    //     type: "date"
    //   }
    // ],
    evidenceFields: [
      {
        name: "evidence_links",
        label: "Evidence Links",
        description: "Links to supporting documentation",
        required: false,
        type: "textarea"
      }
    ]
  },

  CUSTOM: {
    framework: "CUSTOM",
    label: "Custom Framework",
    complianceFields: [
      {
        name: "finding_category",
        label: "Finding Category",
        description: "Category or area of focus for this finding",
        required: false,
        type: "text"
      }
    ],
    // managementFields: [
    //   {
    //     name: "severity",
    //     label: "Severity Level",
    //     description: "Critical, High, Medium, or Low",
    //     required: true,
    //     type: "select"
    //   },
    //   {
    //     name: "workings_and_test_results",
    //     label: "Findings",
    //     description: "Details of findings",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "conclusion",
    //     label: "Conclusion",
    //     description: "Conclusion",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "recommendation",
    //     label: "Recommendation",
    //     description: "Recommended actions",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "management_response",
    //     label: "Management Response",
    //     description: "Organization's response",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "action_plan",
    //     label: "Action Plan",
    //     description: "Plan to address the finding",
    //     required: false,
    //     type: "textarea"
    //   },
    //   {
    //     name: "responsible_person",
    //     label: "Responsible Person",
    //     description: "Person responsible for actions",
    //     required: false,
    //     type: "select"
    //   },
    //   {
    //     name: "due_date",
    //     label: "Due Date",
    //     description: "Target completion date",
    //     required: false,
    //     type: "date"
    //   }
    // ],
    evidenceFields: [
      {
        name: "evidence_links",
        label: "Evidence Links",
        description: "Links to supporting documentation",
        required: false,
        type: "textarea"
      }
    ]
  }
};

/**
 * Helper function to get field configuration for a specific framework
 */
export function getFrameworkFieldConfig(framework: FrameworkType): FrameworkFieldConfig {
  return FRAMEWORK_FINDING_FIELDS[framework] || FRAMEWORK_FINDING_FIELDS.GENERAL;
}

/**
 * Helper function to get all fields for a framework (flattened)
 */
export function getFrameworkAllFields(framework: FrameworkType): FindingField[] {
  const config = getFrameworkFieldConfig(framework);
  return [
    ...config.complianceFields,
    // ...config.managementFields,
    ...config.evidenceFields
  ];
}

/**
 * Helper function to check if a field is required for a framework
 */
export function isFieldRequired(framework: FrameworkType, fieldName: string): boolean {
  const fields = getFrameworkAllFields(framework);
  const field = fields.find((f) => f.name === fieldName);
  return field?.required ?? false;
}

/**
 * Helper function to get all required field names for a framework
 */
export function getRequiredFields(framework: FrameworkType): string[] {
  return getFrameworkAllFields(framework)
    .filter((f) => f.required)
    .map((f) => f.name);
}
