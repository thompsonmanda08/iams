# STATUS STANDARDIZATION IMPLEMENTATION PLAN

**Status:** Audit Complete | Plan Ready
**Date:** 2025-11-13
**Priority:** HIGH
**Scope:** System-wide status consolidation and standardization

---

## EXECUTIVE SUMMARY

The codebase currently has **13 different status type definitions** with **54+ status values** spread across multiple modules and files. This creates maintenance burden, inconsistencies in user experience, and validation gaps. This plan establishes a single source of truth for all statuses across the platform with standardized naming, color coding, and transitions.

**Key Objectives:**
1. Implement unified status definitions across all modules
2. Enforce StatusBadge component for all status displays
3. Standardize naming convention (UPPER_SNAKE_CASE)
4. Create single source of truth for color mappings
5. Document and validate status transitions
6. Eliminate type definition conflicts

---

## CURRENT STATE ANALYSIS

### Critical Issues Found

#### 1. **Type Definition Conflicts** ⚠️ CRITICAL
- **RiskStatus**: Defined two different ways with conflicting values
  - `lib/types/risk-types.ts`: `OPEN | CLOSED | PENDING_REVIEW | MITIGATED`
  - `app/_actions/risk-module-actions.ts`: `DRAFT | OPEN | CLOSED`
- **TaskStatus**: Defined two different ways
  - `lib/types/task.ts`: `PENDING | IN_PROGRESS | COMPLETED | REJECTED | REASSIGNED`
  - `app/_actions/risk-module-actions.ts`: `PENDING | COMPLETED`

#### 2. **Naming Convention Inconsistency**
- **UPPER_SNAKE_CASE**: `IN_PROGRESS`, `UNDER_REVIEW` (audit, risk modules)
- **kebab-case**: `in-progress`, `under-review` (audit module)
- **camelCase**: `inProgress`, `pending` (account module)
- **PascalCase**: `Green`, `Amber`, `Red` (KRI status)

#### 3. **Color Mapping Scattered** (5+ locations)
- [lib/utils/audit-utils.ts](lib/utils/audit-utils.ts) - Audit-specific colors
- [components/status-badge.tsx](components/status-badge.tsx) - Generic badge config
- [components/audit/audit-status-badge.tsx](components/audit/audit-status-badge.tsx) - Audit status
- [components/audit/audit-plan-status-badge.tsx](components/audit/audit-plan-status-badge.tsx) - Audit plan
- [app/dashboard/risks/_components/actions-logs-table-infinite.tsx](app/dashboard/risks/_components/actions-logs-table-infinite.tsx) - Action status

#### 4. **Custom Status Display Components** (NOT using StatusBadge)
- `audit-status-badge.tsx` (custom, should use StatusBadge)
- `audit-plan-status-badge.tsx` (custom, should use StatusBadge)
- Inline status displays in tables and cards (audit, risks, tasks modules)
- Status text without any styling in multiple locations

#### 5. **No Transition Validation**
- No guard rails for invalid state transitions
- State changes happen implicitly throughout code
- No documentation of valid transitions per entity

---

## STANDARDIZED STATUS FRAMEWORK

### Standard Status Values (from database specification)

```typescript
// UPPER_SNAKE_CASE - Single source of truth
DRAFT              // Entity is being prepared and not yet submitted for review
PENDING            // Awaiting action or approval
SUBMITTED          // Entity has been submitted for approval
IN_REVIEW          // Entity is under review by the approval team
APPROVED           // Entity has been approved and is active
REJECTED           // Entity was rejected and needs revision
ON_HOLD            // Entity is paused pending other conditions
OPEN               // Entity is active and open (legacy status)
COMPLETED          // Entity execution is complete
CLOSED             // Entity is closed and no longer active (legacy status)
ARCHIVED           // Entity has been archived and is read-only
```

### Color Scheme (Standardized)

