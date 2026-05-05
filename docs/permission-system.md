# Permission Enforcement System

## Overview

The IAMS web application implements a client-side permission enforcement system that checks user permissions before allowing actions (create, edit, delete, approve, assign, etc.). The system uses the permission data returned by the `useSystemSetup` hook and provides a simple, consistent pattern for guarding action handlers throughout the application.

**Key Principle**: Buttons remain visible, but actions are blocked with a toast notification when unauthorized. This lets users see what features exist while clearly communicating when they lack access.

---

## Architecture

```
┌─────────────────────────────────────────┐
│           useSystemSetup()              │  React Query (staleTime: Infinity)
│  Returns session.permissions[]          │  Cached, fetched once on app load
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          usePermissions()               │  hooks/use-permissions.ts
│  buildPermissionMap() → flat Map        │
│  Exposes:                               │
│    - getPermissions(moduleCode)         │
│    - hasPermission(moduleCode, action)  │  Silent boolean check
│    - checkPermission(moduleCode, action)│  Check + toast on denial
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Component Handlers               │
│  if (!checkPermission(...)) return;     │  One-line guard in handlers
└─────────────────────────────────────────┘
```

---

## API: `usePermissions` Hook

**File**: `hooks/use-permissions.ts`

### Returned Functions

#### `hasPermission(moduleCode, action): boolean`

Silent check - returns `true`/`false` without showing any UI feedback.

```tsx
const { hasPermission } = usePermissions();

// Use for conditional rendering or silent logic
if (hasPermission("RISK_REGISTERS", "can_export")) {
  // show export button
}
```

#### `checkPermission(moduleCode, action, customMessage?): boolean`

Check with toast feedback - returns `true` if allowed, shows an error toast and returns `false` if denied.

```tsx
const { checkPermission } = usePermissions();

const handleDelete = () => {
  if (!checkPermission("RISK_REGISTERS", "can_delete")) return;
  // proceed with deletion...
};
```

With a custom message:

```tsx
const handleDelete = () => {
  if (
    !checkPermission("RISK_REGISTERS", "can_delete", "You cannot delete risks from this register.")
  )
    return;
  // proceed...
};
```

#### `getPermissions(moduleCode): ModulePermissions | null`

Returns the full permission object for a module, or `null` if not found.

```tsx
const { getPermissions } = usePermissions();
const perms = getPermissions("AUDIT_PLANS");
// perms = { can_view: true, can_create: false, can_edit: true, ... }
```

---

## Types

**File**: `lib/types/index.ts`

```ts
export type PermissionAction =
  | "can_view"
  | "can_create"
  | "can_edit"
  | "can_delete"
  | "can_approve"
  | "can_export"
  | "can_assign"
  | "can_configure";

export type ModulePermissions = {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
  can_assign: boolean;
  can_configure: boolean;
  custom_permissions: Record<string, any> | null;
  granted_at: string;
  granted_by: string | null;
};
```

---

## Module Codes

These are the `module_code` values used throughout the application:

| Module Code           | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `RISK_REGISTERS`      | Risk register CRUD operations                            |
| `RISK_ACTIONS`        | Risk action operations (assign, review, submit findings) |
| `RISK_INCIDENTS`      | Risk incident management                                 |
| `KRI_DASHBOARD`       | Key Risk Indicator operations                            |
| `RISK_MODULE_CONFIGS` | Risk module settings/configuration                       |
| `AUDIT_PLANS`         | Audit plan operations, memos, closures, evidence         |
| `AUDIT_WPS`           | Workpaper/finding operations, evidence editing           |
| `AUDIT_REPORTS`       | Audit report operations                                  |
| `AUDIT_MODULE_CONFIG` | Audit settings configuration                             |
| `WORKFLOW_CONFIG`     | Workflow management (create, edit, triggers, roles)      |
| `USER_MGMT`           | User management, module management, mail settings        |
| `BRANCH_MGMT`         | Branch, province, and town management                    |
| `DEPT_MGMT`           | Department management and module assignment              |

---

## Usage Patterns

### Pattern 1: Guard an onClick/onSubmit handler (most common)

```tsx
"use client";
import { usePermissions } from "@/hooks/use-permissions";

export function MyComponent() {
  const { checkPermission } = usePermissions();

  const handleCreate = () => {
    if (!checkPermission("RISK_REGISTERS", "can_create")) return;
    // ... create logic
  };

  const handleDelete = (id: string) => {
    if (!checkPermission("RISK_REGISTERS", "can_delete")) return;
    if (!confirm("Are you sure?")) return;
    // ... delete logic
  };

  return (
    <div>
      <Button onClick={handleCreate}>Create Risk</Button>
      <Button onClick={() => handleDelete(risk.id)}>Delete</Button>
    </div>
  );
}
```

### Pattern 2: Guard a Link/navigation action

```tsx
<Link
  href={`/dashboard/audit/plans/${plan.id}/edit`}
  onClick={(e) => {
    if (!checkPermission("AUDIT_PLANS", "can_edit")) {
      e.preventDefault();
    }
  }}>
  Edit Plan
</Link>
```

