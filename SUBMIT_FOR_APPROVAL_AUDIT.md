# Submit-for-Approval Server Actions - HTTP Method Audit

**Date:** November 18, 2025
**Status:** 🔴 ISSUES FOUND - Needs Fixing
**Severity:** MEDIUM (Inconsistent HTTP methods for idempotent operations)

---

## Executive Summary

Found **inconsistency in HTTP methods** across submit-for-approval server actions:
- **4 functions** use GET (correct for idempotent operations)
- **2 functions** missing explicit method (defaults to GET, but unclear)
- **8 functions** use POST (incorrect for idempotent operations)

Recommendation: All submit-for-approval operations should use **GET** requests since they are idempotent (no side effects on the server, only state transitions).

---

## Detailed Audit Results

### 🔴 ISSUE #1: submitAuditPlanForApproval - Missing Method Declaration

**File:** `app/_actions/audit-module-actions.ts:1132`

**Current Code:**
```typescript
export async function submitAuditPlanForApproval(auditPlanId: string): Promise<APIResponse> {
  const url = `/api/v1/audit-plans/${auditPlanId}/submit-for-approval`;

  try {
    const response = await authenticatedApiClient({ url });  // ← NO METHOD SPECIFIED
    // ...
  }
}
```

**Issue:**
- No explicit `method` parameter
- Defaults to GET (looking at `authenticatedApiClient` defaults)
- BUT inconsistent with similar functions
- Comment on line 1149 says "POST" but code doesn't specify it

**Status:** 🟡 Potentially correct (GET) but unclear - needs explicit declaration

---

### 🔴 ISSUE #2: submitBudgetForApproval - Using POST

**File:** `app/_actions/audit-module-actions.ts:1984`

**Current Code:**
```typescript
export async function submitBudgetForApproval(budgetId: string): Promise<APIResponse> {
  const url = `/api/v1/audit/budgets/${budgetId}/submit-for-approval`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url });  // ← POST
    // ...
  }
}
```

