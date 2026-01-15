# Reports System Documentation

Complete documentation for the Reports System frontend and backend implementation.

## 📚 Documentation Index

> **See [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) for complete navigation**

### For Backend Developers

1. **[BACKEND_QUICK_START.md](./BACKEND_QUICK_START.md)** ⭐ START HERE
   - 5-minute overview
   - Essential endpoints
   - Response formats
   - Common mistakes to avoid

2. **[DATA_SOURCES_COMPLETE.md](./DATA_SOURCES_COMPLETE.md)** ⭐ DATA SOURCES
   - Single source of truth for all data sources
   - All 7 data sources with SQL queries
   - Complete data flow diagrams
   - API endpoints and response formats
   - Implementation guide with code examples
   - Testing checklist
   - Color standards

3. **[BACKEND_DATA_SPEC_COMPLETE.md](./BACKEND_DATA_SPEC_COMPLETE.md)**
   - **Data sources and widget data formats**
   - Complete data specifications
   - SQL examples for data sources
   - Transformation code
   - Error handling
   - Testing checklist

4. **[BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md)**
   - **Report structure and CRUD operations**
   - Complete API specification
   - All 6 section types documented
   - Widget structures
   - Findings API format
   - Complete ISO 27001 example
   - Database schema recommendations

5. **[BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md)**
   - Step-by-step implementation guide
   - Database schema with SQL
   - Best practices
   - Code examples

6. **[PDF_EXPORT_COMPLETE.md](./PDF_EXPORT_COMPLETE.md)** ⭐ PDF GENERATION
   - Complete PDF export documentation
   - Client-side generation with @react-pdf/renderer
   - 4 cover page styles
   - Preview modal with zoom and navigation
   - Troubleshooting guide

### For Frontend Developers

1. **[types.ts](./types.ts)**
   - TypeScript interfaces for all data structures
   - ReportContent, ReportSection, FindingSummary, etc.

2. **[constants.ts](./constants.ts)**
   - Mock data for development
   - Available data sources
   - Sample findings

3. **[store.ts](./store.ts)**
   - Zustand store for state management
   - All actions and state

4. **[Components](./components/)**
   - section-editor.tsx
   - findings-selector.tsx
   - pie-chart-widget.tsx
   - configurable-table.tsx
   - And more...

---

## 🚀 Quick Start

### For Backend Implementation

1. Read **BACKEND_QUICK_START.md** (5-minute overview!)
2. Read **DATA_SOURCES_COMPLETE.md** (complete data source guide)
3. Create database schema from BACKEND_IMPLEMENTATION_GUIDE.md
4. Implement Phase 1 endpoints (reports CRUD)
5. Implement Phase 2 endpoints (findings)
6. Implement Phase 3 endpoints (data sources)
7. Test using examples in DATA_SOURCES_COMPLETE.md

### For PDF Export (Already Implemented ✅)

- Client-side PDF generation with @react-pdf/renderer
- 4 cover page styles (Standard, Simple, Detailed, Signature)
- Preview modal with zoom and navigation
- See **PDF_EXPORT_COMPLETE.md** for details

### For Frontend Development

