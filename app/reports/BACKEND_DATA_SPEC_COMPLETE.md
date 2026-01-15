# Complete Backend Data Specification for Reports System

## Executive Summary

This document provides the **definitive specification** for all backend API responses in the Reports system. It ensures consistent data structures for widgets (tables and pie charts), data sources, and report content.

## Critical Requirements

### 1. Data Source Response Format

All data source endpoints MUST return data in one of two formats based on `widget_type` parameter:

#### For Pie Charts (`widget_type=pie_chart`)

```typescript
{
  "success": true,
  "data": Array<{
    label: string;    // Display label (e.g., "High", "Critical")
    value: number;    // Numeric value (count or percentage)
    color: string;    // Hex color code (e.g., "#ef4444")
  }>
}
```

#### For Tables (`widget_type=table`)

```typescript
{
  "success": true,
  "data": {
    columns: Array<{
      key: string;      // Field key for data access
      header: string;   // Display header
      width?: string;   // Optional (e.g., "30%")
    }> | string[],      // Can be simple string array
    rows: Array<Record<string, any>>  // Array of row objects
  }
}
```

### 2. Standard Color Palette

**MUST use these exact colors for consistency:**

#### Severity Colors

- **Critical**: `#f00` (Red)
- **High**: `#ef4444` (Red-Orange)
- **Medium**: `#f59e0b` (Amber/Orange)
- **Low**: `#22c55e` (Green)

#### Status Colors

- **Open**: `#ef4444` (Red)
- **In Progress**: `#3b82f6` (Blue)
- **Resolved**: `#10b981` (Emerald)
- **Closed**: `#22c55e` (Green)

#### Conformity Colors

- **Conforming/Conformity**: `#22c55e` (Green)
- **Minor Non-Conformity/Partial**: `#f59e0b` (Amber)
- **Major Non-Conformity/Non-Conforming**: `#ef4444` (Red)

#### Risk Rating Colors

- **Critical**: `#7c3aed` (Purple)
- **High**: `#ef4444` (Red)
- **Medium**: `#f59e0b` (Amber)
- **Low**: `#22c55e` (Green)

---

## API Endpoints

### 1. Get Available Data Sources

**Endpoint**: `GET /api/data-sources`

**Purpose**: Returns metadata about all available data sources

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
```

### 2. Get Data Source Data

**Endpoint**: `GET /api/data-sources/:dataSourceId`

**Query Parameters**:

- `widget_type` (required): "pie_chart" | "table"
- `audit_plan_id` (conditional): Required if `requires_entity: true` and `category: "audit"`
- `risk_register_id` (conditional): Required if `requires_entity: true` and `category: "risk"`
- `organization_id` (optional): For organization-wide data

**Examples**:

```
GET /api/data-sources/findings_severity?widget_type=pie_chart&audit_plan_id=ap-001
GET /api/data-sources/findings_severity?widget_type=table&audit_plan_id=ap-001
GET /api/data-sources/control_compliance?widget_type=pie_chart&organization_id=org-001
```

---

## Data Source Specifications

### DS-1: Findings by Severity

**ID**: `findings_severity`
**Category**: `audit`
**Requires Entity**: `true` (audit_plan_id)
**Compatible Widgets**: `["pie_chart", "table"]`

#### Pie Chart Response

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

#### Table Response

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
      { "label": "Medium", "count": 3, "percentage": "43%" },
      { "severity": "Low", "count": 1, "percentage": "14%" }
    ]
  }
}
```

#### Backend SQL Logic

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

---

### DS-2: Findings by Status

**ID**: `findings_by_status`
**Category**: `audit`
**Requires Entity**: `true` (audit_plan_id)
**Compatible Widgets**: `["pie_chart", "table"]`

#### Pie Chart Response

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

#### Table Response

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

### DS-3: Findings List

**ID**: `findings_list`
**Category**: `audit`
**Requires Entity**: `true` (audit_plan_id)
**Compatible Widgets**: `["table"]`

#### Table Response

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

### DS-4: Control Compliance Status

**ID**: `control_compliance`
**Category**: `compliance`
**Requires Entity**: `false`
**Compatible Widgets**: `["pie_chart", "table"]`

#### Pie Chart Response

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

#### Table Response

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

### DS-5: Risks by Rating

**ID**: `risks_by_rating`
**Category**: `risk`
**Requires Entity**: `true` (risk_register_id)
**Compatible Widgets**: `["pie_chart", "table"]`

#### Pie Chart Response

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

---

### DS-6: Risks Above Appetite

