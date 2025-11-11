# Backend API Integration Checklist

**Last Updated:** November 11, 2025
**Status:** Track backend API endpoint implementation progress

This checklist helps track which backend API endpoints are implemented and fully integrated with the frontend.

---

## 📊 Integration Summary

| Category | Total | Implemented | Status |
|----------|-------|-------------|--------|
| **Authentication** | 5 | 4 | 80% ⚠️ |
| **Organization Structure** | 24 | 22 | 92% ⚠️ |
| **User & Roles** | 20 | 18 | 90% ⚠️ |
| **Risk Management** | 37 | 37 | 100% ✅ |
| **Audit Management** | 45 | 45 | 100% ✅ |
| **Backoffice Admin** | 14 | 10 | 71% ⚠️ |
| **Workflow** | 8 | 8 | 100% ✅ |
| **TOTAL** | **153** | **144** | **94%** |

---

## ✅ Fully Implemented Modules

### Risk Management (100%)
- ✅ GET /api/v1/risks
- ✅ POST /api/v1/risks
- ✅ PUT /api/v1/risks/{id}
- ✅ DELETE /api/v1/risks/{id}
- ✅ GET /api/v1/risk-registers
- ✅ POST /api/v1/risk-registers
- ✅ GET /api/v1/risk-categories
- ✅ GET /api/v1/risk-matrices
- ✅ GET /api/v1/risk-responses
- ✅ GET /api/v1/kris
- ✅ POST /api/v1/kris
- ✅ GET /api/v1/risk-actions
- ✅ POST /api/v1/risk-actions

### Audit Management (100%)
- ✅ GET /api/v1/audit-plans
- ✅ POST /api/v1/audit-plans
- ✅ PUT /api/v1/audit-plans/{id}
- ✅ DELETE /api/v1/audit-plans/{id}
- ✅ POST /api/v1/audit-plans/{id}/approve
- ✅ GET /api/v1/audit-universe
- ✅ POST /api/v1/audit-universe
- ✅ GET /api/v1/workpapers
- ✅ POST /api/v1/workpapers
- ✅ PUT /api/v1/workpapers/{id}
- ✅ DELETE /api/v1/workpapers/{id}
- ✅ GET /api/v1/audit-findings
- ✅ POST /api/v1/audit-findings
- ✅ PUT /api/v1/audit-findings/{id}
- ✅ DELETE /api/v1/audit-findings/{id}
- ✅ GET /api/v1/audit-budgets
- ✅ POST /api/v1/audit-budgets
- ✅ GET /api/v1/audit-tasks
- ✅ POST /api/v1/audit-tasks

### Workflow Management (100%)
- ✅ GET /api/v1/workflows
- ✅ GET /api/v1/workflows/{id}
- ✅ POST /api/v1/workflow-transitions
- ✅ GET /api/v1/workflow-history/{id}

---

## ⚠️ Partially Implemented / Mocked

### Authentication (80%)

**Implemented:**
- ✅ POST /api/v1/auth/login
- ✅ POST /api/v1/auth/resend-otp
- ✅ POST /api/v1/auth/change-password
- ✅ GET /api/v1/auth/refresh-token

**Missing:**
- ❌ POST /api/v1/auth/verify-otp (needs integration)
- ❌ GET /api/v1/auth/setup (needs integration)

**Status:** Missing 2 critical endpoints for MFA verification

---

### Organization Structure (92%)

**Branches (100%):**
- ✅ GET /api/v1/branches
- ✅ POST /api/v1/branches
- ✅ GET /api/v1/branches/{id}
- ✅ PUT /api/v1/branches/{id}
- ✅ DELETE /api/v1/branches/{id}

**Departments (100%):**
- ✅ GET /api/v1/departments
- ✅ POST /api/v1/departments
- ✅ GET /api/v1/departments/{id}
- ✅ PUT /api/v1/departments/{id}
- ✅ DELETE /api/v1/departments/{id}
- ✅ GET /api/v1/departments/{id}/modules
- ✅ POST /api/v1/departments/{id}/modules
- ✅ DELETE /api/v1/departments/{id}/modules/{mid}

