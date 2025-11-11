# Audit Plans Module

**Status:** 🟠 PARTIAL - Finding components newly added (untested)

## Overview

Create, manage, and track audit plans with multi-level approvals.

## Flow

```
Create Plan → Add Workpapers → Add Findings → Submit for Approval
                                              → HIAR → CEO → Audit Chair
```

## Key Features

- ✅ Plan creation with period, scope, objectives
- ✅ Workpaper templates integration
- ✅ Finding management (CREATE, untested)
- ✅ Multi-level approval workflow (3 levels)
- ✅ Universe mapping to plans
- ✅ Status tracking (PLANNED → APPROVED → IN_PROGRESS → COMPLETED)

## Components

**Core:**
- `PlansList.tsx` - List all plans with filtering
- `PlanForm.tsx` - Create/edit plans
- `PlanDetail.tsx` - View plan details

**Workpapers:**
- `WorkpapersList.tsx`
- `WorkpaperForm.tsx`

**Findings (NEW - Untested):**
- `finding-form.tsx` - Create/edit findings
- `findings-list.tsx` - List findings
- `finding-actions-menu.tsx` - Bulk operations

## Server Actions

`app/_actions/audit-module-actions.ts`:
- `createAuditPlan()` - Create new plan
- `updateAuditPlan()` - Update plan
- `deleteAuditPlan()` - Delete plan
- `submitPlanForApproval()` - Start approval workflow
- `approvePlan()` - Approve at any level
- `createFinding()` - Add finding (NEW)
- `updateFinding()` - Edit finding (NEW)
- `deleteFinding()` - Delete finding (NEW)

## API Integration

**Endpoints (PocketBase):**
- `POST /api/v1/audit/plans` - Create
- `GET /api/v1/audit/plans` - List
- `GET /api/v1/audit/plans/:id` - Detail
- `PUT /api/v1/audit/plans/:id` - Update
- `DELETE /api/v1/audit/plans/:id` - Delete
- `POST /api/v1/audit/plans/:id/approve` - Approval workflow
- `POST /api/v1/audit/findings` - Create finding
- `GET /api/v1/audit/findings` - List findings
- `PUT /api/v1/audit/findings/:id` - Update finding
- `DELETE /api/v1/audit/findings/:id` - Delete finding

## Known Issues

⚠️ **Finding components untested** - Added Nov 11, needs verification before production

## Missing

❌ Report generation (PDF export)
❌ Bulk finding operations
❌ Finding approval workflow

## Next Steps

1. **Test** finding components
2. **Implement** finding approval workflow
3. **Add** report generation
4. **Optimize** performance (add pagination)

See [CURRENT_IMPLEMENTATION.md](../../CURRENT_IMPLEMENTATION.md#5-feature-modules) for full details.
