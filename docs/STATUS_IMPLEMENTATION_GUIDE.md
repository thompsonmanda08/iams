# Status Standardization - Implementation Guide

**Document Version:** 1.0
**Implementation Status:** Phase 1-3 Complete ✓
**Date:** 2025-11-14

---

## WHAT HAS BEEN DONE

### ✓ Phase 1: Foundation Complete
1. **Created Centralized Status Configuration** (`lib/statuses.ts`)
   - Single source of truth for all 11 standard statuses
   - Complete status metadata (label, description, colors, sort order)
   - Entity-specific status rules and transitions
   - Comprehensive utility functions for status operations

2. **Enhanced StatusBadge Component** (`components/status-badge.tsx`)
   - Now uses centralized status configuration
   - Supports all standard statuses with consistent colors
   - Type-safe with improved error handling
   - Backward compatible with existing code
   - Development warnings for unknown statuses

### ✓ Phase 2: Type Consolidation Complete
1. **Resolved Type Conflicts:**
   - ✓ RiskStatus consolidated (removed duplicate from risk-module-actions.ts)
   - ✓ ActionTaskStatus created (renamed from TaskStatus in risk-module-actions.ts to avoid conflicts)
   - ✓ Added backward compatibility for legacy status values

2. **Updated Type Definitions:**
   - ✓ `lib/types/audit-types.ts` - Now supports UPPER_SNAKE_CASE
   - ✓ `lib/types/risk-types.ts` - Consolidated and expanded for standard statuses
   - ✓ `lib/types/task.ts` - Remains primary source for TaskStatus
   - ✓ `lib/types/workflow.ts` - Now supports standardized status values
   - ✓ `lib/types/incidents-types.ts` - New IncidentStatus type created

### ✓ Phase 3: Component Migration Partial
1. **Refactored Custom Status Components:**
   - ✓ `components/audit/audit-status-badge.tsx` - Now wraps StatusBadge
   - ✓ `components/audit/audit-plan-status-badge.tsx` - Now wraps StatusBadge
   - Both provide backward compatibility for legacy kebab-case statuses

---

## KEY FILES CREATED/MODIFIED

### New Files
- **`lib/statuses.ts`** - Centralized status configuration (600+ lines)
  - STATUS_VALUES constant
  - STANDARD_STATUSES configuration
  - ENTITY_STATUS_RULES with transitions
  - 15+ utility functions

### Modified Files
- `components/status-badge.tsx` - Now uses lib/statuses.ts configuration
- `components/audit/audit-status-badge.tsx` - Wrapper around StatusBadge
- `components/audit/audit-plan-status-badge.tsx` - Wrapper around StatusBadge
- `lib/types/audit-types.ts` - Added UPPER_SNAKE_CASE support
- `lib/types/risk-types.ts` - Consolidated status definitions
- `lib/types/workflow.ts` - Added standardized status support
- `lib/types/incidents-types.ts` - Created IncidentStatus type
- `app/_actions/risk-module-actions.ts` - Removed RiskStatus conflict

---

## STANDARD STATUS VALUES

All statuses use **UPPER_SNAKE_CASE** convention:

| Status | Display Name | Color | Style | Use Case |
|--------|-------------|-------|-------|----------|
| DRAFT | Draft | gray | outline | Entity being prepared |
| PENDING | Pending | orange | outline | Awaiting action/approval |
| SUBMITTED | Submitted | blue | outline | Submitted for approval |
| IN_REVIEW | In Review | cyan | outline | Under review by team |
| APPROVED | Approved | green | solid | Approved and active |
| REJECTED | Rejected | red | solid | Rejected, needs revision |
| ON_HOLD | On Hold | orange | outline | Paused pending conditions |
| OPEN | Open | green | solid | Active and open (legacy) |
| COMPLETED | Completed | teal | solid | Execution complete |
| CLOSED | Closed | gray | outline | Closed and inactive |
| ARCHIVED | Archived | dark-gray | outline | Archived and read-only |

