import { DataSource, FindingSummary } from "./types";

export const AVAILABLE_DATA_SOURCES: DataSource[] = [
  {
    id: "findings_severity",
    name: "Findings by Severity",
    description: "Distribution of audit findings by severity level",
    category: "audit",
    compatible_widgets: ["pie_chart", "table"],
    requires_entity: true,
    sample_data: {
      pie_chart: [
        { label: "High", value: 2, color: "#ef4444" },
        { label: "Medium", value: 3, color: "#f59e0b" },
        { label: "Low", value: 1, color: "#22c55e" }
      ],
      table: {
        columns: ["Severity", "Count", "Percentage"],
        rows: [
          { severity: "High", count: 2, percentage: "33%" },
          { severity: "Medium", count: 3, percentage: "50%" },
          { severity: "Low", count: 1, percentage: "17%" }
        ]
      }
    }
  },
  {
    id: "findings_by_status",
    name: "Findings by Status",
    description: "Distribution of findings by their current status",
    category: "audit",
    compatible_widgets: ["pie_chart", "table"],
    requires_entity: true,
    sample_data: {
      pie_chart: [
        { label: "Open", value: 3, color: "#ef4444" },
        { label: "In Progress", value: 2, color: "#3b82f6" },
        { label: "Closed", value: 5, color: "#22c55e" }
      ]
    }
  },
  {
    id: "findings_list",
    name: "Findings List",
    description: "Complete list of audit findings with details",
    category: "audit",
    compatible_widgets: ["table"],
    requires_entity: true,
    sample_data: {
      columns: ["Reference", "Title", "Severity", "Status", "Recommendation"],
      rows: []
    }
  },
  {
    id: "risks_by_rating",
    name: "Risks by Rating",
    description: "Distribution of risks by inherent risk rating",
    category: "risk",
    compatible_widgets: ["pie_chart", "table", "bar_chart"],
    requires_entity: true,
    sample_data: {
      pie_chart: [
        { label: "Critical", value: 2, color: "#7c3aed" },
        { label: "High", value: 5, color: "#ef4444" },
        { label: "Medium", value: 8, color: "#f59e0b" },
        { label: "Low", value: 3, color: "#22c55e" }
      ]
    }
  },
  {
    id: "risks_above_appetite",
    name: "Risks Above Appetite",
    description: "List of risks that exceed the organization's risk appetite",
    category: "risk",
    compatible_widgets: ["table"],
    requires_entity: true,
    sample_data: {
      columns: ["Risk Title", "Category", "Residual Score", "Risk Owner", "Treatment Status"],
      rows: []
    }
  },
   {
    id: "risk_dashboard_appetite_bar",
    name: "Risk Dashboard - Against Appetite",
    description: "Bar chart showing risks within and above appetite levels",
    category: "risk",
    compatible_widgets: ["bar_chart"],
    requires_entity: true,
    sample_data: {
      bar_chart: {
        categories: [
          { label: "STRATEGIC", series: [
            { label: "Within", value: 10, color: "#3b82f6" },
            { label: "Above (Open)", value: 40, color: "#f59e0b" },
            { label: "Above (Closed)", value: 4, color: "#10b981" }
          ]},
          { label: "OPERATIONAL", series: [
            { label: "Within", value: 3, color: "#3b82f6" },
            { label: "Above (Open)", value: 0, color: "#f59e0b" },
            { label: "Above (Closed)", value: 0, color: "#10b981" }
          ]},
          { label: "GEOPOLITICAL", series: [
            { label: "Within", value: 10, color: "#3b82f6" },
            { label: "Above (Open)", value: 1, color: "#f59e0b" },
            { label: "Above (Closed)", value: 0, color: "#10b981" }
          ]},
          { label: "LEGAL, COMPLIANCE & REGULATIONS", series: [
            { label: "Within", value: 4, color: "#3b82f6" },
            { label: "Above (Open)", value: 0, color: "#f59e0b" },
            { label: "Above (Closed)", value: 1, color: "#10b981" }
          ]},
          { label: "ADMINISTRATION", series: [
            { label: "Within", value: 5, color: "#3b82f6" },
            { label: "Above (Open)", value: 0, color: "#f59e0b" },
            { label: "Above (Closed)", value: 0, color: "#10b981" }
          ]},
          { label: "HUMAN RESOURCES", series: [
            { label: "Within", value: 2, color: "#3b82f6" },
            { label: "Above (Open)", value: 0, color: "#f59e0b" },
            { label: "Above (Closed)", value: 0, color: "#10b981" }
          ]},
          { label: "HEALTH & SAFETY", series: [
            { label: "Within", value: 7, color: "#3b82f6" },
            { label: "Above (Open)", value: 0, color: "#f59e0b" },
            { label: "Above (Closed)", value: 0, color: "#10b981" }
          ]},
          { label: "FINANCIAL", series: [
            { label: "Within", value: 3, color: "#3b82f6" },
            { label: "Above (Open)", value: 0, color: "#f59e0b" },
            { label: "Above (Closed)", value: 0, color: "#10b981" }
          ]},
          { label: "CORPORATE GOVERNANCE", series: [
            { label: "Within", value: 2, color: "#3b82f6" },
            { label: "Above (Open)", value: 0, color: "#f59e0b" },
            { label: "Above (Closed)", value: 0, color: "#10b981" }
          ]},
          { label: "3RD PARTY / COUNTER PARTY", series: [
            { label: "Within", value: 2, color: "#3b82f6" },
            { label: "Above (Open)", value: 0, color: "#f59e0b" },
            { label: "Above (Closed)", value: 0, color: "#10b981" }
          ]}
        ],
        orientation: "vertical",
        show_values: true
      }
    }
  },
  {
    id: "risk_distribution_by_department_bar",
    name: "Risk Distribution by Department",
    description: "Bar chart showing risk distribution across departments",
    category: "risk",
    compatible_widgets: ["bar_chart"],
    requires_entity: true,
    sample_data: {
      bar_chart: {
        categories: [
          { label: "IT Department", series: [
            { label: "Risks", value: 30, color: "#3b82f6" }
          ]},
          { label: "Finance", series: [
            { label: "Risks", value: 25, color: "#10b981" }
          ]},
          { label: "Operations", series: [
            { label: "Risks", value: 20, color: "#f59e0b" }
          ]},
          { label: "HR", series: [
            { label: "Risks", value: 15, color: "#ef4444" }
          ]},
          { label: "Legal", series: [
            { label: "Risks", value: 10, color: "#7c3aed" }
          ]},
          { label: "Marketing", series: [
            { label: "Risks", value: 8, color: "#ec4899" }
          ]},
          { label: "Sales", series: [
            { label: "Risks", value: 12, color: "#8b5cf6" }
          ]}
        ],
        orientation: "vertical",
        show_values: true
      }
    }
  },
  {
    id: "control_compliance",
    name: "Control Compliance Status",
    description: "Compliance status of controls against framework",
    category: "compliance",
    compatible_widgets: ["pie_chart", "table"],
    requires_entity: false,
    sample_data: {
      pie_chart: [
        { label: "Conforming", value: 85, color: "#22c55e" },
        { label: "Partial", value: 10, color: "#f59e0b" },
        { label: "Non-Conforming", value: 5, color: "#ef4444" }
      ]
    }
  },
  {
    id: "audit_team",
    name: "Audit Team",
    description: "List of audit team members and their roles",
    category: "audit",
    compatible_widgets: ["table"],
    requires_entity: true,
    sample_data: {
      columns: ["Name", "Role", "Certification"],
      rows: [
        { name: "John Doe", role: "Lead Auditor", certification: "CISA" },
        { name: "Jane Smith", role: "Auditor", certification: "ISO 27001 LA" }
      ]
    }
  },
  {
    id: "custom_table",
    name: "Custom Table",
    description: "Create your own table with custom columns",
    category: "custom",
    compatible_widgets: ["table"],
    requires_entity: false,
    sample_data: {
      columns: ["Column 1", "Column 2"],
      rows: []
    }
  },
  {
    id: "custom_chart",
    name: "Custom Chart Data",
    description: "Create your own pie chart with custom values",
    category: "custom",
    compatible_widgets: ["pie_chart"],
    requires_entity: false,
    sample_data: {
      pie_chart: [
        { label: "Category A", value: 50, color: "#3b82f6" },
        { label: "Category B", value: 50, color: "#f59e0b" }
      ]
    }
  }
];