| Status | Color Code | Meaning | Variant |
|--------|-----------|---------|---------|
| DRAFT | #6C757D | Not started | outline (gray) |
| PENDING | #FFC107 | Awaiting action | outline (orange) |
| SUBMITTED | #0D6EFD | Submitted | outline (blue) |
| IN_REVIEW | #0DCAF0 | Under review | outline (cyan) |
| APPROVED | #198754 | Approved/Success | solid (green) |
| REJECTED | #DC3545 | Rejected/Failed | solid (red) |
| ON_HOLD | #FFC107 | Paused | outline (orange) |
| OPEN | #28A745 | Active/Open | solid (green) |
| COMPLETED | #20C997 | Complete | solid (teal) |
| CLOSED | #6C757D | Closed | outline (gray) |
| ARCHIVED | #495057 | Archived | outline (dark gray) |

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Days 1-2)

#### 1.1 Create Centralized Status Configuration
**File:** `lib/constants/statuses.ts`

- Define all standard statuses with metadata
- Map statuses to StatusBadge colors and styles
- Include display labels and descriptions
- Support i18n for future translations

```typescript
// STRUCTURE
export const STANDARD_STATUSES = {
  DRAFT: {
    label: "Draft",
    description: "Entity is being prepared",
    color: "default",
    style: "outline"
  },
  // ... rest of statuses
}

export const ENTITY_STATUS_CONFIG = {
  audit: {
    allowedStatuses: ["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"],
    transitions: { /* valid state machine */ }
  },
  // ... per entity
}
```

#### 1.2 Create Status Utility Module
**File:** `lib/utils/status-utils.ts`

```typescript
export function getStatusConfig(status: string)
export function isValidStatus(status: string, entityType: string)
export function getValidTransitions(currentStatus: string, entityType: string)
export function canTransitionTo(from: string, to: string, entityType: string)
export function getStatusColor(status: string): string
export function getStatusLabel(status: string): string
```

#### 1.3 Enhance StatusBadge Component
**File:** `components/status-badge.tsx`

- Update to use new centralized configuration
- Add support for all 11 standard statuses
- Add optional tooltip with description
- Ensure dark mode support

**Changes:**
- Replace hardcoded statusConfig with import from `lib/constants/statuses`
- Add validation warning if unknown status
- Support both display modes (solid/outline)

---

### Phase 2: Type Definition Consolidation (Days 2-3)

#### 2.1 Resolve Type Conflicts
- **RiskStatus**: Consolidate to single definition in `lib/types/risk-types.ts`
- **TaskStatus**: Use primary definition from `lib/types/task.ts`, remove from actions

#### 2.2 Standardize All Type Definitions
**Files to update:**
- `lib/types/audit-types.ts` - Convert kebab-case to UPPER_SNAKE_CASE
- `lib/types/risk-types.ts` - Consolidate RiskStatus, ActionFindingsStatus
- `lib/types/task.ts` - Already correct
- `lib/types/workflow.ts` - Add to standard status set
- `lib/types/incidents-types.ts` - Consolidate incident status

**Approach:**
1. Create base type that extends standard statuses
2. Add module-specific status types where needed
3. Use discriminated unions for type safety
4. Update database schema to use UPPER_SNAKE_CASE in storage

#### 2.3 Update Type Definitions
```typescript
// Before (various)
export type AuditStatus = 'draft' | 'under-review' | 'planned' | ...
export type RiskStatus = 'OPEN' | 'CLOSED' | 'PENDING_REVIEW' | ...

// After (consistent)
export type StandardStatus =
  | 'DRAFT' | 'PENDING' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED'
  | 'REJECTED' | 'ON_HOLD' | 'OPEN' | 'COMPLETED' | 'CLOSED' | 'ARCHIVED'

export type AuditStatus = StandardStatus
export type RiskStatus = StandardStatus
export type TaskStatus = StandardStatus
// ... etc
```

---

### Phase 3: Component Migration (Days 3-5)

#### 3.1 Replace All Custom Status Display Components

**Custom components to remove/refactor:**

1. `components/audit/audit-status-badge.tsx`
   - **Current:** Custom color mapping for audit statuses
   - **Action:** Replace all usage with StatusBadge component
   - **Files affected:** Audit pages, tables, cards

