# Backend Quick Start Guide - Reports System

## TL;DR

Implement 2 endpoints that return data in 2 formats based on `widget_type` parameter.

## Endpoints

### 1. List Data Sources

```
GET /api/data-sources
```

Returns metadata about available data sources.

### 2. Get Data Source Data

```
GET /api/data-sources/:dataSourceId?widget_type={type}&audit_plan_id={id}
```

Returns actual data in format determined by `widget_type`.

---

## Response Formats

### For `widget_type=pie_chart`

```json
{
  "success": true,
  "data": [
    { "label": "High", "value": 2, "color": "#ef4444" },
    { "label": "Medium", "value": 3, "color": "#f59e0b" },
    { "label": "Low", "value": 1, "color": "#22c55e" }
  ]
}
```

### For `widget_type=table`

```json
{
  "success": true,
  "data": {
    "columns": [
      { "key": "severity", "header": "Severity" },
      { "key": "count", "header": "Count" }
    ],
    "rows": [
      { "severity": "High", "count": 2 },
      { "severity": "Medium", "count": 3 },
      { "severity": "Low", "count": 1 }
    ]
  }
}
```

---

## Standard Colors (MUST USE)

```typescript
const COLORS = {
  severity: {
    critical: "#7c3aed", // Purple
    high: "#ef4444", // Red
    medium: "#f59e0b", // Amber
    low: "#22c55e" // Green
  },
  status: {
    open: "#ef4444", // Red
    in_progress: "#3b82f6", // Blue
    resolved: "#10b981", // Emerald
    closed: "#22c55e" // Green
  },
  conformity: {
    conforming: "#22c55e", // Green
    minor_nc: "#f59e0b", // Amber
    major_nc: "#ef4444" // Red
  }
};
```

---

## Data Sources to Implement

| ID                     | Category   | Requires Entity     | Widgets    | Description            |
| ---------------------- | ---------- | ------------------- | ---------- | ---------------------- |
| `findings_severity`    | audit      | ✅ audit_plan_id    | pie, table | Findings by severity   |
| `findings_by_status`   | audit      | ✅ audit_plan_id    | pie, table | Findings by status     |
| `findings_list`        | audit      | ✅ audit_plan_id    | table      | Complete findings list |
| `control_compliance`   | compliance | ❌                  | pie, table | Compliance status      |
| `risks_by_rating`      | risk       | ✅ risk_register_id | pie, table | Risks by rating        |
| `risks_above_appetite` | risk       | ✅ risk_register_id | table      | High-priority risks    |
| `audit_team`           | audit      | ✅ audit_plan_id    | table      | Team members           |

---

## Example Implementation

### findings_severity Handler

```typescript
async function getFindingsSeverity(params: {
  widgetType: "pie_chart" | "table";
  auditPlanId: string;
}) {
  // Query database
  const rows = await db.query(
    `
    SELECT 
      severity,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as percentage
    FROM findings
    WHERE audit_plan_id = ?
    GROUP BY severity
  `,
    [params.auditPlanId]
  );

  // Transform based on widget type
  if (params.widgetType === "pie_chart") {
    return rows.map((row) => ({
      label: capitalize(row.severity),
      value: row.count,
      color: COLORS.severity[row.severity]
    }));
  } else {
    return {
      columns: [
        { key: "severity", header: "Severity", width: "40%" },
        { key: "count", header: "Count", width: "30%" },
        { key: "percentage", header: "Percentage", width: "30%" }
      ],
      rows: rows.map((row) => ({
        severity: capitalize(row.severity),
        count: row.count,
        percentage: `${row.percentage}%`
      }))
    };
  }
}
```

---

## Testing Checklist

- [ ] Pie chart returns array of `{ label, value, color }`
- [ ] Table returns `{ columns, rows }`
- [ ] Colors match standard palette
- [ ] Percentages formatted as "XX%"
- [ ] Column keys match row keys
- [ ] Empty data returns empty array/rows (not error)
- [ ] Missing parameters return error with message

---

## Common Mistakes to Avoid

❌ **Wrong**: Returning different color codes

```json
{ "label": "High", "value": 2, "color": "#ff0000" } // Wrong red
```

✅ **Correct**: Use standard colors

```json
{ "label": "High", "value": 2, "color": "#ef4444" } // Correct red
```

❌ **Wrong**: Column keys don't match row keys

```json
{
  "columns": [{ "key": "severity_level", "header": "Severity" }],
  "rows": [{ "severity": "High" }] // Key mismatch!
}
```

✅ **Correct**: Keys must match

```json
{
  "columns": [{ "key": "severity", "header": "Severity" }],
  "rows": [{ "severity": "High" }]
}
```

❌ **Wrong**: Percentage as number

```json
{ "percentage": 33 }
```

✅ **Correct**: Percentage as string with %

```json
{ "percentage": "33%" }
```

---

## Need More Details?

See `BACKEND_DATA_SPEC_COMPLETE.md` for:

- Complete SQL examples
- All data source specifications
- Error handling patterns
- Transformation examples
- Full API documentation
