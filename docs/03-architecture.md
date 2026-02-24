# 03 - Architecture

## System Overview

INFRATEL IAMS follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         UI Components ("use client")    │
│    (React Components + Client State)    │
└──────────────┬──────────────────────────┘
               │ consumes
┌──────────────▼──────────────────────────┐
│     React Query Hooks Layer             │
│  (useQuery / useMutation wrappers)      │
└──────────────┬──────────────────────────┘
               │ calls
┌──────────────▼──────────────────────────┐
│       Server Actions ("use server")     │
│         (app/_actions/*.ts)             │
└──────────────┬──────────────────────────┘
               │ uses api-config.ts
┌──────────────▼──────────────────────────┐
│      API Config (Axios Client)          │
│  (authenticated + unauthenticated)      │
└──────────────┬──────────────────────────┘
               │ HTTP requests
┌──────────────▼──────────────────────────┐
│        Go Backend API                   │
│     (REST API + PostgreSQL)             │
└─────────────────────────────────────────┘
```

## Architecture Layers

### 1. Presentation Layer (UI)
**Location:** `app/`, `components/`

- Next.js App Router
- Client Components (`"use client"`) for interactivity
- Radix UI components
- TailwindCSS styling
- **Consumes hooks** for all data fetching and mutations

### 2. Hooks Layer (React Query)
**Location:** `hooks/`, co-located `*-hooks.ts` files

- **Queries (`useQuery`):** Fetch data from server actions, cache results
- **Mutations (`useMutation`):** Call server actions, invalidate queries on success
- **TanStack React Query** for server state, caching, and cache invalidation
- **Zustand:** Client-side UI state (modals, selections, screen lock)

### 3. Server Actions Layer
**Location:** `app/_actions/*.ts`

- All files marked with `"use server"` directive
- Call the Go backend via `authenticatedApiClient()` from `api-config.ts`
- Return standardized `APIResponse` (`{ success, data, message }`)
- Handle errors with `handleError()` utility

### 4. API Config Layer
**Location:** `app/_actions/api-config.ts`

- **`authenticatedApiClient()`:** Creates Axios instance with session token (Bearer) and cookie credentials
- **Response helpers:** `successResponse()`, `handleError()`, `unauthorizedResponse()`, `notFoundResponse()`
- Global error interceptors for timeout, network, and HTTP errors

### 5. Backend (Go API)

- **Go REST API** serving `/api/v1/*` endpoints
- PostgreSQL database
- JWT-based authentication
- Row-Level Security (RLS)

## Key Patterns

### Server Action Pattern (api-config.ts)

```typescript
// app/_actions/backoffice-actions.ts
"use server";

import { authenticatedApiClient } from "./api-config";
import { successResponse, handleError } from "./api-config";

// GET - Query
export async function getCountries(params?: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/countries`,
      method: "GET",
    });
    return successResponse(response.data.data, "Countries fetched successfully");
  } catch (error) {
    return handleError(error, "GET", "/api/v1/backoffice/countries");
  }
}

// POST - Mutation
export async function createCompanyLocation(data: {
  company_id: string;
  country_id: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/company-locations",
      method: "POST",
      data,
    });
    return successResponse(response.data.data, "Company location created successfully");
  } catch (error) {
    return handleError(error, "POST", "/api/v1/backoffice/company-locations");
  }
}
```

### React Query Hook Pattern

```typescript
// hooks/use-backoffice-queries.ts

// Query hook
export function useCountries(params?: { search?: string }) {
  return useQuery({
    queryKey: ["countries", params],
    queryFn: () => getCountries(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Mutation hook
export function useCreateCompanyLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompanyLocation,
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["company-locations"] });
        notify({ title: "Success", type: "success" });
      }
    },
    onError: (error) => {
      notify({ title: "Error", description: error.message });
    },
  });
}
```

### UI Component Pattern

```typescript
// app/(private)/admin/companies/companies.tsx
"use client";

export default function CompaniesPage() {
  // Consume query hook
  const { data: companiesResponse, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getOrganizations(),
    staleTime: 5 * 60 * 1000,
  });

  const companies = companiesResponse?.success ? companiesResponse.data?.data : [];

  // Consume mutation hook
  const deleteMutation = useMutation({
    mutationFn: deleteCompanyLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-locations"] });
    },
  });

  return <DataTable data={companies} isLoading={isLoading} />;
}
```

## Data Flow

### Read Operations
1. UI component mounts
2. `useQuery` hook fires, calling a server action
3. Server action uses `authenticatedApiClient()` to call Go backend
4. Go backend returns data
5. Server action wraps in `successResponse()`
6. React Query caches the result
7. UI renders the data

### Write Operations
1. User submits form
2. UI calls `mutate()` from a `useMutation` hook
3. Mutation calls server action
4. Server action uses `authenticatedApiClient()` to POST/PUT/DELETE to Go backend
5. On success, hook calls `queryClient.invalidateQueries()` to refetch stale data
6. UI re-renders with updated data

## Security Architecture

- **Authentication:** Go Backend Auth (JWT via Bearer token)
- **Session:** Verified via `verifySession()` in `api-config.ts` before every API call
- **Authorization:** Row-Level Security (RLS) in PostgreSQL
- **Session Management:** HTTP-only cookies
- **Screen Lock:** Zustand state + localStorage
- **MFA:** TOTP-based two-factor auth

## Performance Optimizations

- React Query caching with configurable `staleTime` minimizes network requests
- Dependent queries (`enabled` flag) prevent unnecessary fetches
- Parallel data fetching with Promise.all
- Image optimization with next/image

## Next Steps

Continue to → [04-authentication.md](04-authentication.md)
