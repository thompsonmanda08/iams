# Implementation Guide

This comprehensive guide provides step-by-step instructions for implementing the Audit Management Module.

## Prerequisites

### 1. Verify Dependencies

Check that all required dependencies are installed:

```bash
# Core dependencies (already installed)
# @tanstack/react-query@5.90.5
# @tanstack/react-query-devtools@5.90.2
# zustand@5.0.5
# date-fns@4.1.0
# lucide-react@0.522.0
# recharts@2.15.4
# react-hook-form@7.58.1
# zod@3.25.67
# clsx@2.1.1
# tailwind-merge@3.3.1

# All dependencies are already installed in package.json
```

### 2. Verify Project Structure

```bash
# Check directory structure
ls -la app/
ls -la lib/
ls -la components/ui/
```

## Phase 1: Foundation Setup

### Step 1.1: Create Type Definitions

**File**: `lib/types/audit-types.ts`

```typescript
/**
 * Audit Management Module Type Definitions
 * Consolidated file for all audit-related TypeScript types
 */

// ============================================================================
// ENUMS AND LITERAL TYPES
// ============================================================================

export type AuditStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';
export type TestResult = 'conformity' | 'partial-conformity' | 'non-conformity';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';
export type FindingStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type ReportType = 'summary' | 'detailed' | 'non-conformity' | 'management-review' | 'compliance';
export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ViewMode = 'list' | 'grid' | 'timeline';

// ============================================================================
// AUDIT PLAN TYPES
// ============================================================================

export interface AuditPlan {
  id: string;
  title: string;
  standard: string;
  scope: string[];
  objectives: string;
  teamLeader: string;
  teamMembers: string[];
  startDate: Date;
  endDate: Date;
  status: AuditStatus;
  progress: number;
  conformityRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditPlanInput {
  title: string;
  standard?: string;
  scope: string[];
  objectives: string;
  teamLeader: string;
  teamMembers: string[];
  startDate: Date;
  endDate: Date;
  status?: AuditStatus;
}

export interface AuditFilters {
  status?: AuditStatus[];
  dateRange?: [Date, Date] | null;
  teamLeader?: string;
  search?: string;
}

// ============================================================================
// WORKPAPER TYPES
// ============================================================================

export interface Workpaper {
  id: string;
  auditId: string;
  auditTitle: string;
  clause: string;
  clauseTitle: string;
  objectives: string;
  testProcedures: string;
  testResults: string;
  testResult: TestResult;
  evidence: Evidence[];
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkpaperInput {
  auditId: string;
  clause: string;
  objectives: string;
  testProcedures: string;
  testResults: string;
  testResult: TestResult;
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
}

export interface WorkpaperDraft {
  auditId: string;
  clause: string;
  objectives: string;
  testProcedures: string;
  testResults?: string;
  testResult?: TestResult;
  lastSaved?: Date;
}

export interface WorkpaperTemplate {
  id: string;
  clause: string;
  clauseTitle: string;
  category: string;
  objectives: string[];
  testProcedures: string[];
}

export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

// ============================================================================
// FINDING TYPES
// ============================================================================

export interface Finding {
  id: string;
  referenceCode: string;
  auditId: string;
  auditTitle: string;
  clause: string;
  clauseTitle: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  recommendation: string;
  correctiveAction?: string;
  assignedTo?: string;
  dueDate?: Date;
  resolvedDate?: Date;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FindingInput {
  auditId: string;
  clause: string;
  description: string;
  severity: FindingSeverity;
  recommendation: string;
  correctiveAction?: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface FindingFilters {
  severity?: FindingSeverity[];
  status?: FindingStatus[];
  clause?: string;
  assignedTo?: string;
  search?: string;
}

export interface FindingTimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'status_change' | 'comment' | 'resolved';
  description: string;
  user: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  parameters: string[];
}

export interface ReportParams {
  templateId: string;
  format: ReportFormat;
  auditId?: string;
  dateRange?: [Date, Date];
  includeFindings?: boolean;
  includeWorkpapers?: boolean;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: ReportFormat;
  recipients: string[];
  lastGenerated?: Date;
  nextScheduled: Date;
  isActive: boolean;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AuditMetrics {
  totalAudits: number;
  activeAudits: number;
  completedAudits: number;
  conformityRate: number;
  openFindings: number;
  criticalFindings: number;
  overdueFindings: number;
  upcomingAudits: number;
}

export interface AnalyticsParams {
  dateRange?: [Date, Date];
  auditId?: string;
}

export interface ConformityTrend {
  date: Date;
  conformityRate: number;
  partialConformityRate: number;
  nonConformityRate: number;
}

export interface FindingsByClause {
  clause: string;
  clauseTitle: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface AuditAnalytics {
  conformityTrends: ConformityTrend[];
  findingsByClause: FindingsByClause[];
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  statusDistribution: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
}

export interface TeamMemberInput {
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface AuditSettings {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  dueDateReminderDays: number;
  autoSaveInterval: number;
  defaultStandard: string;
  requireApproval: boolean;
  allowDraftWorkpapers: boolean;
}

export interface SettingsInput extends Partial<AuditSettings> {}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ActivityItem {
  id: string;
  type: 'audit_created' | 'audit_updated' | 'finding_created' | 'workpaper_submitted';
  title: string;
  description: string;
  user: string;
  date: Date;
  metadata?: Record<string, any>;
}
```

