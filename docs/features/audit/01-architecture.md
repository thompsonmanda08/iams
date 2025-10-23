# Architecture Overview

## System Architecture

The Audit Management Module follows a modern, scalable architecture pattern that integrates seamlessly with the existing INFRATEL IAMS application.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React Components                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │  Dashboard │  │   Plans    │  │  Findings  │  ...   │  │
│  │  └────────────┘  └────────────┘  └────────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │                    │                    │             │
│         ├────────────────────┴────────────────────┘             │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          TanStack Query (Server State Cache)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Zustand Store (Client State)                   │  │
│  │  • UI State  • Filters  • Drafts  • Modal States        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Server Actions
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Next.js Server                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Server Actions Layer                         │  │
│  │    (app/_actions/audit-actions.ts)                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │  Audits  │  │Workpapers│  │ Findings │  ...         │  │
│  │  └──────────┘  └──────────┘  └──────────┘              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  API Client Layer                         │  │
│  │              (lib/api/audits-api.ts)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Server                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 REST API Endpoints                        │  │
│  │  /api/audits  /api/workpapers  /api/findings  ...       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                Business Logic Layer                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Database (PostgreSQL)                        │  │
│  │  • audits  • workpapers  • findings  • evidence  ...    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Breakdown

### 1. Presentation Layer (Client)

#### Components
- **Location**: `app/dashboard/audit/_components/`
- **Purpose**: UI rendering and user interaction
- **Pattern**: Consolidated component files by feature
- **Technology**: React 19, Radix UI, Tailwind CSS

#### Component Organization
```typescript
// Each feature has ONE file containing all related components
audit-dashboard.tsx
  ├─ AuditMetricCard
  ├─ AuditMetrics
  ├─ ConformityChart
  ├─ RecentActivity
  ├─ UpcomingAudits
  ├─ DashboardFilters
  └─ QuickActions

audit-plans.tsx
  ├─ AuditPlansTable
  ├─ AuditPlanCard
  ├─ CreateAuditModal
  ├─ AuditPlanForm
  ├─ AuditStatusBadge
  ├─ AuditActionsDropdown
  └─ ...more
```

#### State Management
```typescript
// Client State (Zustand)
- UI state (modals, selected items, view modes)
- Filters (audit filters, finding filters)
- Drafts (workpaper drafts with auto-save)

// Server State (TanStack Query)
- API data caching
- Background refetching
- Optimistic updates
- Request deduplication

// Form State (React Hook Form)
- Form data
- Validation
- Error handling
```

### 2. Data Fetching Layer

#### TanStack Query Hooks
- **Location**: `lib/hooks/use-audit-query-data.ts`
- **Purpose**: Client-side data fetching and caching
- **Pattern**: Custom hooks wrapping server actions

```typescript
// Query Pattern (for reads)
export const useAuditPlans = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: ['auditPlans', filters],
    queryFn: () => getAuditPlans(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation Pattern (for writes)
export const useCreateAuditPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAuditPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditPlans'] });
      toast.success('Audit plan created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create audit plan');
    },
  });
};
```

#### Benefits
- Automatic caching and revalidation
- Loading and error states
- Request deduplication
- Background refetching
- Optimistic updates
- Pagination support

### 3. Server Actions Layer

#### Server Actions
- **Location**: `app/_actions/audit-actions.ts`
- **Purpose**: Server-side data operations
- **Pattern**: Consolidated file with all server actions
- **Security**: Runs on server, can't be reverse-engineered