2. `components/audit/audit-plan-status-badge.tsx`
   - **Current:** Custom color mapping for audit plan statuses
   - **Action:** Replace all usage with StatusBadge component
   - **Files affected:** Audit plan pages, approval panels

3. Inline status displays in:
   - [app/dashboard/(modules)/audit/plans/_components/audit-plan-approvals-panel.tsx](app/dashboard/(modules)/audit/plans/_components/audit-plan-approvals-panel.tsx)
   - Audit tables and lists
   - Risk action tables
   - Task displays
   - Incident tables

#### 3.2 Audit All Status Display Locations

**Search patterns to identify:**
- `.map(status =>` or `switch(status)` - Status case handling
- `className=".*badge.*"` - Badge elements
- `status.toLowerCase()` or `status.toUpperCase()` - String manipulation
- Color/style assignments (amber, blue, green, etc.) - Manual styling

**Expected files:**
- All files in `app/dashboard/(modules)/*/`
- All files in `components/audit/`
- All files in `components/risks/`
- Table and list components throughout

#### 3.3 Implement Migration Pattern

```typescript
// BEFORE: Custom handling
function getStatusColor(status: string) {
  if (status === 'draft') return 'bg-gray-100'
  if (status === 'in-progress') return 'bg-blue-100'
  // ...
}

// AFTER: Unified StatusBadge
<StatusBadge status={normalizeStatus(status)} size="sm" />
```

---

### Phase 4: Validation & Consistency (Days 5-6)

#### 4.1 Implement Status Transition State Machine

**File:** `lib/constants/status-transitions.ts`

```typescript
export const STATUS_TRANSITIONS: Record<string, Record<string, string[]>> = {
  audit: {
    DRAFT: ['SUBMITTED', 'REJECTED'],
    SUBMITTED: ['IN_REVIEW', 'DRAFT'],
    IN_REVIEW: ['APPROVED', 'REJECTED'],
    APPROVED: ['COMPLETED', 'ARCHIVED'],
    REJECTED: ['DRAFT'],
    // ...
  },
  // ... per entity type
}
```

#### 4.2 Create Validation Guards

**File:** `lib/utils/status-validator.ts`

```typescript
export function validateStatusTransition(
  entityType: string,
  currentStatus: string,
  newStatus: string
): { valid: boolean; reason?: string }

export function assertValidStatus(status: string, entityType: string): void

export function normalizeStatus(status: string): StandardStatus
```

#### 4.3 Add API Validation Layer

- Update all API endpoints that modify status
- Add server-side transition validation
- Return clear error messages for invalid transitions
- Add logging for status changes

---

### Phase 5: Testing & Documentation (Days 6-7)

#### 5.1 Comprehensive Testing

**Test coverage:**
- StatusBadge component with all status values
- Status transitions for each entity type
- Color consistency across different sizes and variants
- Dark mode support
- Responsive display

**Test files:**
- `components/__tests__/status-badge.test.tsx`
- `lib/utils/__tests__/status-utils.test.ts`
- `lib/utils/__tests__/status-validator.test.ts`

#### 5.2 Documentation

Create `STATUS_IMPLEMENTATION.md`:
- Status values and meanings
- Valid transitions per entity
- Migration guide for developers
- Examples of using StatusBadge
- Troubleshooting section

#### 5.3 Visual Regression Testing

- Screenshot comparisons for all status badges
- Responsive layout verification
- Dark mode verification

---

## AFFECTED MODULES & FILES

### Audit Module
**Status Types:** 6 (most complex)
- `lib/types/audit-types.ts`
- `components/audit/audit-status-badge.tsx` (REMOVE)
- `components/audit/audit-plan-status-badge.tsx` (REMOVE)
- `lib/utils/audit-utils.ts` (CONSOLIDATE)
- All audit tables and detail pages

**Files to update:** ~15 files

### Risk Module
**Status Types:** 6 (has conflicts)
- `lib/types/risk-types.ts`
- `app/_actions/risk-module-actions.ts`
- All risk action tables and displays
- Risk assessment displays

