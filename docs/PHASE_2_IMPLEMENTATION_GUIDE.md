# Phase 2 Implementation Guide - Detailed Roadmap

**Date**: 2025-12-18
**Phase**: 2 (Component Integration)
**Duration**: 2-3 weeks
**Status**: Ready to Execute

---

## 🎯 Phase 2 Objective

**Create 5 additional mutation hooks and integrate them into 12+ high-priority components to eliminate another 510+ lines of duplicate code.**

---

## 📋 Week 1: Hook Creation

### Task 1: Create `use-action-mutations.ts`

**Location**: `hooks/use-action-mutations.ts`

**Purpose**: Standardize action-related mutations (create, update, assign)

**File Size**: ~200 lines

**Mutations to Include**:

```typescript
// Actions related to risk actions/findings
export function useCreateActionMutation(options?: {...})
export function useUpdateActionMutation(options?: {...})
export function useAssignActionMutation(options?: {...})
```

**Components That Will Benefit**:
1. `app/dashboard/(modules)/risks/_components/action-findings-dialog.tsx` - 70 lines
2. `app/dashboard/(modules)/risks/_components/action-assessment-form.tsx` - 40 lines
3. Related action components - 40+ lines

**Total Lines Saved**: 150+ lines

**Implementation Steps**:
1. [ ] Copy structure from `use-config-mutations.ts`
2. [ ] Import action functions from `@/app/_actions/risk-module-actions`
3. [ ] Create 3 mutations with consistent error handling
4. [ ] Add JSDoc comments with usage examples
5. [ ] Compile and verify TypeScript

**Checklist**:
- [ ] File created at correct location
- [ ] All imports resolve
- [ ] All mutations follow standard pattern
- [ ] TypeScript compilation succeeds
- [ ] Ready for component integration

---

### Task 2: Create `use-risk-response-mutations.ts`

**Location**: `hooks/use-risk-response-mutations.ts`

**Purpose**: Handle risk response CRUD operations

**File Size**: ~150 lines

**Mutations to Include**:

```typescript
export function useCreateRiskResponseMutation(options?: {...})
export function useUpdateRiskResponseMutation(options?: {...})
export function useDeleteRiskResponseMutation(options?: {...})
```

**Components That Will Benefit**:
1. `app/dashboard/system-configs/_components/create-risk-response-dialog.tsx` - 24 lines
2. `app/dashboard/system-configs/_components/edit-risk-response-dialog.tsx` - 24 lines
3. Risk response config component - 32 lines

**Total Lines Saved**: 80+ lines

**Implementation Steps**:
1. [ ] Copy from `use-risk-category-mutations.ts` (similar pattern)
2. [ ] Replace function names with risk response equivalents
3. [ ] Update query keys to `["riskResponses"]`
4. [ ] Add usage examples
5. [ ] Verify TypeScript compilation

**Checklist**:
- [ ] File created
- [ ] Imports verified
- [ ] Query keys updated
- [ ] Compilation successful

---

### Task 3: Create `use-file-upload-mutations.ts`

**Location**: `hooks/use-file-upload-mutations.ts`

**Purpose**: Handle file uploads with validation

**File Size**: ~200 lines

**Mutations to Include**:

```typescript
export function useFileUploadMutation(options?: {...})
export function useFileUploadWithValidationMutation(options?: {
  validationRules?: {...}
  maxSize?: number
})
```

**Components That Will Benefit**:
1. `app/dashboard/(modules)/risks/_components/action-findings-dialog.tsx` - 40 lines
2. `app/dashboard/(workflows)/actions/audit/_components/submit-evidence-dialog.tsx` - 80 lines
3. Other file upload components - 40+ lines

**Total Lines Saved**: 120+ lines

**Implementation Steps**:
1. [ ] Create basic `useFileUploadMutation()`
2. [ ] Add validation wrapper `useFileUploadWithValidationMutation()`
3. [ ] Handle file validation errors
4. [ ] Progress tracking (optional)
5. [ ] Document max file size handling

**Checklist**:
- [ ] File created
- [ ] Both mutations included
- [ ] Validation examples provided
- [ ] TypeScript successful

---

## 📋 Week 2: Component Integration - Dialogs

### Priority 1: Simple Dialog Components (4 files)

**These have identical try-catch patterns and will save the most code.**

#### 1. **create-risk-matrix-dialog.tsx**
**Path**: `app/dashboard/system-configs/_components/create-risk-matrix-dialog.tsx`

**Current State**:
- Lines 39-63: Manual try-catch-finally
- `useState(isLoading)`
- Direct toast calls

**Refactoring**:
```typescript
// BEFORE: 24 lines
// AFTER: 6 lines
const { mutate: createMatrix, isPending } = useCreateRiskMatrixMutation({
  onSuccess: () => setOpen(false)
});

const handleSubmit = () => {
  createMatrix(formData);
};
```

