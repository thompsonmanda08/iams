# Backend API Specification for Reports System

This document provides comprehensive sample response objects that the backend should return for the Reports system.

## Table of Contents

1. [Report Content Structure](#report-content-structure)
2. [Findings Data](#findings-data)
3. [Data Sources](#data-sources)
4. [Section Types](#section-types)
5. [API Endpoints](#api-endpoints)

---

## 1. Report Content Structure

### GET `/api/reports/:reportId`

**Response: ReportContent**

```json
{
  "report_id": "rep-2025-001",
  "organization_id": "org-001",
  "report_type": "compliance_audit",
  "title": "ISO 27001 Internal Audit Report",
  "version": "1.0",
  "created_at": "2025-01-14T10:00:00Z",
  "updated_at": "2025-01-14T15:30:00Z",
  "management_standard": "ISO 27001",
  "branding": {
    "primary_color": "#1a365d",
    "secondary_color": "#2563eb",
    "font_family": "Inter"
  },
  "sections": [
    // See Section Types below
  ]
}
```

**Field Descriptions:**

- `report_id`: Unique identifier for the report
- `organization_id`: Organization this report belongs to
- `report_type`: One of: "general_audit" | "compliance_audit" | "risk" | "followup"
- `management_standard`: Template name: "General" | "ISO 27001" | "Risk Assessment" | "Follow-up"
- `branding`: Visual styling for the report
- `sections`: Array of report sections (see below)

---

## 2. Findings Data

### GET `/api/findings?audit_plan_id={id}`

**Response: FindingSummary[]**

```json
[
  {
    "id": "F-001",
    "reference_code": "F-2025-001",
    "title": "Unauthorized Cloud Storage Usage",
    "severity": "high",
    "status": "OPEN",
    "category_name": "A.12 Operations Security",
    "is_selected": false,
    "clause": "12.3.1",
    "finding_type": "Minor Non-Conformity",
    "observation": "Employees are using unsanctioned Dropbox accounts for storing sensitive data."
  },
  {
    "id": "F-002",
    "reference_code": "F-2025-002",
    "title": "Weak Password Rotation Policy",
    "severity": "medium",
    "status": "IN_PROGRESS",
    "category_name": "A.9 Access Control",
    "is_selected": false,
    "clause": "9.2.1",
    "finding_type": "Conformity",
```

    "observation": "Password complexity is adequate, but rotation intervals are not enforced."

},
{
"id": "F-003",
"reference_code": "F-2025-003",
"title": "Missing Physical Security Logs",
"severity": "high",
"status": "OPEN",
"category_name": "A.11 Physical and Environmental Security",
"is_selected": false,
"clause": "11.1.2",
"finding_type": "Major Non-Conformity",
"observation": "Server room access logs are not maintained for the secondary data center."
}
]

```

**Field Descriptions:**
- `id`: Unique finding identifier
- `reference_code`: Human-readable reference (e.g., F-2025-001)
- `title`: Finding title/summary
- `severity`: "critical" | "high" | "medium" | "low"
- `status`: Finding status (e.g., "OPEN", "IN_PROGRESS", "CLOSED")
- `category_name`: ISO clause or category (e.g., "A.9 Access Control")
- `is_selected`: Whether finding is selected in report (managed by frontend)
- `clause`: Specific clause number (e.g., "9.2.1")
- `finding_type`: "Conformity" | "Minor Non-Conformity" | "Major Non-Conformity" | "OFI"
- `observation`: Detailed observation text

---

## 3. Data Sources

### GET `/api/data-sources`
```

**Response: DataSource[]**

```json
[
  {
    "id": "findings_severity",
    "name": "Findings by Severity",
    "description": "Distribution of audit findings by severity level",
    "category": "audit",
    "compatible_widgets": ["pie_chart", "table"],
    "requires_entity": true,
    "sample_data": {
      "pie_chart": [
        { "label": "High", "value": 2, "color": "#ef4444" },
        { "label": "Medium", "value": 3, "color": "#f59e0b" },
        { "label": "Low", "value": 1, "color": "#22c55e" }
      ],
      "table": {
        "columns": ["Severity", "Count", "Percentage"],
        "rows": [
          { "severity": "High", "count": 2, "percentage": "33%" },
          { "severity": "Medium", "count": 3, "percentage": "50%" },
          { "severity": "Low", "count": 1, "percentage": "17%" }
        ]
      }
    }
  },
  {
    "id": "control_compliance",
    "name": "Control Compliance Status",
    "description": "Compliance status of controls against framework",
    "category": "compliance",
    "compatible_widgets": ["pie_chart", "table"],
    "requires_entity": false,
    "sample_data": {
      "pie_chart": [
        { "label": "Conforming", "value": 85, "color": "#22c55e" },
        { "label": "Partial", "value": 10, "color": "#f59e0b" },
```

        { "label": "Non-Conforming", "value": 5, "color": "#ef4444" }
      ]
    }

}
]

