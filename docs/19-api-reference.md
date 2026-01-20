# 19 - API Reference

## Reports API

### getReport

Fetch a single report by ID.

```typescript
export async function getReport(reportId: string): Promise<Report>
```

**Parameters:**
- `reportId` - UUID of the report

**Returns:**
- `Report` object

**Example:**
```typescript
const report = await getReport("550e8400-e29b-41d4-a716-446655440000");
```

---

### getReports

Fetch all reports with optional filters.

```typescript
export async function getReports(filters?: ReportFilters): Promise<Report[]>
```

**Parameters:**
- `filters` (optional) - Filter criteria
  - `status?: ReportStatus`
  - `entity_type?: ReportEntityType`
  - `created_by?: string`

**Returns:**
- Array of `Report` objects

**Example:**
```typescript
const draftReports = await getReports({ status: "DRAFT" });
```

---

### createReport

Create a new report.

```typescript
export async function createReport(input: CreateReportInput): Promise<Report>
```

**Parameters:**
- `input` - Report data
  - `title: string`
  - `entity_id: string`
  - `entity_type: ReportEntityType`
  - `report_content: ReportContent`

**Returns:**
- Created `Report` object

**Example:**
```typescript
const report = await createReport({
  title: "Q1 2026 Audit Report",
  entity_id: auditPlanId,
  entity_type: "audit_plan",
  report_content: { sections: [] }
});
```

---

### updateReport

Update an existing report.

```typescript
export async function updateReport(
  reportId: string,
  reportContent: ReportContent
): Promise<void>
```

**Parameters:**
- `reportId` - UUID of the report
- `reportContent` - Updated report content

**Returns:**
- `void`

**Side Effects:**
- Revalidates cache paths

**Example:**
```typescript
await updateReport(reportId, updatedContent);
```

---

### publishReport

Publish a draft report.

```typescript
export async function publishReport(reportId: string): Promise<void>
```

**Parameters:**
- `reportId` - UUID of the report

**Returns:**
- `void`

**Side Effects:**
- Sets status to "PUBLISHED"
- Sets published_at timestamp
- Revalidates cache paths

**Example:**
```typescript
await publishReport(reportId);
```

---

### deleteReport

Delete a report.

```typescript
export async function deleteReport(reportId: string): Promise<void>
```

**Parameters:**
- `reportId` - UUID of the report

**Returns:**
- `void`

**Example:**
```typescript
await deleteReport(reportId);
```

---

## Audit API

### getAuditPlan

Fetch an audit plan with relations.

```typescript
export async function getAuditPlan(planId: string): Promise<AuditPlan>
```

**Parameters:**
- `planId` - UUID of the audit plan

**Returns:**
- `AuditPlan` object with nested findings and workpapers

**Example:**
```typescript
const plan = await getAuditPlan(planId);
console.log(plan.findings); // Array of findings
```

---

### getAuditPlans

Fetch all audit plans.

```typescript
export async function getAuditPlans(): Promise<AuditPlan[]>
```

**Returns:**
- Array of `AuditPlan` objects

---

### createAuditPlan

Create a new audit plan.

```typescript
export async function createAuditPlan(
  input: CreateAuditPlanInput
): Promise<AuditPlan>
```

**Parameters:**
- `input` - Audit plan data
  - `title: string`
  - `management_standard: string`
  - `start_date: string`
  - `end_date: string`
  - `scope?: string`
  - `objectives?: string[]`

**Example:**
```typescript
const plan = await createAuditPlan({
  title: "ISO 27001 Internal Audit",
  management_standard: "ISO27001:2022",
  start_date: "2026-01-01",
  end_date: "2026-03-31"
});
```

---

### updateAuditPlan

Update an audit plan.

```typescript
export async function updateAuditPlan(
  planId: string,
  updates: Partial<AuditPlan>
): Promise<AuditPlan>
```

**Parameters:**
- `planId` - UUID of the audit plan
- `updates` - Fields to update

**Example:**
```typescript
await updateAuditPlan(planId, {
  status: "IN_PROGRESS"
});
```

---

## Findings API

### createFinding

Create a new finding.

```typescript
export async function createFinding(
  input: CreateFindingInput
): Promise<Finding>
```

**Parameters:**
- `input` - Finding data
  - `audit_plan_id: string`
  - `title: string`
  - `description: string`
  - `severity: FindingSeverity`
  - `control_reference?: string`

**Example:**
```typescript
const finding = await createFinding({
  audit_plan_id: planId,
  title: "Inadequate access controls",
  description: "Users have excessive permissions",
  severity: "HIGH",
  control_reference: "A.9.2.1"
});
```

