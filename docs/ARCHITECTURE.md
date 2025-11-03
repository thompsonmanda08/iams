# System Architecture

**INFRATEL IAMS Web Application**
**Last Updated:** November 3, 2025

---

## Overview

INFRATEL IAMS (Integrated Audit and Risk Management System) is a Next.js 16.0 enterprise dashboard application built with React 19, TypeScript, and Tailwind CSS. The system provides comprehensive risk management, audit lifecycle management, and system configuration capabilities.

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16.0 (App Router)
- **UI Library:** React 19.0
- **Language:** TypeScript 5.8
- **Styling:** Tailwind CSS 4.1
- **Component Library:** Radix UI primitives
- **Icons:** Lucide React
- **Animation:** Framer Motion

### State Management
- **Server State:** TanStack React Query v5.90.5
- **Client State:** Zustand v5.0.5
- **Form State:** React Hook Form 7.58

### Data Fetching & APIs
- **HTTP Client:** Axios 1.12
- **Server Actions:** Next.js Server Actions
- **Authentication:** JWT with jose 6.1
- **File Storage:** PocketBase integration

### Validation & Forms
- **Schema Validation:** Zod 3.25
- **Form Validation:** React Hook Form + Zod resolver

---

## Application Structure

```
/app
├── (auth)/                           # Unauthenticated routes
│   ├── login/                        # Login page
│   └── otp/                          # OTP verification
│
├── (private)/                        # Backoffice admin routes
│   └── admin/
│       ├── home/                     # Admin dashboard
│       ├── users/                    # User management
│       ├── configurations/           # Global configs
│       └── companies/                # Company management
│
├── dashboard/                        # Main user dashboard
│   ├── home/                         # Dashboard home (risk/audit/operations)
│   ├── (modules)/
│   │   ├── risks/                    # Risk management module
│   │   └── audit/                    # Audit management module
│   ├── profile/                      # User profile
│   └── system-configs/               # System configuration
│       ├── users/
│       ├── departments/
│       ├── branches/
│       ├── workflow/                 # Workflow administration
│       ├── audit-settings/
│       ├── risk-settings/
│       └── modules/
│
├── api/                              # Next.js API routes
│   └── logout/                       # Logout endpoint
│
└── _actions/                         # Server Actions
    ├── auth-actions.ts               # Authentication
    ├── user-actions.ts               # User management
    ├── risk-module-actions.ts        # Risk operations
    ├── audit-module-actions.ts       # Audit operations
    ├── workflow-actions.ts           # Workflow management
    ├── config-actions.ts             # Configuration
    ├── permissions-actions.ts        # RBAC permissions
    └── pocketbase-actions.ts         # File uploads
```

---

## Backend Integration

### API Configuration

**Base URL:** `https://iams-dev.infratel.co.zm` (from `.env.local`)

**API Pattern:** All endpoints use `/api/v1/` prefix

```typescript
// Example configuration
baseURL: process.env.BASE_URL || "http://localhost:8080"
```

### Server Actions Pattern

The application primarily uses Next.js Server Actions instead of traditional REST API routes:

```typescript
// Server Action pattern
export async function functionName(params): Promise<APIResponse> {
  const url = `/api/v1/endpoint`;

  try {
    const response = await axios.method(url, data);
    return successResponse(response?.data, "Success message");
  } catch (error: Error | any) {
    return handleError(error, "METHOD", url);
  }
}
```

### Key Benefits of Server Actions
- Type-safe client-server communication
- Automatic form handling
- Built-in request deduplication
- Cache revalidation with `revalidatePath()`
- Simplified authentication context

---

## Authentication Architecture

### Session Management

**Three-tier session cookie system:**

1. **AUTH_SESSION** - Access token and authentication flags
   - `accessToken`
   - `user_type` (ORGANIZATION_USER | BACKOFFICE_USER)
   - `user_id`
   - `mfa_required`
   - `change_password`
   - `organization_id`

2. **USER_SESSION** - User profile information
   - Full user profile data
   - Branch, Department, Role details

3. **PERMISSIONS_SESSION** - Role-based permissions
   - Module permissions
   - Operation permissions (view, create, edit, delete, approve, etc.)

### JWT Token Security
- **Algorithm:** HS256
- **Expiration:** 1 hour (configurable)
- **Cookie Security:**
  - `httpOnly: true` (prevents XSS)
  - `secure: true` (production only)
  - `sameSite: 'strict'`

### Authentication Flow