---

## USAGE GUIDE

### Using StatusBadge Component

```typescript
// Basic usage
import { StatusBadge } from "@/components/status-badge";

// With standard status
<StatusBadge status="APPROVED" />
<StatusBadge status="IN_REVIEW" size="lg" />
<StatusBadge status="DRAFT" className="mr-2" />

// With tooltip
<StatusBadge status="COMPLETED" showTooltip={true} />

// In tables
<td>
  <StatusBadge status={auditPlan.status} size="sm" />
</td>
```

### Using Status Utilities

```typescript
import {
  getStatusConfig,
  getStatusLabel,
  getStatusColor,
  validateStatusTransition,
  normalizeStatus,
  isValidStatusForEntity,
  getValidTransitions
} from "@/lib/statuses";

// Get full configuration for a status
const config = getStatusConfig("APPROVED");
// Returns: { id: "APPROVED", label: "Approved", color: "success", ... }

// Get display label
const label = getStatusLabel("IN_REVIEW"); // "In Review"

// Get color for styling
const color = getStatusColor("DRAFT"); // "default"

// Validate transitions
const result = validateStatusTransition("DRAFT", "SUBMITTED", "auditPlan");
// Returns: { valid: true }

// Normalize legacy formats to standard
const normalized = normalizeStatus("in-progress"); // "IN_PROGRESS"

// Check if status is allowed for entity
const allowed = isValidStatusForEntity("APPROVED", "audit"); // true

// Get valid next statuses
const next = getValidTransitions("DRAFT", "audit");
// Returns: ["SUBMITTED", "REJECTED"]
```

### Backward Compatibility

**Legacy kebab-case statuses are still supported:**

```typescript
// These still work:
<AuditStatusBadge status="in-progress" />  // Auto-normalizes to IN_PROGRESS
<StatusBadge status="under-review" />      // Auto-normalizes to IN_REVIEW

// Get normalized version
import { normalizeStatus } from "@/lib/statuses";
const normalized = normalizeStatus("in-progress"); // "IN_PROGRESS"
```

---

## STATUS TRANSITIONS

Valid state transitions are defined per entity type in `lib/statuses.ts`:

### Audit Status Transitions
```
DRAFT → [SUBMITTED, REJECTED]
SUBMITTED → [IN_REVIEW, DRAFT]
IN_REVIEW → [APPROVED, REJECTED]
APPROVED → [COMPLETED, ARCHIVED]
REJECTED → [DRAFT]
COMPLETED → [ARCHIVED]
ARCHIVED → []
```

### Risk Status Transitions
```
DRAFT → [OPEN, REJECTED]
PENDING → [OPEN, APPROVED]
APPROVED → [OPEN, ON_HOLD, CLOSED]
ON_HOLD → [OPEN, CLOSED]
OPEN → [PENDING, ON_HOLD, CLOSED]
CLOSED → [ARCHIVED]
ARCHIVED → []
```

### Task Status Transitions
```
PENDING → [IN_REVIEW, COMPLETED, REJECTED]
IN_REVIEW → [COMPLETED, REJECTED]
REJECTED → [PENDING]
ON_HOLD → [PENDING, COMPLETED]
COMPLETED → [ARCHIVED]
ARCHIVED → []
```

*See lib/statuses.ts for complete transitions for all entity types.*

---

## REMAINING WORK

### Phase 3 (Continued): Component Migration
- [ ] Audit all files displaying statuses
- [ ] Replace custom status displays with StatusBadge
- [ ] Update inline status text to use utility functions
- [ ] Test all status badge displays

**Files likely requiring updates:**
- Audit module pages and tables
- Risk module pages and tables
- Task displays and lists
- Incident management components
- Workflow visualization components
- Any custom status rendering logic

### Phase 4: Validation & API Integration
- [ ] Implement API-level status validation
- [ ] Add status transition guards in server actions
- [ ] Add logging for status change events
- [ ] Update error handling for invalid transitions

