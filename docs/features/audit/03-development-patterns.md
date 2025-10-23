# Development Patterns

This document outlines the key development patterns used in the Audit Management Module, based on the existing codebase conventions.

## Pattern Analysis from Existing Codebase

### 1. Server Actions Pattern

Based on existing files like `app/_actions/auth-actions.ts` and `app/_actions/permissions-actions.ts`:

```typescript
// Pattern observed in auth-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { APIResponse } from '@/types';

/**
 * Server action with comprehensive error handling
 */
export async function actionName(input: InputType): Promise<APIResponse> {
  const url = `/api/endpoint`;

  try {
    const response = await axios.post(url, input);

    // Revalidate relevant paths
    revalidatePath('/dashboard/relevant-path');

    return {
      success: true,
      message: 'Operation successful',
      data: response?.data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error: Error | any) {
    console.error({
      endpoint: `POST | ACTION NAME ~ ${url}`,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      headers: error?.response?.headers,
      config: error?.response?.config,
      data: error?.response?.data || error,
    });

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.message ||
        error?.message ||
        'Oops! Something went wrong. Please try again.',
      data: null,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
    };
  }
}
```

**Key Observations:**
- Use `'use server'` directive at top of file
- Import `APIResponse` from `@/types`
- Comprehensive error logging with detailed object
- Consistent error message fallback chain
- Return `APIResponse` type with success, message, data, status
- Use `revalidatePath` after mutations

### 2. API Client Pattern

Based on `lib/api/risks-api.ts`:

```typescript
// Pattern observed in risks-api.ts
import axios from 'axios';

// Define interfaces
export interface Entity {
  id: string;
  // properties...
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Mock delay for development
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Export API object with methods
export const entityApi = {
  // Get all with pagination
  async getAll(params: QueryParams = {}): Promise<{ data: Entity[]; meta: any }> {
    await delay(600); // Simulated delay

    let filtered = [...mockData];

    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(item =>
        // search logic
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  },

  // Get single item
  async getById(id: string): Promise<Entity> {
    await delay(400);
    const item = mockData.find(r => r.id === id);
    if (!item) throw new Error('Not found');
    return item;
  },

  // Create
  async create(data: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entity> {
    await delay(800);
    const newItem: Entity = {
      ...data,
      id: `${mockData.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockData.push(newItem);
    return newItem;
  },

  // Update
  async update(id: string, data: Partial<Entity>): Promise<Entity> {
    await delay(700);
    const index = mockData.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Not found');
    mockData[index] = { ...mockData[index], ...data, updatedAt: new Date() };
    return mockData[index];
  },

  // Delete
  async delete(id: string): Promise<void> {
    await delay(500);
    const index = mockData.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Not found');
    mockData.splice(index, 1);
  },
};
```

**Key Observations:**
- Export interfaces for types
- Use `const delay` for mock API simulation
- Return `{ data, meta }` for paginated results
- Include total, page, limit, totalPages in meta
- Comprehensive CRUD operations
- Use `Omit` for create operations (exclude id, timestamps)
- Throw errors for not found items

### 3. Component Pattern

Based on `app/dashboard/home/risks/actions/actions-table.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Props {
  data: DataType[];
}