**Estimated Lines Saved**: 18 lines

**Checklist**:
- [ ] Read current implementation
- [ ] Update imports
- [ ] Replace mutation logic
- [ ] Remove useState(isLoading)
- [ ] Test functionality
- [ ] TypeScript compilation

#### 2. **edit-risk-matrix-dialog.tsx**
**Path**: `app/dashboard/system-configs/_components/edit-risk-matrix-dialog.tsx`

**Similar to create-risk-matrix-dialog**
- Estimated Lines Saved: 18 lines

#### 3. **create-risk-response-dialog.tsx**
**Path**: `app/dashboard/system-configs/_components/create-risk-response-dialog.tsx`

- Estimated Lines Saved: 18 lines

#### 4. **control-effectiveness-dialog.tsx**
**Path**: `app/dashboard/system-configs/_components/control-effectiveness-dialog.tsx`

- Estimated Lines Saved: 21 lines

**Total for Priority 1**: 75+ lines saved

---

### Priority 2: Complex Form Components (2 files)

#### 5. **action-assessment-form.tsx**
**Path**: `app/dashboard/(modules)/risks/_components/action-assessment-form.tsx`

**Current State**:
- Lines 41-80: Manual try-catch with validation
- Single handler with complex logic

**Refactoring**:
```typescript
const { mutate: assessAction, isPending } = useActionAssessmentMutation({
  onSuccess: () => {
    setFormData(INIT_DATA);
  }
});

const handleSubmit = () => {
  assessAction(formData);
};
```

**Estimated Lines Saved**: 32 lines

#### 6. **budget-form.tsx**
**Path**: `app/dashboard/(modules)/audit/budgets/_components/budget-form.tsx`

**Status**: Hook already exists (`use-budget-mutations.ts`)

**Refactoring**:
- Remove `useState(isCreating)`
- Replace `createBudgetHandler()` with mutation call
- Replace `createBudgetLineHandler()` with mutation call

**Estimated Lines Saved**: 70+ lines

**Total for Priority 2**: 100+ lines saved

---

## 📋 Week 3: Component Integration - Advanced

### Priority 3: Complex Multi-Operation Components (4 files)

#### 7. **audit-closure-review.tsx**
**Path**: `app/dashboard/(modules)/audit/plans/_components/audit-closure-review.tsx`

**Current State**:
- 3 separate loading states
- Multiple async operations
- 100+ lines of try-catch

**Refactoring**:
- Create `use-audit-closure-mutations.ts`
- Replace loadClosureData() with query hook
- Replace handleRequestClosure() with mutation

**Estimated Lines Saved**: 60 lines

#### 8. **new-incident.tsx**
**Path**: `app/dashboard/(modules)/risks/incidents/_components/new-incident.tsx`

**Current State**:
- 4 separate loading states
- 4 async data fetch operations
- Multiple try-catch blocks

**Refactoring**:
- Replace with query hooks for data fetching
- Use existing mutation hooks for submissions
- Eliminate manual try-catch

**Estimated Lines Saved**: 80 lines

#### 9. **submit-evidence-dialog.tsx**
**Path**: `app/dashboard/(workflows)/actions/audit/_components/submit-evidence-dialog.tsx`

**Current State**:
- File upload handling (complex)
- Manual error state management
- 80+ lines of logic

**Refactoring**:
- Use `useFileUploadWithValidationMutation()`
- Remove manual error state
- Simplify validation logic

**Estimated Lines Saved**: 50 lines

#### 10. **task-reassign-dialog.tsx**
**Path**: `app/dashboard/(workflows)/approvals/_components/task-reassign-dialog.tsx`

**Current State**:
- Manual try-catch for loading users
- Manual try-catch for reassigning

**Refactoring**:
- Create `useTaskReassignMutation()`
- Use query hook for users

**Estimated Lines Saved**: 30 lines

**Total for Priority 3**: 220+ lines saved

---

## 📋 Remaining Components

### Priority 4: Config Components (5+ files)
- risk-categories-config.tsx (Hook exists: ready for integration)
- business-process-list.tsx (Hook exists: ready for integration)
- risk-response-config.tsx (Needs hook creation)
- kri-config.tsx (Needs hook creation)
- audit-plans-table.tsx (Complex, multiple actions)

**Estimated Lines Saved**: 200+ lines

---

## 🔄 Implementation Workflow Per Component

### Standard Refactoring Steps

1. **Read & Analyze** (5 min)
   - [ ] Read current file
   - [ ] Identify try-catch blocks
   - [ ] Note all useState loading states
   - [ ] Document current flow

2. **Update Imports** (5 min)
   - [ ] Remove action imports
   - [ ] Add mutation hook import
   - [ ] Keep other imports

3. **Replace State Management** (10 min)
   - [ ] Replace `useState(isLoading/isSubmitting)` with mutation
   - [ ] Remove loading state declarations