**Implementation Steps:**
1. Create the file: `lib/types/audit-types.ts`
2. Copy the complete type definitions
3. Verify no TypeScript errors: `npm run build`

### Step 1.2: Create Utility Functions

**File**: `lib/utils/audit-utils.ts`

Create a comprehensive utility file with all helper functions. Due to length, see the full implementation in the codebase examples.

**Key sections to implement:**
1. General utilities (`cn`)
2. Date utilities (format, range, overdue checks)
3. Status utilities (colors, labels for all status types)
4. Calculation utilities (conformity rate, progress)
5. Reference code generation
6. Filtering utilities
7. Sorting utilities
8. Validation utilities
9. Export utilities
10. Search utilities
11. Chart data preparation
12. ISO 27001 clause utilities
13. Notification utilities

**Implementation Steps:**
1. Create file: `lib/utils/audit-utils.ts`
2. Implement each utility section
3. Test each function with sample data
4. Export all functions

### Step 1.3: Create Zustand Store

**File**: `lib/stores/audit-store.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AuditFilters,
  FindingFilters,
  WorkpaperDraft,
  ViewMode,
  AuditStatus,
  FindingSeverity,
  FindingStatus,
} from '@/lib/types/audit-types';

interface AuditState {
  // UI State
  selectedAuditId: string | null;
  viewMode: ViewMode;
  isCreateAuditModalOpen: boolean;
  isCreateFindingModalOpen: boolean;
  isCreateWorkpaperModalOpen: boolean;
  selectedFindingId: string | null;

  // Filters
  auditFilters: AuditFilters;
  findingFilters: FindingFilters;

  // Drafts (Map serialized as array for localStorage)
  workpaperDrafts: Map<string, WorkpaperDraft>;

  // UI Actions
  setSelectedAudit: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setCreateAuditModalOpen: (open: boolean) => void;
  setCreateFindingModalOpen: (open: boolean) => void;
  setCreateWorkpaperModalOpen: (open: boolean) => void;
  setSelectedFinding: (id: string | null) => void;

  // Filter Actions
  updateAuditFilters: (filters: Partial<AuditFilters>) => void;
  resetAuditFilters: () => void;
  updateFindingFilters: (filters: Partial<FindingFilters>) => void;
  resetFindingFilters: () => void;

  // Draft Actions
  saveWorkpaperDraft: (id: string, data: WorkpaperDraft) => void;
  getWorkpaperDraft: (id: string) => WorkpaperDraft | undefined;
  clearWorkpaperDraft: (id: string) => void;
  clearAllDrafts: () => void;
}

const defaultAuditFilters: AuditFilters = {
  status: [],
  dateRange: null,
  teamLeader: undefined,
  search: '',
};

const defaultFindingFilters: FindingFilters = {
  severity: [],
  status: [],
  clause: undefined,
  assignedTo: undefined,
  search: '',
};

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      // Initial State
      selectedAuditId: null,
      viewMode: 'list',
      isCreateAuditModalOpen: false,
      isCreateFindingModalOpen: false,
      isCreateWorkpaperModalOpen: false,
      selectedFindingId: null,
      auditFilters: defaultAuditFilters,
      findingFilters: defaultFindingFilters,
      workpaperDrafts: new Map(),

      // UI Actions
      setSelectedAudit: (id) => set({ selectedAuditId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setCreateAuditModalOpen: (open) => set({ isCreateAuditModalOpen: open }),
      setCreateFindingModalOpen: (open) => set({ isCreateFindingModalOpen: open }),
      setCreateWorkpaperModalOpen: (open) => set({ isCreateWorkpaperModalOpen: open }),
      setSelectedFinding: (id) => set({ selectedFindingId: id }),

      // Filter Actions
      updateAuditFilters: (filters) =>
        set((state) => ({
          auditFilters: { ...state.auditFilters, ...filters },
        })),

      resetAuditFilters: () => set({ auditFilters: defaultAuditFilters }),

      updateFindingFilters: (filters) =>
        set((state) => ({
          findingFilters: { ...state.findingFilters, ...filters },
        })),

      resetFindingFilters: () => set({ findingFilters: defaultFindingFilters }),

      // Draft Actions
      saveWorkpaperDraft: (id, data) =>
        set((state) => {
          const newDrafts = new Map(state.workpaperDrafts);
          newDrafts.set(id, { ...data, lastSaved: new Date() });
          return { workpaperDrafts: newDrafts };
        }),

      getWorkpaperDraft: (id) => {
        return get().workpaperDrafts.get(id);
      },

      clearWorkpaperDraft: (id) =>
        set((state) => {
          const newDrafts = new Map(state.workpaperDrafts);
          newDrafts.delete(id);
          return { workpaperDrafts: newDrafts };
        }),

      clearAllDrafts: () => set({ workpaperDrafts: new Map() }),
    }),
    {
      name: 'audit-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist viewMode and drafts
      partialize: (state) => ({
        viewMode: state.viewMode,
        workpaperDrafts: Array.from(state.workpaperDrafts.entries()),
      }),
      // Custom serialization for Map
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        workpaperDrafts: new Map(persistedState.workpaperDrafts || []),
      }),
    }
  )
);
```

