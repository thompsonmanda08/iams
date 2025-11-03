# API Integration Guide

**INFRATEL IAMS Web Application**
**Last Updated:** November 3, 2025
**API Base URL:** `https://iams-dev.infratel.co.zm/api/v1`

---

## Quick Start

### Environment Configuration

```env
# .env.local
BASE_URL=https://iams-dev.infratel.co.zm
AUTH_SECRET=<32+ character secret>
POCKET_BASE_URL=<pocketbase-url>
```

### API Client Configuration

**File:** `app/_actions/api-config.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.BASE_URL || "http://localhost:8080",
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});
```

---

## Authentication

### Login

```typescript
// POST /api/v1/auth/login
const response = await axios.post('/api/v1/auth/login', {
  username: "admin",
  password: "Admin@123"
});

// Response
{
  access_token: "eyJ...",
  user_type: "ORGANIZATION_USER",
  mfa_required: false,
  change_password: false,
  organization_id: "uuid",
  message: "Login successful"
}
```

### MFA Verification

```typescript
// POST /api/v1/auth/verify-otp
const response = await axios.post('/api/v1/auth/verify-otp', {
  username: "admin",
  otp: "123456"
});
```

### Setup User Session

```typescript
// GET /api/v1/auth/setup
const response = await authenticatedApiClient({
  url: '/api/v1/auth/setup'
});

// Response
{
  user: { ...user details },
  permissions: [ ...permissions ]
}
```

---

## Server Actions Pattern

All API calls use Next.js Server Actions for type-safe communication:

```typescript
export async function functionName(params): Promise<APIResponse> {
  const url = `/api/v1/endpoint`;

  // Validation
  if (!requiredParam) {
    return handleBadRequest("Missing required parameter");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: params
    });

    return successResponse(response.data, "Success message");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}
```

### Response Format

```typescript
interface APIResponse {
  success: boolean;
  status?: number;
  type?: string;
  message?: string;
  data?: any;
}
```

---

## API Endpoints Reference

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/verify-otp` | POST | Verify MFA OTP |
| `/api/v1/auth/resend-otp` | POST | Resend OTP code |
| `/api/v1/auth/change-password` | POST | Change password |
| `/api/v1/auth/register` | POST | Register new user |
| `/api/v1/auth/logout` | POST | Logout user |
| `/api/v1/auth/refresh-token` | GET | Refresh access token |
| `/api/v1/auth/setup` | GET | Get user setup data |

### Organization Structure

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/branches` | GET/POST | List/create branches |
| `/api/v1/branches/{id}` | GET/PUT/DELETE | Get/update/delete branch |
| `/api/v1/departments` | GET/POST | List/create departments |
| `/api/v1/departments/{id}` | GET/PUT/DELETE | Get/update/delete department |
| `/api/v1/departments/{id}/modules` | GET/POST | Get/assign modules |
| `/api/v1/departments/{id}/modules/{mid}` | DELETE | Remove module |
| `/api/v1/provinces` | GET/POST | List/create provinces |
| `/api/v1/provinces/with-towns` | GET | Get provinces with towns |
| `/api/v1/towns` | GET/POST | List/create towns |

### User & Role Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/users` | GET/POST | List/create users |
| `/api/v1/users/{id}` | GET/PUT/DELETE | Get/update/delete user |
| `/api/v1/roles` | GET/POST | List/create roles |
| `/api/v1/roles/{id}` | GET/PUT/DELETE | Get/update/delete role |
| `/api/v1/roles/{id}/permissions` | GET/POST | Get/grant permissions |
| `/api/v1/roles/{id}/available-modules` | GET | Get available modules for role |

### Risk Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/risks` | GET/POST | List/create risks |
| `/api/v1/risks/{id}` | GET/PUT/DELETE | Get/update/delete risk |
| `/api/v1/risk-registers` | GET/POST | List/create risk registers |
| `/api/v1/kris` | GET/POST | List/create KRIs |
| `/api/v1/risk-categories` | GET/POST | List/create categories |
| `/api/v1/risk-matrices` | GET/POST | List/create matrices |
| `/api/v1/risk-responses` | GET/POST | List/create responses |

### Audit Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/audit-plans` | GET/POST | List/create plans |
| `/api/v1/audit-plans/{id}` | GET/PUT/DELETE | Get/update/delete plan |
| `/api/v1/audit-universe` | GET/POST | List/create universe |
| `/api/v1/workpapers` | GET/POST | List/create workpapers |
| `/api/v1/audit-findings` | GET/POST | List/create findings |
| `/api/v1/audit-budgets` | GET/POST | List/create budgets |
| `/api/v1/audit-tasks` | GET/POST | List/create tasks |
| `/api/v1/audit-metrics` | GET | Get audit metrics |