**ID**: `risks_above_appetite`
**Category**: `risk`
**Requires Entity**: `true` (risk_register_id)
**Compatible Widgets**: `["table"]`

#### Table Response

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

### DS-7: Audit Team

**ID**: `audit_team`
**Category**: `audit`
**Requires Entity**: `true` (audit_plan_id)
**Compatible Widgets**: `["table"]`

#### Table Response

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
      { "name": "John Doe", "role": "Lead Auditor", "certification": "CISA, CISSP" },
      { "name": "Jane Smith", "role": "Auditor", "certification": "ISO 27001 LA" }
    ]
  }
}
```


---

## Data Transformation Examples

### Example 1: Database → Pie Chart

**Database Query Result**:
```
severity  | count
----------|------
critical  | 1
high      | 2
medium    | 3
low       | 1
```

**Backend Transformation Code**:
```typescript
function transformToPieChart(rows: any[], type: 'severity' | 'status' | 'conformity' | 'risk') {
  const colorMaps = {
    severity: {
      critical: "#7c3aed",
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#22c55e"
    },
    status: {
      open: "#ef4444",
      in_progress: "#3b82f6",
      resolved: "#10b981",
      closed: "#22c55e"
    },
    conformity: {
      conformity: "#22c55e",
      partial_conformity: "#f59e0b",
      non_conformity: "#ef4444"
    },
    risk: {
      critical: "#7c3aed",
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#22c55e"
    }
  };

  const colorMap = colorMaps[type];

  return rows.map((row) => ({
    label: row[type].charAt(0).toUpperCase() + row[type].slice(1).replace('_', ' '),
    value: row.count,
    color: colorMap[row[type].toLowerCase()]
  }));
}
```

**API Response**:
```json
[
  { "label": "Critical", "value": 1, "color": "#7c3aed" },
  { "label": "High", "value": 2, "color": "#ef4444" },
  { "label": "Medium", "value": 3, "color": "#f59e0b" },
  { "label": "Low", "value": 1, "color": "#22c55e" }
]
```



### Example 2: Database → Table

**Database Query Result**:
```
finding_number | category_name                  | severity | status      | recommendation
---------------|--------------------------------|----------|-------------|------------------
F-2025-001     | Unauthorized Cloud Storage     | high     | OPEN        | Implement policy...
F-2025-002     | Weak Password Rotation Policy  | medium   | IN_PROGRESS | Implement automated...
```

**Backend Transformation Code**:
```typescript
function transformToTable(rows: any[], columnDefs: any[]) {
  return {
    columns: columnDefs.map(col => ({
      key: col.key,
      header: col.header,
      width: col.width
    })),
    rows: rows.map((row) => {
      const transformedRow: Record<string, any> = {};
      columnDefs.forEach(col => {
        transformedRow[col.key] = row[col.dbField] || row[col.key];
      });
      return transformedRow;
    })
  };
}

// Usage
const columnDefs = [
  { key: "reference", header: "Reference", width: "15%", dbField: "finding_number" },
  { key: "title", header: "Finding", width: "30%", dbField: "category_name" },
  { key: "severity", header: "Severity", width: "15%", dbField: "severity" },
  { key: "status", header: "Status", width: "15%", dbField: "status" },
  { key: "recommendation", header: "Recommendation", width: "25%", dbField: "recommendation" }
];

