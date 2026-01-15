# Data Sources - Complete Guide for Backend Developers

> **Single source of truth for implementing backend data source endpoints**

## Table of Contents

1. [Overview](#overview)
2. [Quick Reference](#quick-reference)
3. [Data Flow](#data-flow)
4. [API Endpoints](#api-endpoints)
5. [Data Source Specifications](#data-source-specifications)
6. [Implementation Guide](#implementation-guide)
7. [Testing](#testing)
8. [Color Standards](#color-standards)

---

## Overview

### What Backend Developers Need to Know

Data sources are the bridge between your database and the frontend widgets. The frontend needs data in **two specific formats**:

1. **Pie Chart Format**: Array of `{ label, value, color }`
2. **Table Format**: Object with `{ columns, rows }`

Your job is to:

- Query the database
- Transform results into one of these two formats
- Return consistent color codes (see [Color Standards](#color-standards))
- Handle errors gracefully

### Key Concepts

- **widget_type** parameter determines response format ("pie_chart" or "table")
- **requires_entity** means the data source needs an ID (audit_plan_id or risk_register_id)
- **category** groups data sources (audit, risk, compliance, custom)
- **compatible_widgets** lists which widget types can use this data source

---

## Quick Reference

### API Endpoints

```
GET /api/data-sources                    # List all available data sources
GET /api/data-sources/:id?widget_type=X  # Get data for specific source
```

### Required Query Parameters

| Parameter          | Required When                    | Example                |
| ------------------ | -------------------------------- | ---------------------- |
| `widget_type`      | Always                           | `pie_chart` or `table` |
| `audit_plan_id`    | Audit category + requires_entity | `ap-001`               |
| `risk_register_id` | Risk category + requires_entity  | `rr-001`               |
| `organization_id`  | Optional                         | `org-001`              |

### Response Formats

**Pie Chart**:

```json
{
  "success": true,
  "data": [{ "label": "High", "value": 2, "color": "#ef4444" }]
}
```

**Table**:

```json
{
  "success": true,
  "data": {
    "columns": [{ "key": "severity", "header": "Severity" }],
    "rows": [{ "severity": "High" }]
  }
}
```

### All Data Sources at a Glance

| ID                     | Name                 | Category   | Requires Entity     | Widgets          |
| ---------------------- | -------------------- | ---------- | ------------------- | ---------------- |
| `findings_severity`    | Findings by Severity | audit      | ✅ audit_plan_id    | pie_chart, table |
| `findings_by_status`   | Findings by Status   | audit      | ✅ audit_plan_id    | pie_chart, table |
| `findings_list`        | Findings List        | audit      | ✅ audit_plan_id    | table            |
| `risks_by_rating`      | Risks by Rating      | risk       | ✅ risk_register_id | pie_chart, table |
| `risks_above_appetite` | Risks Above Appetite | risk       | ✅ risk_register_id | table            |
| `control_compliance`   | Control Compliance   | compliance | ❌                  | pie_chart, table |
| `audit_team`           | Audit Team           | audit      | ✅ audit_plan_id    | table            |
| `custom_table`         | Custom Table         | custom     | ❌                  | table            |
| `custom_chart`         | Custom Chart         | custom     | ❌                  | pie_chart        |

**Note**: `custom_table` and `custom_chart` are frontend-only (no backend implementation needed)

---

## Data Flow

### Complete Flow: User Action → Database → Widget

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USER: Adds widget and clicks "Connect Data Source"                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
```

┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: Data Source Picker shows compatible sources │
│ - Filters by widget type (pie*chart or table) │
│ - User selects "Findings by Severity" │
└─────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ API CALL │
│ GET /api/data-sources/findings_severity │
│ ?audit_plan_id=ap-001 │
│ &widget_type=pie_chart │
└─────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND: API Route Handler │
│ 1. Validate parameters (audit_plan_id required) │
│ 2. Check data source exists │
│ 3. Route to appropriate handler │
└─────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ DATABASE QUERY │
│ SELECT severity, COUNT(*) as count, │
│ ROUND(COUNT(_) _ 100.0 / SUM(COUNT(\_)) OVER(), 0) as percentage │
│ FROM findings WHERE audit_plan_id = 'ap-001' GROUP BY severity │
└─────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND: Transform to Widget Format │
│ return rows.map(row => ({ │
│ label: capitalize(row.severity), │
│ value: row.count, │
│ color: SEVERITY_COLORS[row.severity] │
│ })); │
└─────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ API RESPONSE │
│ { │
│ "success": true, │
│ "data": [ │
│ { "label": "High", "value": 2, "color": "#ef4444" }, │
│ { "label": "Medium", "value": 3, "color": "#f59e0b" } │
│ ] │
│ } │
└─────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: Update Widget & Save Report │
│ - Render pie chart with received data │
│ - Store data_source_id in widget config │
│ - On next load, re-fetch data from data source │
└─────────────────────────────────────────────────────────────────────────┘

```

### Error Handling Flow

```

Missing Parameter → 400 error: "Missing required parameter: audit_plan_id"
Invalid Data Source → 404 error: "Data source not found"
Database Error → 500 error with error message

````

---

## API Endpoints

### 1. List All Data Sources

**Endpoint**: `GET /api/data-sources`

**Description**: Returns list of all available data sources with metadata

**Query Parameters**: None

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "findings_severity",
      "name": "Findings by Severity",
      "description": "Distribution of audit findings by severity level",
      "category": "audit",
      "compatible_widgets": ["pie_chart", "table"],
      "requires_entity": true
    }
  ]
}
````

### 2. Get Data Source Data

**Endpoint**: `GET /api/data-sources/:dataSourceId`

**Description**: Fetches actual data for a specific data source

**Query Parameters**:

- `widget_type` (required): "pie_chart" or "table"
- `audit_plan_id` (conditional): Required if data source category is "audit" and requires_entity is true
- `risk_register_id` (conditional): Required if data source category is "risk" and requires_entity is true
- `organization_id` (optional): Used for organization-wide data sources

**Example Requests**:

```
GET /api/data-sources/findings_severity?audit_plan_id=ap-001&widget_type=pie_chart
GET /api/data-sources/findings_severity?audit_plan_id=ap-001&widget_type=table
GET /api/data-sources/control_compliance?organization_id=org-001&widget_type=pie_chart
```

**Success Response** (pie_chart):

```json
{
  "success": true,
  "data": [
    { "label": "High", "value": 2, "color": "#ef4444" },
    { "label": "Medium", "value": 3, "color": "#f59e0b" }
  ]
}
```

**Success Response** (table):

```json
{
  "success": true,
  "data": {
    "columns": [
      { "key": "severity", "header": "Severity", "width": "40%" },
      { "key": "count", "header": "Count", "width": "30%" }
    ],
    "rows": [
      { "severity": "High", "count": 2 },
      { "severity": "Medium", "count": 3 }
    ]
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Missing required parameter: audit_plan_id"
}
```

---

## Data Source Specifications

### 1. Findings by Severity

**ID**: `findings_severity`
**Category**: audit
**Requires Entity**: ✅ audit_plan_id
**Compatible Widgets**: pie_chart, table

**SQL Query**:

```sql
SELECT
  severity,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as percentage
FROM findings
WHERE audit_plan_id = ?
GROUP BY severity
ORDER BY
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
```

**Pie Chart Response**:

```json
{
  "success": true,
  "data": [
    { "label": "Critical", "value": 1, "color": "#7c3aed" },
    { "label": "High", "value": 2, "color": "#ef4444" },
    { "label": "Medium", "value": 3, "color": "#f59e0b" },
    { "label": "Low", "value": 1, "color": "#22c55e" }
  ]
}
```

**Table Response**:

```json
{
  "success": true,
  "data": {
    "columns": [
      { "key": "severity", "header": "Severity", "width": "40%" },
      { "key": "count", "header": "Count", "width": "30%" },
      { "key": "percentage", "header": "Percentage", "width": "30%" }
    ],
    "rows": [
      { "severity": "Critical", "count": 1, "percentage": "14%" },
      { "severity": "High", "count": 2, "percentage": "29%" },
      { "severity": "Medium", "count": 3, "percentage": "43%" },
      { "severity": "Low", "count": 1, "percentage": "14%" }
    ]
  }
}
```

---

### 2. Findings by Status

**ID**: `findings_by_status`
**Category**: audit
**Requires Entity**: ✅ audit_plan_id
**Compatible Widgets**: pie_chart, table

**SQL Query**:

```sql
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as percentage
FROM findings
WHERE audit_plan_id = ?
GROUP BY status;
```

**Pie Chart Response**:

```json
{
  "success": true,
  "data": [
    { "label": "Open", "value": 3, "color": "#ef4444" },
    { "label": "In Progress", "value": 2, "color": "#3b82f6" },
    { "label": "Resolved", "value": 1, "color": "#10b981" },
    { "label": "Closed", "value": 5, "color": "#22c55e" }
  ]
}
```

**Table Response**:

```json
{
  "success": true,
  "data": {
    "columns": ["Status", "Count", "Percentage"],
    "rows": [
      { "status": "Open", "count": 3, "percentage": "27%" },
      { "status": "In Progress", "count": 2, "percentage": "18%" },
      { "status": "Resolved", "count": 1, "percentage": "9%" },
      { "status": "Closed", "count": 5, "percentage": "46%" }
    ]
  }
}
```

---

### 3. Findings List

**ID**: `findings_list`
**Category**: audit
**Requires Entity**: ✅ audit_plan_id
**Compatible Widgets**: table

**SQL Query**:

```sql
SELECT
  finding_number as reference,
  category_name as title,
  severity,
  status,
  recommendation
FROM findings
WHERE audit_plan_id = ?
ORDER BY created_at DESC;
```

**Table Response**:

```json
{
  "success": true,
  "data": {
    "columns": [
      { "key": "reference", "header": "Reference", "width": "15%" },
      { "key": "title", "header": "Finding", "width": "30%" },
      { "key": "severity", "header": "Severity", "width": "15%" },
      { "key": "status", "header": "Status", "width": "15%" },
      { "key": "recommendation", "header": "Recommendation", "width": "25%" }
    ],
    "rows": [
      {
        "reference": "F-2025-001",
        "title": "Unauthorized Cloud Storage Usage",
        "severity": "high",
        "status": "OPEN",
        "recommendation": "Implement policy to restrict unauthorized cloud storage"
      }
    ]
  }
}
```

---

### 4. Risks by Rating

**ID**: `risks_by_rating`
**Category**: risk
**Requires Entity**: ✅ risk_register_id
**Compatible Widgets**: pie_chart, table

**SQL Query**:

```sql
SELECT
  inherent_risk_rating as rating,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as percentage
FROM risks
WHERE risk_register_id = ?
GROUP BY inherent_risk_rating
ORDER BY
  CASE inherent_risk_rating
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
```

**Pie Chart Response**:

```json
{
  "success": true,
  "data": [
    { "label": "Critical", "value": 2, "color": "#7c3aed" },
    { "label": "High", "value": 5, "color": "#ef4444" },
    { "label": "Medium", "value": 8, "color": "#f59e0b" },
    { "label": "Low", "value": 3, "color": "#22c55e" }
  ]
}
```

**Table Response**:

```json
{
  "success": true,
  "data": {
    "columns": ["Risk Rating", "Count", "Percentage"],
    "rows": [
      { "rating": "Critical", "count": 2, "percentage": "11%" },
      { "rating": "High", "count": 5, "percentage": "28%" },
      { "rating": "Medium", "count": 8, "percentage": "44%" },
      { "rating": "Low", "count": 3, "percentage": "17%" }
    ]
  }
}
```

---

### 5. Risks Above Appetite

**ID**: `risks_above_appetite`
**Category**: risk
**Requires Entity**: ✅ risk_register_id
**Compatible Widgets**: table

**SQL Query**:

```sql
SELECT
  r.title,
  r.category,
  r.residual_risk_score as residual_score,
  r.risk_owner,
  r.treatment_status
FROM risks r
JOIN risk_registers rr ON r.risk_register_id = rr.id
WHERE r.risk_register_id = ?
  AND r.residual_risk_score > rr.risk_appetite_threshold
ORDER BY r.residual_risk_score DESC;
```

**Table Response**:

```json
{
  "success": true,
  "data": {
    "columns": [
      { "key": "title", "header": "Risk Title", "width": "30%" },
      { "key": "category", "header": "Category", "width": "20%" },
      { "key": "residual_score", "header": "Residual Score", "width": "15%" },
      { "key": "risk_owner", "header": "Risk Owner", "width": "20%" },
      { "key": "treatment_status", "header": "Treatment Status", "width": "15%" }
    ],
    "rows": [
      {
        "title": "Data Breach Risk",
        "category": "Information Security",
        "residual_score": "18",
        "risk_owner": "CISO",
        "treatment_status": "In Progress"
      }
    ]
  }
}
```

---

### 6. Control Compliance Status

**ID**: `control_compliance`
**Category**: compliance
**Requires Entity**: ❌ (organization-wide)
**Compatible Widgets**: pie_chart, table

**SQL Query**:

```sql
SELECT
  CASE
    WHEN conformity_status = 'CONFORMITY' THEN 'Conforming'
    WHEN conformity_status = 'PARTIAL_CONFORMITY' THEN 'Minor Non-Conformity'
    WHEN conformity_status = 'NON_CONFORMITY' THEN 'Major Non-Conformity'
  END as status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as percentage
FROM findings
WHERE organization_id = ?
GROUP BY conformity_status;
```

**Pie Chart Response**:

```json
{
  "success": true,
  "data": [
    { "label": "Conforming", "value": 85, "color": "#22c55e" },
    { "label": "Minor Non-Conformity", "value": 10, "color": "#f59e0b" },
    { "label": "Major Non-Conformity", "value": 5, "color": "#ef4444" }
  ]
}
```

**Table Response**:

```json
{
  "success": true,
  "data": {
    "columns": ["Compliance Status", "Count", "Percentage"],
    "rows": [
      { "status": "Conforming", "count": 85, "percentage": "85%" },
      { "status": "Minor Non-Conformity", "count": 10, "percentage": "10%" },
      { "status": "Major Non-Conformity", "count": 5, "percentage": "5%" }
    ]
  }
}
```

---

### 7. Audit Team

**ID**: `audit_team`
**Category**: audit
**Requires Entity**: ✅ audit_plan_id
**Compatible Widgets**: table

**SQL Query**:

```sql
SELECT
  u.full_name as name,
  atm.role,
  u.certifications as certification
FROM audit_team_members atm
JOIN users u ON atm.user_id = u.id
WHERE atm.audit_plan_id = ?
ORDER BY
  CASE atm.role
    WHEN 'Lead Auditor' THEN 1
    WHEN 'Auditor' THEN 2
    ELSE 3
  END,
  u.full_name;
```

**Table Response**:

```json
{
  "success": true,
  "data": {
    "columns": [
      { "key": "name", "header": "Name", "width": "35%" },
      { "key": "role", "header": "Role", "width": "35%" },
      { "key": "certification", "header": "Certification", "width": "30%" }
    ],
    "rows": [
      {
        "name": "John Doe",
        "role": "Lead Auditor",
        "certification": "CISA, CISSP"
      },
      {
        "name": "Jane Smith",
        "role": "Auditor",
        "certification": "ISO 27001 LA"
      }
    ]
  }
}
```

---

### 8. Custom Table

**ID**: `custom_table`
**Category**: custom
**Requires Entity**: ❌
**Compatible Widgets**: table

**Backend Implementation**: None (frontend-only)

Users manually add columns and rows through the UI. Data is stored in the report JSON.

---

### 9. Custom Chart

**ID**: `custom_chart`
**Category**: custom
**Requires Entity**: ❌
**Compatible Widgets**: pie_chart

**Backend Implementation**: None (frontend-only)

Users manually add/edit slices through the UI. Data is stored in the report JSON.

---

## Implementation Guide

### Backend Implementation Steps

**Step 1: Create Data Source Registry**

```typescript
// data-sources-registry.ts
export const DATA_SOURCES = {
  findings_severity: {
    id: "findings_severity",
    name: "Findings by Severity",
    category: "audit",
    requires_entity: true,
    compatible_widgets: ["pie_chart", "table"],
    handler: findingsSeverityHandler
  }
  // ... more data sources
};
```

**Step 2: Create Generic API Route**

```typescript
// app/api/data-sources/[dataSourceId]/route.ts
export async function GET(request: Request, { params }) {
  const { dataSourceId } = params;
  const { searchParams } = new URL(request.url);

  const widgetType = searchParams.get("widget_type");
  const auditPlanId = searchParams.get("audit_plan_id");
  const riskRegisterId = searchParams.get("risk_register_id");
  const organizationId = searchParams.get("organization_id");

  const dataSource = DATA_SOURCES[dataSourceId];

  if (!dataSource) {
    return Response.json({ success: false, error: "Data source not found" }, { status: 404 });
  }

  // Validate required parameters
  if (dataSource.requires_entity && dataSource.category === "audit" && !auditPlanId) {
    return Response.json(
      { success: false, error: "Missing required parameter: audit_plan_id" },
      { status: 400 }
    );
  }

  // Call handler
  try {
    const data = await dataSource.handler({
      widgetType,
      auditPlanId,
      riskRegisterId,
      organizationId
    });

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

**Step 3: Implement Data Source Handlers**

```typescript
// handlers/findings-severity-handler.ts
export async function findingsSeverityHandler(params) {
  const { widgetType, auditPlanId } = params;

  const query = `
    SELECT 
      severity,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as percentage
    FROM findings
    WHERE audit_plan_id = ?
    GROUP BY severity
    ORDER BY
      CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END
  `;

  const rows = await db.query(query, [auditPlanId]);

  if (widgetType === "pie_chart") {
    return transformToPieChart(rows);
  } else if (widgetType === "table") {
    return transformToTable(rows);
  }

  throw new Error("Invalid widget_type");
}

function transformToPieChart(rows) {
  const colorMap = {
    critical: "#7c3aed",
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#22c55e"
  };

  return rows.map((row) => ({
    label: row.severity.charAt(0).toUpperCase() + row.severity.slice(1),
    value: row.count,
    color: colorMap[row.severity]
  }));
}

function transformToTable(rows) {
  return {
    columns: [
      { key: "severity", header: "Severity", width: "40%" },
      { key: "count", header: "Count", width: "30%" },
      { key: "percentage", header: "Percentage", width: "30%" }
    ],
    rows: rows.map((row) => ({
      severity: row.severity.charAt(0).toUpperCase() + row.severity.slice(1),
      count: row.count,
      percentage: `${row.percentage}%`
    }))
  };
}
```

### Frontend Integration

**Step 1: Fetch Available Data Sources**

```typescript
// On page load
useEffect(() => {
  fetch("/api/data-sources")
    .then((res) => res.json())
    .then((data) => setDataSources(data.data));
}, []);
```

**Step 2: Connect Widget to Data Source**

```typescript
// When user selects a data source
const handleDataSourceSelect = async (dataSourceId) => {
  const response = await fetch(
    `/api/data-sources/${dataSourceId}?audit_plan_id=${auditPlanId}&widget_type=${widgetType}`
  );
  const result = await response.json();

  if (result.success) {
    updateWidget({ data_source_id: dataSourceId, data: result.data });
  }
};
```

**Step 3: Save and Load Reports**

```typescript
// Widget config stored in report
{
  "instance_id": "widget-001",
  "widget_type": "pie_chart",
  "data": {
    "title": "Findings by Severity",
    "data_source_id": "findings_severity",  // ← Connected to data source
    "slices": [...]  // Latest data
  }
}

// On report load, re-fetch data for widgets with data_source_id
```

---

## Testing

### Implementation Checklist

**Backend Tasks**:

- [ ] Create `/api/data-sources` endpoint (list all sources)
- [ ] Create `/api/data-sources/:dataSourceId` endpoint (get data)
- [ ] Implement `findings_severity` handler
- [ ] Implement `findings_by_status` handler
- [ ] Implement `findings_list` handler
- [ ] Implement `risks_by_rating` handler
- [ ] Implement `risks_above_appetite` handler
- [ ] Implement `control_compliance` handler
- [ ] Implement `audit_team` handler
- [ ] Add parameter validation (audit_plan_id, risk_register_id)
- [ ] Add error handling for missing/invalid parameters
- [ ] Test all endpoints with sample data
- [ ] Verify color consistency

**Database Requirements**:

- [ ] `findings` table with: severity, status, audit_plan_id, conformity_status
- [ ] `risks` table with: inherent_risk_rating, residual_risk_score, risk_register_id
- [ ] `risk_registers` table with: risk_appetite_threshold
- [ ] `audit_team_members` table with: audit_plan_id, user_id, role
- [ ] `users` table with: full_name, certifications

### Test Cases

**Test 1: Pie Chart Format**

```bash
curl "http://localhost:3000/api/data-sources/findings_severity?audit_plan_id=ap-001&widget_type=pie_chart"
```

Expected: Array of `{ label, value, color }` objects

**Test 2: Table Format**

```bash
curl "http://localhost:3000/api/data-sources/findings_severity?audit_plan_id=ap-001&widget_type=table"
```

Expected: Object with `{ columns: [], rows: [] }`

**Test 3: Missing Required Parameter**

```bash
curl "http://localhost:3000/api/data-sources/findings_severity?widget_type=pie_chart"
```

Expected: 400 error with message about missing audit_plan_id

**Test 4: Invalid Data Source**

```bash
curl "http://localhost:3000/api/data-sources/invalid_source?widget_type=pie_chart"
```

Expected: 404 error "Data source not found"

**Test 5: Empty Result Set**

Test with audit_plan_id that has no findings

Expected: Empty array `[]` or empty rows `{ columns: [], rows: [] }`

**Test 6: Percentage Calculation**

Verify percentages sum to 100% (or close due to rounding)

**Test 7: Color Consistency**

Verify all severity/status colors match the standards

---

## Color Standards

### Severity Colors

- **Critical**: `#7c3aed` (Purple)
- **High**: `#ef4444` (Red)
- **Medium**: `#f59e0b` (Amber)
- **Low**: `#22c55e` (Green)

### Status Colors

- **Open**: `#ef4444` (Red)
- **In Progress**: `#3b82f6` (Blue)
- **Resolved**: `#10b981` (Emerald)
- **Closed**: `#22c55e` (Green)

### Conformity Colors

- **Conforming**: `#22c55e` (Green)
- **Minor Non-Conformity**: `#f59e0b` (Amber)
- **Major Non-Conformity**: `#ef4444` (Red)

### Risk Rating Colors

- **Critical**: `#7c3aed` (Purple)
- **High**: `#ef4444` (Red)
- **Medium**: `#f59e0b` (Amber)
- **Low**: `#22c55e` (Green)

**Important**: Use these exact hex codes for consistency across all data sources!

---

## Common Errors and Solutions

### Error: "Missing required parameter: audit_plan_id"

**Cause**: Data source requires audit_plan_id but it wasn't provided

**Solution**: Include `audit_plan_id` in query parameters

### Error: "Data source not found"

**Cause**: Invalid data source ID in URL

**Solution**: Check data source ID against the registry

### Error: "Invalid widget_type"

**Cause**: widget_type is not "pie_chart" or "table"

**Solution**: Use only "pie_chart" or "table" as widget_type

### Empty Data

**Cause**: No records found for the given entity ID

**Solution**: Return empty array `[]` or `{ columns: [], rows: [] }` - this is valid

---

## Performance Optimization

### Database Indexes

Create indexes on frequently queried columns:

```sql
CREATE INDEX idx_findings_audit_plan ON findings(audit_plan_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_status ON findings(status);
CREATE INDEX idx_risks_register ON risks(risk_register_id);
```

### Query Optimization

Use window functions for percentage calculations (single pass):

```sql
-- Efficient: Single pass with window function
SELECT severity, COUNT(*) as count,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as percentage
FROM findings
GROUP BY severity;
```

### Caching (Optional)

Cache data source results for 5 minutes:

```typescript
const cache = new Map();

async function getCachedData(cacheKey, fetchFn) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }
  const data = await fetchFn();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

---

## Summary

### What You Need to Implement

1. **GET /api/data-sources** - List all available data sources
2. **GET /api/data-sources/:dataSourceId** - Fetch data for specific source

### Key Points

- **Two response formats**: Pie chart (array) and table (object with columns/rows)
- **Entity IDs required**: audit_plan_id for audit sources, risk_register_id for risk sources
- **Consistent colors**: Use exact hex codes from Color Standards section
- **Error handling**: Return proper HTTP status codes and error messages
- **Custom sources**: No backend needed for custom_table and custom_chart

### Next Steps

1. Set up database tables and indexes
2. Implement API endpoints following the examples
3. Test each data source with sample data
4. Verify color consistency
5. Add organization_id filtering for multi-tenant support
