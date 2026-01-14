# Report Generation Module - Schema Design

## Overview

This document describes the database schema and JSON structure for a flexible, multi-tenant report generation system. The design supports dynamic report sections with embedded widgets (tables and charts) that can vary by organization.

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│  reports                                                                │
│  ├── report_id (PK, UUID)                                              │
│  ├── organization_id (FK, UUID)                                        │
│  ├── report_type (VARCHAR) ← "iso_audit", "risk", "internal_audit"...  │
│  └── report (JSONB) ← sections, metadata, branding, widget instances   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  widgets (lookup table - 2 rows)                                │
│  ├── widget_id (PK, UUID)                                              │
│  └── widget_type (VARCHAR) ← "table" or "pie_chart"                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  widget_data (metadata - exactly 2 rows, one per widget type)           │
│  ├── id (PK, UUID)                                                     │
│  ├── widget_id (FK, UUID)                                              │
│  └── data (JSONB) ← name, description, icon, default styling, schema   │
└─────────────────────────────────────────────────────────────────────────┘
```

## JSON Structures

### Report Object

The `report` JSONB column contains the full report structure including metadata, branding, sections, and **widget instances with their data embedded**.

```json
{
  "report_id": "b3f2c9a4-7e21-4d0b-9b91-5f3e7d8c6a11",
  "organization_id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "report_type": "iso_audit",
  "report": {
    "title": "Internal Audit Assessment Report",
    "version": "1.0",
    "created_at": "2024-07-12",
    "branding": {
      "primary_color": "#1a365d",
      "secondary_color": "#2563eb",
      "font_family": "Arial"
    },
    "sections": [
      {
        "section_id": "cover page",
        "order": 1,
        "content": {
          "report_title": "Internal Audit Assessment Report",
          "report_date": "2024-07-12",
          "organization": {
            "name": "INFRATEL Corporation",
            "logo_url": "https://example.com/logo.png",
            "tagline": "A member of the IDC Group"
          },
          "author": {
            "name": "Alex M. Maka",
            "certification": "CISA"
          }
        },
        "widgets": []
      },
      {
        "section_id": "executive_summary",
        "order": 2,
        "header": "Executive Summary",
        "sub_header": "Summary",
        "content": "The audit assessed the Information Security Management System (ISMS) against ISO/IEC 27001:2022. The organization demonstrates overall conformity, with minor non-conformities noted.",
        "widgets": [
          {
            "instance_id": "a1b2c3d4-1111-2222-3333-444455556666",
            "widget_type": "table",
            "order": 1,
            "data": {
              "title": "Non-Conformity Findings",
              "columns": [
                { "key": "reference", "header": "Reference" },
                { "key": "control", "header": "Control Ref" },
                { "key": "observation", "header": "Observation" },
                { "key": "recommendation", "header": "Recommendation" },
                { "key": "status", "header": "Status" }
              ],
              "rows": [
                {
                  "reference": "C.1.1",
                  "control": "A.6.3",
                  "observation": "ISMS awareness training has not been formally documented.",
                  "recommendation": "Develop and implement a formal ISMS awareness and training program.",
                  "status": "Open"
                },
                {
                  "reference": "C.1.2",
                  "control": "A.7.1",
                  "observation": "Asset classification scheme is not consistently applied.",
                  "recommendation": "Define, approve, and enforce an asset classification policy.",
                  "status": "Closed"
                }
              ]
            }
          },
          {
            "instance_id": "b2c3d4e5-2222-3333-4444-555566667777",
            "widget_type": "pie_chart",
            "order": 2,
            "data": {
              "title": "SOA Conformity Status",
              "slices": [
                { "label": "Conforming", "value": 89, "color": "#10b981" },
                { "label": "Minor NC", "value": 3, "color": "#f59e0b" },
                { "label": "Not Applicable", "value": 1, "color": "#6b7280" }
              ]
            }
          }
        ]
      },
      {
        "section_id": "conclusion",
        "order": 3,
        "header": "Conclusion",
        "sub_header": "Recommendations",
        "content": "Within the scope of ISO/IEC 27001:2022, the organization has implemented an effective ISMS framework. Continued improvement is recommended to address identified minor non-conformities.",
        "widgets": []
      }
    ]
  }
}
```

---

## Predefined Widgets (Lookup Table)

The `widgets` table contains exactly 2 rows - one for each supported widget type.

```json
[
  {
    "widget_id": "e6a7d2f1-9c44-4b62-8e71-2a5f9c7d8b33",
    "widget_type": "table"
  },
  {
    "widget_id": "f9b2c7e4-1d6a-4e93-b6f5-8a2d9c3e7f44",
    "widget_type": "pie_chart"
  }
]
```

---

## Widget Metadata

The `widget_data` table contains exactly 2 rows - metadata and default configuration for each predefined widget type.

### Table Widget Metadata

```json
{
  "id": "d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a",
  "widget_id": "e6a7d2f1-9c44-4b62-8e71-2a5f9c7d8b33",
  "data": {
    "name": "Table",
    "description": "Display data in rows and columns",
    "icon": "table",
    "default_styling": {
      "header_bg_color": "#1a365d",
      "header_text_color": "#ffffff",
      "border_color": "#e2e8f0",
      "striped_rows": true
    },
    "config_schema": {
      "required_fields": ["title", "columns", "rows"],
      "column_schema": {
        "key": "string",
        "header": "string"
      },
      "row_schema": "dynamic"
    }
  }
}
```

### Pie Chart Widget Metadata

```json
{
  "id": "a9b8c7d6-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "widget_id": "f9b2c7e4-1d6a-4e93-b6f5-8a2d9c3e7f44",
  "data": {
    "name": "Pie Chart",
    "description": "Display data as proportional slices",
    "icon": "pie-chart",
    "default_styling": {
      "show_legend": true,
      "show_labels": true,
      "donut": false,
      "donut_thickness": 60
    },
    "config_schema": {
      "required_fields": ["title", "slices"],
      "slice_schema": {
        "label": "string",
        "value": "number",
        "color": "string (hex)"
      }
    }
  }
}
```

---

## Section Types

| Type | Description |
|------|-------------|
| `cover_page` | Title page with organization info, author, date |
| `text_only` | Section with header, subheader, and text content |
| `text_with_widgets` | Section with text content plus embedded widgets |

---

## Widget Types (Predefined)

| Type | Description | Data Structure |
|------|-------------|----------------|
| `table` | Tabular data display | `title`, `columns[]`, `rows[]` |
| `pie_chart` | Pie/donut chart | `title`, `slices[]` (label, value, color) |

---

## Frontend Rendering Flow

1. **Fetch widget metadata** (once, on app load) → get available widget types with their icons, names, default styling
2. **Fetch report** → get sections with embedded widget instances
3. **Render sections** → for each section, render its widgets based on `widget_type`:
   - `table` → `<DataTable columns={data.columns} rows={data.rows} />`
   - `pie_chart` → `<PieChart title={data.title} slices={data.slices} />`

---

## SQL Schema Definition

```sql
-- Reports table
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    report JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_reports_organization ON reports(organization_id);
CREATE INDEX idx_reports_type ON reports(report_type);