export const MOCK_FINDINGS: FindingSummary[] = [
  {
    id: "F-001",
    reference_code: "F-2025-001",
    title: "Unauthorized Cloud Storage Usage",
    severity: "high",
    status: "OPEN",
    category_name: "A.12 Operations Security",
    is_selected: true,
    clause_number: "12.3.1",
    clause: "A.12.3.1 Information backup",
    clause_description: "Information backup",
    observation: "Employees are using unsanctioned Dropbox accounts for storing sensitive data.",
    recommendation:
      "Implement a policy to restrict the use of unauthorized cloud storage services and provide approved alternatives.",
    management_response: "Management agrees and will implement the policy by Q2 2025.",
    action_plan:
      "1. Draft policy document\n2. Obtain management approval\n3. Communicate to all staff\n4. Implement technical controls",
    responsible_person: "IT Security Manager",
    due_date: "2025-06-30",
    conformity_status: "NON_CONFORMITY",
    is_conformity: false,
    compliance_status: "Non-Compliant",
    compliance_percentage: 40,
    framework: "ISO27001",
    category: {
      id: "cat-001",
      working_paper_id: "wp-001",
      template_category_id: "tpl-cat-001",
      name: "A.12 Operations Security",
      sort_order: 12,
      organization_id: "org-001",
      clause: "A.12",
      description: "Operations Security controls"
    },
    created_at: "2025-01-10T10:00:00Z",
    updated_at: "2025-01-14T15:30:00Z"
  },
  {
    id: "F-002",
    reference_code: "F-2025-002",
    title: "Weak Password Rotation Policy",
    severity: "medium",
    status: "IN_PROGRESS",
    category_name: "A.9 Access Control",
    is_selected: true,
    clause_number: "9.2.1",
    clause: "A.9.2.1 User registration and de-registration",
    clause_description: "User registration and de-registration",
    observation: "Password complexity is adequate, but rotation intervals are not enforced.",
    recommendation: "Implement automated password expiration and rotation policies.",
    management_response: "In progress - technical implementation underway.",
    action_plan: "Configure Active Directory password policies to enforce 90-day rotation.",
    responsible_person: "System Administrator",
    due_date: "2025-03-31",
    conformity_status: "CONFORMITY",
    is_conformity: true,
    compliance_status: "Compliant",
    compliance_percentage: 85,
    framework: "ISO27001",
    category: {
      id: "cat-002",
      working_paper_id: "wp-001",
      template_category_id: "tpl-cat-002",
      name: "A.9 Access Control",
      sort_order: 9,
      organization_id: "org-001",
      clause: "A.9",
      description: "Access Control requirements"
    },
    created_at: "2025-01-11T09:00:00Z",
    updated_at: "2025-01-14T14:00:00Z"
  },
  {
    id: "F-003",
    reference_code: "F-2025-003",
    title: "Missing Physical Security Logs",
    severity: "high",
    status: "OPEN",
    category_name: "A.11 Physical and Environmental Security",
    is_selected: false,
    clause_number: "11.1.2",
    clause: "A.11.1.2 Physical entry controls",
    clause_description: "Physical entry controls",
    observation: "Server room access logs are not maintained for the secondary data center.",
    recommendation: "Implement access logging system for all data center facilities.",
    management_response: "Management acknowledges the finding and will address it urgently.",
    action_plan:
      "1. Procure access control system\n2. Install and configure\n3. Train security personnel",
    responsible_person: "Facilities Manager",
    due_date: "2025-05-31",
    conformity_status: "NON_CONFORMITY",
    is_conformity: false,
    compliance_status: "Non-Compliant",
    compliance_percentage: 20,
    framework: "ISO27001",
    category: {
      id: "cat-003",
      working_paper_id: "wp-001",
      template_category_id: "tpl-cat-003",
      name: "A.11 Physical and Environmental Security",
      sort_order: 11,
      organization_id: "org-001",
      clause: "A.11",
      description: "Physical and Environmental Security controls"
    },
    created_at: "2025-01-12T11:00:00Z",
    updated_at: "2025-01-14T16:00:00Z"
  },
  {
    id: "F-004",
    reference_code: "F-2025-004",
    title: "Documented Termination Process",
    severity: "low",
    status: "CLOSED",
    category_name: "A.7 Human Resource Security",
    is_selected: true,
    clause_number: "7.2.2",
    clause: "A.7.2.2 Termination and change of employment",
    clause_description: "Termination and change of employment",
    observation: "The organization has a well-defined and executed exit procedure for employees.",
    recommendation: "Continue current practices and conduct annual reviews.",
    management_response: "Acknowledged. Will maintain current standards.",
    action_plan: "No action required - maintain current process.",
    responsible_person: "HR Manager",
    due_date: null,
    conformity_status: "CONFORMITY",
    is_conformity: true,
    compliance_status: "Compliant",
    compliance_percentage: 100,
    framework: "ISO27001",
    category: {
      id: "cat-004",
      working_paper_id: "wp-001",
      template_category_id: "tpl-cat-004",
      name: "A.7 Human Resource Security",
      sort_order: 7,
      organization_id: "org-001",
      clause: "A.7",
      description: "Human Resource Security controls"
    },
    created_at: "2025-01-09T14:00:00Z",
    updated_at: "2025-01-13T10:00:00Z"
  },
  {
    id: "F-005",
    reference_code: "F-2025-005",
    title: "Incomplete Asset Inventory",
    severity: "medium",
    status: "OPEN",
    category_name: "A.8 Asset Management",
    is_selected: false,
    clause_number: "8.1.1",
    clause: "A.8.1.1 Inventory of assets",
    clause_description: "Inventory of assets",
    observation: "Software assets are not consistently tracked in the central inventory.",
    recommendation: "Implement automated asset discovery and inventory management system.",
    management_response: "Management agrees. Budget approved for asset management tool.",
    action_plan:
      "1. Evaluate asset management solutions\n2. Procure and deploy\n3. Conduct full asset audit",
    responsible_person: "IT Asset Manager",
    due_date: "2025-07-31",
    conformity_status: "PARTIAL_CONFORMITY",
    is_conformity: false,
    compliance_status: "Partially Compliant",
    compliance_percentage: 60,
    framework: "ISO27001",
    category: {
      id: "cat-005",
      working_paper_id: "wp-001",
      template_category_id: "tpl-cat-005",
      name: "A.8 Asset Management",
      sort_order: 8,
      organization_id: "org-001",
      clause: "A.8",
      description: "Asset Management controls"
    },
    created_at: "2025-01-13T08:00:00Z",
    updated_at: "2025-01-14T12:00:00Z"
  }
];