**Files to update:** ~12 files

### Task Module
**Status Types:** 2 (has conflicts)
- `lib/types/task.ts`
- `app/_actions/risk-module-actions.ts`
- Task tables and displays

**Files to update:** ~8 files

### Other Modules
**Status Types:** 5 (scattered)
- Workflow, Incidents, Account, etc.
- Various display components
- Utilities for status display

**Files to update:** ~10 files

---

## MIGRATION CHECKLIST

### Before Starting
- [ ] Back up database
- [ ] Create feature branch: `feat/status-standardization`
- [ ] Set up status transition documentation
- [ ] Plan deployment strategy

### Phase 1
- [ ] Create `lib/constants/statuses.ts`
- [ ] Create `lib/utils/status-utils.ts`
- [ ] Update `components/status-badge.tsx`
- [ ] Create migration guide

### Phase 2
- [ ] Update `lib/types/audit-types.ts`
- [ ] Update `lib/types/risk-types.ts`
- [ ] Update `lib/types/task.ts`
- [ ] Update `lib/types/workflow.ts`
- [ ] Update `lib/types/incidents-types.ts`
- [ ] Resolve RiskStatus conflicts
- [ ] Resolve TaskStatus conflicts

### Phase 3
- [ ] Remove `components/audit/audit-status-badge.tsx`
- [ ] Remove `components/audit/audit-plan-status-badge.tsx`
- [ ] Update all audit module components
- [ ] Update all risk module components
- [ ] Update all task module components
- [ ] Update workflow components
- [ ] Update incident components
- [ ] Update account components
- [ ] Update utility functions

### Phase 4
- [ ] Create `lib/constants/status-transitions.ts`
- [ ] Create `lib/utils/status-validator.ts`
- [ ] Add API validation layer
- [ ] Update API endpoints for status changes
- [ ] Add logging for status transitions

### Phase 5
- [ ] Write comprehensive tests
- [ ] Perform visual regression testing
- [ ] Test all status transitions
- [ ] Create documentation
- [ ] Code review and testing
- [ ] Staging deployment
- [ ] Production deployment

---

## CONFIGURATION EXAMPLES

### New Status Configuration Structure
```typescript
// lib/constants/statuses.ts
export const STANDARD_STATUSES = {
  DRAFT: {
    id: 'DRAFT',
    label: 'Draft',
    description: 'Entity is being prepared and not yet submitted for review',
    color: 'default',      // Maps to StatusBadge color prop
    style: 'outline',      // Maps to StatusBadge style
    hexColor: '#6C757D',
    sortOrder: 1
  },
  PENDING: {
    id: 'PENDING',
    label: 'Pending',
    description: 'Awaiting action or approval',
    color: 'warning',
    style: 'outline',
    hexColor: '#FFC107',
    sortOrder: 2
  },
  // ... 9 more statuses
} as const

export type StandardStatusKey = keyof typeof STANDARD_STATUSES

export const ENTITY_STATUS_RULES = {
  audit: {
    allowedStatuses: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'],
    defaultStatus: 'DRAFT',
    transitions: {
      DRAFT: ['SUBMITTED', 'REJECTED'],
      SUBMITTED: ['IN_REVIEW', 'DRAFT'],
      IN_REVIEW: ['APPROVED', 'REJECTED'],
      APPROVED: ['COMPLETED', 'ARCHIVED'],
      REJECTED: ['DRAFT'],
      COMPLETED: ['ARCHIVED'],
      ARCHIVED: []
    }
  },
  // ... per entity
}
```

### StatusBadge Usage
```typescript
// All status displays use same component
<StatusBadge status="DRAFT" size="sm" />
<StatusBadge status="IN_REVIEW" size="md" />
<StatusBadge status="APPROVED" />

// With optional tooltip
<StatusBadge
  status="COMPLETED"
  size="lg"
  className="cursor-help"
  title="Completed on 2025-11-13"
/>
```

---

## ROLLOUT STRATEGY