---

### updateFinding

Update a finding.

```typescript
export async function updateFinding(
  findingId: string,
  updates: Partial<Finding>
): Promise<Finding>
```

---

## Risk API

### getRisk

Fetch a risk by ID.

```typescript
export async function getRisk(riskId: string): Promise<Risk>
```

---

### getRisks

Fetch all risks.

```typescript
export async function getRisks(filters?: RiskFilters): Promise<Risk[]>
```

**Parameters:**
- `filters` (optional)
  - `category?: string`
  - `status?: RiskStatus`
  - `min_score?: number`

---

### createRisk

Create a new risk.

```typescript
export async function createRisk(input: CreateRiskInput): Promise<Risk>
```

**Parameters:**
- `input` - Risk data
  - `title: string`
  - `description: string`
  - `category: string`
  - `likelihood: number` (1-5)
  - `impact: number` (1-5)

**Example:**
```typescript
const risk = await createRisk({
  title: "Data breach vulnerability",
  description: "Unpatched systems",
  category: "CYBERSECURITY",
  likelihood: 4,
  impact: 5
});
```

---

### updateRiskScore

Update risk likelihood and impact.

```typescript
export async function updateRiskScore(
  riskId: string,
  likelihood: number,
  impact: number
): Promise<void>
```

---

## Workflow API

### createWorkflow

Create a new workflow.

```typescript
export async function createWorkflow(
  input: CreateWorkflowInput
): Promise<Workflow>
```

**Parameters:**
- `input` - Workflow data
  - `entity_id: string`
  - `entity_type: string`
  - `workflow_type: string`
  - `steps: WorkflowStep[]`

**Example:**
```typescript
const workflow = await createWorkflow({
  entity_id: reportId,
  entity_type: "report",
  workflow_type: "approval",
  steps: [
    { step_number: 1, name: "Manager Review", assigned_to: managerId },
    { step_number: 2, name: "Director Approval", assigned_to: directorId }
  ]
});
```

---

### processWorkflowStep

Process a workflow step (approve/reject).

```typescript
export async function processWorkflowStep(
  input: ProcessStepInput
): Promise<void>
```

**Parameters:**
- `input` - Step processing data
  - `workflow_id: string`
  - `step_number: number`
  - `action: "APPROVED" | "REJECTED"`
  - `comments?: string`

**Example:**
```typescript
await processWorkflowStep({
  workflow_id: workflowId,
  step_number: 1,
  action: "APPROVED",
  comments: "Looks good"
});
```

---

## Types Reference

### Report

```typescript
interface Report {
  id: string;
  title: string;
  entity_id: string;
  entity_type: ReportEntityType;
  report_content: ReportContent;
  status: ReportStatus;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

### ReportContent

```typescript
interface ReportContent {
  report_id?: string;
  title: string;
  status?: ReportStatus;
  sections: ReportSection[];
  metadata?: {
    created_at?: string;
    updated_at?: string;
  };
}
```

### ReportSection

```typescript
interface ReportSection {
  id: string;
  title: string;
  type: SectionType;
  content?: string;
  dataSource?: string;
  order: number;
}
```

### AuditPlan

```typescript
interface AuditPlan {
  id: string;
  title: string;
  management_standard: string;
  start_date: string;
  end_date: string;
  status: AuditPlanStatus;
  scope?: string;
  objectives?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  findings?: Finding[];
  workpapers?: Workpaper[];
}
```

### Finding

```typescript
interface Finding {
  id: string;
  audit_plan_id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  control_reference?: string;
  status: FindingStatus;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}
```

### Risk

```typescript
interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  risk_score: number;
  status: RiskStatus;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}
```

### Workflow

```typescript
interface Workflow {
  id: string;
  entity_id: string;
  entity_type: string;
  workflow_type: string;
  status: WorkflowStatus;
  current_step: number;
  steps: WorkflowStep[];
  initiated_by: string;
  created_at: string;
  updated_at: string;
}
```

## Enums

### ReportStatus

```typescript
type ReportStatus = "DRAFT" | "PUBLISHED";
```

### ReportEntityType

```typescript
type ReportEntityType = "audit_plan" | "risk";
```

### FindingSeverity

```typescript
type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
```

### FindingStatus

```typescript
type FindingStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
```

### RiskStatus

```typescript
type RiskStatus = "IDENTIFIED" | "ASSESSED" | "TREATED" | "MONITORED" | "CLOSED";
```

### WorkflowStatus

```typescript
type WorkflowStatus = "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED";
```

## Next Steps

Continue to → [20-changelog.md](20-changelog.md)
