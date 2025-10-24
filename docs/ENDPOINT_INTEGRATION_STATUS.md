# API Endpoint Integration Status

> **📦 ARCHIVE NOTICE:** This document is archived for historical reference.
>
> **For current status, see:** [API_INTEGRATION_STATUS.md](./API_INTEGRATION_STATUS.md)
>
> The new consolidated document provides a better overview with feature status, next steps, and quick references.

**Last Updated:** 2025-10-24
**Backend Base URL:** `http://10.51.74.29:8050` (from .env)
**API Version:** `/api/v1/`
**Status:** 📦 ARCHIVED

---

## Legend

- ✅ **Integrated** - Server action implemented and ready to use
- ⚠️ **Partially Integrated** - Server action exists but may have issues or limitations
- ❌ **Not Integrated** - No server action implemented
- 🔴 **Backend TODO** - API documented but backend not implemented
- 📝 **UI Missing** - Backend ready but no UI implementation

---

## Authentication Module

### Status: ✅ **FULLY INTEGRATED**

| Endpoint | Method | Server Action | File | Status | Notes |
|----------|--------|---------------|------|--------|-------|
| `/api/v1/auth/login` | POST | `loginUser()` | `auth-actions.ts:13` | ✅ Integrated | Returns JWT tokens, creates auth session |
| `/api/v1/auth/register` | POST | `registerUser()` | `auth-actions.ts:88` | ✅ Integrated | User registration with all required fields |
| `/api/v1/auth/change-password` | POST | `changePassword()` | `auth-actions.ts:65` | ✅ Integrated | For authenticated users |
| `/api/v1/auth/password-reset` | POST | `resetPassword()` | `auth-actions.ts:42` | ⚠️ Integrated | May need backend implementation (token-based reset) |

**Integration Notes:**
- Login flow fully functional
- Registration action ready but UI form may need updates (field mappings documented in API_UI_ALIGNMENT_ANALYSIS.md)
- Password reset assumes token-based reset endpoint exists (needs backend confirmation)

---

## Branch Management

### Status: ✅ **FULLY INTEGRATED**

| Endpoint | Method | Server Action | File | Status | Notes |
|----------|--------|---------------|------|--------|-------|
| `/api/v1/branches` | GET | `getBranches()` | `config-actions.ts:21` | ✅ Integrated | Supports filtering: province_id, town_id, is_active, limit, offset |
| `/api/v1/branches/{id}` | GET | `getBranchById()` | `config-actions.ts:50` | ✅ Integrated | Get single branch |
| `/api/v1/branches` | POST | `createBranch()` | `config-actions.ts:69` | ✅ Integrated | ⚠️ Requires province_id and town_id (UUIDs) |
| `/api/v1/branches/{id}` | PUT | `updateBranch()` | `config-actions.ts:111` | ✅ Integrated | ⚠️ Requires province_id and town_id (UUIDs) |
| `/api/v1/branches/{id}` | DELETE | `deleteBranch()` | `config-actions.ts:156` | ✅ Integrated | |

**Integration Notes:**
- ⚠️ **UI Update Required:** Branch forms currently use string province/city names. Must be updated to use `getProvincesWithTowns()` for dropdowns and pass UUIDs.
- Legacy functions `createNewBranch()` and `updateBranch()` deprecated (incompatible with API).
- Field mapping: `physical_address` → `address`, add `is_active` field.

---

## Department Management

### Status: ✅ **FULLY INTEGRATED**

