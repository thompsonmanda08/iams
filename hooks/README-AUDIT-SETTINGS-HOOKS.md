# Audit Settings Query Hooks

This document provides examples and usage guidelines for the audit settings query hooks located in `hooks/use-audit-settings-query-data.ts`.

## Overview

These hooks provide a consistent, reusable way to fetch audit settings data from the client side using TanStack Query (React Query). They follow the same pattern as other query hooks in the application (like `useDepartments`, `useBranches`, etc.).

## Available Hooks

### 1. `useAuditableAreas()`

Fetches all auditable areas.

**Response Structure:**
```typescript
{
  data: Array<AuditableArea>,
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  }
}
```

```tsx
import { useAuditableAreas } from "@/hooks/use-audit-settings-query-data";

function MyComponent() {
  const { data: areas, isLoading, error, refetch } = useAuditableAreas();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {areas?.data?.map((area) => (
        <div key={area.id}>{area.name}</div>
      ))}
      {/* Access pagination if needed */}
      {areas?.pagination && (
        <div>Page {areas.pagination.page} of {areas.pagination.total_pages}</div>
      )}
    </div>
  );
}
```

### 2. `useStrategicPillars(params?)`

Fetches strategic pillars with optional filtering and pagination.

**Parameters:**
- `pillarId` (optional): Fetch a specific pillar by ID
- `page` (optional): Page number for pagination
- `page_size` (optional): Number of items per page

**Response Structure:**
```typescript
{
  data: Array<StrategicPillar>,
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  }
}
```

```tsx
import { useStrategicPillars } from "@/hooks/use-audit-settings-query-data";

function PillarsComponent() {
  // Fetch all pillars
  const { data: pillars, isLoading } = useStrategicPillars();

  // OR: Fetch with pagination
  const { data: paginatedPillars } = useStrategicPillars({
    page: 1,
    page_size: 10
  });

  // OR: Fetch a specific pillar
  const { data: specificPillar } = useStrategicPillars({
    pillarId: "123"
  });

  return (
    <div>
      {pillars?.data?.map((pillar) => (
        <div key={pillar.id}>{pillar.name}</div>
      ))}
    </div>
  );
}
```

### 3. `useStrategicInitiatives(pillarId?, params?)`

Fetches strategic initiatives for a specific pillar.

**Parameters:**
- `pillarId` (required): The ID of the strategic pillar
- `params.page` (optional): Page number for pagination
- `params.page_size` (optional): Number of items per page

**Note:** This hook will only run if `pillarId` is provided (due to `enabled: !!pillarId`).

**Response Structure:**
```typescript
{
  data: Array<StrategicInitiative>,
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  }
}
```

```tsx
import { useStrategicInitiatives } from "@/hooks/use-audit-settings-query-data";

function InitiativesComponent({ pillarId }: { pillarId: string }) {
  const { data: initiatives, isLoading, error } = useStrategicInitiatives(pillarId, {
    page: 1,
    page_size: 10
  });

  if (isLoading) return <div>Loading initiatives...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {initiatives?.data?.map((initiative) => (
        <div key={initiative.id}>{initiative.title}</div>
      ))}
    </div>
  );
}
```

### 4. `useFindingsCategories()`

Fetches all findings categories.

**Response Structure:**
```typescript
{
  data: Array<FindingsCategory>,
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  }
}
```

```tsx
import { useFindingsCategories } from "@/hooks/use-audit-settings-query-data";

function FindingsCategoriesComponent() {
  const { data: categories, isLoading, refetch } = useFindingsCategories();

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh Categories</button>
      {categories?.data?.map((category) => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}
```

### 5. `useProcessActivities()`

Fetches all process activities.

**Response Structure:**
```typescript
{
  data: Array<ProcessActivity>,
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  }
}
```

```tsx
import { useProcessActivities } from "@/hooks/use-audit-settings-query-data";

function ProcessActivitiesComponent() {
  const { data: processes, isLoading, error } = useProcessActivities();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {processes?.data?.map((process) => (
        <div key={process.id}>
          <h3>{process.name}</h3>
          <p>{process.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### 6. `useIndicativeTargets()`

Fetches all indicative targets.

**Response Structure:**
```typescript
{
  data: Array<IndicativeTarget>,
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  }
}
```

```tsx
import { useIndicativeTargets } from "@/hooks/use-audit-settings-query-data";

function IndicativeTargetsComponent() {
  const { data: targets, isLoading } = useIndicativeTargets();

  if (isLoading) return <div>Loading targets...</div>;

  return (
    <div>
      {targets?.data?.map((target) => (
        <div key={target.id}>{target.title}</div>
      ))}
    </div>
  );
}
```

## Common Query Result Properties

All hooks return a React Query result object with the following commonly used properties:

- `data`: The fetched data
- `isLoading`: Boolean indicating if the query is in a loading state
- `isFetching`: Boolean indicating if the query is fetching (including background refetches)
- `error`: Error object if the query failed
- `isError`: Boolean indicating if there was an error
- `refetch()`: Function to manually trigger a refetch
- `isSuccess`: Boolean indicating if the query was successful

## Automatic Cache Management

All hooks automatically invalidate their caches when mutations occur. For example:

```tsx
import { useFindingsCategories } from "@/hooks/use-audit-settings-query-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFindingsCategory } from "@/app/_actions/audit-settings-actions";
import { QUERY_KEYS } from "@/lib/constants";

function CreateCategoryComponent() {
  const { data: categories } = useFindingsCategories();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createFindingsCategory,
    onSuccess: () => {
      // Invalidate the cache to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FINDINGS_CATEGORIES]
      });
    }
  });

  // Your component logic...
}
```

## Cache Configuration

All hooks are configured with:
- **Stale Time**: 5 minutes - Data is considered fresh for 5 minutes before automatic background refetch

## Example: Converting Server Component to Client Component

**Before (Server Component with props):**

```tsx
// page.tsx (Server Component)
export default async function AuditSettingsPage() {
  const response = await getFindingsCategories();

  return <FindingsCategoryTab categories={response.data} />;
}

// findings-category-tab.tsx
export default function FindingsCategoryTab({
  categories
}: {
  categories: any[]
}) {
  return (
    <div>
      {categories?.map((category) => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}
```

**After (Client Component with hooks):**

```tsx
// findings-category-tab.tsx
"use client";

import { useFindingsCategories } from "@/hooks/use-audit-settings-query-data";

export default function FindingsCategoryTab() {
  const { data: categories, isLoading } = useFindingsCategories();

  if (isLoading) return <TableLoading />;

  return (
    <div>
      {categories?.data?.map((category) => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Use hooks in client components**: Always mark your component with `"use client"` directive when using these hooks.

2. **Handle loading and error states**: Always check for loading and error states to provide good UX.

3. **Leverage automatic refetching**: After mutations, invalidate queries to automatically refetch fresh data.

4. **Use the enabled option**: For hooks like `useStrategicInitiatives` that depend on another value, the query will only run when the dependency is available.

5. **Reuse hooks across components**: These hooks can be used in multiple components simultaneously - React Query will deduplicate requests and share cache.

## Related Files

- **Hooks**: `hooks/use-audit-settings-query-data.ts`
- **Actions**: `app/_actions/audit-settings-actions.ts`
- **Query Keys**: `lib/constants.ts` (QUERY_KEYS constant)
- **Similar Hooks**: `hooks/use-query-data.ts` (for departments, branches, roles)