### Pattern 3: Dynamic permission (create vs edit in one handler)

```tsx
const handleSave = () => {
  const isExisting = !!itemId;
  if (!checkPermission("AUDIT_PLANS", isExisting ? "can_edit" : "can_create")) return;
  // ... save logic
};
```

### Pattern 4: Conditional rendering with `hasPermission`

Use `hasPermission` (silent check) when you want to conditionally render UI elements:

```tsx
const { hasPermission } = usePermissions();

return (
  <div>
    {hasPermission("RISK_REGISTERS", "can_create") && (
      <Button onClick={handleCreate}>Create Risk</Button>
    )}
  </div>
);
```

### Pattern 5: Show a dismissible banner for restricted sections

```tsx
import { PermissionBanner } from "@/components/ui/permission-banner";
import { usePermissions } from "@/hooks/use-permissions";

function RiskRegistersPage() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {!hasPermission("RISK_REGISTERS", "can_edit") && (
        <PermissionBanner
          title="Read-Only Access"
          message="You have view-only access to risk registers. Contact your administrator to request edit permissions."
          variant="warning"
          dismissible
        />
      )}
      {/* ... rest of the page */}
    </div>
  );
}
```

---

## `PermissionBanner` Component

**File**: `components/ui/permission-banner.tsx`

A dismissible banner for showing persistent (but closable) permission warnings at the top of pages or sections.

### Props

| Prop          | Type                             | Default                     | Description                           |
| ------------- | -------------------------------- | --------------------------- | ------------------------------------- |
| `message`     | `string`                         | Generic restriction message | The message body                      |
| `title`       | `string`                         | `"Limited Access"`          | Bold title text                       |
| `variant`     | `"warning" \| "error" \| "info"` | `"warning"`                 | Color scheme                          |
| `dismissible` | `boolean`                        | `true`                      | Whether the user can close the banner |
| `onDismiss`   | `() => void`                     | -                           | Callback when dismissed               |
| `className`   | `string`                         | -                           | Additional CSS classes                |

### When to use which

| Scenario                                 | Use                                               |
| ---------------------------------------- | ------------------------------------------------- |
| User clicks a button they can't use      | `checkPermission()` - shows a toast               |
| User lands on a page with limited access | `<PermissionBanner>` - shows a dismissible banner |
| Conditionally hide a button entirely     | `hasPermission()` - silent boolean check          |

---

## How It Works Internally

1. **`useSystemSetup`** fetches the user's session (including permissions) on app load and caches it with `staleTime: Infinity` via React Query.

2. **`buildPermissionMap`** flattens the nested API response into a `Map<module_code, ModulePermissions>`. The API returns:

   ```json
   {
     "permissions": [
       {
         "module_code": "RISK_MANAGEMENT",
         "permissions": { "can_view": true, ... },
         "sub_modules": [
           {
             "module_code": "RISK_REGISTERS",
             "permissions": { "can_view": true, "can_create": false, ... }
           }
         ]
       }
     ]
   }
   ```

   Both parent modules and sub-modules are flattened into the map using their `module_code` as key.

3. **`checkPermission`** looks up the module's permissions in the map, checks the specific action, and either returns `true` or shows a contextual toast and returns `false`.

---

## Guarded Files Reference

Below is the complete list of files where permission guards have been applied:

### Risk Module

- `risks/_components/risks-page-header.tsx` - Create risk button
- `risks/_components/risks-table.tsx` - Edit, Delete, Close, Assign buttons
- `risks/_components/risk-registers-table.tsx` - Register CRUD
- `risks/_components/register-list.tsx` - Register list actions
- `risks/_components/assign-action-dialog.tsx` - Assign risk action
- `risks/_components/action-review-dialog.tsx` - Review/approve risk actions
- `risks/_components/action-findings-dialog.tsx` - Submit action findings
- `risks/_components/action-assessment-form.tsx` - Risk assessment
- `risks/_components/kri-configure-dialog.tsx` - KRI configuration
- `risks/_components/kri-measure-dialog.tsx` - KRI measurements
- `risks/risk-acceptances/page.tsx` - Risk acceptances
- `risks/incidents/_components/new-incident.tsx` - New incidents

### Audit Module

- `audit/plans/_components/audit-plans-table.tsx` - Plan CRUD
- `audit/plans/_components/audit-plan-workpaper-view.tsx` - Plan actions, memos, findings
- `audit/plans/_components/finding-actions-menu.tsx` - Finding actions
- `audit/plans/_components/findings-list.tsx` - Findings list actions
- `audit/plans/_components/annual-plan-details.tsx` - Annual plan details
- `audit/plans/_components/audit-plan-report-tab.tsx` - Report tab
- `audit/plans/_components/assign-finding-action-dialog.tsx` - Assign finding action
- `audit/plans/_components/audit-closure-approval-dialog.tsx` - Closure approval
- `audit/plans/_components/create-plan-item-dialog.tsx` - Create/update plan items
- `audit/plans/_components/finding-form.tsx` - Update findings
- `audit/plans/_components/framework-finding-form.tsx` - Framework findings
- `audit/plans/_components/evidence-form.tsx` - Evidence submission
- `audit/plans/_components/evidence-list.tsx` - Evidence edit/delete
- `audit/budgets/_components/budget-list.tsx` - Budget CRUD
- `audit/budgets/_components/budget-details.tsx` - Budget details
- `audit/budgets/_components/budget-form.tsx` - Budget form
- `audit/universe/_components/audit-universe-list.tsx` - Universe CRUD