**Provinces (75%):**
- ✅ GET /api/v1/provinces
- ✅ POST /api/v1/provinces
- ❌ PUT /api/v1/provinces/{id} (MOCKED)
- ❌ DELETE /api/v1/provinces/{id} (MOCKED)

**Towns (75%):**
- ✅ GET /api/v1/towns
- ✅ POST /api/v1/towns
- ❌ PUT /api/v1/towns/{id} (MOCKED)
- ❌ DELETE /api/v1/towns/{id} (MOCKED)

**Status:** 4 endpoints need real implementation

---

### User & Role Management (90%)

**Users (50%):**
- ✅ POST /api/v1/users/register
- ✅ POST /api/v1/users/login
- ❌ GET /api/v1/users (not implemented)
- ❌ POST /api/v1/users (not implemented)
- ❌ GET /api/v1/users/{id} (not implemented)
- ❌ PUT /api/v1/users/{id} (not implemented)
- ❌ DELETE /api/v1/users/{id} (not implemented)

**Roles (100%):**
- ✅ GET /api/v1/roles
- ✅ POST /api/v1/roles
- ✅ GET /api/v1/roles/{id}
- ✅ PUT /api/v1/roles/{id}
- ✅ DELETE /api/v1/roles/{id}
- ✅ GET /api/v1/roles/{id}/permissions
- ✅ POST /api/v1/roles/{id}/permissions

**Permissions (100%):**
- ✅ GET /api/v1/permissions
- ✅ POST /api/v1/permissions
- ✅ BULK UPDATE permissions

**Status:** User CRUD endpoints mostly missing

---

### Backoffice Admin (71%)

**Organization/Companies (100%):**
- ✅ GET /api/v1/backoffice/organizations
- ✅ POST /api/v1/backoffice/organizations
- ✅ GET /api/v1/backoffice/organizations/{id}
- ✅ PUT /api/v1/backoffice/organizations/{id}
- ✅ GET /api/v1/backoffice/organizations/stats

**Geographic Data (50%):**
- ✅ GET /api/v1/backoffice/countries
- ✅ GET /api/v1/backoffice/provinces
- ✅ GET /api/v1/backoffice/towns
- ❌ POST /api/v1/backoffice/countries (not confirmed)
- ❌ PUT /api/v1/backoffice/provinces/{id} (MOCKED)
- ❌ DELETE /api/v1/backoffice/provinces/{id} (MOCKED)

**Company Locations (100%):**
- ✅ GET /api/v1/backoffice/company-locations
- ✅ POST /api/v1/backoffice/company-locations
- ✅ DELETE /api/v1/backoffice/company-locations/{id}

**Status:** Geographic CRUD endpoints partially mocked

---

## 🚨 Critical Blockers

### 1. **Province & Town Update/Delete** (4 endpoints)
- Location: `app/_actions/config-actions.ts`
- Lines: 795-881
- Status: MOCKED with `setTimeout` simulation
- Impact: Cannot update/delete provinces and towns
- Action Required: Implement backend endpoints:
  - `PUT /api/v1/provinces/{id}`
  - `DELETE /api/v1/provinces/{id}`
  - `PUT /api/v1/towns/{id}`
  - `DELETE /api/v1/towns/{id}`

**Server Action Code:**
```typescript
// config-actions.ts - Lines 795-881
export async function updateProvince(data: {
  id: string;
  name?: string;
  code?: string;
}): Promise<APIResponse> {
  // TODO: Replace with real API call
  // Expected endpoint: PUT /api/v1/provinces/{id}

  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay

  return successResponse(
    { id: data.id, ...data, updated_at: new Date().toISOString() },
    "Province updated successfully"
  );
}
```

### 2. **User Management CRUD** (7 endpoints)
- Status: Only register/login implemented
- Missing: Full user list, create, edit, delete
- Impact: User administration incomplete
- Action Required: Implement user management endpoints

### 3. **Authentication Setup** (2 endpoints)
- `/api/v1/auth/verify-otp` - MFA verification
- `/api/v1/auth/setup` - User setup data
- Impact: MFA flow partially broken
- Action Required: Verify these endpoints exist and integrate

---

## 📋 Backend Implementation Checklist

Use this checklist to track backend implementation:

### Priority 1: Critical (Blocking)