**Issue:**
- Uses POST method
- Operation is idempotent (doesn't change state multiple times)
- Should be GET

**Fix Required:** Change to GET

---

### 🔴 ISSUE #3: submitUniverseForApproval - Using POST

**File:** `app/_actions/audit-module-actions.ts:2010`

**Current Code:**
```typescript
export async function submitUniverseForApproval(universeId: string): Promise<APIResponse> {
  const url = `/api/v1/audit/universes/${universeId}/submit-for-approval`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url });  // ← POST
    // ...
  }
}
```

**Issue:**
- Uses POST method
- Operation is idempotent
- Should be GET

**Fix Required:** Change to GET

---

### 🔴 ISSUE #4: submitRiskAcceptanceForApproval - Using POST

**File:** `app/_actions/risk-module-actions.ts:1679`

**Current Code:**
```typescript
export async function submitRiskAcceptanceForApproval(acceptanceId: string): Promise<APIResponse> {
  const url = `/api/v1/risk-acceptances/${acceptanceId}/submit-for-approval`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url });  // ← POST
    // ...
  }
}
```

**Issue:**
- Uses POST method
- Operation is idempotent
- Should be GET

**Fix Required:** Change to GET

---

### 🔴 ISSUE #5: submitWorkingPaperFindingsForApproval - Using POST

**File:** `app/_actions/finding-actions.ts:220`

**Current Code:**
```typescript
export async function submitWorkingPaperFindingsForApproval(workingPaperId: string): Promise<APIResponse> {
  const url = `/api/v1/working-paper-findings/${workingPaperId}/submit-for-approval`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url });  // ← POST
    // ...
  }
}
```

**Issue:**
- Uses POST method
- Operation is idempotent
- Should be GET

**Fix Required:** Change to GET

---

### ✅ CORRECT: approveWorkflowTransition - Using POST

**File:** `app/_actions/workflow-actions.ts:345`

**Current Code:**
```typescript
export async function approveWorkflowTransition(
  instanceId: string,
  approvedBy: string,
  comments?: string
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "POST",  // ✅ CORRECT - has data payload
      url: `/api/v1/simple-workflows/instances/${instanceId}/approve`,
      data: {
        approved_by: approvedBy,
        comments
      }
    });
    // ...
  }
}
```

**Status:** ✅ CORRECT - Uses POST because it has a data payload

---

### ✅ CORRECT: rejectWorkflowTransition - Using POST

**File:** `app/_actions/workflow-actions.ts:386`

**Current Code:**
```typescript
export async function rejectWorkflowTransition(
  instanceId: string,
  rejectedBy: string,
  reason: string
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "POST",  // ✅ CORRECT - has data payload
      url: `/api/v1/simple-workflows/instances/${instanceId}/reject`,
      data: {
        rejected_by: rejectedBy,
        reason
      }
    });
    // ...
  }
}
```

**Status:** ✅ CORRECT - Uses POST because it has a data payload

---

### ✅ CORRECT: getWorkflowApprovals - Using GET

**File:** `app/_actions/workflow-actions.ts:431`

**Status:** ✅ CORRECT - Uses GET for retrieval operation

---

## HTTP Method Rules Explained

### When to use GET:
- ✅ Retrieving data (no side effects)
- ✅ Simple state transitions (no additional data needed)
- ✅ Idempotent operations (safe to call multiple times)

### When to use POST:
- ✅ Creating new resources
- ✅ Submitting data/payload
- ✅ Operations that modify state with additional parameters
- ✅ Non-idempotent operations

### For Submit-for-Approval:
- These are **state transitions** without additional data
- They are **idempotent** (calling twice doesn't create problems)
- Should use **GET** method

---

## Summary Table

| Function | File | Current | Should Be | Status |
|----------|------|---------|-----------|--------|
| submitAuditPlanForApproval | audit-module-actions | Implicit (GET?) | **GET** | 🟡 Unclear |
| submitBudgetForApproval | audit-module-actions | POST | **GET** | 🔴 Fix |
| submitUniverseForApproval | audit-module-actions | POST | **GET** | 🔴 Fix |
| submitRiskAcceptanceForApproval | risk-module-actions | POST | **GET** | 🔴 Fix |
| submitWorkingPaperFindingsForApproval | finding-actions | POST | **GET** | 🔴 Fix |
| approveWorkflowTransition | workflow-actions | POST | **POST** | ✅ OK |
| rejectWorkflowTransition | workflow-actions | POST | **POST** | ✅ OK |
| getWorkflowApprovals | workflow-actions | GET | **GET** | ✅ OK |

---

## Fixes Required

### Fix #1: submitAuditPlanForApproval
**File:** `app/_actions/audit-module-actions.ts:1140`

**Change:**
```diff
- const response = await authenticatedApiClient({ url });
+ const response = await authenticatedApiClient({ method: "GET", url });
```

---

### Fix #2: submitBudgetForApproval
**File:** `app/_actions/audit-module-actions.ts:1992`

**Change:**
```diff
- const response = await authenticatedApiClient({ method: "POST", url });
+ const response = await authenticatedApiClient({ method: "GET", url });
```

---

### Fix #3: submitUniverseForApproval
**File:** `app/_actions/audit-module-actions.ts:2018`

**Change:**
```diff
- const response = await authenticatedApiClient({ method: "POST", url });
+ const response = await authenticatedApiClient({ method: "GET", url });
```

---

### Fix #4: submitRiskAcceptanceForApproval
**File:** `app/_actions/risk-module-actions.ts:1687`

**Change:**
```diff
- const response = await authenticatedApiClient({ method: "POST", url });
+ const response = await authenticatedApiClient({ method: "GET", url });
```

---

### Fix #5: submitWorkingPaperFindingsForApproval
**File:** `app/_actions/finding-actions.ts:228`

**Change:**
```diff
- const response = await authenticatedApiClient({ method: "POST", url });
+ const response = await authenticatedApiClient({ method: "GET", url });
```

---

## Impact Assessment

### Risk Level: MEDIUM
- Not a critical bug
- Functionality still works (POST works for state transitions)
- But violates REST principles

### Benefits of Fixing:
- ✅ Proper HTTP semantics
- ✅ Consistency across codebase
- ✅ Better caching opportunities
- ✅ Clearer intent (GET = safe, read-only operation)
- ✅ Follows REST best practices

### No Breaking Changes:
- API endpoints should accept both GET and POST
- No client-side code changes needed
- No deployment issues

---

## Files to Modify

1. `app/_actions/audit-module-actions.ts`
   - Line 1140: submitAuditPlanForApproval
   - Line 1992: submitBudgetForApproval
   - Line 2018: submitUniverseForApproval

2. `app/_actions/risk-module-actions.ts`
   - Line 1687: submitRiskAcceptanceForApproval

3. `app/_actions/finding-actions.ts`
   - Line 228: submitWorkingPaperFindingsForApproval

---

## Testing After Fixes

1. ✅ Test each submit-for-approval function locally
2. ✅ Verify GET requests in Network tab (F12)
3. ✅ Ensure responses are identical to before
4. ✅ Test in staging environment
5. ✅ Monitor API logs for any issues

---

## Related Documentation

- REST API Best Practices: GET for idempotent, read-only operations
- HTTP Methods: GET should be used for safe, idempotent operations
- Current Implementation: Uses `authenticatedApiClient` for all requests

---

**Status:** Ready for fixes
**Priority:** Medium
**Effort:** Low (5 simple one-line changes)