### Workflow Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/workflows` | GET/POST | List/create workflows |
| `/api/v1/workflows/{id}` | GET/PUT/DELETE | Get/update/delete workflow |
| `/api/v1/workflows/details` | GET | Get workflow details |

---

## Common Patterns

### CRUD Operations

**Create:**
```typescript
export async function createResource(data: ResourceInput): Promise<APIResponse> {
  const url = `/api/v1/resources`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data
    });

    return successResponse(response.data, "Resource created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}
```

**Read (List):**
```typescript
export async function getResources(params?: QueryParams): Promise<APIResponse> {
  const queryParams = new URLSearchParams();
  if (params?.filter) queryParams.append("filter", params.filter);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());

  const url = `/api/v1/resources${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  try {
    const response = await authenticatedApiClient({ url });
    return successResponse(response.data, "Resources retrieved");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}
```

**Update:**
```typescript
export async function updateResource(
  id: string,
  data: Partial<ResourceInput>
): Promise<APIResponse> {
  const url = `/api/v1/resources/${id}`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data
    });

    return successResponse(response.data, "Resource updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}
```

**Delete:**
```typescript
export async function deleteResource(id: string): Promise<APIResponse> {
  const url = `/api/v1/resources/${id}`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "DELETE"
    });

    return successResponse(null, "Resource deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}
```

### Field Mapping (camelCase ↔ snake_case)

```typescript
// Frontend → API
const apiData = {
  first_name: firstName,
  last_name: lastName,
  branch_id: branchId,
  department_id: departmentId,
  role_id: roleId
};

// API → Frontend
const frontendData = {
  firstName: data.first_name,
  lastName: data.last_name,
  branchId: data.branch_id,
  departmentId: data.department_id,
  roleId: data.role_id
};
```

### Error Handling

```typescript
function handleError(error: any, method: string, url: string): APIResponse {
  console.error(`[${method}] ${url}:`, error.message);

  if (error.response) {
    // Server responded with error
    return {
      success: false,
      status: error.response.status,
      type: getErrorType(error.response.status),
      message: error.response.data?.message || "An error occurred"
    };
  } else if (error.request) {
    // No response received
    return {
      success: false,
      type: "Network Error",
      message: "Unable to connect to server"
    };
  } else {
    // Request setup error
    return {
      success: false,
      type: "Request Error",
      message: error.message
    };
  }
}
```

---

## TanStack Query Integration

### Setup

```typescript
// app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  }
});

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Query Pattern

```typescript
import { useQuery } from '@tanstack/react-query';

function Component() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <div>{/* Render data */}</div>;
}
```

### Mutation Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function Component() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success("Branch created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

---

## File Upload (PocketBase)

```typescript
export async function uploadFile(file: File): Promise<APIResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('collection', 'temp_files');

  try {
    const response = await axios.post(
      `${process.env.POCKET_BASE_URL}/api/files/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return successResponse({
      fileId: response.data.id,
      fileUrl: response.data.url
    }, "File uploaded successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", "/api/files/upload");
  }
}
```

---

## Testing API Calls

### Using curl

```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Authenticated request
curl -X GET http://localhost:8080/api/v1/branches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import collection: `docs/IAMS_API_POSTMAN_COLLECTION.json`
2. Set environment variables:
   - `BASE_URL`: `http://localhost:8080`
   - `TOKEN`: Your JWT token
3. Test endpoints

---

## Error Codes

| Code | Type | Description |
|------|------|-------------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

- **Limit:** 100 requests per minute per user
- **Headers:**
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Reset timestamp

---

## Best Practices

1. **Always use Server Actions** - Don't create custom API routes unless necessary
2. **Type safety** - Use TypeScript interfaces for all API calls
3. **Error handling** - Always handle errors gracefully
4. **Loading states** - Show loading indicators during API calls
5. **Cache invalidation** - Invalidate queries after mutations
6. **Optimistic updates** - Update UI before API confirmation when appropriate
7. **Retry logic** - Implement retry for failed requests
8. **Request cancellation** - Cancel requests on component unmount

---

## References

- [Architecture Overview](ARCHITECTURE.md)
- [Authentication Guide](AUTHENTICATION.md)
- [Features Documentation](FEATURES.md)
- [Getting Started](GETTING_STARTED.md)

---

**Last Updated:** November 3, 2025
**Maintained by:** Development Team