4. **Replace Handlers** (15 min)
   - [ ] Remove try-catch-finally blocks
   - [ ] Replace with mutation call
   - [ ] Move cleanup to `onSuccess` callback

5. **Remove Toast Calls** (5 min)
   - [ ] Remove manual toast notifications
   - [ ] Mutations handle this automatically

6. **Test & Verify** (10 min)
   - [ ] TypeScript compilation
   - [ ] Component functionality
   - [ ] Error handling works
   - [ ] Loading states display

**Total Time Per Component**: 50 minutes (average)

---

## 📊 Completion Checklist

### Week 1: Hook Creation
- [ ] use-action-mutations.ts created
- [ ] use-risk-response-mutations.ts created
- [ ] use-file-upload-mutations.ts created
- [ ] All 3 files compile successfully
- [ ] All imports resolve

### Week 2: Dialog Refactoring
- [ ] create-risk-matrix-dialog.tsx refactored
- [ ] edit-risk-matrix-dialog.tsx refactored
- [ ] create-risk-response-dialog.tsx refactored
- [ ] control-effectiveness-dialog.tsx refactored
- [ ] action-assessment-form.tsx refactored
- [ ] budget-form.tsx refactored
- [ ] All 6 components compile
- [ ] All functionality verified

### Week 3: Advanced Refactoring
- [ ] audit-closure-review.tsx refactored
- [ ] new-incident.tsx refactored
- [ ] submit-evidence-dialog.tsx refactored
- [ ] task-reassign-dialog.tsx refactored
- [ ] All 4 components compile
- [ ] All functionality verified

### Post-Refactoring
- [ ] Comprehensive testing
- [ ] Error handling validation
- [ ] Loading states verification
- [ ] Query invalidation testing
- [ ] Router navigation testing

---

## 🎯 Success Criteria

### Code Quality
- [x] Consistent mutation pattern
- [ ] 80%+ of identified components refactored
- [ ] Zero try-catch blocks remaining
- [ ] All loading states use `isPending`
- [ ] Type safety maintained

### Testing
- [ ] TypeScript: 0 errors
- [ ] Functionality: All features work
- [ ] Error Handling: All errors display
- [ ] Loading: All loaders show/hide properly
- [ ] Navigation: All routing works

### Metrics
- [ ] 1,300+ lines of code removed
- [ ] 68% average reduction per component
- [ ] 40+ files improved
- [ ] 100% error consistency
- [ ] 0 breaking changes

---

## 🚨 Risk Mitigation

### Testing Strategy
1. **Unit Level**: Each mutation hook tested
2. **Component Level**: Each refactored component tested
3. **Integration Level**: Full feature flow tested
4. **Regression**: Existing features still work

### Rollback Plan
- Each refactoring is atomic
- Can revert individual component easily
- No shared state modifications
- Full backward compatibility

### Quality Checks
- TypeScript compilation must pass
- All tests must pass
- No console errors
- No functionality lost

---

## 📈 Progress Tracking

### Daily Standup Questions
- [ ] How many components refactored today?
- [ ] How many lines of code saved?
- [ ] Any blockers encountered?
- [ ] TypeScript compilation status?

### Weekly Metrics
- Components refactored: ___/12
- Lines saved: ___/1,300
- Hooks created: ___/5
- TypeScript errors: ___/0

---

## 🎓 Learning Resources

### Reference Files
- `hooks/use-config-mutations.ts` - Example of consolidated mutations
- `hooks/use-audit-mutations.ts` - Example of audit mutations
- `hooks/use-risk-acceptance-mutations.ts` - Example with query hook
- `app/dashboard/(modules)/risks/risk-acceptances/page.tsx` - Example refactored component

### Documentation
- `MUTATION_HOOKS_REFACTORING.md` - Complete guide
- `COMPREHENSIVE_REFACTORING_ROADMAP.md` - Implementation roadmap
- `REFACTORING_INITIATIVE_OVERVIEW.md` - Visual overview

---

## 🎯 End Goal

**After Phase 2 Completion**:
- ✅ 5 additional mutation hooks created
- ✅ 12+ components refactored
- ✅ 1,300+ lines of duplicate code removed
- ✅ 100% error handling consistency
- ✅ 40+ files improved
- ✅ 40% faster feature development

---

## 📞 Questions?

Refer to:
1. **MUTATION_HOOKS_REFACTORING.md** - How to create hooks
2. **COMPREHENSIVE_REFACTORING_ROADMAP.md** - Why refactor
3. **REFACTORING_INITIATIVE_OVERVIEW.md** - What's being done
4. **COMPLETE_REFACTORING_STATUS.md** - Current progress

---

**Status**: 📋 READY FOR EXECUTION
**Next Action**: Start with use-action-mutations.ts creation
**Estimated Completion**: 3 weeks