export function ComponentName({ data }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState('10');

  // Filtering logic
  const filtered = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / Number.parseInt(entriesPerPage));
  const startIndex = (currentPage - 1) * Number.parseInt(entriesPerPage);
  const endIndex = startIndex + Number.parseInt(entriesPerPage);
  const paginated = filtered.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and filters */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          {/* Content */}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.property}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of{' '}
            {filtered.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Key Observations:**
- Mark with `'use client'` directive
- Use existing UI components from `@/components/ui/`
- Client-side filtering and pagination
- Empty state with centered message
- Pagination info showing "Showing X to Y of Z entries"
- Button navigation for pagination

### 4. Utilities Pattern

Based on `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility functions with clear purpose
export function generateAvatarFallback(string: string) {
  const names = string.split(' ').filter((name: string) => name);
  const mapped = names.map((name: string) => name.charAt(0).toUpperCase());
  return mapped.join('');
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

**Key Observations:**
- Export standalone utility functions
- Use descriptive function names
- Include `cn()` for className merging
- Keep functions pure and focused

### 5. Type Definitions Pattern

Based on `types/index.ts`:

```typescript
import { JWTPayload } from 'jose';

// Page props type
export type PageProps = {
  params?: Promise<{ [key: string]: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// API Response type
export type APIResponse = {
  success: boolean;
  message: string;
  data: any;
  status?: number;
  [x: string]: unknown;
};

// Domain types
export type Department = {
  id: string | undefined;
  name: string;
  code: string;
  description: string;
  [key: string]: any;
};

// Filter types
export type DateRangeFilter = {
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  [x: string]: any;
};

// Pagination type
export type Pagination = {
  page: number;
  limit: number;
  total?: number;
  total_pages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  [x: string]: any;
};
```

**Key Observations:**
- Use `type` keyword for simple types
- Use `interface` for object shapes
- Include `[x: string]: any` for flexibility
- Export all types
- Consistent naming conventions

## Audit Module Development Patterns

### Pattern 1: TanStack Query Integration

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as auditActions from '@/app/_actions/audit-actions';

/**
 * Hook for fetching audit plans with filters
 */
export const useAuditPlans = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: ['auditPlans', filters],
    queryFn: async () => {
      const result = await auditActions.getAuditPlans(filters);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating audit plans with cache invalidation
 */
export const useCreateAuditPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AuditPlanInput) => {
      const result = await auditActions.createAuditPlan(input);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['auditPlans'] });
      queryClient.invalidateQueries({ queryKey: ['auditMetrics'] });
      toast.success('Audit plan created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create audit plan');
    },
  });
};

/**
 * Hook for updating audit plans with optimistic updates
 */
export const useUpdateAuditPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AuditPlanInput> }) => {
      const result = await auditActions.updateAuditPlan(id, data);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auditPlan', id] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['auditPlan', id]);

      // Optimistically update
      queryClient.setQueryData(['auditPlan', id], (old: any) => ({
        ...old,
        ...data,
      }));

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['auditPlan', variables.id], context.previous);
      }
      toast.error('Failed to update audit plan');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditPlans'] });
      toast.success('Audit plan updated successfully');
    },
  });
};
```

### Pattern 2: Zustand Store with Persistence

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuditState {
  // UI State
  selectedAuditId: string | null;
  viewMode: 'list' | 'grid' | 'timeline';
  isCreateAuditModalOpen: boolean;

  // Filters
  auditFilters: AuditFilters;
  findingFilters: FindingFilters;

  // Drafts
  workpaperDrafts: Map<string, WorkpaperDraft>;

  // Actions
  setSelectedAudit: (id: string | null) => void;
  setViewMode: (mode: 'list' | 'grid' | 'timeline') => void;
  setCreateAuditModalOpen: (open: boolean) => void;
  updateAuditFilters: (filters: Partial<AuditFilters>) => void;
  resetAuditFilters: () => void;
  saveWorkpaperDraft: (id: string, data: WorkpaperDraft) => void;
  clearWorkpaperDraft: (id: string) => void;
}

const defaultAuditFilters: AuditFilters = {
  status: [],
  dateRange: null,
  teamLeader: undefined,
  search: '',
};

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      // Initial state
      selectedAuditId: null,
      viewMode: 'list',
      isCreateAuditModalOpen: false,
      auditFilters: defaultAuditFilters,
      findingFilters: {
        severity: [],
        status: [],
        clause: undefined,
        search: '',
      },
      workpaperDrafts: new Map(),

      // Actions
      setSelectedAudit: (id) => set({ selectedAuditId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setCreateAuditModalOpen: (open) => set({ isCreateAuditModalOpen: open }),

      updateAuditFilters: (filters) =>
        set((state) => ({
          auditFilters: { ...state.auditFilters, ...filters },
        })),

      resetAuditFilters: () => set({ auditFilters: defaultAuditFilters }),

      saveWorkpaperDraft: (id, data) =>
        set((state) => {
          const newDrafts = new Map(state.workpaperDrafts);
          newDrafts.set(id, { ...data, lastSaved: new Date() });
          return { workpaperDrafts: newDrafts };
        }),

      clearWorkpaperDraft: (id) =>
        set((state) => {
          const newDrafts = new Map(state.workpaperDrafts);
          newDrafts.delete(id);
          return { workpaperDrafts: newDrafts };
        }),
    }),
    {
      name: 'audit-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields
      partialize: (state) => ({
        viewMode: state.viewMode,
        workpaperDrafts: Array.from(state.workpaperDrafts.entries()),
      }),
      // Custom serialization for Map
      serialize: (state) => JSON.stringify({
        ...state,
        state: {
          ...state.state,
          workpaperDrafts: Array.from(state.state.workpaperDrafts),
        },
      }),
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            workpaperDrafts: new Map(parsed.state.workpaperDrafts || []),
          },
        };
      },
    }
  )
);
```

### Pattern 3: Consolidated Component File

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuditMetrics } from '@/lib/hooks/use-audit-query-data';
import { getAuditStatusColor, formatDate } from '@/lib/utils/audit-utils';

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface AuditMetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

export function AuditMetricCard({ title, value, change, icon: Icon, trend }: AuditMetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold">{value}</h3>
            {change !== undefined && (
              <p className={`mt-1 text-sm ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {change > 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// METRICS GRID COMPONENT
// ============================================================================

export function AuditMetrics() {
  const { data: metrics, isLoading } = useAuditMetrics();

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AuditMetricCard
        title="Total Audits"
        value={metrics?.totalAudits || 0}
        icon={AlertCircle}
      />
      <AuditMetricCard
        title="Conformity Rate"
        value={`${metrics?.conformityRate || 0}%`}
        change={5.2}
        trend="up"
        icon={CheckCircle2}
      />
      {/* More metric cards... */}
    </div>
  );
}