```
1. User Login (POST /api/v1/auth/login)
   ↓
2. Create Auth Session (JWT in httpOnly cookie)
   ↓
3. If MFA Required → OTP Verification (POST /api/v1/auth/verify-otp)
   ↓
4. Initialize System Setup (GET /api/v1/auth/setup)
   ├── Fetch full user profile
   ├── Fetch user permissions
   └── Populate session cookies
   ↓
5. First Login → Force password change modal
```

---

## Authorization (RBAC)

### Role-Based Access Control Model

**Hierarchy:**
```
Organization
  ├── Branches
  │   └── Users
  ├── Departments
  │   ├── Modules (assigned to department)
  │   ├── Roles (scoped to department)
  │   └── Users (assigned role within department)
  └── Modules
      └── Permissions (granted to roles for specific modules)
```

### Permission Types
- `can_view` - View access
- `can_create` - Create new items
- `can_edit` - Edit existing items
- `can_delete` - Delete items
- `can_approve` - Approve actions
- `can_export` - Export data
- `can_assign` - Assign tasks/items
- `can_configure` - Configure settings
- `custom_permissions` - JSONB for module-specific permissions

### Department-Constrained RBAC
- Roles belong to specific departments
- Only modules assigned to a department can have permissions granted to its roles
- Users inherit permissions from their assigned role within their department

---

## Data Models

### Core Entities

#### User
```typescript
{
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  branch_id: string
  department_id: string
  role_id: string
  is_active: boolean
  mfa_enabled: boolean
  user_type: "ORGANIZATION_USER" | "BACKOFFICE_USER"
  branch: Branch
  department: Department
  role: Role
}
```

#### Risk
```typescript
{
  id: string
  title: string
  description: string
  category: string
  department_id: string

  // Inherent Risk
  inherentImpact: number
  inherentLikelihood: number
  inherentScore: number
  inherent_rating: string

  // Residual Risk
  residualImpact: number
  residualLikelihood: number
  residualScore: number
  residual_rating: string

  // Controls & Response
  existing_controls: string
  control_effectiveness: string
  risk_response: "REDUCE" | "ACCEPT" | "TRANSFER" | "AVOID" | "OPTIMIZE"
  treatment_plan: string

  // Tracking
  status: string
  owner: string
  target_closing_date: string
}
```

#### Audit Plan
```typescript
{
  id: string
  title: string
  description: string
  audit_year: number
  start_date: string
  end_date: string
  status: "draft" | "under-review" | "planned" | "in-progress" | "completed"
  department_id: string
  created_by: string
}
```

#### Workflow
```typescript
{
  id: string
  name: string
  entity_type: "RISK" | "AUDIT_PLAN" | "FINDING" | "RECOMMENDATION"
  description: string
  status: "draft" | "active" | "inactive" | "archived"
  states: State[]
  transitions: Transition[]
}
```

---

## Client-Side Architecture

### State Management Strategy

**TanStack React Query** for server state:
- Automatic caching with stale-while-revalidate
- Background refetching
- Optimistic updates
- Cache invalidation on mutations

**Zustand** for client state:
- Session storage (`useSessionStore`)
- Entity storage (`useEntityStore`)
- Audit state (`useAuditStore`)

### Component Architecture

**Pattern:** Server Components + Client Components

```typescript
// Server Component (data fetching)
async function Page() {
  const data = await fetchData(); // Server-side
  return <ClientComponent data={data} />;
}

// Client Component (interactivity)
'use client';
function ClientComponent({ data }) {
  const mutation = useMutation(...);
  return <Form onSubmit={mutation.mutate} />;
}
```

### Data Fetching Patterns

**Server-Side:**
```typescript
// In Server Component
const [branches, provinces, towns] = await Promise.all([
  getBranches(),
  getProvinces(),
  getTowns()
]);
```

**Client-Side:**
```typescript
// TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ['branches'],
  queryFn: getBranches,
  staleTime: 5 * 60 * 1000 // 5 minutes
});

const mutation = useMutation({
  mutationFn: createBranch,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['branches'] });
  }
});
```

---

## File Upload Architecture

### PocketBase Integration

**Purpose:** Decoupled file storage for temporary files

**Flow:**
```
1. User selects file in form
   ↓
2. Upload to PocketBase via pocketbase-actions.ts
   ↓
3. Receive file record ID and URL
   ↓
4. Submit form with file reference
   ↓
5. Backend processes and moves to permanent storage
```

**Implementation:**
- `POCKET_BASE_URL` environment variable
- User-scoped file tracking
- Temporary file collection
- File URL generation

---

## Security Features

