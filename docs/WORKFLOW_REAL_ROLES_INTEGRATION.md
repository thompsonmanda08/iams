# Workflow Real Roles API Integration

**Date:** November 2, 2025
**Status:** ✅ Complete

---

## Overview

The Workflow Administration interface has been successfully integrated with the real Roles API, replacing the previous mock data implementation. This ensures that role assignments to workflow transitions use actual system roles.

---

## What Changed

### Before
```typescript
// Mock roles - hardcoded data
const AVAILABLE_ROLES = [
  { id: "role-1", name: "ADMIN" },
  { id: "role-2", name: "AUDITOR" },
  { id: "role-3", name: "HIAR" },
  // ...
];
```

### After
```typescript
// Real API integration
import { getRoles } from "@/app/_actions/config-actions";

const rolesResponse = await getRoles({ isActive: true, limit: 1000 });
const availableRoles = rolesResponse.data.map(role => ({
  id: role.id,
  name: role.name
}));
```

---

## Implementation Details

### File Modified
[app/dashboard/system-configs/workflow/admin/page.tsx](../app/dashboard/system-configs/workflow/admin/page.tsx)

### Changes Made

1. **Import Real API Function**
   - Added: `import { getRoles } from "@/app/_actions/config-actions";`
   - Removed: Mock roles constant

2. **Parallel Data Fetching**
   ```typescript
   const [workflowResponse, rolesResponse] = await Promise.all([
     getWorkflowDetails(workflowId),
     getRoles({ isActive: true, limit: 1000 })
   ]);
   ```
   - Fetches workflow details and roles simultaneously
   - Improves page load performance

3. **Data Transformation**
   ```typescript
   const availableRoles = rolesResponse.success && rolesResponse.data
     ? rolesResponse.data.map((role: any) => ({
         id: role.id,
         name: role.name
       }))
     : [];
   ```
   - Transforms API response to component format
   - Handles empty/failed responses gracefully

4. **User Feedback**
   ```typescript
   {availableRoles.length === 0 && (
     <Alert>
       <AlertCircle className="h-4 w-4" />
       <AlertDescription>
         No active roles found. Please create roles first.
       </AlertDescription>
     </Alert>
   )}
   ```
   - Displays warning if no roles are available
   - Guides users to create roles if needed

---

## API Endpoint Used

**Endpoint:** `GET /api/v1/roles`

**Server Action:** `getRoles()`
- Located in: [app/_actions/config-actions.ts](../app/_actions/config-actions.ts) (Line 616)
- Supports filtering by department, active status
- Returns all role data including ID, name, code, department info

**Parameters Used:**
```typescript
{
  isActive: true,  // Only fetch active roles
  limit: 1000      // Support up to 1000 roles
}
```

---

## Benefits

1. **Real-time Data**
   - No more hardcoded mock data
   - Reflects actual system roles immediately

2. **Department Integration**
   - Roles are linked to departments in the API
   - Enables future department-based filtering

3. **Dynamic Updates**
   - New roles appear automatically
   - Deleted roles are removed automatically
   - No code changes needed for role management

4. **Better UX**
   - Users see actual system roles they can assign
   - Clear warnings when no roles exist
   - Consistent with rest of the application

5. **Scalability**
   - Supports up to 1000 roles
   - Can be easily adjusted if needed
   - Efficient parallel loading

---

## Component Flow

```
User navigates to Workflow Admin
          ↓
Page loads workflow + roles in parallel
          ↓
Roles transformed to component format
          ↓
WorkflowAdministration receives roles
          ↓
TransitionRolesManager displays roles dropdown
          ↓
User assigns real system roles to transitions
```

---

## Testing Checklist

- [ ] Verify roles load correctly on page load
- [ ] Test with 0 roles (empty state)
- [ ] Test with 1 role
- [ ] Test with multiple roles (10+)
- [ ] Test with 100+ roles (performance)
- [ ] Verify role assignment works with real role IDs
- [ ] Test role removal with real role IDs
- [ ] Verify error handling if API fails
- [ ] Check that only active roles are shown
- [ ] Verify parallel loading improves performance

---

## Related Components

These components use the roles data passed from the admin page:

1. **WorkflowAdministration**
   - [workflow-administration.tsx](../app/dashboard/system-configs/workflow/_components/workflow-administration.tsx)
   - Receives availableRoles prop
   - Passes to TransitionRolesManager

2. **TransitionRolesManager**
   - [transition-roles-manager.tsx](../app/dashboard/system-configs/workflow/_components/transition-roles-manager.tsx)
   - Displays roles in dropdown
   - Handles role assignment/removal

---

## Future Enhancements

1. **Department Filtering**
   - Add ability to filter roles by department
   - Show only relevant roles for specific workflows

2. **Role Caching**
   - Cache roles data to reduce API calls
   - Implement cache invalidation strategy

3. **Role Details**
   - Show role code and department in dropdown
   - Add role description tooltip

4. **Pagination**
   - If roles exceed 1000, implement pagination
   - Or use search/filter to narrow results

5. **Role Permissions Display**
   - Show what permissions a role has
   - Help users understand role capabilities before assigning

---

## Troubleshooting

### No Roles Appearing

**Problem:** Dropdown is empty or shows "All roles are already assigned"

**Solutions:**
1. Check that roles exist in the system: `/dashboard/system-configs/departments`
2. Verify roles are marked as active (`is_active: true`)
3. Check API response in browser dev tools
4. Verify user has permission to view roles

### API Error

**Problem:** Error fetching roles

**Solutions:**
1. Check network tab for failed requests
2. Verify authentication token is valid
3. Check server logs for API errors
4. Ensure `/api/v1/roles` endpoint is accessible

### Wrong Roles Showing

**Problem:** Inactive or deleted roles appearing

**Solutions:**
1. Verify `isActive: true` parameter is passed
2. Check role data in database
3. Clear browser cache and reload

---

## Related Documentation

- [Workflow API Audit Report](WORKFLOW_API_AUDIT_REPORT.md) - Complete audit of all workflow endpoints
- [Roles API Documentation](../app/_actions/config-actions.ts) - Role CRUD operations
- [Permissions API Documentation](../app/_actions/permissions-actions.ts) - Role permissions management

---

**Implementation Completed By:** Claude Code Assistant
**Date:** November 2, 2025
**Version:** 1.0
