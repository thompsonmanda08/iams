# Risk Types & Action Findings Type Guide

## Overview

This guide documents all TypeScript types used in the Risk Management module, specifically for risk actions and action findings workflows.

All types are defined in `lib/types/risk-types.ts` and exported for use throughout the application.

---

## Table of Contents

1. [Risk Register Types](#risk-register-types)
2. [Risk Category Types](#risk-category-types)
3. [Risk Owner & User Types](#risk-owner--user-types)
4. [Risk Status & Response Types](#risk-status--response-types)
5. [Risk Table Types](#risk-table-types)
6. [Action Findings Types](#action-findings-types)
7. [Form Types](#form-types)
8. [API Response Types](#api-response-types)
9. [Query Parameter Types](#query-parameter-types)
10. [Usage Examples](#usage-examples)

---

## Risk Register Types

### `RiskRegisterBranch`
Represents a branch within a risk register.

```typescript
export type RiskRegisterBranch = {
  id: string;
  name: string;
  code: string;
};
```

### `RiskRegister`
Main risk register type containing risk information for a specific branch and time period.

```typescript
export type RiskRegister = {
  id: string;
  branch_id: string;
  name: string;
  description?: string;
  start_date: string;
  due_date: string;
  status: "OPEN" | "CLOSED";
  timeline_status: "ON_TRACK" | "AT_RISK" | "OVERDUE";
  branch: RiskRegisterBranch;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
};
```

### `RiskRegistersResponse`
API response type for risk registers list.

```typescript
export type RiskRegistersResponse = {
  registers: RiskRegister[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};
```

---

## Risk Category Types

### `RiskCategory`
Categorizes risks (e.g., "Technology", "Compliance", "Data Protection").

```typescript
export type RiskCategory = {
  id: string;
  name: string;
  code: string;
  color: string; // For UI display (hex color like "#FF6B6B")
};
```

---

## Risk Owner & User Types

### `RiskOwner`
User who owns/manages the risk.

```typescript
export type RiskOwner = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};
```

### `Department`
Department responsible for the risk.

```typescript
export type Department = {
  id: string;
  name: string;
  code: string;
};
```

---

## Risk Status & Response Types

### Status Types

```typescript
export type RiskStatus = "OPEN" | "CLOSED" | "PENDING_REVIEW" | "MITIGATED";
export type ActionFindingsStatus = "OPEN" | "PENDING_REVIEW" | "COMPLETED" | "NEEDS_REVISION";
export type RiskResponse = "REDUCE" | "ACCEPT" | "AVOID" | "SHARE";
export type RiskMagnitude = "low" | "medium" | "high" | "critical";
export type DepartmentStatus = "OPEN" | "CLOSED";
```

---

## Risk Table Types

### `RiskTableRow`
Represents a single row in the ActionsTable component. This is the data structure displayed in the actions list.

```typescript
export type RiskTableRow = {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  department: Department;
  risk_owner: RiskOwner;
  status: string;
  department_status: DepartmentStatus;
  inherent_likelihood: number;      // 1-5
  inherent_impact: number;          // 1-5
  residual_likelihood: number;      // 1-5
  residual_impact: number;          // 1-5
  risk_response: RiskResponse;
  target_closing_date: string;      // ISO date format
  treatment_plan: string;
  control_effectiveness: number;    // 0-10
  mitigation_cost: number;
  created_at: string;               // ISO timestamp
  updated_at: string;               // ISO timestamp
};
```

**Usage in ActionsTable:**
```typescript
import type { RiskTableRow } from "@/lib/types/risk-types";

interface ActionsTableProps {
  actions: RiskTableRow[];
  pagination: PaginationMeta;
}
```

---

## Action Findings Types

### `ActionFindings`
Complete action findings submission with all metadata.

```typescript
export type ActionFindings = {
  id: string;                       // Unique identifier (e.g., "AF-2024-001")
  risk_id: string;                  // Associated risk ID
  action_owner_id: string;          // User who submitted findings
  description: string;              // What action was taken
  evidence_notes?: string;          // Supporting evidence details
  evidence_file_url?: string;       // Cloud storage URL
  evidence_file_name?: string;      // Original filename
  submission_date: Date | string;   // When submitted
  status: ActionFindingsStatus;     // Current status
  reviewer_id?: string;             // Who reviewed it
  reviewer_feedback?: string;       // Detailed feedback
  assessment_score?: number;        // 0-10 scale
  assessment_date?: Date | string;  // When assessed
  created_at: Date | string;
  updated_at: Date | string;
};
```

**Status Flow:**
```
OPEN
  ↓ (User submits findings)
PENDING_REVIEW
  ├─ (Reviewer approves) → COMPLETED
  └─ (Reviewer requests changes) → NEEDS_REVISION
      ↓ (User submits again)
      PENDING_REVIEW (repeat)
```

### `SubmitActionFindingsInput`
Input type for submitting action findings.

```typescript
export type SubmitActionFindingsInput = {
  risk_id: string;
  action_owner_id: string;
  description: string;              // Required, what was done
  evidence_notes?: string;          // Optional supporting notes
  evidence_file_url?: string;       // File upload URL
  evidence_file_name?: string;      // Original filename
};
```

### `AssessActionFindingsInput`
Input type for reviewer assessment.

```typescript
export type AssessActionFindingsInput = {
  reviewer_id: string;
  assessment_score: number;         // 0-10
  reviewer_feedback: string;        // Required detailed feedback
  decision: "APPROVE" | "REQUEST_CHANGES";
};
```

---

## Form Types

### `ActionFindingsFormData`
Client-side form state for submission dialog.

```typescript
export type ActionFindingsFormData = {
  description: string;              // User's action description
  evidence_notes?: string;          // Supporting notes
  evidence_file?: File;             // File upload
};
```

### `ActionFindingsFormErrors`
Validation errors for submission form.

```typescript
export type ActionFindingsFormErrors = {
  description?: string;
  evidence_notes?: string;
  evidence_file?: string;
};
```

### `AssessmentFormData`
Client-side form state for reviewer assessment.

```typescript
export type AssessmentFormData = {
  assessment_score: number;         // 0-10 slider
  reviewer_feedback: string;        // Required feedback
  decision: "APPROVE" | "REQUEST_CHANGES";
};
```

### `AssessmentFormErrors`
Validation errors for assessment form.

```typescript
export type AssessmentFormErrors = {
  assessment_score?: string;
  reviewer_feedback?: string;
  decision?: string;
};
```

---

## API Response Types

### `RisksResponse`
Response from `getRisks()` server action.

```typescript
export type RisksResponse = {
  data: RiskTableRow[];
  pagination: PaginationMeta;
};
```

### `ActionFindingsResponse`
Response from `getActionFindings()` server action.

```typescript
export type ActionFindingsResponse = {
  data: ActionFindings[];
  pagination?: PaginationMeta;
};
```

### `SubmitActionFindingsResponse`
Response from `submitActionFindings()` server action.

```typescript
export type SubmitActionFindingsResponse = {
  success: boolean;
  message: string;
  data?: ActionFindings;
};
```

### `AssessActionFindingsResponse`
Response from `assessActionFindings()` server action.

```typescript
export type AssessActionFindingsResponse = {
  success: boolean;
  message: string;
  data?: ActionFindings;
};
```

### `PaginationMeta`
Pagination metadata included in list responses.

```typescript
export type PaginationMeta = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};
```

---

## Query Parameter Types

### `RiskActionQueryParams`
Parameters for filtering risks in actions list.

```typescript
export type RiskActionQueryParams = {
  risk_action_owner_id?: string;    // Filter by action owner
  status?: RiskStatus;              // Filter by status
  department_id?: string;           // Filter by department
  category_id?: string;             // Filter by category
  search?: string;                  // Full-text search
  page?: number;
  page_size?: number;
};
```

**Usage:**
```typescript
const response = await getRisks({
  risk_action_owner_id: user.id,
  status: "OPEN",
  page: 1,
  page_size: 10
});
```

### `ActionFindingsQueryParams`
Parameters for filtering action findings.

```typescript
export type ActionFindingsQueryParams = {
  risk_id?: string;
  action_owner_id?: string;
  reviewer_id?: string;
  status?: ActionFindingsStatus;
  page?: number;
  page_size?: number;
};
```

---

## Risk Scoring Types

### `RiskScore`
Risk score calculations.

```typescript
export type RiskScore = {
  inherent_score: number;    // Initial risk score (likelihood × impact)
  residual_score: number;    // After controls applied
  likelihood: number;        // 1-5 scale
  impact: number;           // 1-5 scale
};
```

### `RiskSeverityLevel`
Risk severity classification.

```typescript
export type RiskSeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
```

---

## Usage Examples

### Example 1: Getting Risks Assigned to User

```typescript
import type { RiskTableRow, RisksResponse } from "@/lib/types/risk-types";
import { getRisks } from "@/app/_actions/risk-module-actions";

const response = await getRisks({
  risk_action_owner_id: user.id,
  page: 1,
  page_size: 10
});

// Type-safe access
const risks: RiskTableRow[] = response.data;
const pagination = response.pagination;
```

### Example 2: Submitting Action Findings

```typescript
import type { SubmitActionFindingsInput, SubmitActionFindingsResponse } from "@/lib/types/risk-types";
import { submitActionFindings } from "@/app/_actions/risk-module-actions";

const input: SubmitActionFindingsInput = {
  risk_id: "1",
  action_owner_id: "user-123",
  description: "Implemented MFA on all systems",
  evidence_notes: "Deployment completed on 2024-11-07",
  evidence_file_url: "https://cloud-storage.com/file.pdf"
};

const response: SubmitActionFindingsResponse = await submitActionFindings(input);
```

### Example 3: Type-Safe Form Handling

```typescript
import type { ActionFindingsFormData, ActionFindingsFormErrors } from "@/lib/types/risk-types";
import { useState } from "react";

export function ActionFindingsForm() {
  const [formData, setFormData] = useState<ActionFindingsFormData>({
    description: "",
    evidence_notes: "",
  });

  const [errors, setErrors] = useState<ActionFindingsFormErrors>({});

  const handleSubmit = async () => {
    // Validation
    const newErrors: ActionFindingsFormErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit...
  };
}
```

### Example 4: Reviewer Assessment

```typescript
import type { AssessActionFindingsInput } from "@/lib/types/risk-types";
import { assessActionFindings } from "@/app/_actions/risk-module-actions";

const assessment: AssessActionFindingsInput = {
  reviewer_id: "reviewer-123",
  assessment_score: 9,
  reviewer_feedback: "Excellent implementation of controls. Minor recommendations for documentation.",
  decision: "APPROVE"
};

const response = await assessActionFindings(findings.id, assessment);
```

### Example 5: Type-Safe Action Owner Assignment

```typescript
import type { RiskActionOwnerAssignment } from "@/lib/types/risk-types";

const assignment: RiskActionOwnerAssignment = {
  risk_id: "1",
  action_owner_id: "user-action-owner-1",
  assigned_at: new Date().toISOString(),
  assigned_by: "manager-123"
};
```

---

## Best Practices

1. **Always use imported types** instead of creating inline types
   ```typescript
   // ✅ Good
   import type { RiskTableRow } from "@/lib/types/risk-types";
   const risk: RiskTableRow = data;

   // ❌ Avoid
   const risk: any = data;
   ```

2. **Use type annotations for function parameters**
   ```typescript
   // ✅ Good
   async function submitFindings(input: SubmitActionFindingsInput) {
     // ...
   }

   // ❌ Avoid
   async function submitFindings(input: any) {
     // ...
   }
   ```

3. **Leverage union types for status checks**
   ```typescript
   // ✅ Good - TypeScript catches invalid statuses
   const isCompleted = status === "COMPLETED";

   // ❌ Avoid - Easy to typo
   const isCompleted = status === "completed";
   ```

4. **Keep form data separate from API input**
   ```typescript
   // Form data (client-side)
   const formData: ActionFindingsFormData = { ... };

   // API input (when submitting)
   const apiInput: SubmitActionFindingsInput = { ... };
   ```

5. **Use optional fields for nullable data**
   ```typescript
   reviewer_feedback?: string;    // Optional until reviewed
   assessment_score?: number;     // Optional until assessed
   ```

---

## File Locations

- **Type Definitions**: `lib/types/risk-types.ts`
- **Type Guide**: `lib/types/RISK_TYPES_GUIDE.md`
- **Server Actions**: `app/_actions/risk-module-actions.ts`
- **Components**:
  - `app/dashboard/(modules)/risks/actions/page.tsx` - Actions list page
  - `app/dashboard/(modules)/risks/actions/actions-table.tsx` - Main table
  - `app/dashboard/(modules)/risks/_components/action-findings-dialog.tsx` - Submission form
  - `app/dashboard/(modules)/risks/_components/action-assessment-form.tsx` - Reviewer form

---

## Migration from Mock to Real API

When connecting to real backend:

1. Update `getRisks()` to use real API endpoint
2. Update `submitActionFindings()` to send to real endpoint
3. Update `assessActionFindings()` to update real database
4. Ensure API responses match type definitions
5. Handle additional fields from real API with type extension

---

## Version History

- **v1.0** (2024-11-07): Initial type definitions for action findings workflow
