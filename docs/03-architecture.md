# 03 - Architecture

## System Overview

INFRATEL IAMS follows a **modern full-stack architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│           Next.js Frontend              │
│  (React Components + Client State)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Server Actions Layer              │
│    (app/_actions/*.ts)                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Supabase Backend                 │
│  (PostgreSQL + RLS + Auth)              │
└─────────────────────────────────────────┘
```

## Architecture Layers

### 1. Presentation Layer
**Location:** `app/`, `components/`

- Next.js 14 App Router
- React Server Components (RSC)
- Client Components for interactivity
- Radix UI components
- TailwindCSS styling

### 2. State Management Layer
**Location:** `hooks/`, `store/`

- **TanStack React Query:** Server state, caching, mutations
- **Zustand:** Client-side UI state (modals, selections, screen lock)
- **React Context:** Theme, user preferences

### 3. API Layer
**Location:** `app/_actions/`

- **Server Actions:** Primary API pattern
- **API Routes:** External webhooks, file uploads
- Type-safe with TypeScript
- Error handling with try-catch

### 4. Data Layer
**Location:** Supabase

- PostgreSQL database
- Row-Level Security (RLS)
- Real-time subscriptions
- File storage

## Key Patterns

### Server Actions Pattern

```typescript
// app/_actions/reports-actions.ts
export async function updateReport(data: UpdateReportInput) {
  const supabase = createClient();

  const { data: report, error } = await supabase
    .from("reports")
    .update(data)
    .eq("id", data.id)
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/reports");
  return report;
}
```

### React Query Pattern

```typescript
// hooks/use-report-queries.ts
export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report updated!");
    }
  });
}
```

### Component Pattern

```typescript
// Client component wraps server data
export default async function ReportPage({ params }) {
  const report = await getReport(params.id); // Server

  return <ReportDetailsClient report={report} />; // Client
}
```

## Data Flow

### Read Operations
1. User navigates to page
2. Server Component fetches data
3. Data passed to Client Component
4. React Query caches result
5. UI renders

### Write Operations
1. User submits form
2. Client calls mutation hook
3. Mutation invokes Server Action
4. Server Action updates Supabase
5. Server revalidates cache
6. Client invalidates queries
7. UI refetches and updates

## Security Architecture

- **Authentication:** Supabase Auth (JWT)
- **Authorization:** Row-Level Security (RLS)
- **Session Management:** HTTP-only cookies
- **Screen Lock:** Zustand state + localStorage
- **MFA:** TOTP-based two-factor auth

## Performance Optimizations

- Server Components reduce client JS
- React Query minimizes network requests
- Parallel data fetching with Promise.all
- Incremental Static Regeneration (ISR)
- Image optimization with next/image

## Next Steps

Continue to → [04-authentication.md](04-authentication.md)