### Input Validation
- **Client-side:** React Hook Form + Zod
- **Server-side:** Zod schema validation
- **Type safety:** TypeScript throughout

### Data Protection
- Server Actions prevent direct API exposure
- Encrypted JWT sessions
- HTTP-only cookies
- CORS configuration for specific origins

### Error Handling
- Standardized error responses
- No sensitive data in error messages
- Detailed logging server-side
- User-friendly messages client-side

---

## Performance Optimizations

### Caching Strategy
- **TanStack Query:** 5-minute stale time for config data
- **Next.js:** Automatic route caching
- **CDN:** Static assets cached at edge

### Server-Side Rendering
- Initial page loads fetch data server-side
- Reduced client-side JavaScript
- Faster time-to-interactive

### Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading of non-critical features

---

## Deployment Architecture

### Environment Variables
```env
BASE_URL=https://iams-dev.infratel.co.zm
AUTH_SECRET=<32+ char encryption key>
POCKET_BASE_URL=<PocketBase instance URL>
```

### Build Configuration
- TypeScript build (errors ignored for gradual migration)
- Server Actions body size limit: 60MB
- CORS allowed origins: `*.infratel.co.zm`
- Image optimization enabled

---

## Module Architecture

### Risk Management Module
- Risk Registers (CRUD)
- Risk Assessment (inherent/residual scoring)
- Key Risk Indicators (KRI monitoring)
- Risk Actions (mitigation tracking)
- Risk Heat Map (visualization)
- Incidents (tracking)
- Risk Appetite (management)

### Audit Management Module
- Audit Planning (multi-year plans)
- Audit Universe (auditable areas)
- Workpapers (template-based documentation)
- Findings (audit results)
- Budgets (resource allocation)
- Tasks (engagement management)
- Reports (various formats)

### System Configuration Module
- Organization Structure (branches, departments)
- User Management (CRUD, assignments)
- Role Management (department-scoped)
- Permission Management (RBAC matrix)
- Workflow Administration (state machines)
- Module Configuration (activation/assignment)

---

## Integration Points

### Backend API Endpoints

**Authentication:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/auth/setup`
- `GET /api/v1/auth/refresh-token`

**Organization Structure:**
- `GET/POST /api/v1/branches`
- `GET/POST /api/v1/departments`
- `GET/POST /api/v1/users`
- `GET/POST /api/v1/roles`
- `GET/POST /api/v1/provinces`
- `GET/POST /api/v1/towns`

**Risk Management:**
- `GET/POST /api/v1/risks`
- `GET/POST /api/v1/risk-registers`
- `GET/POST /api/v1/kris`
- `GET/POST /api/v1/risk-categories`
- `GET/POST /api/v1/risk-matrices`

**Audit Management:**
- `GET/POST /api/v1/audit-plans`
- `GET/POST /api/v1/audit-universe`
- `GET/POST /api/v1/workpapers`
- `GET/POST /api/v1/audit-findings`
- `GET/POST /api/v1/audit-budgets`

**Permissions:**
- `GET/POST /api/v1/roles/{id}/permissions`
- `GET /api/v1/roles/{id}/available-modules`

---

## Development Patterns

### Error Handling Pattern
```typescript
try {
  const response = await axios.post(url, data);
  return successResponse(response?.data, "Success message");
} catch (error: Error | any) {
  return handleError(error, "POST", url);
}
```

### Field Mapping Pattern
```typescript
// UI camelCase → API snake_case
const response = await axios.post(url, {
  first_name: firstName,
  last_name: lastName,
  branch_id: branchId
});
```

### Query Parameter Pattern
```typescript
const queryParams = new URLSearchParams();
if (params?.field) queryParams.append("field", params.field);

const url = `/api/v1/endpoint${
  queryParams.toString() ? `?${queryParams.toString()}` : ""
}`;
```

---

## Future Enhancements

### Planned Features
- Real-time collaboration
- Advanced analytics dashboard
- Mobile responsiveness optimization
- Bulk import/export operations
- WebSocket integration for live updates

### Technical Debt
- Complete TypeScript strict mode migration
- Implement comprehensive E2E testing
- Add request retry logic with exponential backoff
- Implement request cancellation on component unmount
- Add middleware for route protection

---

## References

- [Getting Started Guide](GETTING_STARTED.md)
- [Authentication Documentation](AUTHENTICATION.md)
- [Features Guide](FEATURES.md)
- [API Integration Guide](API_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)

---

**Last Updated:** November 3, 2025
**Maintained by:** Development Team