| Endpoint | Method | Server Action | File | Status | Notes |
|----------|--------|---------------|------|--------|-------|
| `/api/v1/departments` | GET | `getDepartments()` | `config-actions.ts:181` | ✅ Integrated | Supports filtering: parent_id, is_active, limit, offset |
| `/api/v1/departments/{id}` | GET | `getDepartmentById()` | `config-actions.ts:208` | ✅ Integrated | |
| `/api/v1/departments` | POST | `createDepartment()` | `config-actions.ts:226` | ✅ Integrated | Supports hierarchical departments via parent_id |
| `/api/v1/departments/{id}` | PUT | `updateDepartment()` | `config-actions.ts:262` | ✅ Integrated | |
| `/api/v1/departments/{id}` | DELETE | `deleteDepartment()` | `config-actions.ts:303` | ✅ Integrated | |
| `/api/v1/departments/{id}/modules` | GET | `getDepartmentModules()` | `config-actions.ts:323` | ✅ Integrated | Get modules assigned to department |
| `/api/v1/departments/{id}/modules` | POST | `assignModuleToDepartment()` | `config-actions.ts:343` | ✅ Integrated | Assign module to department |
| `/api/v1/departments/{dept_id}/modules/{module_id}` | DELETE | `removeModuleFromDepartment()` | `config-actions.ts:369` | ✅ Integrated | Remove module from department |

**Integration Notes:**
- ⚠️ **UI Update Required:** Department forms need `parent_id` field for hierarchical departments
- ⚠️ **UI Update Required:** Add `is_active` toggle to forms
- 📝 **UI Missing:** No UI for department-module assignment (critical for RBAC)
- Legacy `createNewDepartment()` still works but deprecated (auto-generates code from name)

---

## Module Management

### Status: ✅ **FULLY INTEGRATED**

| Endpoint | Method | Server Action | File | Status | Notes |
|----------|--------|---------------|------|--------|-------|
| `/api/v1/modules` | GET | `getModules()` | `config-actions.ts:400` | ✅ Integrated | Supports `hierarchy=true` for tree structure |
| `/api/v1/modules/{id}` | GET | `getModuleById()` | `config-actions.ts:416` | ✅ Integrated | |
| `/api/v1/modules` | POST | `createModule()` | `config-actions.ts:432` | ✅ Integrated | |
| `/api/v1/modules/{id}` | PUT | `updateModule()` | `config-actions.ts:477` | ✅ Integrated | |
| `/api/v1/modules/{id}` | DELETE | `deleteModule()` | `config-actions.ts:527` | ✅ Integrated | |
| `/api/v1/modules/{id}/submodules` | GET | `getSubModules()` | `config-actions.ts:547` | ✅ Integrated | Get child modules |

**Integration Notes:**
- ⚠️ **UI Update Required:** Module form exists but field names don't match API
  - `pathname` → `href`
  - `icon_name` → `icon`
  - `sidebar_order` → `sort_order`
  - Missing: `module_code` (required), `description`, `is_active`
- ⚠️ **UI Enhancement:** "Has Sub Modules" checkbox should be replaced with parent module dropdown
- 📝 **UI Missing:** No module tree visualization

---

## Role Management

### Status: ✅ **FULLY INTEGRATED**

| Endpoint | Method | Server Action | File | Status | Notes |
|----------|--------|---------------|------|--------|-------|
| `/api/v1/roles` | GET | `getRoles()` | `config-actions.ts:572` | ✅ Integrated | Supports filtering: department_id, is_active, limit, offset |
| `/api/v1/roles/{id}` | GET | `getRoleById()` | `config-actions.ts:599` | ✅ Integrated | |
| `/api/v1/roles` | POST | `createRole()` | `config-actions.ts:615` | ✅ Integrated | Requires department_id |
| `/api/v1/roles/{id}` | PUT | `updateRole()` | `config-actions.ts:652` | ✅ Integrated | Note: department_id cannot be changed |
| `/api/v1/roles/{id}` | DELETE | `deleteRole()` | `config-actions.ts:690` | ✅ Integrated | |
| `/api/v1/roles/{id}/permissions` | GET | `getRolePermissions()` | `permissions-actions.ts:22` | ✅ Integrated | Get all permissions for role |
| `/api/v1/roles/{id}/permissions` | POST | `grantOrUpdateRolePermission()` | `permissions-actions.ts:55` | ✅ Integrated | Grant/update permission on module |
| `/api/v1/roles/{role_id}/permissions/{module_id}` | DELETE | `revokeRolePermission()` | `permissions-actions.ts:111` | ✅ Integrated | Revoke permission |
| `/api/v1/roles/{id}/available-modules` | GET | `getAvailableModulesForRole()` | `permissions-actions.ts:140` | ✅ Integrated | Get modules assignable to role (department-constrained) |

