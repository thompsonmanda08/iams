# Reports System Documentation Index

## For Backend Developers

### Quick Start (Start Here!)

📄 **[BACKEND_QUICK_START.md](./BACKEND_QUICK_START.md)**

- 5-minute overview
- Essential endpoints
- Response formats
- Common mistakes to avoid

### Complete Specification

📄 **[BACKEND_DATA_SPEC_COMPLETE.md](./BACKEND_DATA_SPEC_COMPLETE.md)**

- **Data sources and widget data formats**
- All data source specifications
- SQL examples for data sources
- Transformation code
- Error handling
- Testing checklist

### API Reference

📄 **[BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md)**

- **Report structure and CRUD operations**
- Complete API endpoints (GET, POST, PUT, DELETE)
- Report content structure
- All 6 section types with examples
- Widget data structures
- Findings API format
- Complete ISO 27001 example
- Database schema recommendations

### Data Sources Complete Guide

📄 **[DATA_SOURCES_COMPLETE.md](./DATA_SOURCES_COMPLETE.md)**

- **Single source of truth for data sources**
- All 7 data source specifications with SQL
- Complete data flow diagrams
- API endpoints and response formats
- Implementation guide with code examples
- Testing checklist
- Color standards

---

## For Everyone

### Project Overview

📄 **[README.md](./README.md)**

- System overview
- Architecture
- Getting started

### Backend Implementation Guide

📄 **[BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md)**

- Step-by-step implementation
- Best practices
- Code examples

---

## Feature-Specific Documentation

### PDF Export

- 📄 **[PDF_EXPORT_COMPLETE.md](./PDF_EXPORT_COMPLETE.md)** - Complete PDF export documentation (generation, preview, cover pages, troubleshooting)

---

## Critical Information

### Standard Color Palette

**Severity**:

- Critical: `#7c3aed` (Purple)
- High: `#ef4444` (Red)
- Medium: `#f59e0b` (Amber)
- Low: `#22c55e` (Green)

**Status**:

- Open: `#ef4444` (Red)
- In Progress: `#3b82f6` (Blue)
- Resolved: `#10b981` (Emerald)
- Closed: `#22c55e` (Green)

**Conformity**:

- Conforming: `#22c55e` (Green)
- Minor Non-Conformity: `#f59e0b` (Amber)
- Major Non-Conformity: `#ef4444` (Red)

### Key Endpoints

```
GET /api/data-sources
GET /api/data-sources/:id?widget_type={type}&audit_plan_id={id}
GET /api/reports/:id
GET /api/findings?audit_plan_id={id}
POST /api/reports/:id
```

### Response Formats

**Pie Chart**:

```json
[{ "label": "High", "value": 2, "color": "#ef4444" }]
```

**Table**:

```json
{
  "columns": [{ "key": "severity", "header": "Severity" }],
  "rows": [{ "severity": "High" }]
}
```

---

## Implementation Priority

### Phase 1: Core Data Sources (Required for MVP)

1. ✅ `findings_severity` - Pie chart and table
2. ✅ `findings_by_status` - Pie chart and table
3. ✅ `findings_list` - Table only
4. ✅ `control_compliance` - Pie chart and table

### Phase 2: Risk Management

5. ✅ `risks_by_rating` - Pie chart and table
6. ✅ `risks_above_appetite` - Table only

### Phase 3: Additional Features

7. ✅ `audit_team` - Table only

---

## Quick Links

- **Backend Quick Start**: Start here if you're implementing the backend
- **Complete Spec**: Reference for all data structures and transformations
- **API Reference**: Complete endpoint documentation
- **Data Sources Spec**: Detailed specifications for each data source

---

## Questions?

1. **"What format should my API return?"**
   → See [BACKEND_QUICK_START.md](./BACKEND_QUICK_START.md) - Response Formats section

2. **"What colors should I use?"**
   → See [BACKEND_DATA_SPEC_COMPLETE.md](./BACKEND_DATA_SPEC_COMPLETE.md) - Standard Color Palette section

3. **"How do I transform database results?"**
   → See [BACKEND_DATA_SPEC_COMPLETE.md](./BACKEND_DATA_SPEC_COMPLETE.md) - Data Transformation Examples section

4. **"What SQL queries should I use?"**
   → See [DATA_SOURCES_COMPLETE.md](./DATA_SOURCES_COMPLETE.md) - Each data source has SQL examples

5. **"How does the frontend use this data?"**
   → See [DATA_SOURCES_COMPLETE.md](./DATA_SOURCES_COMPLETE.md) - Data Flow section

---

## Document Status

| Document                      | Status      | Last Updated |
| ----------------------------- | ----------- | ------------ |
| BACKEND_QUICK_START.md        | ✅ Complete | 2025-01-15   |
| BACKEND_DATA_SPEC_COMPLETE.md | ✅ Complete | 2025-01-15   |
| BACKEND_API_SPEC.md           | ✅ Complete | 2025-01-14   |
| DATA_SOURCES_COMPLETE.md      | ✅ Complete | 2025-01-15   |
| PDF_EXPORT_COMPLETE.md        | ✅ Complete | 2025-01-15   |