1. Review **types.ts** for data structures
2. Check **constants.ts** for mock data
3. Explore components in **\_components/** folder
4. Use **store.ts** for state management

---

## 📋 Implementation Checklist

### Backend Tasks

#### Phase 1: Core Reports (Week 1)

- [ ] Create database schema
- [ ] Implement GET /api/reports (list all)
- [ ] Implement GET /api/reports/:id (get single)
- [ ] Implement POST /api/reports (create)
- [ ] Implement PUT /api/reports/:id (update)
- [ ] Implement DELETE /api/reports/:id (delete)
- [ ] Test all CRUD operations

#### Phase 2: Findings (Week 2)

- [ ] Implement GET /api/findings
- [ ] Add audit_plan_id filtering
- [ ] Include all required fields
- [ ] Use conformity status labels: "Conforming", "Minor Non-Conformity", "Major Non-Conformity"
- [ ] Test findings retrieval

#### Phase 3: Data Sources (Week 3)

- [ ] Implement GET /api/data-sources (list)
- [ ] Implement GET /api/data-sources/:id (get data)
- [ ] Implement findings_severity handler
- [ ] Implement findings_by_status handler
- [ ] Implement findings_list handler
- [ ] Implement risks_by_rating handler
- [ ] Implement risks_above_appetite handler
- [ ] Implement control_compliance handler
- [ ] Implement audit_team handler
- [ ] Test all data sources

### Frontend Tasks (Already Complete ✅)

- ✅ Report editor UI
- ✅ Section management (add, edit, delete, reorder)
- ✅ Findings selector with category grouping
- ✅ Auto-generated tables by conformity status
- ✅ Pie chart widgets
- ✅ Configurable table widgets
- ✅ Data source picker
- ✅ Cover page editor (4 styles)
- ✅ Dynamic form sections
- ✅ Report sidebar with TOC
- ✅ State management with Zustand
- ✅ PDF export with @react-pdf/renderer
- ✅ PDF preview modal with zoom and navigation

---

## 🗂️ File Structure

```
app/reports/
├── README.md                              ← You are here
├── DOCUMENTATION_INDEX.md                 ← Complete navigation guide
├── BACKEND_QUICK_START.md                 ← 5-minute backend overview
├── BACKEND_IMPLEMENTATION_GUIDE.md        ← Step-by-step backend guide
├── BACKEND_API_SPEC.md                    ← Complete API spec
├── BACKEND_DATA_SPEC_COMPLETE.md          ← Complete data specifications
├── DATA_SOURCES_COMPLETE.md               ← All data sources (single source of truth)
├── PDF_EXPORT_COMPLETE.md                 ← PDF export documentation
│
├── types.ts                               ← TypeScript interfaces
├── constants.ts                           ← Mock data & data sources
├── store.ts                               ← Zustand state management
├── utils.ts                               ← Utility functions
├── report-templates.ts                    ← Report templates
│
├── page.tsx                               ← Main report editor page
├── old_page.tsx                           ← Reference implementation
│
├── _components/                           ← React components
│   ├── section-editor.tsx                 ← Section editor with auto-tables
│   ├── findings-selector.tsx              ← Findings selector with grouping
│   ├── pie-chart-widget.tsx               ← Pie chart component
│   ├── configurable-table.tsx             ← Table component
│   ├── cover-page-editor.tsx              ← Cover page editor
│   ├── dynamic-section.tsx                ← Dynamic form section
│   ├── report-header.tsx                  ← Report header with PDF export
│   ├── report-sidebar.tsx                 ← Sidebar with TOC
│   ├── add-section-modal.tsx              ← Add section modal
│   ├── add-section-button.tsx             ← Add section button
│   ├── widget-data-source-picker.tsx      ← Data source picker
│   └── pdf-react/                         ← PDF components
│       ├── pdf-document.tsx               ← Main PDF document
│       ├── cover-pages.tsx                ← 4 cover page styles
│       └── pdf-preview-modal.tsx          ← Preview with zoom
│
├── hooks/                                 ← Custom React hooks
│   └── use-report-fetching.ts             ← Data fetching hook
│
└── actions.ts                             ← Server actions (if needed)
```

---

## 🔑 Key Concepts

### Reports Structure

A report consists of:

- **Metadata**: Title, version, branding, management standard
- **Sections**: Ordered list of content sections
- **Widgets**: Charts and tables within sections
- **Findings**: Selected findings for inclusion

### Section Types

1. **cover_page**: Report cover with organization info
2. **text_only**: Plain text content
3. **text_with_widgets**: Text + charts/tables
4. **findings_selector**: Select findings for report
5. **compliance_findings**: Auto-generated conformity tables
6. **dynamic_form**: Custom form fields

### Widget Types

1. **pie_chart**: Circular chart with slices
2. **table**: Configurable data table

### Data Sources

Data sources provide dynamic data for widgets:

- **Audit sources**: Findings by severity, status, list, team
- **Risk sources**: Risks by rating, above appetite
- **Compliance sources**: Control compliance status
- **Custom sources**: Manual data entry

---

## 🎨 Design Patterns

### State Management

Uses Zustand for global state:

- Report data
- Findings list
- Data sources
- UI state (expanded sections, modals)

### Component Architecture

- **Container components**: Handle data fetching and state
- **Presentation components**: Pure UI components
- **Widget components**: Reusable chart/table components

### Data Flow

```
Database → API → Frontend State → Components → UI
```

For data sources:

```
Database → Data Source Handler → API → Widget → UI
```

---

## 🧪 Testing

### Backend Testing

See BACKEND_IMPLEMENTATION_GUIDE.md for:

- Unit test examples
- Integration test examples
- Testing checklist

### Frontend Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## 📊 Data Source Summary

| Data Source          | Category   | Requires Entity     | Widgets          | Status            |
| -------------------- | ---------- | ------------------- | ---------------- | ----------------- |
| findings_severity    | audit      | ✅ audit_plan_id    | pie_chart, table | 🔴 Backend needed |
| findings_by_status   | audit      | ✅ audit_plan_id    | pie_chart, table | 🔴 Backend needed |
| findings_list        | audit      | ✅ audit_plan_id    | table            | 🔴 Backend needed |
| risks_by_rating      | risk       | ✅ risk_register_id | pie_chart, table | 🔴 Backend needed |
| risks_above_appetite | risk       | ✅ risk_register_id | table            | 🔴 Backend needed |
| control_compliance   | compliance | ❌                  | pie_chart, table | 🔴 Backend needed |
| audit_team           | audit      | ✅ audit_plan_id    | table            | 🔴 Backend needed |
| custom_table         | custom     | ❌                  | table            | ✅ Frontend only  |
| custom_chart         | custom     | ❌                  | pie_chart        | ✅ Frontend only  |

---

## 🔗 API Endpoints Summary

### Reports

- `GET /api/reports` - List all reports
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Findings

- `GET /api/findings?audit_plan_id={id}` - Get findings

### Data Sources

- `GET /api/data-sources` - List available data sources
- `GET /api/data-sources/:id?widget_type={type}&audit_plan_id={id}` - Get data

---

## 🎯 Current Status

### ✅ Complete (Frontend)

- Report editor UI
- Section management
- Findings selector with category grouping
- Auto-generated conformity tables (Major/Minor Non-Conformity)
- Pie chart widgets
- Configurable table widgets
- Data source picker UI
- Cover page editor (4 styles: Standard, Simple, Detailed, Signature)
- Dynamic form sections
- State management
- All components
- PDF export with @react-pdf/renderer (client-side)
- PDF preview modal with zoom and navigation

### 🔴 Needed (Backend)

- Database schema
- Reports CRUD endpoints
- Findings endpoint
- Data sources endpoints
- All 7 data source handlers

---

## 📞 Support & Questions

### Documentation Questions

- Check **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** for complete navigation
- All specifications are comprehensive and include examples

### Implementation Questions

- Review **BACKEND_QUICK_START.md** for 5-minute overview
- Check **DATA_SOURCES_COMPLETE.md** for complete data source guide
- See **BACKEND_API_SPEC.md** for complete API details
- Review **BACKEND_IMPLEMENTATION_GUIDE.md** for step-by-step guidance

### Frontend Questions

- Review component files in \_components/
- Check types.ts for data structures
- See store.ts for state management

---

## 🚦 Next Steps

1. **Backend Developer**: Start with **BACKEND_QUICK_START.md** (5 minutes), then **DATA_SOURCES_COMPLETE.md**
2. **Frontend Developer**: System is complete, ready for backend integration
3. **QA/Testing**: Use examples in **DATA_SOURCES_COMPLETE.md**

---

## 📝 Notes

- All frontend code is production-ready
- Backend implementation follows RESTful conventions
- Database schema supports multi-tenancy
- All data sources include SQL queries
- Color standards are consistent across all components
- Error handling is comprehensive
- Performance optimizations included (indexes, caching)

---

## 🎉 Summary

The Reports System is a comprehensive solution for creating audit, compliance, and risk reports with:

✅ **Flexible section types** for different content needs
✅ **Dynamic widgets** with live data from backend
✅ **Findings integration** with category grouping
✅ **Auto-generated tables** by conformity status (Major/Minor Non-Conformity)
✅ **Customizable branding** per report
✅ **4 cover page styles** (Standard, Simple, Detailed, Signature)
✅ **PDF export** with client-side generation (@react-pdf/renderer)
✅ **PDF preview** with zoom and navigation
✅ **Complete documentation** for implementation
✅ **Production-ready frontend** awaiting backend

**Total Documentation**: 6 comprehensive markdown files covering every aspect of implementation.

**Ready for**: Backend implementation following the provided guides.