**Integration Notes:**
- 📝 **UI Completely Missing:** Role management UI not implemented
- 📝 **UI Completely Missing:** Permission matrix UI not implemented
- Helper functions provided:
  - `bulkUpdateRolePermissions()` - Update multiple permissions at once
  - `setPermissionLevel()` - Quick set: none/view/edit/full
  - `copyRolePermissions()` - Copy from one role to another
  - `checkRolePermission()` - Check if role has specific permission

---

## Province & Town Management

### Status: ✅ **FULLY INTEGRATED**

| Endpoint | Method | Server Action | File | Status | Notes |
|----------|--------|---------------|------|--------|-------|
| `/api/v1/provinces/with-towns` | GET | `getProvincesWithTowns()` | `config-actions.ts:715` | ✅ Integrated | **CRITICAL for branch forms** |
| `/api/v1/provinces` | GET | `getProvinces()` | `config-actions.ts:731` | ✅ Integrated | |
| `/api/v1/provinces/{id}` | GET | `getProvinceById()` | `config-actions.ts:747` | ✅ Integrated | |
| `/api/v1/provinces` | POST | `createProvince()` | `config-actions.ts:763` | ✅ Integrated | |
| `/api/v1/towns` | GET | `getTowns()` | `config-actions.ts:789` | ✅ Integrated | Supports filtering: province_id, is_active |
| `/api/v1/towns` | POST | `createTown()` | `config-actions.ts:812` | ✅ Integrated | |

**Integration Notes:**
- 📝 **UI Completely Missing:** No province/town management interface
- ⚠️ **Required for Branch Forms:** Branch forms MUST use `getProvincesWithTowns()` to populate dropdowns

---

## User Management

### Status: 🔴 **BACKEND TODO**

| Endpoint | Method | Server Action | File | Status | Notes |
|----------|--------|---------------|------|--------|-------|
| `/api/v1/users` | GET | ❌ Not implemented | - | 🔴 Backend TODO | API docs show "501 Not Implemented" |
| `/api/v1/users` | POST | ❌ Not implemented | - | 🔴 Backend TODO | Use `/api/v1/auth/register` instead |
| `/api/v1/users/{id}` | GET | ❌ Not implemented | - | 🔴 Backend TODO | |
| `/api/v1/users/{id}` | PUT | ❌ Not implemented | - | 🔴 Backend TODO | |
| `/api/v1/users/{id}` | DELETE | ❌ Not implemented | - | 🔴 Backend TODO | |
| `/api/v1/users/{id}/permissions` | GET | ❌ Not implemented | - | 🔴 Backend TODO | Get effective permissions |
| `/api/v1/users/{id}/assign-role` | POST | ❌ Not implemented | - | 🔴 Backend TODO | Assign role to user |
| `/api/v1/users/{id}/assign-branch` | POST | ❌ Not implemented | - | 🔴 Backend TODO | Assign branch to user |

**Integration Notes:**
- ✅ User registration works via `/api/v1/auth/register`
- 📝 UI exists for user list and signup form
- 🔴 **Blocked:** Cannot implement CRUD operations until backend endpoints are ready
- **Workaround:** Use registration endpoint for creating users, but no edit/delete/list capability

---

## Risk Management Module

### Status: ❌ **NOT INTEGRATED** (Low Priority - Complex Feature)

The Risk Management module has extensive API documentation (Risk Categories, Risks, Risk Registers, KRIs, KRI Measurements) but has not been integrated in this phase.

**Reason:** Risk module requires:
1. Complex multi-step risk creation workflow
2. KRI measurement recording system
3. Heat map visualizations
4. Department submission workflow
5. Extensive data structures

**Recommendation:** Implement as Phase 4-5 per the plan in API_UI_ALIGNMENT_ANALYSIS.md

**Documented Endpoints (Not Yet Integrated):**
- Risk Categories: 5 endpoints
- Risks (CRUD): 6 endpoints
- Risk Registers: 7 endpoints
- Multi-Step Risk Creation: 6 endpoints
- KRI Registers: 5 endpoints
- KRIs: 7 endpoints
- KRI Measurements: 4 endpoints