### Workflow Module

- `(workflows)/workflow/manage/_components/create-workflow-dialog.tsx` - Create workflow
- `(workflows)/workflow/manage/_components/workflow-editor.tsx` - Edit/save workflow
- `(workflows)/workflow/manage/_components/entry-triggers-manager.tsx` - Entry triggers
- `(workflows)/workflow/manage/_components/transition-roles-manager.tsx` - Transition roles
- `(workflows)/workflow/manage/_components/transition-triggers-manager.tsx` - Transition triggers
- `(workflows)/approvals/_components/task-action-dialog.tsx` - Task actions
- `(workflows)/approvals/_components/workflow-task-action-dialog.tsx` - Workflow task actions
- `(workflows)/approvals/_components/task-reassign-dialog.tsx` - Task reassignment
- `(workflows)/approvals/_components/workflow-task-reassign-dialog.tsx` - Workflow task reassignment
- `(workflows)/actions/audit/_components/finding-action-details-dialog.tsx` - Finding action details
- `(workflows)/actions/audit/_components/create-reassessment-dialog.tsx` - Create reassessment
- `(workflows)/actions/audit/_components/submit-evidence-dialog.tsx` - Submit evidence

### Reports

- `reports/_components/reports-table.tsx` - Report CRUD
- `reports/_components/create-report-dialog.tsx` - Create reports

### System Configuration

- `system-configs/_components/user-roles-config.tsx` - Role permissions
- `system-configs/_components/branches-tab.tsx` - Branch management
- `system-configs/_components/departments-config.tsx` - Department management
- `system-configs/_components/provinces-tab.tsx` - Province management
- `system-configs/_components/towns-tab.tsx` - Town management
- `system-configs/_components/index.tsx` - Module assignment to departments
- `system-configs/_components/department-users.tsx` - Department user management
- `system-configs/users/data-table.tsx` - User table actions
- `system-configs/users/create-user-dialog.tsx` - Create users
- `system-configs/modules/module-list.tsx` - Module CRUD

### Risk Settings

- `system-configs/_components/risk-categories-config.tsx`
- `system-configs/_components/risk-appetite-config.tsx`
- `system-configs/_components/risk-matrix-config.tsx`
- `system-configs/_components/risk-response-config.tsx`
- `system-configs/_components/risk-register-config.tsx`
- `system-configs/_components/kri-config.tsx`

### Audit Settings

- `system-configs/audit-settings/_components/auditable-areas-tab.tsx`
- `system-configs/audit-settings/_components/findings-category-tab.tsx`
- `system-configs/audit-settings/_components/process-activity-tab.tsx`
- `system-configs/audit-settings/_components/strategic-initiative-tab.tsx`
- `system-configs/audit-settings/_components/strategic-pillars-tab.tsx`
- `system-configs/audit-settings/_components/indicative-targets-tab.tsx`
- `system-configs/audit-settings/_components/workpaper-templates-tab.tsx`
- `system-configs/audit-settings/_components/workpaper-templates-table.tsx`
- `system-configs/audit-settings/_components/template-categories-table.tsx`
- `system-configs/audit-settings/_components/audit-criteria-rating-section.tsx`
- `system-configs/audit-settings/_components/iso-workpaper-form.tsx`
- `system-configs/audit-settings/templates/[id]/categories/new/page.tsx`

### Mail Settings

- `system-configs/mail-settings/_components/mailing-settings-form.tsx`

---

## Adding Permission Checks to New Components

When building new features, follow this checklist:

1. Import the hook:

   ```tsx
   import { usePermissions } from "@/hooks/use-permissions";
   ```

2. Destructure inside your component:

   ```tsx
   const { checkPermission } = usePermissions();
   ```

3. Guard every action handler:

   ```tsx
   const handleAction = () => {
     if (!checkPermission("MODULE_CODE", "can_action")) return;
     // ... action logic
   };
   ```

4. For pages with restricted access, add a `<PermissionBanner>`:
   ```tsx
   {
     !hasPermission("MODULE_CODE", "can_edit") && (
       <PermissionBanner
         title="Read-Only Access"
         message="You have view-only access to this section."
       />
     );
   }
   ```

---

## Testing

1. Log in as a user with restricted permissions (not System Administrator)
2. Navigate to each module and attempt CRUD operations
3. Verify toast errors appear for denied actions with contextual messages
4. Verify all actions work normally for System Administrator
5. Verify that status-based conditions (e.g., edit only for DRAFT) still apply alongside permission checks