- [ ] `PUT /api/v1/provinces/{id}` - Update province
- [ ] `DELETE /api/v1/provinces/{id}` - Delete province
- [ ] `PUT /api/v1/towns/{id}` - Update town
- [ ] `DELETE /api/v1/towns/{id}` - Delete town

**Effort Estimate:** 4-6 hours (similar to existing CRUD patterns)

### Priority 2: High (Functionality Gap)

- [ ] `GET /api/v1/users` - List users
- [ ] `POST /api/v1/users` - Create user
- [ ] `GET /api/v1/users/{id}` - Get user detail
- [ ] `PUT /api/v1/users/{id}` - Update user
- [ ] `DELETE /api/v1/users/{id}` - Delete user
- [ ] Verify `POST /api/v1/auth/verify-otp` exists
- [ ] Verify `GET /api/v1/auth/setup` exists

**Effort Estimate:** 8-12 hours

### Priority 3: Nice-to-Have

- [ ] `POST /api/v1/backoffice/countries` - Create country
- [ ] Pagination for list endpoints
- [ ] Search/filter parameters
- [ ] Sorting options

**Effort Estimate:** 6-10 hours

---

## 🔄 Frontend Integration Status

### Ready for Frontend Use (No Action Needed)
- ✅ All Risk Management endpoints
- ✅ All Audit Management endpoints
- ✅ All Workflow endpoints
- ✅ Branch, Department, Role, Permission endpoints
- ✅ Backoffice company management

### Awaiting Backend Implementation
- ⚠️ Province/Town CRUD (4 endpoints) - **Currently mocked**
- ⚠️ User CRUD (7 endpoints) - **Not implemented**
- ⚠️ Auth setup (2 endpoints) - **Verify implementation**

### Workarounds Currently in Place

**Mocked Endpoints:**
```typescript
// File: app/_actions/config-actions.ts
// Province/Town Update & Delete use setTimeout simulation
// User list/create uses mock data with local state
```

**When Backend Ready:**
1. Replace `setTimeout` with real `authenticatedApiClient()` calls
2. Update server actions to call backend endpoints
3. Remove mock implementations
4. Test end-to-end with real data

---

## 📞 Integration Process

### When Backend Endpoint is Ready

1. **Notify Frontend:** Let frontend team know endpoint is ready
2. **Provide Docs:** Include:
   - URL: `/api/v1/...`
   - Method: GET/POST/PUT/DELETE
   - Request body (if applicable)
   - Response format
   - Error codes
3. **Frontend Updates:**
   - Update server action in `app/_actions/`
   - Replace mock implementation
   - Test with real data
   - Update this checklist

### Frontend Integration Template

```typescript
// Before: Mocked
export async function updateProvince(data): Promise<APIResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300)); // MOCK
  return successResponse(data, "Updated");
}

// After: Real API
export async function updateProvince(data): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/provinces/${data.id}`,
      method: "PUT",
      data
    });
    return successResponse(response.data, "Province updated successfully");
  } catch (error) {
    return handleError(error, "PUT", `/api/v1/provinces/${data.id}`);
  }
}
```

---

## 📊 Progress Tracking

### Week 1
- [ ] Priority 1 endpoints (4 endpoints)
- [ ] Update frontend server actions
- [ ] Test with real data

### Week 2
- [ ] Priority 2 endpoints (7 endpoints)
- [ ] Verify authentication endpoints
- [ ] Update user management UI

### Week 3
- [ ] Priority 3 nice-to-have features
- [ ] Add pagination
- [ ] Add search/filtering

---

## 🔗 Related Documentation

- [API Integration Guide](INTEGRATION_GUIDE.md) - How to integrate endpoints
- [Backend API Specification](../../backend/API.md) - Backend API details
- [Server Actions Pattern](INTEGRATION_GUIDE.md#server-actions-pattern) - Implementation pattern

---

## ✅ Verification Checklist

Before marking endpoint as "Integrated":

- [ ] Backend endpoint implemented and tested
- [ ] Frontend server action created/updated
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Toast notifications for feedback
- [ ] End-to-end testing completed
- [ ] Tested with multiple scenarios
- [ ] Documentation updated
- [ ] Mock code removed
- [ ] This checklist updated

---

**Last Updated:** November 11, 2025
**Maintained by:** Development Team
**Status:** Track progress here
