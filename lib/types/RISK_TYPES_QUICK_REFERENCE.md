# Risk Types - Quick Reference Card

## Import Statement

```typescript
import type {
  // Core types
  RiskTableRow,
  ActionFindings,
  ActionFindingsStatus,

  // Input types
  SubmitActionFindingsInput,
  AssessActionFindingsInput,
  RiskActionQueryParams,

  // Form types
  ActionFindingsFormData,
  AssessmentFormData,

  // Response types
  RisksResponse,
  ActionFindingsResponse,
  SubmitActionFindingsResponse,

  // Enums/Unions
  RiskStatus,
  RiskResponse,
  RiskMagnitude,
  ActionFindingsStatus
} from "@/lib/types/risk-types";
```

---

## Type Cheat Sheet

| Type                        | Purpose              | Key Fields                             |
| --------------------------- | -------------------- | -------------------------------------- |
| `RiskTableRow`              | Single risk in table | id, title, category, status, owner     |
| `ActionFindings`            | Submitted finding    | id, risk_id, status, reviewer_feedback |
| `SubmitActionFindingsInput` | Submit form input    | risk_id, description, evidence_notes   |
| `AssessActionFindingsInput` | Reviewer input       | assessment_score, feedback, decision   |
| `PaginationMeta`            | List pagination      | page, total, has_next, has_prev        |
| `RiskActionQueryParams`     | List filters         | risk_action_owner_id, status, search   |

---

## Status Enums

### Risk Status

```typescript
type RiskStatus = "OPEN" | "CLOSED" | "PENDING_REVIEW" | "MITIGATED";
```

### Action Findings Status

```typescript
type ActionFindingsStatus = "OPEN" | "PENDING_REVIEW" | "COMPLETED" | "NEEDS_REVISION";
```

**Flow:**

```
OPEN → PENDING_REVIEW → COMPLETED (or NEEDS_REVISION → PENDING_REVIEW again)
```

### Risk Response

```typescript
type RiskResponse = "REDUCE" | "ACCEPT" | "AVOID" | "SHARE";
```

### Risk Magnitude

```typescript
type RiskMagnitude = "low" | "medium" | "high" | "critical";
```

---

## Common Usage Patterns

### 1️⃣ Fetch Risks for User

```typescript
const response = await getAllRisks{
  risk_action_owner_id: user.id,
  page: 1,
  page_size: 10
});

const risks: RiskTableRow[] = response.data;
```

### 2️⃣ Submit Findings

```typescript
const input: SubmitActionFindingsInput = {
  risk_id: risk.id,
  action_owner_id: user.id,
  description: formData.description,
  evidence_notes: formData.evidence_notes
};

const response = await submitActionFindings(input);
if (response.success) {
  const finding: ActionFindings = response.data!;
}
```

### 3️⃣ Assess Findings (Reviewer)

```typescript
const assessment: AssessActionFindingsInput = {
  reviewer_id: reviewer.id,
  assessment_score: 8,
  reviewer_feedback: "Good implementation",
  decision: "APPROVE"
};

const response = await assessActionFindings(findingId, assessment);
```

### 4️⃣ Type-Safe Form State

```typescript
const [formData, setFormData] = useState<ActionFindingsFormData>({
  description: "",
  evidence_notes: ""
});

const [errors, setErrors] = useState<ActionFindingsFormErrors>({});
```

### 5️⃣ Filter Findings

```typescript
const params: ActionFindingsQueryParams = {
  risk_id: selectedRisk.id,
  status: "PENDING_REVIEW",
  page: 1
};

const response = await getActionFindings(params);
```

---

## Validation Rules

### ActionFindings Submission

```typescript
✓ description: required, min 10 chars
✓ evidence_notes: optional, max 1000 chars
✓ evidence_file: optional, max 10MB, PDF/DOC/XLS
```

### Assessment

```typescript
✓ assessment_score: required, 0-10
✓ reviewer_feedback: required, min 20 chars
✓ decision: required, APPROVE or REQUEST_CHANGES
```

---

## Database Field Mappings

### Risk → Table Display

```
id                      → id
title                   → title
description             → description
category_id             → category (object)
department_id           → department (object)
risk_owner_id           → risk_owner (object)
status                  → status
inherent_likelihood     → inherent_likelihood
inherent_impact         → inherent_impact
residual_likelihood     → residual_likelihood
residual_impact         → residual_impact
risk_response           → risk_response
target_closing_date     → target_closing_date
treatment_plan          → treatment_plan
control_effectiveness   → control_effectiveness
```

### ActionFindings Status Transitions