**Total:** 40+ risk-related endpoints available but not yet integrated.

---

## Audit Management Module

### Status: 📝 **UI READY, BACKEND TODO**

| Endpoint | Method | Server Action | File | Status | Notes |
|----------|--------|---------------|------|--------|-------|
| `/api/v1/audits/*` | ALL | Multiple functions | `audit-module-actions.ts` | 🔴 Backend TODO | Using mock data |

**Integration Notes:**
- ✅ Complete server action structure with mock data
- ✅ UI fully implemented (plans, workpapers, findings, reports, analytics)
- 🔴 **Backend Not Implemented:** API docs don't include any audit endpoints
- ⚠️ Currently works with simulated network delays
- **Action Required:** Backend team needs to implement audit module API

**Mock Actions Defined:**
- Audit Plans: `getAuditPlans()`, `getAuditPlan()`, `createAuditPlan()`, `updateAuditPlan()`, `deleteAuditPlan()`
- Workpapers: `getWorkpapers()`, `getWorkpaper()`, `createWorkpaper()`, `updateWorkpaper()`, `getWorkpaperTemplates()`
- Findings: `getFindings()`, `getFinding()`, `createFinding()`, `updateFinding()`, `deleteFinding()`, `getFindingTimeline()`
- Analytics: `getAuditMetrics()`, `getAuditAnalytics()`
- Reports: `getReportTemplates()`, `generateReport()`, `getScheduledReports()`
- Settings: `getAuditSettings()`, `updateAuditSettings()`
- Team: `getTeamMembers()`, `addTeamMember()`, `removeTeamMember()`

---

## Summary Statistics

### Integration Status by Module

| Module | Total Endpoints | Integrated | Partially | Not Integrated | Backend TODO |
|--------|-----------------|------------|-----------|----------------|--------------|
| **Authentication** | 4 | 3 | 1 | 0 | 0 |
| **Branch Management** | 5 | 5 | 0 | 0 | 0 |
| **Department Management** | 8 | 8 | 0 | 0 | 0 |
| **Module Management** | 6 | 6 | 0 | 0 | 0 |
| **Role Management** | 9 | 9 | 0 | 0 | 0 |
| **Province/Town Management** | 6 | 6 | 0 | 0 | 0 |
| **User Management** | 8 | 0 | 0 | 0 | 8 |
| **Risk Management** | 40+ | 0 | 0 | 40+ | 0 |
| **Audit Management** | 15+ | 0 (mock) | 0 | 0 | 15+ |
| **TOTAL** | **101+** | **37** | **1** | **40+** | **23** |

### Overall Integration Rate

- **Fully Integrated:** 37 endpoints (36.6%)
- **Partially Integrated:** 1 endpoint (1.0%)
- **Ready to Integrate:** 40+ endpoints (Risk module - documented but deferred)
- **Waiting on Backend:** 23 endpoints (User management + Audit module)

### Immediate Next Steps

1. **Update Branch UI** - Change province/city to dropdowns with UUIDs
2. **Update Department UI** - Add parent_id and is_active fields
3. **Update Module UI** - Fix field names and add missing fields
4. **Create Role Management UI** - Full CRUD interface
5. **Create Permission Matrix UI** - Department-constrained RBAC interface
6. **Create Province/Town Management UI** - Location management

### Backend Team Action Items

1. **Implement User Management Endpoints** (Priority: HIGH)
   - GET, POST, PUT, DELETE `/api/v1/users`
   - Role and branch assignment endpoints

2. **Implement Audit Module Endpoints** (Priority: HIGH)
   - All audit-related endpoints following the structure in `audit-module-actions.ts`

3. **Verify Risk Module Endpoints** (Priority: MEDIUM)
   - Confirm all 40+ risk endpoints are functional
   - Test multi-step risk creation workflow

---

## File References

### Server Action Files

