# Missing Routes Implementation Guide

**Date:** November 11, 2025
**Purpose:** Track and implement missing backend API routes
**Status:** Initial audit complete, awaiting backend implementation

---

## 🔴 Critical Missing Routes (Must Have)

### 1. Province Update & Delete (4 endpoints)

**Current State:** Mocked with setTimeout simulation
**Location:** `app/_actions/config-actions.ts` lines 820-985
**User Impact:** Cannot update/delete provinces and towns in admin interface
**Effort:** 4-6 hours (backend)

#### Frontend Status
```typescript
// config-actions.ts

export async function updateProvince(data: {
  id: string;
  name?: string;
  code?: string;
}): Promise<APIResponse> {
  const url = `/api/v1/provinces/${data.id}`;

  // CURRENTLY: Mock with setTimeout
  // READY FOR: Real API implementation

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data
    });
    return successResponse(response?.data, "Province updated successfully");
  } catch (error) {
    return handleError(error, "PUT", url);
  }
}
```

#### Backend Requirements

**Endpoints to Implement:**

1. **PUT /api/v1/provinces/{id}**
   ```json
   Request: {
     "name": "string",
     "code": "string",
     "iso2_code": "string?"
   }
   Response: {
     "id": "uuid",
     "name": "string",
     "code": "string",
     "iso2_code": "string",
     "created_at": "timestamp",
     "updated_at": "timestamp"
   }
   ```

2. **DELETE /api/v1/provinces/{id}**
   ```json
   Response: {
     "message": "Province deleted successfully"
   }
   ```

3. **PUT /api/v1/towns/{id}**
   ```json
   Request: {
     "name": "string",
     "code": "string",
     "province_id": "uuid"
   }
   Response: {
     "id": "uuid",
     "name": "string",
     "code": "string",
     "province_id": "uuid",
     "created_at": "timestamp",
     "updated_at": "timestamp"
   }
   ```

4. **DELETE /api/v1/towns/{id}**
   ```json
   Response: {
     "message": "Town deleted successfully"
   }
   ```

#### Implementation Steps

**Backend:**
1. Create update handlers for provinces and towns
2. Add validation (unique name/code per country/province)
3. Handle cascading effects (branches linked to town)
4. Return proper error codes (409 if still in use)

**Frontend (After Backend Ready):**
1. Remove mock implementation from lines 820-850 (updateProvince)
2. Remove mock implementation from lines 857-867 (deleteProvince)
3. Remove mock implementation from lines 938-968 (updateTown)
4. Remove mock implementation from lines 975-985 (deleteTown)
5. Verify tests pass
6. Deploy

---

### 2. Workflow Transition Execution (2 endpoints)

**Current State:** Not implemented
**Location:** Workflows exist but transition execution missing
**User Impact:** Cannot execute workflow transitions from UI
**Effort:** 8-10 hours (backend + frontend)

#### Missing Endpoints

1. **POST /api/v1/workflows/{id}/execute-transition**
   ```json
   Request: {
     "entity_id": "uuid",
     "entity_type": "RISK|AUDIT_PLAN|FINDING|RECOMMENDATION",
     "transition_id": "uuid"
   }
   Response: {
     "new_state": "string",
     "state_id": "uuid",
     "timestamp": "datetime"
   }
   ```

2. **POST /api/v1/workflows/{id}/submit**
   ```json
   Request: {
     "entity_id": "uuid",
     "entity_type": "string"
   }
   Response: {
     "status": "submitted",
     "submitted_at": "datetime"
   }
   ```

#### Frontend Implementation Needed

**File:** `app/_actions/workflow-actions.ts`

```typescript
export async function executeWorkflowTransition({
  workflowId,
  entityId,
  entityType,
  transitionId
}: {
  workflowId: string;
  entityId: string;
  entityType: "RISK" | "AUDIT_PLAN" | "FINDING" | "RECOMMENDATION";
  transitionId: string;
}): Promise<APIResponse> {
  const url = `/api/v1/workflows/${workflowId}/execute-transition`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: { entity_id: entityId, entity_type: entityType, transition_id: transitionId }
    });
    return successResponse(response?.data, "Transition executed successfully");
  } catch (error) {
    return handleError(error, "POST", url);
  }
}

export async function submitWorkflowEntity({
  workflowId,
  entityId,
  entityType
}: {
  workflowId: string;
  entityId: string;
  entityType: string;
}): Promise<APIResponse> {
  const url = `/api/v1/workflows/${workflowId}/submit`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: { entity_id: entityId, entity_type: entityType }
    });
    return successResponse(response?.data, "Entity submitted successfully");
  } catch (error) {
    return handleError(error, "POST", url);
  }
}
```

---

## 🟠 High Priority Missing Routes

### 3. Risk Escalation

**Current State:** Not implemented
**Location:** Risk management module
**User Impact:** Cannot escalate risks through system
**Effort:** 3-4 hours