const result = transformToTable(dbRows, columnDefs);
```

**API Response**:
```json
{
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
      "title": "Unauthorized Cloud Storage",
      "severity": "high",
      "status": "OPEN",
      "recommendation": "Implement policy..."
    }
  ]
}
```



---

## Implementation Checklist

### Backend Must Implement

- [ ] **GET /api/data-sources** - List all available data sources with metadata
- [ ] **GET /api/data-sources/:dataSourceId** - Fetch data for specific source

### Query Parameter Validation

- [ ] Validate `widget_type` is either "pie_chart" or "table"
- [ ] Validate `audit_plan_id` when `requires_entity: true` and `category: "audit"`
- [ ] Validate `risk_register_id` when `requires_entity: true` and `category: "risk"`
- [ ] Return proper error messages for missing required parameters

### Response Format Validation

- [ ] Pie chart responses return array of `{ label, value, color }`
- [ ] Table responses return object with `{ columns, rows }`
- [ ] All colors use exact hex codes from standard palette
- [ ] Column keys match row object keys
- [ ] Percentages are formatted as strings with "%" symbol

### Data Sources to Implement

- [ ] **findings_severity** (audit, requires entity)
- [ ] **findings_by_status** (audit, requires entity)
- [ ] **findings_list** (audit, requires entity)
- [ ] **risks_by_rating** (risk, requires entity)
- [ ] **risks_above_appetite** (risk, requires entity)
- [ ] **control_compliance** (compliance, no entity)
- [ ] **audit_team** (audit, requires entity)

### Testing

- [ ] Test each data source with `widget_type=pie_chart`
- [ ] Test each data source with `widget_type=table`
- [ ] Test error handling for missing parameters
- [ ] Test with empty data sets (no findings, no risks)
- [ ] Test color consistency across all responses
- [ ] Test percentage calculations are accurate

---

## Error Responses

### Missing Required Parameter
```json
{
  "success": false,
  "error": "Missing required parameter: audit_plan_id",
  "code": "MISSING_PARAMETER"
}
```

### Invalid Widget Type
```json
{
  "success": false,
  "error": "Invalid widget_type. Must be 'pie_chart' or 'table'",
  "code": "INVALID_WIDGET_TYPE"
}
```

### Data Source Not Found
```json
{
  "success": false,
  "error": "Data source not found: invalid_source_id",
  "code": "DATA_SOURCE_NOT_FOUND"
}
```

### No Data Available
```json
{
  "success": true,
  "data": []  // For pie charts
}
```

```json
{
  "success": true,
  "data": {
    "columns": [...],
    "rows": []  // For tables
  }
}
```



---

## Frontend Integration

### How Frontend Uses Data Sources

1. **Page Load**: Fetch available data sources
   ```typescript
   const response = await fetch('/api/data-sources');
   const { data: dataSources } = await response.json();
   ```

2. **User Selects Data Source**: Filter by compatible widget type
   ```typescript
   const compatibleSources = dataSources.filter(ds => 
     ds.compatible_widgets.includes(widgetType)
   );
   ```

3. **Fetch Data**: Call with appropriate parameters
   ```typescript
   const url = `/api/data-sources/${dataSourceId}?widget_type=${widgetType}&audit_plan_id=${auditPlanId}`;
   const response = await fetch(url);
   const { data } = await response.json();
   ```

4. **Render Widget**: Use data directly
   ```typescript
   // For pie chart
   <PieChart data={data} />  // data is array of slices
   
   // For table
   <Table columns={data.columns} rows={data.rows} />
   ```

### Widget Data Structure in Report JSON

When a widget is connected to a data source, it stores the `data_source_id`:

```json
{
  "instance_id": "widget-001",
  "widget_type": "pie_chart",
  "order": 0,
  "data": {
    "title": "Findings by Severity",
    "data_source_id": "findings_severity",
    "slices": [
      { "label": "High", "value": 2, "color": "#ef4444" }
    ]
  }
}
```

When report is loaded, frontend:
1. Detects `data_source_id` is present
2. Fetches fresh data from data source
3. Updates widget with new data
4. Displays updated widget

---

## Summary

### Key Points

1. **Two Response Formats**: Pie chart (array) and Table (object with columns/rows)
2. **Standard Colors**: Use exact hex codes for consistency
3. **Query Parameters**: `widget_type` required, entity IDs conditional
4. **Error Handling**: Return helpful error messages with codes
5. **Empty Data**: Return empty arrays/rows, not errors
6. **Column Keys**: Must match row object keys exactly
7. **Percentages**: Format as strings with "%" symbol

### Backend Responsibilities

- Transform database results into widget-compatible formats
- Apply standard color palette
- Calculate percentages accurately
- Validate required parameters
- Handle empty data gracefully
- Return consistent error responses

### Frontend Responsibilities

- Fetch available data sources on load
- Filter by compatible widget types
- Pass correct query parameters
- Handle loading and error states
- Re-fetch data when report is loaded
- Display widgets with fetched data

---

## Quick Reference

### Pie Chart Data Structure
```typescript
Array<{
  label: string;
  value: number;
  color: string;  // Hex code
}>
```

### Table Data Structure
```typescript
{
  columns: Array<{
    key: string;
    header: string;
    width?: string;
  }> | string[],
  rows: Array<Record<string, any>>
}
```

### Standard Endpoints
- `GET /api/data-sources` - List all
- `GET /api/data-sources/:id?widget_type=X&audit_plan_id=Y` - Get data

### Required Query Parameters
- `widget_type`: Always required
- `audit_plan_id`: Required for audit category with `requires_entity: true`
- `risk_register_id`: Required for risk category with `requires_entity: true`

