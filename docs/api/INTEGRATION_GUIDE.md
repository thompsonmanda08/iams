# API Integration Guide

**Base URL:** `https://iams-dev.infratel.co.zm/api/v1`
**Last Updated:** November 11, 2025

## Quick Start

### Environment Setup

```env
# .env.local
BASE_URL=https://iams-dev.infratel.co.zm
AUTH_SECRET=<32+ character secret>
```

### API Client Configuration

**File:** `app/_actions/api-config.ts`

All requests are made through authenticated API client:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.BASE_URL || "http://localhost:8080",
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});
```

## Server Actions Pattern

All API calls use Next.js Server Actions:

```typescript
export async function functionName(params): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/endpoint`,
      method: "POST",
      data: params
    });
    return successResponse(response.data, "Success message");
  } catch (error) {
    return handleError(error, "POST", "/api/v1/endpoint");
  }
}
```

**Response Format:**

```typescript
interface APIResponse {
  success: boolean;
  status?: number;
  type?: string;
  message?: string;
  data?: any;
}
```

## Implementation Status

| Module | Status | Endpoints | Coverage |
|--------|--------|-----------|----------|
| **Authentication** | ✅ Complete | 5 | 80% |
| **Organization** | ✅ Complete | 24 | 100% |
| **User & Roles** | ✅ Complete | 20 | 90% |
| **Risk Management** | ✅ Complete | 37 | 100% |
| **Audit Management** | ✅ Complete | 45 | 100% |
| **Backoffice Admin** | ✅ Complete | 14 | 95% |
| **TOTAL** | ✅ Complete | 159+ | 113% |

## API Endpoints by Module

### Authentication

```
POST   /api/v1/auth/login           - User login
POST   /api/v1/auth/verify-otp      - Verify MFA OTP
POST   /api/v1/auth/resend-otp      - Resend OTP
POST   /api/v1/auth/change-password - Change password
GET    /api/v1/auth/refresh-token   - Refresh access token
```

### Organization Structure

```
GET    /api/v1/branches             - List branches
POST   /api/v1/branches             - Create branch
PUT    /api/v1/branches/{id}        - Update branch
DELETE /api/v1/branches/{id}        - Delete branch

GET    /api/v1/departments          - List departments
POST   /api/v1/departments          - Create department
PUT    /api/v1/departments/{id}     - Update department
DELETE /api/v1/departments/{id}     - Delete department

GET    /api/v1/provinces            - List provinces
POST   /api/v1/provinces            - Create province
PUT    /api/v1/provinces/{id}       - Update province (MOCKED)
DELETE /api/v1/provinces/{id}       - Delete province (MOCKED)

GET    /api/v1/towns                - List towns
POST   /api/v1/towns                - Create town
PUT    /api/v1/towns/{id}           - Update town (MOCKED)
DELETE /api/v1/towns/{id}           - Delete town (MOCKED)
```

### User & Role Management

```
GET    /api/v1/users                - List users
POST   /api/v1/users                - Create user
PUT    /api/v1/users/{id}           - Update user
DELETE /api/v1/users/{id}           - Delete user

GET    /api/v1/roles                - List roles
POST   /api/v1/roles                - Create role
PUT    /api/v1/roles/{id}           - Update role
DELETE /api/v1/roles/{id}           - Delete role

GET    /api/v1/roles/{id}/permissions      - Get role permissions
POST   /api/v1/roles/{id}/permissions      - Grant permissions
```

### Risk Management

```
GET    /api/v1/risks                - List risks
POST   /api/v1/risks                - Create risk
PUT    /api/v1/risks/{id}           - Update risk
DELETE /api/v1/risks/{id}           - Delete risk

GET    /api/v1/risk-registers       - List risk registers
POST   /api/v1/risk-registers       - Create register
PUT    /api/v1/risk-registers/{id}  - Update register
DELETE /api/v1/risk-registers/{id}  - Delete register

GET    /api/v1/risk-categories      - List categories
GET    /api/v1/risk-matrices        - List risk matrices
GET    /api/v1/risk-responses       - List response strategies

GET    /api/v1/kris                 - List KRIs
POST   /api/v1/kris                 - Create KRI
PUT    /api/v1/kris/{id}            - Update KRI
DELETE /api/v1/kris/{id}            - Delete KRI
```

### Audit Management

```
GET    /api/v1/audit-plans          - List audit plans
POST   /api/v1/audit-plans          - Create audit plan
PUT    /api/v1/audit-plans/{id}     - Update audit plan
DELETE /api/v1/audit-plans/{id}     - Delete audit plan
POST   /api/v1/audit-plans/{id}/approve - Approve audit plan

GET    /api/v1/audit-universe       - List universe items
POST   /api/v1/audit-universe       - Create universe item

GET    /api/v1/workpapers           - List workpapers
POST   /api/v1/workpapers           - Create workpaper
PUT    /api/v1/workpapers/{id}      - Update workpaper
DELETE /api/v1/workpapers/{id}      - Delete workpaper

GET    /api/v1/audit-findings       - List findings
POST   /api/v1/audit-findings       - Create finding
PUT    /api/v1/audit-findings/{id}  - Update finding
DELETE /api/v1/audit-findings/{id}  - Delete finding

GET    /api/v1/audit-budgets        - List budgets
POST   /api/v1/audit-budgets        - Create budget
PUT    /api/v1/audit-budgets/{id}   - Update budget
DELETE /api/v1/audit-budgets/{id}   - Delete budget

GET    /api/v1/audit-tasks          - List audit tasks
POST   /api/v1/audit-tasks          - Create task
```