```typescript
'use server';

import { revalidatePath } from 'next/cache';

/**
 * Get all audit plans with optional filters
 * @param filters - Optional filters for audit plans
 * @returns Array of audit plans
 */
export async function getAuditPlans(filters?: AuditFilters) {
  try {
    // Call API or database
    const response = await auditsApi.getAll(filters);

    return {
      success: true,
      data: response.data,
      meta: response.meta,
    };
  } catch (error) {
    console.error('Error fetching audit plans:', error);
    return {
      success: false,
      message: 'Failed to fetch audit plans',
      data: [],
    };
  }
}

/**
 * Create a new audit plan
 * @param input - Audit plan data
 * @returns Created audit plan
 */
export async function createAuditPlan(input: AuditPlanInput) {
  try {
    const response = await auditsApi.create(input);

    // Revalidate relevant paths
    revalidatePath('/dashboard/audit/plans');
    revalidatePath('/dashboard/home/audit');

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error creating audit plan:', error);
    return {
      success: false,
      message: 'Failed to create audit plan',
      data: null,
    };
  }
}
```

#### Features
- Type-safe server-side operations
- Automatic path revalidation
- Error handling
- Data validation
- Authentication checks (via middleware)

### 4. API Integration Layer

#### API Client
- **Location**: `lib/api/audits-api.ts`
- **Purpose**: HTTP communication with backend
- **Pattern**: Similar to existing `lib/api/risks-api.ts`

```typescript
export const auditsApi = {
  async getAll(params: AuditQueryParams) {
    const response = await axios.get('/api/audits', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await axios.get(`/api/audits/${id}`);
    return response.data;
  },

  async create(data: AuditPlanInput) {
    const response = await axios.post('/api/audits', data);
    return response.data;
  },

  async update(id: string, data: Partial<AuditPlanInput>) {
    const response = await axios.put(`/api/audits/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await axios.delete(`/api/audits/${id}`);
    return response.data;
  },
};
```

### 5. Type System

#### Type Definitions
- **Location**: `lib/types/audit-types.ts`
- **Purpose**: TypeScript interfaces and types
- **Pattern**: Single file for all audit types

```typescript
// Base Types
export type AuditStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';
export type FindingStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

// Domain Models
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
  createdAt: Date;
  updatedAt: Date;
}

// Input Types (for creation/updates)
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

// Filter Types
export interface AuditFilters {
  status?: AuditStatus[];
  dateRange?: [Date, Date] | null;
  teamLeader?: string;
  search?: string;
}
```

### 6. Utility Layer

#### Utility Functions
- **Location**: `lib/utils/audit-utils.ts`
- **Purpose**: Reusable business logic
- **Pattern**: Organized by category

```typescript
// Status utilities
export function getAuditStatusColor(status: AuditStatus): string {
  const colors = {
    planned: 'blue',
    'in-progress': 'amber',
    completed: 'emerald',
    cancelled: 'slate',
  };
  return colors[status];
}

// Date utilities
export function isDueSoon(date: Date, daysThreshold = 7): boolean {
  const diffDays = differenceInDays(date, new Date());
  return diffDays >= 0 && diffDays <= daysThreshold;
}

// Calculation utilities
export function calculateConformityRate(workpapers: Workpaper[]): number {
  const conforming = workpapers.filter(
    w => w.testResult === 'conformity'
  ).length;
  return (conforming / workpapers.length) * 100;
}

// ISO 27001 utilities
export const ISO_27001_CLAUSES = {
  '4': 'Context of the Organization',
  '5': 'Leadership',
  '6': 'Planning',
  // ...
};
```

## Data Flow Patterns

### Read Operation Flow

```
User Action (Click "View Audits")
  ↓
Component calls useAuditPlans() hook
  ↓
TanStack Query checks cache
  ├─ Cache Hit → Return cached data
  └─ Cache Miss ↓
    Server Action: getAuditPlans()
      ↓
    API Client: auditsApi.getAll()
      ↓
    Backend API: GET /api/audits
      ↓
    Database Query
      ↓
    Response flows back up
      ↓
    TanStack Query caches result
      ↓
    Component receives data
      ↓
    UI renders
```

### Write Operation Flow

```
User Action (Submit Form)
  ↓
Form validation (React Hook Form + Zod)
  ↓