### Option 1: Big Bang (Recommended for small team)
- Implement all changes in single sprint
- Coordinate across all modules simultaneously
- Single deployment with full testing
- Risk: High complexity, but cleaner cutover

### Option 2: Phased by Module (Recommended for larger team)
- **Week 1:** Foundation + Audit module
- **Week 2:** Risk module
- **Week 3:** Task module + others
- **Week 4:** Validation + documentation
- Risk: Temporary inconsistency, but lower risk per phase

### Option 3: Feature Flag Approach
- Roll out with feature flag
- Gradually enable per user/org
- Easier rollback if issues found
- Risk: Complex code maintenance during transition

**Recommendation:** Option 1 (Big Bang) - 7-10 days total effort

---

## EXPECTED BENEFITS

### Immediate
✅ Single source of truth for status definitions
✅ Consistent color scheme across UI
✅ Elimination of type conflicts and duplicates
✅ Standardized naming convention

### Short-term
✅ Easier debugging (unified configuration)
✅ Improved user experience (consistent appearance)
✅ Simplified maintenance (less code duplication)
✅ Better type safety (validated transitions)

### Long-term
✅ Easier feature additions (new statuses integrated easily)
✅ Improved onboarding (new developers understand status system)
✅ Foundation for advanced features (status notifications, audit trails)
✅ Reduced bugs related to status handling

---

## RISK ASSESSMENT

### High Risk Items
1. **Database Migration** - Converting status values to UPPER_SNAKE_CASE
   - Mitigation: Backup, test migration, feature flag rollback

2. **Breaking Changes** - API contracts change
   - Mitigation: Versioned APIs, migration period, clear communication

3. **Custom Integrations** - External systems using current status values
   - Mitigation: Maintain compatibility layer, advance notice to partners

### Medium Risk Items
1. **Testing Coverage** - Ensuring all transitions validated
   - Mitigation: Comprehensive test suite, manual testing

2. **Performance** - Config file overhead
   - Mitigation: Use constants (no runtime overhead), cache as needed

### Low Risk Items
1. **Component Changes** - StatusBadge component updates
   - Mitigation: Backward compatible, feature flags

2. **Documentation** - Keeping docs in sync
   - Mitigation: Auto-generated docs from constants

---

## SUCCESS CRITERIA

- [ ] All status values standardized to UPPER_SNAKE_CASE
- [ ] All status displays use StatusBadge component
- [ ] Zero custom status color mappings outside centralized config
- [ ] 100% of status type definitions consolidated
- [ ] Type conflicts resolved (RiskStatus, TaskStatus)
- [ ] All status transitions documented and validated
- [ ] API endpoints validate status transitions
- [ ] Comprehensive test coverage (>90%)
- [ ] Zero console warnings for unknown statuses
- [ ] Documentation complete and reviewed

---

## TIMELINE ESTIMATE

| Phase | Duration | Resources |
|-------|----------|-----------|
| Phase 1: Foundation | 2 days | 1 Senior Dev |
| Phase 2: Type Consolidation | 1.5 days | 1-2 Devs |
| Phase 3: Component Migration | 2.5 days | 2 Devs (parallel) |
| Phase 4: Validation | 1.5 days | 1 Senior Dev |
| Phase 5: Testing & Docs | 2 days | 1-2 Devs |
| **TOTAL** | **~9 days** | **1-2 FTE** |

---

## NEXT STEPS

1. **Review & Approval** - Get stakeholder approval on this plan
2. **Create Detailed Tasks** - Break down into Jira/GitHub issues
3. **Kickoff Planning** - Team alignment on approach
4. **Start Phase 1** - Begin foundation implementation
5. **Weekly Sync** - Monitor progress and adjust as needed

---

## QUESTIONS & CLARIFICATIONS NEEDED

1. **Database Migration:** Should we maintain backward compatibility layer?
2. **API Versioning:** Do we need to support old status values in API responses?
3. **External Integrations:** Are there external systems using current status values?
4. **Timeline:** Any deadline constraints we should consider?
5. **Testing:** What's the required test coverage level?

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Next Review:** Post-implementation