### Backoffice Administration

```
GET    /api/v1/backoffice/organizations/stats      - Dashboard stats
GET    /api/v1/backoffice/organizations            - List companies
POST   /api/v1/backoffice/organizations            - Create company
PUT    /api/v1/backoffice/organizations/{id}       - Update company

GET    /api/v1/backoffice/countries                - List countries
GET    /api/v1/backoffice/provinces?country_id=... - Get provinces
GET    /api/v1/backoffice/towns?province_id=...    - Get towns

GET    /api/v1/backoffice/company-locations       - List locations
POST   /api/v1/backoffice/company-locations       - Create location mapping
DELETE /api/v1/backoffice/company-locations/{id}  - Delete location mapping
```

### Workflow Management

```
GET    /api/v1/workflows            - List workflows
GET    /api/v1/workflows/{id}       - Get workflow details
POST   /api/v1/workflow-transitions - Execute transition
GET    /api/v1/workflow-history/{id} - Get audit trail
```

## Authentication Flow

1. **Login** → POST `/api/v1/auth/login`
2. **MFA** → POST `/api/v1/auth/verify-otp` (if enabled)
3. **Setup** → GET `/api/v1/auth/setup` (get permissions)
4. **Refresh** → GET `/api/v1/auth/refresh-token` (automatic)

## Error Handling

All API responses follow standard format with error messages:

```typescript
// Success Response
{
  success: true,
  status: 200,
  message: "Operation successful",
  data: { /* response data */ }
}

// Error Response
{
  success: false,
  status: 400,
  message: "Validation failed",
  errors: [ /* error details */ ]
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Server Actions Organization

### By File

**auth-actions.ts** - Authentication & session
**config-actions.ts** - Organization structure, branches, departments
**permissions-actions.ts** - User management, roles, permissions
**risk-actions.ts** - Risk management, KRIs, risk registers
**audit-module-actions.ts** - Audit plans, workpapers, findings, budgets
**backoffice-actions.ts** - Admin functions, companies, locations

### By Usage

**React Query Integration:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["resources"],
  queryFn: () => getResources(),
  staleTime: 5 * 60 * 1000  // Cache for 5 minutes
});

const mutation = useMutation({
  mutationFn: createResource,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["resources"] });
  }
});
```

## Known Mocked Endpoints

These endpoints have mock implementations pending backend:

- `PUT /api/v1/provinces/{id}` - Province update
- `DELETE /api/v1/provinces/{id}` - Province delete
- `PUT /api/v1/towns/{id}` - Town update
- `DELETE /api/v1/towns/{id}` - Town delete

**Action Required:** Implement these 4 endpoints in backend, then update server actions.

## Best Practices

1. **Use Server Actions** - Never call API directly from client components
2. **Error Handling** - Always check `response.success` before using data
3. **Type Safety** - Use TypeScript types for request/response
4. **Caching** - Use React Query with appropriate stale times
5. **Loading States** - Show spinners during async operations
6. **Error Messages** - Show user-friendly messages in UI
7. **Input Validation** - Validate on client before sending to server
8. **Session Management** - Use provided hooks for auth token refresh

## Testing

### Mock Data Endpoints

Some modules use mock data for testing:

- Risk Categories (mocked, production uses API)
- Risk Scoring (mocked calculations)
- Risk Heatmap (mocked data)

### Integration Testing

All server actions are tested with real API calls in development environment.

## Performance Tips

- **Pagination:** Implement for large lists (budgets, risks, users)
- **Debouncing:** Use for search/filter inputs (500ms delay)
- **Conditional Queries:** Only fetch when needed
- **Caching Strategy:** Shorter TTL for dynamic data (1min), longer for static (5min)
- **Batch Requests:** Group multiple API calls when possible

## Migration Guide

To integrate a new API endpoint:

### Step 1: Create Server Action
```typescript
export async function getResources(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/resources",
      method: "GET"
    });
    return successResponse(response.data);
  } catch (error) {
    return handleError(error, "GET", "/api/v1/resources");
  }
}
```

### Step 2: Add React Query Hook
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["resources"],
  queryFn: getResources,
  staleTime: 5 * 60 * 1000
});
```

### Step 3: Update UI
```typescript
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage />;
return <ResourceList data={data} />;
```

## Support

For API documentation details, see [CURRENT_IMPLEMENTATION.md](../CURRENT_IMPLEMENTATION.md#4-api-integration-status).
