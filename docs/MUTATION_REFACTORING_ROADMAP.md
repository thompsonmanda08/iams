# 🗺️ System-Wide Mutation Refactoring Roadmap
## Infratel IAMS Web App - Comprehensive Implementation Plan

**Date:** December 16, 2025
**Total Components Identified:** 20+
**Total Lines of Consolidatable Code:** 525+
**Estimated Total Effort:** 7-10 days
**Expected Code Reduction:** 60-70%

---

## Executive Summary

This roadmap provides a prioritized, actionable plan to refactor mutation logic across 20+ React components into reusable, centralized hooks. Implementation will:

- ✅ Eliminate 525+ lines of boilerplate code
- ✅ Standardize error handling and loading states
- ✅ Improve code consistency and maintainability
- ✅ Create foundation for future component improvements
- ✅ Reduce technical debt significantly

---

## Current State Analysis

### Existing Mutation Hooks (Already Created)
- ✅ `hooks/use-finding-mutations.ts` (4 hooks)
- ✅ `hooks/use-audit-mutations.ts` (3 hooks)
- ✅ `hooks/use-plan-mutations.ts` (3 generic hooks)

### Common Mutation Patterns Found

**Pattern 1: Manual State Management (28+ components)**
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState({ status: false, message: "" });
// Then manual try/catch with state updates
```

**Pattern 2: Toast Notifications in Components (25+ components)**
```typescript
catch (error) {
  toast.error(error.message);
}
```

**Pattern 3: QueryClient Invalidation (6+ components)**
```typescript
queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SOMETHING] });
```

**Pattern 4: Scattered Async Logic (20+ components)**
```typescript
const handleSubmit = async (e) => {
  setIsLoading(true);
  try {
    // API call
  } finally {
    setIsLoading(false);
  }
};
```

---

## TIER 1: Quick Wins (1-2 Days Work)
**Target:** 168+ lines removed with minimal complexity

### 1.1 Create `hooks/use-risk-configuration-mutations.ts`
**Status:** 🔴 NOT STARTED
**Files to Refactor:** 5 components
**Total Lines to Remove:** 163 lines

#### Components in This Tier

**1.1.1 create-rating-dialog.tsx** 📍
- **Path:** `app/dashboard/system-configs/risk-settings/matrices/_components/create-rating-dialog.tsx`
- **Entity:** Risk Rating Level
- **Operations:** CREATE
- **Mutation Lines:** 44-80
- **Lines to Remove:** 37 lines
- **Current Pattern:**
  ```typescript
  const handleSubmit = async (e) => {
    setIsLoading(true);
    try {
      const response = await createRating(formData);
      toast.success("Rating created");
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  ```
- **New Pattern:**
  ```typescript
  const createRating = useCreateRatingMutation({
    onSuccess: onSuccess
  });
  createRating.mutate(formData);
  ```

**1.1.2 create-scale-dialog.tsx**
- **Path:** `app/dashboard/system-configs/risk-settings/matrices/_components/create-scale-dialog.tsx`
- **Entity:** Risk Scale
- **Operations:** CREATE
- **Mutation Lines:** 43-78
- **Lines to Remove:** 36 lines
- **Similar Pattern:** Same as create-rating-dialog

**1.1.3 create-risk-matrix-dialog.tsx**
- **Path:** `app/dashboard/system-configs/_components/create-risk-matrix-dialog.tsx`
- **Entity:** Risk Matrix
- **Operations:** CREATE
- **Mutation Lines:** 39-63
- **Lines to Remove:** 25 lines

**1.1.4 create-risk-response-dialog.tsx**
- **Path:** `app/dashboard/system-configs/_components/create-risk-response-dialog.tsx`
- **Entity:** Risk Response Strategy
- **Operations:** CREATE
- **Mutation Lines:** 36-60
- **Lines to Remove:** 25 lines

**1.1.5 risk-appetite-dialog.tsx**
- **Path:** `app/dashboard/system-configs/_components/risk-appetite-dialog.tsx`
- **Entity:** Risk Appetite Status
- **Operations:** CREATE / UPDATE
- **Mutation Lines:** 71-95
- **Lines to Remove:** 30 lines
- **Complexity:** Medium (conditional create/update)

#### Implementation Steps

**Step 1: Create Hook File** (15 minutes)
```typescript
// hooks/use-risk-configuration-mutations.ts
export function useCreateRatingMutation(options?: { onSuccess?: () => void }) { ... }
export function useCreateScaleMutation(options?: { onSuccess?: () => void }) { ... }
export function useCreateRiskMatrixMutation(options?: { onSuccess?: () => void }) { ... }
export function useCreateRiskResponseMutation(options?: { onSuccess?: () => void }) { ... }
export function useRiskAppetiteStatusMutation(options?: { onSuccess?: () => void }) { ... }
```

**Step 2: Refactor Each Component** (45 minutes per component × 5 = 225 minutes)
- Remove manual state management
- Remove try/catch blocks
- Replace with hook calls
- Update button disabled states

**Step 3: Test All Components** (20 minutes)
- Verify dialogs open/close properly
- Verify success/error notifications
- Verify data saves correctly

**Estimated Time:** 4.5 hours

---

### 1.2 Create `hooks/use-evidence-mutations.ts`
**Status:** 🔴 NOT STARTED
**Files to Refactor:** 1 component
**Total Lines to Remove:** 25 lines

#### Components in This Tier

**1.2.1 evidence-form.tsx** 📍
- **Path:** `app/dashboard/(modules)/audit/plans/_components/evidence-form.tsx`
- **Entity:** Finding Evidence
- **Operations:** CREATE / UPDATE
- **Mutation Lines:** 89-100+
- **Lines to Remove:** 25 lines
- **Current Pattern:** Form with field-level error handling
- **New Hook:** `useEvidenceFormMutation`

#### Implementation Steps

**Step 1: Create Hook** (20 minutes)
```typescript
export function useEvidenceFormMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) { ... }
```

**Step 2: Refactor Component** (30 minutes)
- Simplify form submission logic
- Remove field error state management
- Use hook for mutation handling

**Estimated Time:** 1 hour

---

## TIER 2: Medium Effort (2-3 Days Work)
**Target:** 175+ lines removed with moderate complexity

### 2.1 Create `hooks/use-risk-mutations.ts`
**Status:** 🔴 NOT STARTED
**Files to Refactor:** 2 components
**Total Lines to Remove:** 80 lines

**2.1.1 risk-form-dialog.tsx**
- **Path:** `components/forms/risk-form-dialog.tsx`
- **Entity:** Risk
- **Operations:** CREATE / UPDATE
- **Mutation Lines:** 94-102
- **Lines to Remove:** 40 lines
- **Complexity:** Medium (dual operations)

**2.1.2 create-risk-dialog.tsx**
- **Path:** `app/dashboard/(modules)/risks/_components/create-risk-dialog.tsx`
- **Entity:** Risk (wrapper)
- **Operations:** CREATE (delegates)
- **Lines to Remove:** 10 lines (wrapper only)

**Estimated Time:** 3-4 hours

---

### 2.2 Create `hooks/use-budget-mutations.ts`
**Status:** 🔴 NOT STARTED
**Files to Refactor:** 1 component
**Total Lines to Remove:** 45 lines

**2.2.1 budget-form.tsx**
- **Path:** `app/dashboard/(modules)/audit/budgets/_components/budget-form.tsx`
- **Entity:** Budget / Budget Line Items
- **Operations:** CREATE (both)
- **Lines to Remove:** 45 lines
- **Complexity:** High (multi-step form with currency handling)
- **Required Hooks:**
  - `useCreateBudgetMutation`
  - `useCreateBudgetLineMutation`
  - `useSubmitBudgetForApprovalMutation`

**Estimated Time:** 4-5 hours

---

### 2.3 Create `hooks/use-configuration-mutations.ts`
**Status:** 🔴 NOT STARTED
**Files to Refactor:** 2 components
**Total Lines to Remove:** 60 lines

**2.3.1 countries-tab.tsx**
- **Path:** `app/(private)/admin/configurations/_components/countries-tab.tsx`
- **Entity:** Country
- **Operations:** CREATE / UPDATE / READ with pagination
- **Lines to Remove:** 30 lines
- **Required Hooks:**
  - `useCreateCountryMutation`
  - `useUpdateCountryMutation`

**2.3.2 provinces-tab.tsx**
- **Path:** `app/(private)/admin/configurations/_components/provinces-tab.tsx`
- **Entity:** Province
- **Operations:** CREATE / UPDATE / READ with pagination
- **Lines to Remove:** 30 lines
- **Required Hooks:**
  - `useCreateProvinceMutation`
  - `useUpdateProvinceMutation`

**Estimated Time:** 4-5 hours

---

### 2.4 Extend `hooks/use-plan-mutations.ts`
**Status:** 🟡 PARTIALLY STARTED
**Files to Refactor:** 2 components
**Total Lines to Remove:** 50 lines

**2.4.1 create-plan-item-dialog.tsx**
- **Path:** `app/dashboard/(modules)/audit/plans/_components/create-plan-item-dialog.tsx`
- **Entity:** Annual Audit Plan Item
- **Operations:** CREATE / UPDATE
- **Lines to Remove:** 30-40 lines
- **Action:** Consolidate with existing `usePlanItemMutation` hook
- **Note:** Already partially using mutations, needs optimization

**Estimated Time:** 2-3 hours

---

## TIER 3: High Effort (3-5 Days Work)
**Target:** 300+ lines removed with high complexity

### 3.1 Refactor `hooks/use-workflow-mutations.ts` (CRITICAL)
**Status:** 🔴 NOT STARTED
**Scope:** THIS IS ALREADY A HOOK - NEEDS REFACTORING
**Lines to Remove:** 150+ lines
**Complexity:** VERY HIGH

#### Current Issues

This hook currently uses manual state management instead of useMutation:
```typescript
interface MutationState {
  isLoading: boolean;
  error: string | null;
}

const saveWorkflow = async (workflow) => {
  setState({ isLoading: true, error: null });
  try {
    // API call
  } catch (error) {
    setState({ isLoading: false, error: errorMessage });
  }
};
```

#### Refactoring Approach

**Option A: Convert to useMutation** (Recommended)
- Create individual hook for each operation
- Use TanStack Query's built-in state management
- 50-60% code reduction

**Option B: Extract to Separate Hooks**
- `useWorkflowMutation`
- `useWorkflowStateMutation`
- `useWorkflowTransitionMutation`
- Cleaner separation of concerns

#### New Hooks to Create

```typescript
export function useCreateWorkflowMutation(options?: { onSuccess?: () => void }) { ... }
export function useUpdateWorkflowMutation(options?: { onSuccess?: () => void }) { ... }
export function useCreateWorkflowStateMutation(options?: { onSuccess?: () => void }) { ... }
export function useUpdateWorkflowStateMutation(options?: { onSuccess?: () => void }) { ... }
export function useDeleteWorkflowStateMutation(options?: { onSuccess?: () => void }) { ... }
export function useCreateWorkflowTransitionMutation(options?: { onSuccess?: () => void }) { ... }
export function useUpdateWorkflowTransitionMutation(options?: { onSuccess?: () => void }) { ... }
export function useDeleteWorkflowTransitionMutation(options?: { onSuccess?: () => void }) { ... }
```

#### Implementation Impact

**Files Using This Hook:**
- (To be determined by searching imports)

**Estimated Time:** 5-7 hours

**Complexity Risk:** HIGH - Workflow mutations are complex with multiple operations

---

### 3.2 Create `hooks/use-multi-step-form-mutations.ts`
**Status:** 🔴 NOT STARTED
**Files to Refactor:** 1 component
**Total Lines to Remove:** 100+ lines

**3.2.1 multi-step-risk-form.tsx**
- **Path:** `components/forms/multi-step-risk-form.tsx`
- **Entity:** Risk (multi-step creation)
- **Operations:** CREATE with 3 sequential steps
- **Lines to Remove:** 100+ lines
- **Complexity:** VERY HIGH (step orchestration)
- **Required Hook:** `useMultiStepRiskMutation`

#### Implementation Approach

This requires special handling for multi-step forms:
```typescript
export function useMultiStepRiskMutation(options?: {
  onStepComplete?: (step: number) => void;
  onSuccess?: (riskId: string) => void;
  onError?: (error: Error) => void;
}) {
  // Handle step 1 mutation
  // Handle step 2 mutation (depends on step 1 result)
  // Handle step 3 mutation (depends on step 2 result)
  // Orchestrate flow
}
```

**Estimated Time:** 6-8 hours

---

### 3.3 Consolidate User Management Mutations
**Status:** 🔴 NOT STARTED
**Files to Refactor:** 1 component
**Total Lines to Remove:** 50 lines

**3.3.1 create-user-dialog.tsx**
- **Path:** `app/dashboard/system-configs/_components/create-user-dialog.tsx`
- **Entity:** User (ORGANIZATION_USER, ADMIN_USER)
- **Operations:** CREATE / UPDATE
- **Lines to Remove:** 50 lines
- **Note:** Check if hooks already exist in `use-users-query-data.ts`

**Action:**
1. Audit existing user mutation hooks
2. Consolidate if needed
3. Update component to use existing hooks

**Estimated Time:** 2-3 hours

---

## TIER 4: Investigation Required
**Status:** 🔴 PENDING DEEPER REVIEW
**Components:** 10 items requiring analysis

These components showed mutation patterns but need deeper code review:

1. `new-incident.tsx` - Incident creation
2. `my-incidents.tsx` - Incident management
3. `task-reassign-dialog.tsx` - Task reassignment
4. `submit-evidence-dialog.tsx` - Evidence submission
5. `review-evidence-dialog.tsx` - Evidence review
6. `create-reassessment-dialog.tsx` - Reassessment creation
7. `register-list.tsx` - Register management
8. `assign-action-dialog.tsx` - Action assignment
9. `action-review-dialog.tsx` - Action review
10. `workpaper-category-panel.tsx` - Category management

**Next Step:** Deep-dive analysis of each component to determine:
- Actual mutation patterns present
- Code duplication opportunities
- Priority ranking
- Hook consolidation strategy

**Estimated Investigation Time:** 3-4 hours

---

## Implementation Timeline

### Week 1: Foundation & Quick Wins (5 days)
```
Day 1: Create risk-configuration-mutations.ts hook (1.5 hours)
       Refactor create-rating-dialog.tsx (1 hour)
       Refactor create-scale-dialog.tsx (1 hour)
       = 3.5 hours

Day 2: Refactor create-risk-matrix-dialog.tsx (1 hour)
       Refactor create-risk-response-dialog.tsx (1 hour)
       Refactor risk-appetite-dialog.tsx (1.5 hours)
       Testing & verification (1 hour)
       = 4.5 hours

Day 3: Create evidence-mutations.ts hook (20 minutes)
       Refactor evidence-form.tsx (30 minutes)
       Code review & testing (1 hour)
       = 1.5 hours

Day 4: Create risk-mutations.ts hook (1 hour)
       Refactor risk-form-dialog.tsx (1.5 hours)
       Refactor create-risk-dialog.tsx (30 minutes)
       = 3 hours

Day 5: Buffer for testing & fixes
       Documentation updates
       = Full day available
```

**Week 1 Output:** Tier 1 & Tier 2 (First Phase) Complete
**Lines Removed:** ~200 lines
**Components Refactored:** 8

---

### Week 2: Medium Effort Continuation (5 days)

```
Day 1: Create budget-mutations.ts hook (1 hour)
       Refactor budget-form.tsx (2 hours)
       Testing (1 hour)
       = 4 hours

Day 2: Create configuration-mutations.ts hook (1 hour)
       Refactor countries-tab.tsx (1.5 hours)
       Refactor provinces-tab.tsx (1.5 hours)
       = 4 hours

Day 3: Extend plan-mutations.ts (1 hour)
       Refactor create-plan-item-dialog.tsx (2 hours)
       Testing & verification (1 hour)
       = 4 hours

Day 4-5: Tier 4 Investigation
         Deep-dive code review of 10 components
         Create detailed analysis & recommendations
```

**Week 2 Output:** Tier 2 Complete + Tier 4 Analysis
**Lines Removed:** ~150 additional lines
**Total Lines Removed:** ~350 lines

---

### Week 3: High Complexity Refactoring (5 days)

```
Day 1-2: Refactor use-workflow-mutations.ts
         - Convert to proper useMutation hooks
         - Test all workflow operations
         = 2 days

Day 3-4: Create multi-step-form-mutations.ts
         - Handle 3-step risk form orchestration
         - Implement state coordination
         = 2 days

Day 5: User management consolidation
       Tier 4 component refactoring starts
       = 1 day
```

**Week 3 Output:** Tier 3 Complete
**Lines Removed:** ~300+ additional lines
**Total Lines Removed:** ~650+ lines

---

### Week 4: Final Consolidation & Testing (5 days)

```
Day 1-3: Refactor Tier 4 components (pending analysis results)
Day 4: Comprehensive testing & integration verification
Day 5: Documentation & knowledge transfer
```

---

## Priority Matrix

### High Priority (Start Immediately)
- ✅ **use-risk-configuration-mutations.ts** - 5 quick wins
- ⚠️ **use-workflow-mutations.ts** - Critical infrastructure hook
- ⚠️ **create-plan-item-dialog.tsx** - Core audit functionality

### Medium Priority (Week 2)
- 🟡 **use-budget-mutations.ts** - Important audit feature
- 🟡 **use-configuration-mutations.ts** - System configuration
- 🟡 **use-risk-mutations.ts** - Risk management

### Lower Priority (Week 3+)
- 📋 **Multi-step forms** - Complex but isolated
- 📋 **Tier 4 components** - Pending analysis

---

## Success Criteria

✅ **Quantitative:**
- [ ] 525+ lines of code removed
- [ ] 20+ components refactored
- [ ] 15+ new reusable hooks created
- [ ] 100% test pass rate maintained
- [ ] Zero breaking changes in production

✅ **Qualitative:**
- [ ] All hooks have JSDoc with usage examples
- [ ] Error handling standardized across all mutations
- [ ] Loading states managed consistently
- [ ] Query invalidation centralized
- [ ] Team understands new patterns

---

## Risk Mitigation

### Risk 1: Breaking Changes in Refactored Components
**Mitigation:**
- Thorough testing after each refactor
- Keep old code until new tested
- Version control for easy rollback

### Risk 2: Multi-step Form Complexity
**Mitigation:**
- Design custom hook carefully
- Test each step independently
- Create comprehensive test suite

### Risk 3: Workflow Hook Complexity
**Mitigation:**
- Start with small subset of operations
- Expand incrementally
- Create spike for architecture decision

---

## Maintenance & Long-term

### After Refactoring Completion

**Documentation:**
- [ ] Create mutation hooks best practices guide
- [ ] Document each hook with usage examples
- [ ] Create troubleshooting guide

**Testing:**
- [ ] Add unit tests for all new hooks
- [ ] Add integration tests for refactored components
- [ ] Set up snapshot tests for consistency

**Monitoring:**
- [ ] Track mutation success/failure rates
- [ ] Monitor component render performance
- [ ] Gather team feedback on patterns

**Future Improvements:**
- Consider mutation composition library
- Standardize on form state management library
- Create component template for CRUD operations

---

## Resources & Team Allocation

### Required Skills
- React + TypeScript
- TanStack Query / React Query
- Understanding of HTTP and API concepts
- Testing best practices

### Estimated Team Capacity
- **Full-time Developer:** 2-3 weeks
- **Part-time (50%):** 4-6 weeks
- **Part-time (25%):** 8-12 weeks

### Review & QA
- Code review required for each tier
- QA testing after each component refactor
- Security review (especially for API calls)

---

## Conclusion

This roadmap provides a clear, actionable path to reduce technical debt by 500+ lines of code while improving consistency and maintainability across the application.

**Next Steps:**
1. Review and approve this roadmap
2. Assign developer(s) to take on Tier 1
3. Begin with risk-configuration-mutations.ts
4. Execute in phases with code reviews

**Expected Outcome:**
- Cleaner, more maintainable codebase
- Faster feature development
- Fewer bugs in mutation handling
- Better developer experience

**Timeline:** 3-4 weeks with full-time developer, or 6-8 weeks with part-time allocation