````

**Field Descriptions:**
- `id`: Unique data source identifier
- `name`: Display name
- `description`: What this data source provides
- `category`: "audit" | "risk" | "compliance" | "custom"
- `compatible_widgets`: Array of widget types that can use this data
- `requires_entity`: Whether this needs an entity_id (audit plan, risk register)
- `sample_data`: Sample data structure for preview/testing

---

## 4. Section Types

### 4.1 Cover Page Section

```json
{
  "section_id": "sec-cover-001",
  "section_type": "cover_page",
  "order": 0,
  "header": "Cover Page",
  "sub_header": "",
  "include_in_toc": false,
  "toc_level": 1,
  "content": "{\"report_title\":\"Internal Audit Report\",\"report_date\":\"January 2025\",\"organization\":{\"name\":\"INFRATEL Corporation\",\"tagline\":\"A member of the IDC Group\",\"logo_url\":\"/images/logo.png\"},\"author\":{\"name\":\"Mwenya S. Zulu\",\"certification\":\"CISA\",\"title\":\"Head of Internal Audit\"}}",
  "widgets": []
}
````

**Content Structure (JSON string):**

```json
{
  "report_title": "Internal Audit Assessment Report",
  "report_date": "January 2025",
  "organization": {
    "name": "INFRATEL Corporation",
    "tagline": "A member of the IDC Group of Companies",
    "logo_url": "/images/infratel-logo.png"
  },
  "author": {
    "name": "Mwenya S. Zulu",
    "certification": "CISA",
    "title": "Head of Internal Audit & Risk"
  }
}
```

### 4.2 Text Only Section

```json
{
  "section_id": "sec-intro-001",
  "section_type": "text_only",
  "order": 1,
  "header": "Executive Summary",
  "sub_header": "Overview",
  "include_in_toc": true,
  "toc_level": 1,
  "content": "The audit assessed the Information Security Management System (ISMS) against ISO/IEC 27001:2022. The organization demonstrates overall conformity, with minor non-conformities noted.",
  "widgets": []
}
```

### 4.3 Text with Widgets Section

```json
{
  "section_id": "sec-charts-001",
  "section_type": "text_with_widgets",
  "order": 2,
  "header": "Audit Ratings",
  "sub_header": "Risk Distribution",
  "include_in_toc": true,
  "toc_level": 1,
```

"content": "The following chart illustrates the distribution of risk ratings across the identified findings.",
"widgets": [
{
"instance_id": "widget-001",
"widget_type": "pie_chart",
"order": 0,
"data": {
"title": "Findings by Severity",
"slices": [
{ "label": "High", "value": 2, "color": "#ef4444" },
{ "label": "Medium", "value": 5, "color": "#f59e0b" },
{ "label": "Low", "value": 8, "color": "#10b981" }
]
}
},
{
"instance_id": "widget-002",
"widget_type": "table",
"order": 1,
"data": {
"title": "Audit Team",
"columns": [
{ "key": "name", "header": "Name" },
{ "key": "role", "header": "Role" },
{ "key": "certification", "header": "Certification" }
],
"rows": [
{ "name": "John Doe", "role": "Lead Auditor", "certification": "CISA" },
{ "name": "Jane Smith", "role": "Auditor", "certification": "ISO 27001 LA" }
],
"is_configurable": true
}
}
]
}

````

### 4.4 Findings Selector Section

```json
{
  "section_id": "sec-findings-001",
  "section_type": "findings_selector",
````

"order": 3,
"header": "Detailed Findings",
"sub_header": "Audit Observations",
"include_in_toc": true,
"toc_level": 1,
"content": "",
"selected_finding_ids": ["F-001", "F-002", "F-004"],
"widgets": [
{
"instance_id": "widget-findings-table",
"widget_type": "table",
"order": 0,
"data": {
"title": "Audit Findings",
"columns": [
{ "key": "reference", "header": "Reference" },
{ "key": "title", "header": "Finding" },
{ "key": "severity", "header": "Severity" },
{ "key": "status", "header": "Status" }
],
"rows": [],
"is_configurable": true,
"data_source_id": "findings_list"
}
}
]
}

````

**Note:** The `selected_finding_ids` array contains IDs of findings selected for this report. The frontend will:
1. Display a findings selector UI
2. Auto-generate separate tables for each finding_type (Conformity, Minor Non-Conformity, etc.)
3. Populate widget tables with selected findings data

### 4.5 Compliance Findings Section

```json
{
  "section_id": "sec-compliance-001",
  "section_type": "compliance_findings",
  "order": 4,
  "header": "Compliance Findings",
````

"sub_header": "Conformities & Non-Conformities",
"include_in_toc": true,
"toc_level": 1,
"content": "",
"selected_finding_ids": ["F-001", "F-002", "F-003"],
"widgets": []
}

````

**Note:** Similar to findings_selector but specifically for compliance audits. Auto-generates styled tables by finding_type.

### 4.6 Dynamic Form Section

```json
{
  "section_id": "sec-dynamic-001",
  "section_type": "dynamic_form",
  "order": 5,
  "header": "Audit Details",
  "sub_header": "Additional Information",
  "include_in_toc": true,
  "toc_level": 1,
  "content": "",
  "fields": [
    {
      "id": "audit_date",
      "name": "audit_date",
      "label": "Audit Date",
      "type": "date",
      "required": true,
      "defaultValue": "2025-01-14"
    },
    {
      "id": "audit_scope",
      "name": "audit_scope",
      "label": "Audit Scope",
      "type": "textarea",
      "required": true,
      "placeholder": "Describe the audit scope...",
      "helperText": "Include departments, processes, and systems covered"
    },
    {
      "id": "audit_type",
      "name": "audit_type",
````

      "label": "Audit Type",
      "type": "select",
      "required": true,
      "options": [
        { "label": "Internal Audit", "value": "internal" },
        { "label": "External Audit", "value": "external" },
        { "label": "Compliance Audit", "value": "compliance" }
      ]
    },
    {
      "id": "is_certified",
      "name": "is_certified",
      "label": "Certification Audit",
      "type": "checkbox",
      "required": false,
      "defaultValue": false
    }

],
"field_values": {
"audit_date": "2025-01-14",
"audit_scope": "Financial Systems and Access Controls",
"audit_type": "internal",
"is_certified": false
},
"widgets": []
}

```

**Field Types Available:**
- `text`: Single-line text input
- `textarea`: Multi-line text input
- `date`: Date picker
- `select`: Dropdown selection
- `checkbox`: Boolean checkbox
- `radio`: Radio button group
- `number`: Numeric input

---

## 5. API Endpoints

### 5.1 Get Report

**Endpoint:** `GET /api/reports/:reportId`

**Response:**
```

```json
{
  "success": true,
  "data": {
    // ReportContent object (see section 1)
  }
}
```

### 5.2 Get Findings

**Endpoint:** `GET /api/findings?audit_plan_id={id}`

**Query Parameters:**

- `audit_plan_id` (optional): Filter findings by audit plan

**Response:**

```json
{
  "success": true,
  "data": [
    // Array of FindingSummary objects (see section 2)
  ]
}
```

### 5.3 Get Data Sources

**Endpoint:** `GET /api/data-sources`

**Response:**

```json
{
  "success": true,
  "data": [
    // Array of DataSource objects (see section 3)
  ]
}
```

### 5.4 Save Report

**Endpoint:** `POST /api/reports/:reportId`

**Request Body:**

```json
{
  // Complete ReportContent object
}
```

**Response:**

```json
{
  "success": true,
  "message": "Report saved successfully",
  "data": {
    "report_id": "rep-2025-001",
    "updated_at": "2025-01-14T16:00:00Z"
  }
}
```

### 5.5 Create New Report

**Endpoint:** `POST /api/reports`

**Request Body:**

```json
{
  "organization_id": "org-001",
  "report_type": "compliance_audit",
  "title": "Q1 2025 ISO Audit",
  "management_standard": "ISO 27001"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    // Complete ReportContent object with default sections
  }
}
```

### 5.6 Delete Report

**Endpoint:** `DELETE /api/reports/:reportId`

**Response:**

```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

## 6. Complete Example: ISO 27001 Compliance Report

Here's a complete example of what the backend should return for an ISO 27001 compliance audit report:

```json
{
  "report_id": "rep-2025-iso-001",
  "organization_id": "org-001",
  "report_type": "compliance_audit",
  "title": "ISO 27001:2022 Internal Audit Report",
  "version": "1.0",
  "created_at": "2025-01-14T10:00:00Z",
  "updated_at": "2025-01-14T15:30:00Z",
  "management_standard": "ISO 27001",
  "branding": {
    "primary_color": "#1a365d",
    "secondary_color": "#2563eb",
    "font_family": "Inter"
  },
```

"sections": [
{
"section_id": "sec-cover",
"section_type": "cover_page",
"order": 0,
"header": "Cover Page",
"include_in_toc": false,
"toc_level": 1,
"content": "{\"report_title\":\"ISO 27001:2022 Internal Audit Report\",\"report_date\":\"January 2025\",\"organization\":{\"name\":\"INFRATEL Corporation\",\"tagline\":\"A member of the IDC Group of Companies\",\"logo_url\":\"/images/infratel-logo.png\"},\"author\":{\"name\":\"Mwenya S. Zulu\",\"certification\":\"CISA\",\"title\":\"Head of Internal Audit & Risk\"}}",
"widgets": []
},
{
"section_id": "sec-exec",
"section_type": "text_only",
"order": 1,
"header": "Executive Summary",
"sub_header": "Compliance Status",
"include_in_toc": true,
"toc_level": 1,
"content": "The audit assessed the Information Security Management System (ISMS) against ISO/IEC 27001:2022. The organization demonstrates overall conformity, with minor non-conformities noted in access control and operations security.",
"widgets": []
},
{
"section_id": "sec-scope",
"section_type": "text_only",
"order": 2,
"header": "Audit Scope",
"sub_header": "ISMS Scope",
"include_in_toc": true,
"toc_level": 1,
"content": "The audit covered all ISMS processes within the organization for the period Q4 2024.",
"widgets": []
},
{
"section_id": "sec-compliance-overview",
"section_type": "text_with_widgets",
"order": 3,
"header": "Compliance Overview",
"sub_header": "Dashboard",
"include_in_toc": true,
"toc_level": 1,
"content": "Overall compliance status across all ISO 27001 controls.",
"widgets": [
{
"instance_id": "widget-compliance-chart",
"widget_type": "pie_chart",
"order": 0,
"data": {
"title": "Control Compliance Status",
"data_source_id": "control_compliance",
"slices": [
{ "label": "Conforming", "value": 85, "color": "#22c55e" },
{ "label": "Partial", "value": 10, "color": "#f59e0b" },
{ "label": "Non-Conforming", "value": 5, "color": "#ef4444" }
]
}
}
]
},
{
"section_id": "sec-findings",
"section_type": "compliance_findings",
"order": 4,
"header": "Compliance Findings",
"sub_header": "Conformities & Non-Conformities",
"include_in_toc": true,
"toc_level": 1,
"content": "",
"selected_finding_ids": ["F-001", "F-002", "F-003", "F-004"],
"widgets": []
},
{
"section_id": "sec-recommendations",
"section_type": "text_only",
"order": 5,
      "header": "Recommendations",
      "sub_header": "Corrective Actions",
      "include_in_toc": true,
      "toc_level": 1,
      "content": "Management should address identified non-conformities within the committed timelines. A follow-up audit is scheduled for Q2 2025.",
      "widgets": []
    }
  ]
}
```

---

## 7. Widget Data Structures

### 7.1 Pie Chart Widget

```json
{
  "instance_id": "widget-pie-001",
  "widget_type": "pie_chart",
  "order": 0,
  "data": {
    "title": "Risk Distribution",
    "slices": [
      { "label": "Critical", "value": 2, "color": "#7c3aed" },
      { "label": "High", "value": 5, "color": "#ef4444" },
      { "label": "Medium", "value": 8, "color": "#f59e0b" },
      { "label": "Low", "value": 3, "color": "#22c55e" }
    ],
    "data_source_id": "risks_by_rating"
  }
}
```

### 7.2 Table Widget

```json
{
  "instance_id": "widget-table-001",
  "widget_type": "table",
  "order": 0,
  "data": {
    "title": "Audit Team Members",
    "columns": [
      { "key": "name", "header": "Name", "width": "30%" },
      { "key": "role", "header": "Role", "width": "40%" },
      { "key": "certification", "header": "Certification", "width": "30%" }
    ],
    "rows": [
      { "name": "John Doe", "role": "Lead Auditor", "certification": "CISA" },
      { "name": "Jane Smith", "role": "Auditor", "certification": "ISO 27001 LA" },
      { "name": "Bob Johnson", "role": "Technical Specialist", "certification": "CISSP" }
    ],
    "is_configurable": true,
    "data_source_id": "audit_team"
  }
}
```

**Note:** 
- If `data_source_id` is present, the widget is connected to a dynamic data source
- If `is_configurable` is true, users can add/edit columns and rows
- `width` in columns is optional

---

## 8. Important Notes for Backend Implementation

### 8.1 Section Ordering
- Sections should be ordered by the `order` field
- Frontend will display sections in ascending order
- Order values don't need to be sequential (0, 1, 2... or 10, 20, 30... both work)

### 8.2 Finding Selection
- `selected_finding_ids` in findings_selector/compliance_findings sections
- Frontend manages selection state but backend should persist it
- When findings are selected, frontend auto-generates tables by `finding_type`

### 8.3 Widget Data Sources
- If `data_source_id` is present, widget data comes from that source
- Backend should populate widget data based on the data source
- For findings_list data source, populate with actual findings data

### 8.4 Cover Page Content
- Stored as JSON string in `content` field
- Must be valid JSON that can be parsed
- Should include organization logo URL from session/database

### 8.5 Dynamic Form Fields
- `fields` array defines the form schema
- `field_values` object stores user input (key = field.id, value = user input)
- Backend should validate field values against field schema

### 8.6 Table of Contents
- Generated automatically by frontend based on:
  - `include_in_toc`: Whether section appears in TOC
  - `toc_level`: Indentation level (1, 2, or 3)
  - `order`: Display order

### 8.7 Branding
- Colors should be valid hex codes
- Font family should be web-safe or available font
- Frontend applies branding to report preview/export

---

## 9. Database Schema Recommendations

### 9.1 Reports Table
```sql
CREATE TABLE reports (
  report_id VARCHAR(50) PRIMARY KEY,
  organization_id VARCHAR(50) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  version VARCHAR(20),
  management_standard VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  branding_primary_color VARCHAR(7),
  branding_secondary_color VARCHAR(7),
  branding_font_family VARCHAR(50),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

### 9.2 Report Sections Table
```sql
CREATE TABLE report_sections (
  section_id VARCHAR(50) PRIMARY KEY,
  report_id VARCHAR(50) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  order_index INT NOT NULL,
  header VARCHAR(255) NOT NULL,
  sub_header VARCHAR(255),
  content TEXT,
  include_in_toc BOOLEAN DEFAULT TRUE,
  toc_level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE
);
```

### 9.3 Report Widgets Table
```sql
CREATE TABLE report_widgets (
  instance_id VARCHAR(50) PRIMARY KEY,
  section_id VARCHAR(50) NOT NULL,
  widget_type VARCHAR(20) NOT NULL,
  order_index INT NOT NULL,
  widget_data JSON NOT NULL,
  FOREIGN KEY (section_id) REFERENCES report_sections(section_id) ON DELETE CASCADE
);
```

### 9.4 Report Findings Table (Junction)
```sql
CREATE TABLE report_findings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id VARCHAR(50) NOT NULL,
  finding_id VARCHAR(50) NOT NULL,
  FOREIGN KEY (section_id) REFERENCES report_sections(section_id) ON DELETE CASCADE,
  FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
  UNIQUE KEY unique_section_finding (section_id, finding_id)
);
```

---

## 10. Summary

This specification provides all the data structures needed for the backend to support the Reports system. Key points:

1. **Three main endpoints**: Get report, get findings, get data sources
2. **Six section types**: cover_page, text_only, text_with_widgets, findings_selector, compliance_findings, dynamic_form
3. **Two widget types**: pie_chart, table
4. **Findings with metadata**: Include clause, finding_type, observation for compliance audits
5. **Auto-generated tables**: Frontend creates tables by finding_type automatically
6. **Flexible data sources**: Widgets can connect to dynamic data sources
7. **Persistent state**: Backend should save section order, selected findings, widget configurations

The frontend handles:
- Report editing and section management
- Findings selection and grouping
- Widget configuration
- Auto-generating compliance tables
- Table of contents generation
- Report preview and export

The backend should:
- Store and retrieve report data
- Provide findings data with all metadata
- Populate widget data from data sources
- Validate and persist user changes
- Handle report versioning and history
