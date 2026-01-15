# Backend Implementation Guide for Reports System

Complete guide for implementing the backend API for the reports system.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Required Endpoints](#required-endpoints)
3. [Implementation Priority](#implementation-priority)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Checklist](#deployment-checklist)

---

## 1. Overview

The reports system requires backend APIs for:

- **Report CRUD operations**: Create, read, update, delete reports
- **Findings data**: Fetch findings for report inclusion
- **Data sources**: Dynamic data for widgets (charts and tables)

### Architecture

```
Frontend (Next.js)
    ↓
API Routes (/api/...)
    ↓
Database (PostgreSQL/MySQL)
```

---

## 2. Required Endpoints

### Core Endpoints (Priority 1)

| Endpoint           | Method | Purpose           | Status      |
| ------------------ | ------ | ----------------- | ----------- |
| `/api/reports`     | GET    | List all reports  | 🔴 Required |
| `/api/reports/:id` | GET    | Get single report | 🔴 Required |
| `/api/reports`     | POST   | Create new report | 🔴 Required |
| `/api/reports/:id` | PUT    | Update report     | 🔴 Required |
| `/api/reports/:id` | DELETE | Delete report     | 🔴 Required |
| `/api/findings`    | GET    | Get findings list | 🔴 Required |

### Data Source Endpoints (Priority 2)

| Endpoint                | Method | Purpose                     | Status       |
| ----------------------- | ------ | --------------------------- | ------------ |
| `/api/data-sources`     | GET    | List available data sources | 🟡 Important |
| `/api/data-sources/:id` | GET    | Get data source data        | 🟡 Important |

### Optional Endpoints (Priority 3)

| Endpoint                     | Method | Purpose              | Status          |
| ---------------------------- | ------ | -------------------- | --------------- |
| `/api/reports/:id/export`    | GET    | Export report as PDF | 🟢 Nice to have |
| `/api/reports/:id/duplicate` | POST   | Duplicate report     | 🟢 Nice to have |
| `/api/reports/:id/share`     | POST   | Share report         | 🟢 Nice to have |

---

## 3. Implementation Priority

### Phase 1: Core Report Operations (Week 1)

**Goal**: Enable basic report creation and editing

1. ✅ Create database schema
2. ✅ Implement GET /api/reports (list)
3. ✅ Implement GET /api/reports/:id (single)
4. ✅ Implement POST /api/reports (create)
5. ✅ Implement PUT /api/reports/:id (update)
6. ✅ Implement DELETE /api/reports/:id (delete)

**Deliverable**: Users can create, view, edit, and delete reports

### Phase 2: Findings Integration (Week 2)

**Goal**: Enable findings selection in reports

1. ✅ Implement GET /api/findings
2. ✅ Add findings filtering by audit_plan_id
3. ✅ Ensure findings include all required fields (see FINDINGS_FIELD_MAPPING.md)

**Deliverable**: Users can select findings and see them in reports

### Phase 3: Data Sources (Week 3)

**Goal**: Enable dynamic widgets with live data

1. ✅ Implement GET /api/data-sources (list)
2. ✅ Implement GET /api/data-sources/:id (data)
3. ✅ Implement all 7 data source handlers
4. ✅ Add caching for performance

**Deliverable**: Users can add charts and tables with live data

---

## 4. Step-by-Step Implementation

### Step 1: Database Schema

Create the following tables:

```sql
-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  report_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  management_standard VARCHAR(50),
  branding_primary_color VARCHAR(7) DEFAULT '#1a365d',
  branding_secondary_color VARCHAR(7) DEFAULT '#2563eb',
  branding_font_family VARCHAR(50) DEFAULT 'Inter',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  CONSTRAINT valid_report_type CHECK (report_type IN ('general_audit', 'compliance_audit', 'risk', 'followup'))
);

-- Report sections table
CREATE TABLE report_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL,
  order_index INT NOT NULL,
  header VARCHAR(255) NOT NULL,
  sub_header VARCHAR(255),
  content TEXT,
  include_in_toc BOOLEAN DEFAULT TRUE,
  toc_level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_section_type CHECK (section_type IN ('cover_page', 'text_only', 'text_with_widgets', 'findings_selector', 'compliance_findings', 'dynamic_form')),
  CONSTRAINT valid_toc_level CHECK (toc_level IN (1, 2, 3))
);

-- Report widgets table
CREATE TABLE report_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES report_sections(id) ON DELETE CASCADE,
  widget_type VARCHAR(20) NOT NULL,
  order_index INT NOT NULL,
  widget_data JSONB NOT NULL,
  CONSTRAINT valid_widget_type CHECK (widget_type IN ('table', 'pie_chart'))
);

-- Report findings junction table
CREATE TABLE report_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES report_sections(id) ON DELETE CASCADE,
  finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(section_id, finding_id)
);

-- Dynamic form fields table
CREATE TABLE report_section_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES report_sections(id) ON DELETE CASCADE,
  field_schema JSONB NOT NULL,
  field_values JSONB
);

-- Indexes for performance
CREATE INDEX idx_reports_org ON reports(organization_id);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_sections_report ON report_sections(report_id, order_index);
CREATE INDEX idx_widgets_section ON report_widgets(section_id, order_index);
CREATE INDEX idx_report_findings_section ON report_findings(section_id);
CREATE INDEX idx_report_findings_finding ON report_findings(finding_id);
```

### Step 2: Implement Core Report Endpoints

#### GET /api/reports

```typescript
// app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session.user.organization_id;

    const reports = await db.query(
      `
      SELECT 
        id as report_id,
        organization_id,
        report_type,
        title,
        version,
        management_standard,
        branding_primary_color,
        branding_secondary_color,
        branding_font_family,
        created_at,
        updated_at
      FROM reports
      WHERE organization_id = $1
      ORDER BY created_at DESC
    `,
      [organizationId]
    );

    return NextResponse.json({ success: true, data: reports.rows });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, report_type, management_standard } = body;
    const organizationId = session.user.organization_id;
    const userId = session.user.id;

    // Create report
    const reportResult = await db.query(
      `
      INSERT INTO reports (
        organization_id, report_type, title, management_standard, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [organizationId, report_type, title, management_standard, userId, userId]
    );

    const report = reportResult.rows[0];

    // Create default sections based on template
    const defaultSections = getDefaultSections(management_standard);

    for (const section of defaultSections) {
      await db.query(
        `
        INSERT INTO report_sections (
          report_id, section_type, order_index, header, sub_header, content, include_in_toc, toc_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          report.id,
          section.section_type,
          section.order,
          section.header,
          section.sub_header || null,
          section.content || null,
          section.include_in_toc,
          section.toc_level
        ]
      );
    }

    // Fetch complete report with sections
    const completeReport = await getReportById(report.id);

    return NextResponse.json({ success: true, data: completeReport }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

#### GET /api/reports/:id

```typescript
// app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const reportId = params.id;
    const report = await getReportById(reportId);

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    // Verify user has access to this report
    if (report.organization_id !== session.user.organization_id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const reportId = params.id;
    const body = await request.json();

    // Update report metadata
    await db.query(
      `
      UPDATE reports
      SET title = $1,
          version = $2,
          management_standard = $3,
          branding_primary_color = $4,
          branding_secondary_color = $5,
          branding_font_family = $6,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = $7
      WHERE id = $8
    `,
      [
        body.title,
        body.version,
        body.management_standard,
        body.branding.primary_color,
        body.branding.secondary_color,
        body.branding.font_family,
        session.user.id,
        reportId
      ]
    );

    // Update sections (delete and recreate for simplicity)
    await db.query("DELETE FROM report_sections WHERE report_id = $1", [reportId]);

    for (const section of body.sections) {
      const sectionResult = await db.query(
        `
        INSERT INTO report_sections (
          report_id, section_type, order_index, header, sub_header, content, include_in_toc, toc_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
        [
          reportId,
          section.section_type,
          section.order,
          section.header,
          section.sub_header || null,
          section.content || null,
          section.include_in_toc,
          section.toc_level
        ]
      );

      const sectionId = sectionResult.rows[0].id;

      // Insert widgets
      if (section.widgets && section.widgets.length > 0) {
        for (const widget of section.widgets) {
          await db.query(
            `
            INSERT INTO report_widgets (section_id, widget_type, order_index, widget_data)
            VALUES ($1, $2, $3, $4)
          `,
            [sectionId, widget.widget_type, widget.order, JSON.stringify(widget.data)]
          );
        }
      }

      // Insert selected findings
      if (section.selected_finding_ids && section.selected_finding_ids.length > 0) {
        for (const findingId of section.selected_finding_ids) {
          await db.query(
            `
            INSERT INTO report_findings (section_id, finding_id)
            VALUES ($1, $2)
            ON CONFLICT (section_id, finding_id) DO NOTHING
          `,
            [sectionId, findingId]
          );
        }
      }

      // Insert dynamic form fields
      if (section.fields) {
        await db.query(
          `
          INSERT INTO report_section_fields (section_id, field_schema, field_values)
          VALUES ($1, $2, $3)
        `,
          [sectionId, JSON.stringify(section.fields), JSON.stringify(section.field_values || {})]
        );
      }
    }

    const updatedReport = await getReportById(reportId);

    return NextResponse.json({ success: true, data: updatedReport });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const reportId = params.id;

    // Verify ownership
    const report = await db.query("SELECT organization_id FROM reports WHERE id = $1", [reportId]);
    if (report.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    if (report.rows[0].organization_id !== session.user.organization_id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Delete report (cascade will handle sections, widgets, etc.)
    await db.query("DELETE FROM reports WHERE id = $1", [reportId]);

    return NextResponse.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Helper function to fetch complete report
async function getReportById(reportId: string) {
  // Fetch report
  const reportResult = await db.query(
    `
    SELECT 
      id as report_id,
      organization_id,
      report_type,
      title,
      version,
      management_standard,
      branding_primary_color,
      branding_secondary_color,
      branding_font_family,
      created_at,
      updated_at
    FROM reports
    WHERE id = $1
  `,
    [reportId]
  );

  if (reportResult.rows.length === 0) {
    return null;
  }

  const report = reportResult.rows[0];

  // Fetch sections
  const sectionsResult = await db.query(
    `
    SELECT 
      id as section_id,
      section_type,
      order_index as "order",
      header,
      sub_header,
      content,
      include_in_toc,
      toc_level
    FROM report_sections
    WHERE report_id = $1
    ORDER BY order_index
  `,
    [reportId]
  );

  const sections = [];

  for (const section of sectionsResult.rows) {
    // Fetch widgets
    const widgetsResult = await db.query(
      `
      SELECT 
        id as instance_id,
        widget_type,
        order_index as "order",
        widget_data as data
      FROM report_widgets
      WHERE section_id = $1
      ORDER BY order_index
    `,
      [section.section_id]
    );

    // Fetch selected findings
    const findingsResult = await db.query(
      `
      SELECT finding_id
      FROM report_findings
      WHERE section_id = $1
    `,
      [section.section_id]
    );

    // Fetch dynamic fields
    const fieldsResult = await db.query(
      `
      SELECT field_schema as fields, field_values
      FROM report_section_fields
      WHERE section_id = $1
    `,
      [section.section_id]
    );

    sections.push({
      ...section,
      widgets: widgetsResult.rows,
      selected_finding_ids: findingsResult.rows.map((r) => r.finding_id),
      fields: fieldsResult.rows[0]?.fields || null,
      field_values: fieldsResult.rows[0]?.field_values || null
    });
  }

  return {
    ...report,
    branding: {
      primary_color: report.branding_primary_color,
      secondary_color: report.branding_secondary_color,
      font_family: report.branding_font_family
    },
    sections
  };
}
```

### Step 3: Implement Findings Endpoint

See `FINDINGS_FIELD_MAPPING.md` for complete field mapping.

```typescript
// app/api/findings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const auditPlanId = searchParams.get("audit_plan_id");

    if (!auditPlanId) {
      return NextResponse.json({ success: false, error: "Missing audit_plan_id" }, { status: 400 });
    }

    const findings = await db.query(
      `
      SELECT 
        f.id,
        f.finding_number as reference_code,
        f.category_name as title,
        LOWER(f.severity) as severity,
        f.status,
        f.category_name,
        f.clause_number,
        CONCAT('A.', f.clause_number, ' ', f.clause_description) as clause,
        f.clause_description,
        COALESCE(f.workings_and_test_results, f.conclusion) as observation,
        f.recommendation,
        f.management_response,
        f.action_plan,
        f.responsible_person,
        f.due_date,
        f.conformity_status,
        f.is_conformity,
        f.compliance_status,
        f.compliance_percentage,
        f.evidence_links,
        f.evidence_summary,
        f.framework,
        f.created_at,
        f.updated_at,
        f.created_by,
        f.updated_by,
        json_build_object(
          'id', c.id,
          'working_paper_id', c.working_paper_id,
          'template_category_id', c.template_category_id,
          'name', c.name,
          'sort_order', c.sort_order,
          'organization_id', c.organization_id,
          'clause', c.clause,
          'description', c.description
        ) as category
      FROM findings f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE f.audit_plan_id = $1
      ORDER BY f.created_at DESC
    `,
      [auditPlanId]
    );

    // Add is_selected: false to all findings (frontend manages this)
    const findingsWithSelection = findings.rows.map((f) => ({
      ...f,
      is_selected: false
    }));

    return NextResponse.json({ success: true, data: findingsWithSelection });
  } catch (error) {
    console.error("Error fetching findings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### Step 4: Implement Data Sources

See `DATA_SOURCES_SPEC.md` for complete specification.

```typescript
// app/api/data-sources/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AVAILABLE_DATA_SOURCES } from "@/app/reports/constants";

export async function GET(request: NextRequest) {
  try {
    // Return list of available data sources (metadata only)
    const dataSources = AVAILABLE_DATA_SOURCES.map((ds) => ({
      id: ds.id,
      name: ds.name,
      description: ds.description,
      category: ds.category,
      compatible_widgets: ds.compatible_widgets,
      requires_entity: ds.requires_entity
    }));

    return NextResponse.json({ success: true, data: dataSources });
  } catch (error) {
    console.error("Error fetching data sources:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

```typescript
// app/api/data-sources/[dataSourceId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { DATA_SOURCE_HANDLERS } from "@/lib/data-source-handlers";

export async function GET(request: NextRequest, { params }: { params: { dataSourceId: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { dataSourceId } = params;
    const { searchParams } = new URL(request.url);

    const widgetType = searchParams.get("widget_type");
    const auditPlanId = searchParams.get("audit_plan_id");
    const riskRegisterId = searchParams.get("risk_register_id");
    const organizationId = session.user.organization_id;

    if (!widgetType) {
      return NextResponse.json({ success: false, error: "Missing widget_type" }, { status: 400 });
    }

    const handler = DATA_SOURCE_HANDLERS[dataSourceId];

    if (!handler) {
      return NextResponse.json({ success: false, error: "Data source not found" }, { status: 404 });
    }

    // Validate required parameters
    if (handler.requires_entity) {
      if (handler.category === "audit" && !auditPlanId) {
        return NextResponse.json(
          { success: false, error: "Missing audit_plan_id" },
          { status: 400 }
        );
      }
      if (handler.category === "risk" && !riskRegisterId) {
        return NextResponse.json(
          { success: false, error: "Missing risk_register_id" },
          { status: 400 }
        );
      }
    }

    // Execute handler
    const data = await handler.execute({
      widgetType,
      auditPlanId,
      riskRegisterId,
      organizationId
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching data source data:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

## 5. Testing Strategy

### Unit Tests

```typescript
// __tests__/api/reports.test.ts
describe("Reports API", () => {
  describe("GET /api/reports", () => {
    it("should return list of reports", async () => {
      const response = await request(app).get("/api/reports");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/reports");
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/reports", () => {
    it("should create a new report", async () => {
      const response = await request(app).post("/api/reports").send({
        title: "Test Report",
        report_type: "compliance_audit",
        management_standard: "ISO 27001"
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Test Report");
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/report-workflow.test.ts
describe("Report Workflow", () => {
  it("should complete full report lifecycle", async () => {
    // Create report
    const createResponse = await request(app)
      .post("/api/reports")
      .send({ title: "Integration Test Report", report_type: "general_audit" });

    const reportId = createResponse.body.data.report_id;

    // Get report
    const getResponse = await request(app).get(`/api/reports/${reportId}`);
    expect(getResponse.status).toBe(200);

    // Update report
    const updateResponse = await request(app)
      .put(`/api/reports/${reportId}`)
      .send({ ...getResponse.body.data, title: "Updated Title" });
    expect(updateResponse.status).toBe(200);

    // Delete report
    const deleteResponse = await request(app).delete(`/api/reports/${reportId}`);
    expect(deleteResponse.status).toBe(200);

    // Verify deletion
    const verifyResponse = await request(app).get(`/api/reports/${reportId}`);
    expect(verifyResponse.status).toBe(404);
  });
});
```

---

## 6. Deployment Checklist

### Pre-Deployment

- [ ] All database migrations run successfully
- [ ] All indexes created
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] API documentation updated
- [ ] Environment variables configured
- [ ] Database backups configured

### Deployment

- [ ] Deploy database changes
- [ ] Deploy API changes
- [ ] Run smoke tests
- [ ] Monitor error logs
- [ ] Verify performance metrics

### Post-Deployment

- [ ] Test all endpoints in production
- [ ] Verify data source connections
- [ ] Check report creation/editing
- [ ] Monitor database performance
- [ ] Collect user feedback

---

## 7. Documentation References

- **BACKEND_API_SPEC.md**: Complete API specification with examples
- **FINDINGS_FIELD_MAPPING.md**: Field mapping from workpapers to reports
- **DATA_SOURCES_SPEC.md**: Data sources specification with SQL queries
- **DATA_SOURCES_QUICK_REFERENCE.md**: Quick reference for data sources
- **DATA_SOURCES_FLOW.md**: Visual flow diagrams

---

## 8. Support

For questions or issues:

1. Check the documentation files listed above
2. Review the frontend implementation in `app/reports/`
3. Test endpoints using the examples in `DATA_SOURCES_QUICK_REFERENCE.md`
4. Verify database schema matches the specification

---

## Summary

This guide provides everything needed to implement the backend for the reports system:

✅ **Database schema** with all required tables and indexes
✅ **API endpoints** with complete implementation examples
✅ **Data sources** with SQL queries and transformation logic
✅ **Testing strategy** with unit and integration test examples
✅ **Deployment checklist** for production readiness

Follow the implementation priority (Phase 1 → Phase 2 → Phase 3) for a smooth rollout.