```
OPEN
  ↓ (User submits via dialog)
PENDING_REVIEW
  ├─ (Reviewer approves) → COMPLETED ✓
  └─ (Reviewer rejects) → NEEDS_REVISION
      ↓ (User resubmits)
      PENDING_REVIEW (cycle repeats)
```

---

## Component Integration

### ActionsTable Component

```typescript
import type { RiskTableRow } from "@/lib/types/risk-types";

interface ActionsTableProps {
  actions: RiskTableRow[];
  pagination: PaginationMeta;
}
```

### ActionFindingsDialog Component

```typescript
// Input: RiskTableRow
// State: ActionFindingsFormData
// Submit: SubmitActionFindingsInput
// Response: SubmitActionFindingsResponse
```

### ActionAssessmentForm Component

```typescript
// Input: ActionFindings
// State: AssessmentFormData
// Submit: AssessActionFindingsInput
// Response: AssessActionFindingsResponse
```

### ActionFindingsDisplay Component

```typescript
// Input: ActionFindings
// Display: Uses ActionFindingsStatus type for styling
```

---

## API Endpoints (Mock → Real)

| Operation       | Current           | Future                                    |
| --------------- | ----------------- | ----------------------------------------- |
| Get Risks       | Mock array filter | `GET /api/risks?risk_action_owner_id=...` |
| Submit Findings | Mock array append | `POST /api/action-findings`               |
| Get Findings    | Mock filter       | `GET /api/risks/{id}/findings`            |
| Assess Findings | Mock update       | `PUT /api/action-findings/{id}/assess`    |

---

## TypeScript Tips

### Partial Types

```typescript
// For optional updates
type PartialActionFindings = Partial<ActionFindings>;
```

### Readonly Types

```typescript
// For immutable data
type ReadonlyActionFindings = Readonly<ActionFindings>;
```

### Discriminated Unions

```typescript
// For handling different statuses
type FindingsState =
  | { status: "OPEN" }
  | { status: "PENDING_REVIEW" }
  | { status: "COMPLETED"; assessment_score: number }
  | { status: "NEEDS_REVISION"; feedback: string };
```

---

## Common Mistakes to Avoid

❌ Don't use `any` type

```typescript
// Bad
const risk: any = data;

// Good
const risk: RiskTableRow = data;
```

❌ Don't forget optional fields

```typescript
// Bad
const assessment: AssessActionFindingsInput = {
  reviewer_id: "123",
  assessment_score: 5,
  reviewer_feedback: "Good"
  // Missing 'decision'!
};

// Good
const assessment: AssessActionFindingsInput = {
  reviewer_id: "123",
  assessment_score: 5,
  reviewer_feedback: "Good",
  decision: "APPROVE"
};
```

❌ Don't mix form data with API input

```typescript
// Bad
const input: SubmitActionFindingsInput = formData;

// Good
const input: SubmitActionFindingsInput = {
  risk_id: formData.risk_id,
  action_owner_id: user.id,
  description: formData.description,
  evidence_notes: formData.evidence_notes
};
```

---

## Testing Types

### Mock Risk Data

```typescript
const mockRisk: RiskTableRow = {
  id: "1",
  title: "Test Risk",
  description: "Test description",
  category: { id: "1", name: "Tech", code: "T", color: "#000" },
  department: { id: "1", name: "IT", code: "IT" },
  risk_owner: { id: "1", email: "test@test.com", first_name: "John", last_name: "Doe" },
  status: "OPEN",
  department_status: "OPEN",
  inherent_likelihood: 4,
  inherent_impact: 5,
  residual_likelihood: 2,
  residual_impact: 4,
  risk_response: "REDUCE",
  target_closing_date: "2024-12-31",
  treatment_plan: "Test plan",
  control_effectiveness: 3,
  mitigation_cost: 10000,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-11-07T10:00:00Z"
};
```

### Mock Action Findings

```typescript
const mockFindings: ActionFindings = {
  id: "AF-2024-001",
  risk_id: "1",
  action_owner_id: "user-123",
  description: "Implemented MFA",
  evidence_notes: "Deployment completed",
  submission_date: new Date().toISOString(),
  status: "PENDING_REVIEW",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
```

---

## Related Files

📄 **Type Definitions**: `lib/types/risk-types.ts`
📖 **Full Guide**: `lib/types/RISK_TYPES_GUIDE.md`
🔧 **Server Actions**: `app/_actions/risk-module-actions.ts`
📋 **Components**: `app/dashboard/(modules)/risks/_components/`

---

**Last Updated**: 2024-11-07
**Version**: 1.0