Component calls useCreateAuditPlan() mutation
  ↓
Optimistic Update (optional)
  ├─ Update UI immediately
  └─ Rollback on error
    ↓
Server Action: createAuditPlan()
  ↓
Validation on server
  ↓
API Client: auditsApi.create()
  ↓
Backend API: POST /api/audits
  ↓
Database Insert
  ↓
revalidatePath() called
  ↓
TanStack Query invalidates cache
  ↓
Background refetch
  ↓
UI updates with fresh data
  ↓
Toast notification
```

### Auto-Save Draft Flow (Workpapers)

```
User types in workpaper form
  ↓
Debounced function (300ms)
  ↓
Zustand store: saveWorkpaperDraft()
  ↓
localStorage persistence
  ↓
Visual indicator updated

On Submit:
  ↓
Merge draft with form data
  ↓
Clear draft from store
  ↓
Create workpaper via mutation
```

## Security Architecture

### Authentication & Authorization

```typescript
// Middleware checks authentication
// app/middleware.ts already handles this

// Server actions can access session
export async function createAuditPlan(input: AuditPlanInput) {
  const session = await getSession();

  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  // Check permissions
  if (!hasPermission(session, 'audit:create')) {
    return { success: false, message: 'Forbidden' };
  }

  // Proceed with creation
}
```

### Data Validation

```typescript
// Client-side validation (React Hook Form + Zod)
const auditPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  scope: z.array(z.string()).min(1, 'At least one scope required'),
  startDate: z.date(),
  endDate: z.date(),
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date',
});

// Server-side validation (in server actions)
export async function createAuditPlan(input: AuditPlanInput) {
  const validation = auditPlanSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validation.error.errors,
    };
  }

  // Proceed with creation
}
```

## Performance Optimization

### 1. Code Splitting
```typescript
// Lazy load heavy components
const WorkpaperForm = lazy(() =>
  import('./audit-workpapers').then(m => ({ default: m.WorkpaperForm }))
);
```

### 2. Memoization
```typescript
// Expensive calculations
const conformityRate = useMemo(() =>
  calculateConformityRate(workpapers),
  [workpapers]
);

// Component memoization
export const AuditPlanCard = memo(({ audit }) => {
  // Component logic
});
```

### 3. Debouncing
```typescript
// Search input
const debouncedSearch = useDebouncedValue(searchQuery, 300);

useEffect(() => {
  updateAuditFilters({ search: debouncedSearch });
}, [debouncedSearch]);
```

### 4. Virtual Scrolling
```typescript
// For large lists (100+ items)
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: findings.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

## Scalability Considerations

### Horizontal Scaling
- Stateless server actions
- API client can be load balanced
- TanStack Query handles request deduplication

### Caching Strategy
- **TanStack Query Cache**: 5 minutes for most queries
- **LocalStorage**: Workpaper drafts only
- **Server-side**: Future Redis cache for API responses

### Database Optimization
- Indexed columns: id, status, dates, teamLeader
- Pagination for large result sets
- Selective field loading

## Monitoring & Observability

### Client-side
- TanStack Query DevTools (development)
- React DevTools
- Browser console for errors

### Server-side
- Server action error logging
- API response time tracking
- Database query monitoring

## Technology Decisions

### Why TanStack Query?
- Automatic caching and background refetching
- Built-in loading and error states
- Request deduplication
- Optimistic updates
- Better than useEffect + fetch
- Industry standard for React apps

### Why Zustand?
- Lightweight (1KB)
- Simple API
- No boilerplate
- Built-in persistence
- Better than Context API for this use case

### Why Server Actions?
- Type-safe API calls
- No API route boilerplate
- Automatic serialization
- Better security (server-only code)
- Integrated with Next.js App Router

### Why Consolidated Files?
- Easier navigation
- Less file switching
- Clearer dependencies
- Reduced cognitive load
- Follows existing patterns in codebase

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