#### Backend Requirement

**POST /api/v1/risks/{id}/escalate**
```json
Request: {
  "reason": "string",
  "escalate_to_level": "1|2|3",
  "notes": "string?"
}
Response: {
  "id": "uuid",
  "escalated_at": "datetime",
  "escalation_level": "number"
}
```

#### Frontend Implementation

```typescript
// Add to risk-module-actions.ts
export async function escalateRisk({
  riskId,
  reason,
  escalateToLevel,
  notes
}: {
  riskId: string;
  reason: string;
  escalateToLevel: number;
  notes?: string;
}): Promise<APIResponse> {
  const url = `/api/v1/risks/${riskId}/escalate`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: { reason, escalate_to_level: escalateToLevel, notes }
    });
    return successResponse(response?.data, "Risk escalated successfully");
  } catch (error) {
    return handleError(error, "POST", url);
  }
}
```

---

### 4. Finding-Risk Linking

**Current State:** Not implemented
**Location:** Findings module
**User Impact:** Cannot link findings to existing risks
**Effort:** 2-3 hours

#### Backend Requirement

**POST /api/v1/findings/{id}/link-risk**
```json
Request: {
  "risk_id": "uuid"
}
Response: {
  "finding_id": "uuid",
  "risk_id": "uuid",
  "linked_at": "datetime"
}
```

#### Frontend Implementation

```typescript
// Add to finding-actions.ts
export async function linkFindingToRisk({
  findingId,
  riskId
}: {
  findingId: string;
  riskId: string;
}): Promise<APIResponse> {
  const url = `/api/v1/findings/${findingId}/link-risk`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: { risk_id: riskId }
    });
    return successResponse(response?.data, "Finding linked to risk successfully");
  } catch (error) {
    return handleError(error, "POST", url);
  }
}
```

---

### 5. Audit Plan Duplication

**Current State:** Not implemented
**Location:** Audit module
**User Impact:** Cannot quickly create audit plans from templates
**Effort:** 4-5 hours

#### Backend Requirement

**POST /api/v1/audit-plans/{id}/duplicate**
```json
Request: {
  "new_year": "number",
  "copy_workpapers": "boolean?"
}
Response: {
  "id": "uuid",
  "title": "string",
  "audit_year": "number",
  "duplicated_from": "uuid",
  "created_at": "datetime"
}
```

#### Frontend Implementation

```typescript
// Add to audit-module-actions.ts
export async function duplicateAuditPlan({
  auditPlanId,
  newYear,
  copyWorkpapers = false
}: {
  auditPlanId: string;
  newYear: number;
  copyWorkpapers?: boolean;
}): Promise<APIResponse> {
  const url = `/api/v1/audit-plans/${auditPlanId}/duplicate`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: { new_year: newYear, copy_workpapers: copyWorkpapers }
    });
    return successResponse(response?.data, "Audit plan duplicated successfully");
  } catch (error) {
    return handleError(error, "POST", url);
  }
}
```

---

### 6. KRI Measurement Configuration

**Current State:** Not fully implemented
**Location:** Risk module (KRI management)
**User Impact:** Cannot configure how KRI measurements are calculated
**Effort:** 5-6 hours

#### Backend Requirement

**POST /api/v1/kris/{id}/configure-measurement**
```json
Request: {
  "measurement_frequency": "DAILY|WEEKLY|MONTHLY|QUARTERLY|ANNUALLY",
  "threshold_green": "number",
  "threshold_amber": "number",
  "threshold_red": "number",
  "calculation_method": "AVERAGE|MAX|MIN|LATEST"
}
Response: {
  "id": "uuid",
  "configured_at": "datetime"
}
```

---

## 🟡 Medium Priority Missing Routes

### 7. Report Generation & Export

**Current State:** Mocked only
**Location:** `audit-module-actions.ts` lines 686-788
**User Impact:** Cannot generate PDF/Excel reports
**Effort:** 20-30 hours

#### Backend Requirements

1. **POST /api/v1/reports/generate**
   ```json
   Request: {
     "report_type": "SUMMARY|DETAILED|FINDINGS|AUDIT_COMPLETION",
     "entity_id": "uuid",
     "entity_type": "AUDIT_PLAN|FINDINGS",
     "format": "PDF|EXCEL|CSV"
   }
   Response: {
     "report_id": "uuid",
     "download_url": "string",
     "generated_at": "datetime"
   }
   ```

2. **GET /api/v1/reports/{id}/download**
   - Returns PDF/Excel file as binary

#### Frontend Implementation

```typescript
export async function generateReport({
  reportType,
  entityId,
  entityType,
  format = "PDF"
}: {
  reportType: string;
  entityId: string;
  entityType: string;
  format: "PDF" | "EXCEL" | "CSV";
}): Promise<APIResponse> {
  const url = `/api/v1/reports/generate`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: { report_type: reportType, entity_id: entityId, entity_type: entityType, format }
    });
    return successResponse(response?.data, "Report generated successfully");
  } catch (error) {
    return handleError(error, "POST", url);
  }
}
```