-- Widgets table (lookup - only 2 rows)
CREATE TABLE widgets (
    widget_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_type VARCHAR(20) NOT NULL UNIQUE CHECK (widget_type IN ('table', 'pie_chart')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Widget metadata table (only 2 rows)
CREATE TABLE widget_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_id UUID NOT NULL UNIQUE REFERENCES widgets(widget_id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed the predefined widgets
INSERT INTO widgets (widget_id, widget_type) VALUES
    ('e6a7d2f1-9c44-4b62-8e71-2a5f9c7d8b33', 'table'),
    ('f9b2c7e4-1d6a-4e93-b6f5-8a2d9c3e7f44', 'pie_chart');

-- Seed widget metadata
INSERT INTO widget_data (id, widget_id, data) VALUES
    ('d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 'e6a7d2f1-9c44-4b62-8e71-2a5f9c7d8b33', '{
        "name": "Table",
        "description": "Display data in rows and columns",
        "icon": "table",
        "default_styling": {
            "header_bg_color": "#1a365d",
            "header_text_color": "#ffffff",
            "border_color": "#e2e8f0",
            "striped_rows": true
        }
    }'),
    ('a9b8c7d6-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 'f9b2c7e4-1d6a-4e93-b6f5-8a2d9c3e7f44', '{
        "name": "Pie Chart",
        "description": "Display data as proportional slices",
        "icon": "pie-chart",
        "default_styling": {
            "show_legend": true,
            "show_labels": true,
            "donut": false
        }
    }');
```

---

## Report Types Supported

| Report Type | Description |
|-------------|-------------|
| `iso_audit` | ISO 27001 Compliance Audit Report |
| `internal_audit` | Internal Audit Report (4C Framework) |
| `risk` | Risk Assessment Report |
| `followup` | Audit Follow-up Log Report |

---

## Design Benefits

- **Flexibility** - Report structure is not fixed; sections can be added/removed without schema migrations
- **Multi-tenant** - Each organization can have custom branding and report configurations
- **Predefined Widgets** - Widget types are controlled (only table and pie_chart), but their data is dynamic
- **Self-contained Reports** - All widget instance data lives in the report JSON, no joins needed to render
- **Widget Metadata Centralized** - Default styling, icons, and schemas stored once in widget_data table
- **Frontend Friendly** - Clear contract between backend JSON and frontend components