// ============================================================================
// ACTIVITY FEED COMPONENT
// ============================================================================

interface ActivityItemProps {
  activity: ActivityItem;
}

function ActivityItemComponent({ activity }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-1 rounded-full bg-blue-500/10 p-2">
        <AlertCircle className="h-4 w-4 text-blue-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-xs text-muted-foreground">{activity.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatDate(activity.date)}</p>
      </div>
    </div>
  );
}

export function RecentActivity() {
  // Component implementation
}

// ============================================================================
// ... MORE COMPONENTS
// ============================================================================
```

**Key Points:**
- Use section dividers with `=====` lines
- Group related components
- Export all components
- Clear component hierarchy
- Shared props interfaces at top of each section

### Pattern 4: Form Handling with React Hook Form

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateAuditPlan } from '@/lib/hooks/use-audit-query-data';

// Validation schema
const auditPlanSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  standard: z.string().default('ISO 27001:2022'),
  scope: z.array(z.string()).min(1, 'At least one scope item required'),
  objectives: z.string().min(10, 'Objectives must be at least 10 characters'),
  teamLeader: z.string().min(1, 'Team leader is required'),
  teamMembers: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['planned', 'in-progress', 'completed', 'cancelled']).default('planned'),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

type AuditPlanFormData = z.infer<typeof auditPlanSchema>;

interface AuditPlanFormProps {
  onSuccess?: () => void;
  initialData?: Partial<AuditPlanFormData>;
}

export function AuditPlanForm({ onSuccess, initialData }: AuditPlanFormProps) {
  const createMutation = useCreateAuditPlan();

  const form = useForm<AuditPlanFormData>({
    resolver: zodResolver(auditPlanSchema),
    defaultValues: {
      title: initialData?.title || '',
      standard: initialData?.standard || 'ISO 27001:2022',
      scope: initialData?.scope || [],
      objectives: initialData?.objectives || '',
      teamLeader: initialData?.teamLeader || '',
      teamMembers: initialData?.teamMembers || [],
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || new Date(),
      status: initialData?.status || 'planned',
    },
  });

  const onSubmit = async (data: AuditPlanFormData) => {
    try {
      await createMutation.mutateAsync(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter audit title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* More form fields... */}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Audit Plan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Pattern 5: Debounced Auto-Save

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useAuditStore } from '@/lib/stores/audit-store';
import { useDebounce } from '@/hooks/use-debounce';

interface WorkpaperFormProps {
  workpaperId: string;
}

export function WorkpaperForm({ workpaperId }: WorkpaperFormProps) {
  const { saveWorkpaperDraft } = useAuditStore();
  const [formData, setFormData] = useState<WorkpaperDraft>({
    auditId: '',
    clause: '',
    objectives: '',
    testProcedures: '',
    testResult: undefined,
  });

  // Debounce form data changes
  const debouncedFormData = useDebounce(formData, 2000); // 2 seconds

  // Auto-save effect
  useEffect(() => {
    if (debouncedFormData.objectives || debouncedFormData.testProcedures) {
      saveWorkpaperDraft(workpaperId, debouncedFormData);
      // Show save indicator
      console.log('Draft saved automatically');
    }
  }, [debouncedFormData, workpaperId, saveWorkpaperDraft]);

  const handleChange = (field: keyof WorkpaperDraft, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Form fields with onChange calling handleChange */}
      <div className="mt-2 text-xs text-muted-foreground">
        Last saved: {/* timestamp */}
      </div>
    </div>
  );
}
```

## Best Practices Summary

### 1. Naming Conventions
- Components: PascalCase (`AuditPlanCard`)
- Functions: camelCase (`getAuditPlans`)
- Constants: UPPER_SNAKE_CASE (`ISO_27001_CLAUSES`)
- Types/Interfaces: PascalCase (`AuditPlan`, `AuditFilters`)
- Files: kebab-case (`audit-plans.tsx`, `audit-utils.ts`)

### 2. File Organization
- One feature, one file for components
- Group related functionality
- Clear section dividers
- Export everything that might be reused

### 3. Error Handling
- Always use try-catch in server actions
- Return consistent `APIResponse` structure
- Log errors with detailed context
- Show user-friendly error messages
- Use toast notifications for feedback

### 4. Performance
- Debounce search inputs (300ms)
- Memoize expensive calculations
- Use React.memo for pure components
- Implement virtual scrolling for large lists
- Lazy load heavy components

### 5. Accessibility
- Use semantic HTML
- Include ARIA labels
- Support keyboard navigation
- Manage focus properly
- Ensure color contrast

### 6. TypeScript
- Strict mode enabled
- No `any` unless necessary
- Export all types
- Use generics appropriately
- Leverage type inference

### 7. Testing Approach
- Manual testing for UI
- Unit tests for utilities
- Integration tests for flows
- E2E tests for critical paths