---

### 8. Global Search

**Current State:** Not implemented
**Location:** Would go in new search-actions.ts
**User Impact:** Cannot search across all entities
**Effort:** 8-10 hours

#### Backend Requirement

**GET /api/v1/search**
```json
Query: {
  "q": "search term",
  "entity_types": "RISK|AUDIT_PLAN|FINDING|...",
  "limit": 20
}
Response: {
  "results": [
    {
      "id": "uuid",
      "type": "RISK",
      "title": "string",
      "description": "string",
      "url": "string"
    }
  ],
  "total": "number"
}
```

#### Frontend Implementation

```typescript
// Create app/_actions/search-actions.ts
export async function globalSearch(query: string, entityTypes?: string[]): Promise<APIResponse> {
  const params = new URLSearchParams();
  params.append("q", query);
  params.append("limit", "20");

  if (entityTypes?.length) {
    params.append("entity_types", entityTypes.join(","));
  }

  const url = `/api/v1/search?${params.toString()}`;

  try {
    const response = await authenticatedApiClient({ url });
    return successResponse(response?.data, "Search results fetched");
  } catch (error) {
    return handleError(error, "GET", url);
  }
}
```

---

### 9. Real-time Notifications

**Current State:** Not implemented
**Location:** Would require WebSocket integration
**User Impact:** Users don't get real-time updates
**Effort:** 15-20 hours

#### Backend Requirement

**GET /api/v1/notifications**
```json
Response: {
  "notifications": [
    {
      "id": "uuid",
      "type": "RISK_ESCALATED|AUDIT_PLAN_APPROVED|...",
      "message": "string",
      "entity_id": "uuid",
      "read": "boolean",
      "created_at": "datetime"
    }
  ]
}
```

**WebSocket:** `/ws/notifications` (optional for real-time)

---

## 🟢 Low Priority Nice-to-Have Routes

### 10. Audit Plan Export as Template

**POST /api/v1/audit-plans/{id}/export-template**
- Export audit plan structure for reuse
- Effort: 2-3 hours

### 11. Batch Risk Import

**POST /api/v1/risks/bulk-import**
- Import multiple risks from CSV
- Effort: 6-8 hours

### 12. Advanced Analytics

**GET /api/v1/analytics/dashboard**
- Dashboard metrics and charts
- Effort: 10-12 hours

---

## 📊 Implementation Roadmap

### Phase 1: Critical (Week 1)
- [ ] Province & Town CRUD (4 endpoints)
- [ ] Workflow transition execution (2 endpoints)

### Phase 2: High Priority (Week 2-3)
- [ ] Risk escalation
- [ ] Finding-risk linking
- [ ] Audit plan duplication
- [ ] KRI configuration

### Phase 3: Medium Priority (Week 4-5)
- [ ] Report generation & export
- [ ] Global search
- [ ] Batch operations

### Phase 4: Nice-to-Have (Future)
- [ ] Notifications system
- [ ] Advanced analytics
- [ ] Export as template

---

## 🔄 Integration Process

### When Backend Route is Ready

1. **Backend Team Notifies Frontend:**
   - Endpoint URL
   - HTTP method
   - Request format
   - Response format
   - Error codes

2. **Frontend Team:**
   - Creates/updates server action
   - Adds React Query hook if needed
   - Updates UI components
   - Tests end-to-end
   - Removes any mocks
   - Updates this document

3. **Testing:**
   - Integration tests
   - Error scenarios
   - Edge cases
   - Performance

4. **Deployment:**
   - Code review
   - Staging verification
   - Production release
   - Monitor for issues

---

## 📋 Template for Adding New Routes

```typescript
/**
 * [Feature Name]
 * Endpoint: [METHOD] /api/v1/[path]
 * Status: [READY|PENDING|COMPLETED]
 * Date Added: [DATE]
 */
export async function [functionName]({
  [param1],
  [param2]
}: {
  [param1]: [type];
  [param2]: [type];
}): Promise<APIResponse> {
  const url = `/api/v1/[path]`;

  if (![param1]) {
    return handleBadRequest("[param1] is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "[METHOD]",
      data: { [param1], [param2] }
    });

    return successResponse(response?.data, "[Success message]");
  } catch (error: Error | any) {
    return handleError(error, "[METHOD]", url);
  }
}
```

---

## 📞 Coordination Checklist

- [ ] Backend team reviewed this document
- [ ] Priorities agreed upon
- [ ] Resource allocation confirmed
- [ ] Timeline communicated
- [ ] Weekly sync scheduled
- [ ] This document updated regularly

---

**Last Updated:** November 11, 2025
**Status:** Initial audit complete, awaiting backend implementation
**Next Review:** Weekly sync with backend team