**Implementation Steps:**
1. Create file: `lib/stores/audit-store.ts`
2. Implement complete store with persistence
3. Test state updates in browser DevTools
4. Verify localStorage persistence

### Step 1.4: Create Server Actions

**File**: `app/_actions/audit-actions.ts`

See the full implementation following the pattern from `auth-actions.ts`. Key sections:

1. Audit Plans (5 functions)
2. Workpapers (5 functions)
3. Findings (5 functions)
4. Evidence (2 functions)
5. Reports (3 functions)
6. Analytics (2 functions)
7. Settings (5 functions)

**Implementation Steps:**
1. Create file with `'use server'` directive
2. Implement mock data (50-100 realistic records)
3. Implement all CRUD operations
4. Add comprehensive error handling
5. Add JSDoc comments
6. Test each function

### Step 1.5: Create TanStack Query Hooks

**File**: `lib/hooks/use-audit-query-data.ts`

Create custom hooks for all server actions:

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as auditActions from '@/app/_actions/audit-actions';
import type {
  AuditFilters,
  AuditPlanInput,
  // ... other types
} from '@/lib/types/audit-types';

// ============================================================================
// AUDIT PLANS HOOKS
// ============================================================================

export const useAuditPlans = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: ['auditPlans', filters],
    queryFn: async () => {
      const result = await auditActions.getAuditPlans(filters);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ... more hooks
```

**Implementation Steps:**
1. Create file with `'use client'` directive
2. Implement all query hooks (useAuditPlans, useWorkpapers, etc.)
3. Implement all mutation hooks (useCreateAuditPlan, etc.)
4. Add proper cache invalidation
5. Test each hook in components

## Phase 2: Dashboard Implementation

### Step 2.1: Create Redirect Page

**File**: `app/dashboard/audit/page.tsx`

```typescript
import { redirect } from 'next/navigation';

export default function AuditPage() {
  redirect('/dashboard/home/audit');
}
```

### Step 2.2-2.6: Component Implementation

Follow the detailed component specifications in the main prompt for:
- Shared components
- Dashboard components
- Main dashboard page
- Plans components
- Plans listing page

## Testing Each Phase

### Phase 1 Testing
```bash
# Type check
npm run build

# Check for errors
# No TypeScript errors should appear
```

### Phase 2 Testing
1. Start dev server: `npm run dev`
2. Navigate to `/dashboard/audit`
3. Should redirect to `/dashboard/home/audit`
4. Dashboard should render with mock data
5. All metrics should display
6. Charts should render

## Troubleshooting

### Common Issues

**Issue**: TypeScript errors in types file
- **Solution**: Ensure all imports are correct
- Check for circular dependencies

**Issue**: Zustand store not persisting
- **Solution**: Check localStorage in DevTools
- Verify `persist` middleware configuration

**Issue**: TanStack Query not caching
- **Solution**: Check query keys are unique
- Verify staleTime is set

**Issue**: Server actions returning errors
- **Solution**: Check mock data structure
- Verify return type matches `APIResponse`

## Next Steps

After completing Phase 1 and 2:
1. Move to Phase 3 (Workpapers)
2. Implement remaining phases
3. Replace mock data with real API calls
4. Add comprehensive testing
5. Optimize performance
6. Deploy to production

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