| File | Lines of Code | Endpoints Covered | Status |
|------|---------------|-------------------|--------|
| `app/_actions/api-config.ts` | 201 | Config (BASE_URL updated) | ✅ Updated |
| `app/_actions/auth-actions.ts` | 125 | 4 auth endpoints | ✅ Complete |
| `app/_actions/config-actions.ts` | 874 | 38 config endpoints | ✅ Complete |
| `app/_actions/permissions-actions.ts` | 409 | 4 endpoints + helpers | ✅ Complete |
| `app/_actions/audit-module-actions.ts` | ~500 | 15+ endpoints (mock) | 📝 Ready for backend |
| `app/_actions/risk-module-actions.ts` | ~50 | Minimal/stub | ❌ Not implemented |

### Documentation Files

| File | Purpose |
|------|---------|
| `docs/API_DOCS.md` | Complete backend API documentation |
| `docs/API_UI_ALIGNMENT_ANALYSIS.md` | Detailed mismatch analysis and implementation plan |
| `docs/ENDPOINT_INTEGRATION_STATUS.md` | This file - integration tracking |

---

## Testing Checklist

### Phase 1: Configuration Module Testing

- [ ] Test login with correct credentials
- [ ] Test login with incorrect credentials
- [ ] Test user registration
- [ ] Test password change (authenticated)
- [ ] Test branch CRUD operations
- [ ] Test department CRUD operations
- [ ] Test module CRUD operations
- [ ] Test role CRUD operations
- [ ] Test province/town fetching
- [ ] Verify all GET requests return proper data structures
- [ ] Verify all POST/PUT requests accept correct payloads
- [ ] Verify all DELETE requests work correctly
- [ ] Test error handling for invalid IDs
- [ ] Test error handling for missing required fields

### Phase 2: Permissions System Testing

- [ ] Test fetching role permissions
- [ ] Test granting permissions to role
- [ ] Test updating permissions
- [ ] Test revoking permissions
- [ ] Test department-constrained module access
- [ ] Test bulk permission updates
- [ ] Test permission level helpers (none/view/edit/full)
- [ ] Test copying permissions between roles

### Phase 3: UI Integration Testing

- [ ] Update branch form with province/town dropdowns
- [ ] Test branch creation with new form
- [ ] Update department form with parent_id
- [ ] Test hierarchical department creation
- [ ] Update module form with correct field names
- [ ] Test module creation with updated form
- [ ] Create and test role management UI
- [ ] Create and test permission matrix UI

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-24 | Initial comprehensive integration tracking document | Claude Code |

---

## Notes for Developers

### Important Considerations

1. **BASE_URL Configuration:**
   - Always use `process.env.BASE_URL` from .env file
   - Current value: `http://10.51.74.29:8050`
   - Falls back to `http://localhost:8080` if not set

2. **API Versioning:**
   - All endpoints use `/api/v1/` prefix
   - Do not use `/api/` without version

3. **UUID Requirements:**
   - All IDs are UUIDs, not integers
   - Foreign keys must reference UUIDs

4. **Department-Constrained RBAC:**
   - Modules must be assigned to departments first
   - Roles belong to specific departments
   - Roles can only get permissions for modules in their department
   - This is enforced by the backend

5. **Error Handling:**
   - All server actions use standardized error handling via `handleError()`
   - Errors are logged with endpoint, method, and error details
   - User-friendly error messages are returned in APIResponse format

6. **Backwards Compatibility:**
   - Legacy functions marked `@deprecated` kept for existing UI
   - Update UI to use new function signatures when possible

7. **Authentication:**
   - JWT tokens stored in session cookies
   - `createAuthSession()` called after successful login
   - Protected endpoints automatically include Authorization header (via `authenticatedApiClient` when implemented)

### Common Patterns

**Fetching with Filters:**
```typescript
const result = await getBranches({
  provinceId: "uuid-here",
  isActive: true,
  limit: 50,
  offset: 0
});
```

**Creating Resources:**
```typescript
const result = await createBranch({
  name: "Branch Name",
  code: "CODE",
  townId: "town-uuid",
  provinceId: "province-uuid",
  address: "123 Street",
  isActive: true
});
```

**Error Checking:**
```typescript
if (!result.success) {
  console.error(result.message);
  // Handle error
  return;
}

const data = result.data;
// Use data
```

---

**End of Document**