### Phase 5: Testing & Documentation
- [ ] Create test suite for status utilities
- [ ] Test all status transitions
- [ ] Visual regression testing for badges
- [ ] Update team documentation
- [ ] Create migration guide for developers

---

## QUICK REFERENCE

### Import Statements

```typescript
// For status displays
import { StatusBadge } from "@/components/status-badge";
import { AuditStatusBadge } from "@/components/audit/audit-status-badge";
import { AuditPlanStatusBadge } from "@/components/audit/audit-plan-status-badge";

// For status logic
import {
  getStatusConfig,
  getStatusLabel,
  getStatusColor,
  validateStatusTransition,
  normalizeStatus,
  isValidStatusForEntity,
  getValidTransitions,
  getDefaultStatusForEntity,
  STANDARD_STATUSES,
  ENTITY_STATUS_RULES,
  STATUS_VALUES,
  type StandardStatus
} from "@/lib/statuses";

// For type safety
import type { StandardStatus } from "@/lib/statuses";
import type {
  AuditStatus,
  AuditPlanStatus,
  FindingStatus,
  WorkpaperStatus
} from "@/lib/types/audit-types";
import type { RiskStatus } from "@/lib/types/risk-types";
import type { TaskStatus } from "@/lib/types/task";
import type { WorkflowStatus } from "@/lib/types/workflow";
import type { IncidentStatus } from "@/lib/types/incidents-types";
```

### Common Patterns

**Check if transition is valid before allowing:**
```typescript
const { valid, reason } = validateStatusTransition(
  current,
  newStatus,
  "audit"
);
if (!valid) {
  return { error: `Cannot transition: ${reason}` };
}
```

**Get all allowed statuses for entity:**
```typescript
import { getAllowedStatusesForEntity } from "@/lib/statuses";

const allowedStatuses = getAllowedStatusesForEntity("audit");
// Returns: ["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED", "ARCHIVED"]
```

**Display status with fallback:**
```typescript
const label = getStatusLabel(status);
<span>{label || "Unknown Status"}</span>
```

---

## DEVELOPER CHECKLIST

When creating new entities or status-related features:

- [ ] Use standardized UPPER_SNAKE_CASE status values
- [ ] Use StatusBadge for displaying statuses
- [ ] Add entity type to ENTITY_STATUS_RULES if needed
- [ ] Use validateStatusTransition before allowing changes
- [ ] Import types from centralized locations
- [ ] Use utility functions instead of hardcoded strings
- [ ] Support status normalization for legacy data
- [ ] Add tests for status transitions
- [ ] Document valid transitions in comments

---

## TROUBLESHOOTING

### Unknown Status Warning
If you see: `StatusBadge: Unknown status "..."` in console:
1. The status value isn't in STANDARD_STATUSES
2. Check if it's a legacy value that needs normalization
3. Add it to lib/statuses.ts if it's a new valid status

### Type Mismatch
If TypeScript complains about status type:
1. Use `StandardStatus` type from lib/statuses.ts
2. Or use the specific entity type (e.g., `AuditStatus`)
3. Use `normalizeStatus()` to convert legacy formats

### Transition Validation Fails
If transition validation returns false:
1. Check ENTITY_STATUS_RULES in lib/statuses.ts
2. Verify the entity type is correct
3. Check the current and target statuses are correct
4. See STATUS_TRANSITIONS section above

---

## PERFORMANCE NOTES

- Status configuration is defined as constants (zero runtime overhead)
- Utility functions are pure and cacheable
- StatusBadge component memoization friendly
- No database queries needed for status lookups
- Color/style mappings are static

---

## NEXT STEPS

1. Review this implementation guide with the team
2. Begin Phase 3 component migration
3. Create test suite for all status transitions
4. Update API endpoints with transition validation
5. Schedule Phase 5 documentation updates

---

**Questions?** Refer to STATUS_STANDARDIZATION_PLAN.md for comprehensive details.
