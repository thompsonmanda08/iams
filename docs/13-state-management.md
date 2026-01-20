# 13 - State Management

## Overview

INFRATEL IAMS uses a hybrid state management approach:
- **TanStack React Query** - Server state
- **Zustand** - Client-side UI state
- **React Context** - Theme and preferences

## TanStack React Query

### Setup

**File:** `app/providers.tsx`

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false
    }
  }
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Query Hook Pattern

```typescript
// hooks/use-report-queries.ts
import { useQuery } from "@tanstack/react-query";
import { getReport } from "@/app/_actions/reports-actions";

export const REPORT_QUERY_KEYS = {
  REPORTS: ["reports"],
  REPORT: ["report"]
};

export function useReport(reportId: string) {
  return useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORT, reportId],
    queryFn: () => getReport(reportId),
    enabled: !!reportId,
    staleTime: 60000
  });
}

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORTS, filters],
    queryFn: () => getReports(filters),
    staleTime: 60000
  });
}
```

### Mutation Hook Pattern

```typescript
// hooks/use-report-queries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateReport } from "@/app/_actions/reports-actions";

export function useUpdateReport() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: updateReport,
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, variables.reportId] });

      const previousReport = queryClient.getQueryData([REPORT_QUERY_KEYS.REPORT, variables.reportId]);

      queryClient.setQueryData(
        [REPORT_QUERY_KEYS.REPORT, variables.reportId],
        variables.newData
      );

      return { previousReport };
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, variables.reportId] });

      // Refresh server components
      router.refresh();

      toast.success("Report updated!");
    },
    onError: (_error, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousReport) {
        queryClient.setQueryData(
          [REPORT_QUERY_KEYS.REPORT, _variables.reportId],
          context.previousReport
        );
      }

      toast.error("Failed to update report");
    }
  });
}
```

### Usage in Components

```typescript
"use client";

import { useReport, useUpdateReport } from "@/hooks/use-report-queries";

export function ReportEditor({ reportId }) {
  const { data: report, isLoading } = useReport(reportId);
  const updateMutation = useUpdateReport();

  const handleSave = () => {
    updateMutation.mutate({
      reportId,
      newData: updatedReport
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* Editor UI */}
      <Button
        onClick={handleSave}
        disabled={updateMutation.isLoading}
        isLoading={updateMutation.isLoading}
      >
        Save
      </Button>
    </div>
  );
}
```

## Zustand

### Store Pattern

**File:** `store/report-store.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReportStore {
  selectedSections: string[];
  exportFormat: "pdf" | "docx";
  previewMode: boolean;

  // Actions
  toggleSection: (sectionId: string) => void;
  setExportFormat: (format: "pdf" | "docx") => void;
  togglePreview: () => void;
  reset: () => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set) => ({
      selectedSections: [],
      exportFormat: "pdf",
      previewMode: false,

      toggleSection: (sectionId) =>
        set((state) => ({
          selectedSections: state.selectedSections.includes(sectionId)
            ? state.selectedSections.filter((id) => id !== sectionId)
            : [...state.selectedSections, sectionId]
        })),

      setExportFormat: (format) => set({ exportFormat: format }),

      togglePreview: () => set((state) => ({ previewMode: !state.previewMode })),

      reset: () =>
        set({
          selectedSections: [],
          exportFormat: "pdf",
          previewMode: false
        })
    }),
    {
      name: "report-store"
    }
  )
);
```

### Screen Lock Store

**File:** `store/screen-lock-store.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ScreenLockStore {
  isLocked: boolean;
  lockTimeout: number; // minutes

  lockScreen: () => void;
  unlockScreen: () => void;
  setLockTimeout: (minutes: number) => void;
}

export const useScreenLockStore = create<ScreenLockStore>()(
  persist(
    (set) => ({
      isLocked: false,
      lockTimeout: 15,

      lockScreen: () => set({ isLocked: true }),
      unlockScreen: () => set({ isLocked: false }),
      setLockTimeout: (minutes) => set({ lockTimeout: minutes })
    }),
    {
      name: "screen-lock-store"
    }
  )
);
```

### Usage

```typescript
"use client";

import { useReportStore } from "@/store/report-store";

export function ReportSidebar() {
  const { selectedSections, toggleSection } = useReportStore();

  return (
    <div>
      {sections.map((section) => (
        <Checkbox
          key={section.id}
          checked={selectedSections.includes(section.id)}
          onCheckedChange={() => toggleSection(section.id)}
        >
          {section.title}
        </Checkbox>
      ))}
    </div>
  );
}
```

## Cache Invalidation Patterns

### Full Invalidation

```typescript
// Invalidate all reports queries
queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });

// Invalidate specific report
queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });

// Invalidate all queries
queryClient.invalidateQueries();
```

### Selective Invalidation

```typescript
// Only invalidate exact match
queryClient.invalidateQueries({
  queryKey: [REPORT_QUERY_KEYS.REPORT, reportId],
  exact: true
});

// Invalidate with predicate
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === REPORT_QUERY_KEYS.REPORTS &&
    query.queryKey[1]?.status === "DRAFT"
});
```

### Refetch vs Invalidate

```typescript
// Invalidate (refetch on next use)
queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });

// Refetch immediately
queryClient.refetchQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
```

## Optimistic Updates

```typescript
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReport,
    onMutate: async (reportId) => {
      await queryClient.cancelQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });

      const previousReports = queryClient.getQueryData([REPORT_QUERY_KEYS.REPORTS]);

      // Optimistically remove from list
      queryClient.setQueryData(
        [REPORT_QUERY_KEYS.REPORTS],
        (old: Report[]) => old.filter((r) => r.id !== reportId)
      );

      return { previousReports };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousReports) {
        queryClient.setQueryData([REPORT_QUERY_KEYS.REPORTS], context.previousReports);
      }
    },
    onSuccess: () => {
      toast.success("Report deleted!");
    }
  });
}
```

## React Context

**File:** `app/providers.tsx`

```typescript
"use client";

import { createContext, useContext, useState } from "react";

interface AppContext {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const AppContext = createContext<AppContext | undefined>(undefined);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
```

## Best Practices

1. **Use React Query for server data** - Don't duplicate in Zustand
2. **Use Zustand for UI state** - Modals, filters, selections
3. **Invalidate comprehensively** - All related queries after mutations
4. **Enable optimistic updates** - For better UX
5. **Set appropriate staleTime** - Balance freshness vs performance
6. **Use query keys consistently** - Define constants
7. **Persist selectively** - Only UI state, not server data

## Next Steps

Continue to → [14-deployment.md](14-deployment.md)
