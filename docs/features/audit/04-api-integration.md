# API Integration Guide

This document details how to integrate the Audit Management Module with the backend API.

## Current State: Mock Data

The initial implementation uses mock data to enable frontend development without backend dependencies. All server actions in `app/_actions/audit-actions.ts` currently use mock data arrays.

## Migration Path: Mock → Real API

### Phase 1: Create API Client Layer

**File**: `lib/api/audits-api.ts`

Follow the pattern from `lib/api/risks-api.ts`:

```typescript
import axios from 'axios';
import type {
  AuditPlan,
  AuditPlanInput,
  AuditFilters,
  Workpaper,
  WorkpaperInput,
  Finding,
  FindingInput,
  // ... other types
} from '@/lib/types/audit-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Optional: Request/Response interceptors
axios.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// AUDIT PLANS API
// ============================================================================

export const auditPlansApi = {
  /**
   * Get all audit plans with optional filters
   */
  async getAll(params?: AuditFilters): Promise<{ data: AuditPlan[]; meta: any }> {
    const response = await axios.get(`${BASE_URL}/audits/plans`, {
      params: {
        status: params?.status?.join(','),
        startDate: params?.dateRange?.[0]?.toISOString(),
        endDate: params?.dateRange?.[1]?.toISOString(),
        teamLeader: params?.teamLeader,
        search: params?.search,
      },
    });

    return {
      data: response.data.data.map((item: any) => ({
        ...item,
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })),
      meta: response.data.meta,
    };
  },

  /**
   * Get single audit plan by ID
   */
  async getById(id: string): Promise<AuditPlan> {
    const response = await axios.get(`${BASE_URL}/audits/plans/${id}`);

    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: new Date(response.data.endDate),
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  },

  /**
   * Create new audit plan
   */
  async create(data: AuditPlanInput): Promise<AuditPlan> {
    const response = await axios.post(`${BASE_URL}/audits/plans`, {
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    });

    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: new Date(response.data.endDate),
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  },

  /**
   * Update existing audit plan
   */
  async update(id: string, data: Partial<AuditPlanInput>): Promise<AuditPlan> {
    const response = await axios.put(`${BASE_URL}/audits/plans/${id}`, {
      ...data,
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
    });

    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: new Date(response.data.endDate),
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  },

  /**
   * Delete audit plan
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/audits/plans/${id}`);
  },
};

// ============================================================================
// WORKPAPERS API
// ============================================================================

export const workpapersApi = {
  async getAll(auditId?: string): Promise<{ data: Workpaper[]; meta: any }> {
    const response = await axios.get(`${BASE_URL}/audits/workpapers`, {
      params: { auditId },
    });
    return response.data;
  },

  async getById(id: string): Promise<Workpaper> {
    const response = await axios.get(`${BASE_URL}/audits/workpapers/${id}`);
    return response.data;
  },

  async create(data: WorkpaperInput): Promise<Workpaper> {
    const response = await axios.post(`${BASE_URL}/audits/workpapers`, data);
    return response.data;
  },

  async update(id: string, data: Partial<WorkpaperInput>): Promise<Workpaper> {
    const response = await axios.put(`${BASE_URL}/audits/workpapers/${id}`, data);
    return response.data;
  },

  async getTemplates(clause?: string): Promise<WorkpaperTemplate[]> {
    const response = await axios.get(`${BASE_URL}/audits/workpapers/templates`, {
      params: { clause },
    });
    return response.data;
  },
};

// ============================================================================
// FINDINGS API
// ============================================================================

export const findingsApi = {
  async getAll(filters?: FindingFilters): Promise<{ data: Finding[]; meta: any }> {
    const response = await axios.get(`${BASE_URL}/audits/findings`, {
      params: {
        severity: filters?.severity?.join(','),
        status: filters?.status?.join(','),
        clause: filters?.clause,
        assignedTo: filters?.assignedTo,
        search: filters?.search,
      },
    });
    return response.data;
  },

  async getById(id: string): Promise<Finding> {
    const response = await axios.get(`${BASE_URL}/audits/findings/${id}`);
    return response.data;
  },

  async create(data: FindingInput): Promise<Finding> {
    const response = await axios.post(`${BASE_URL}/audits/findings`, data);
    return response.data;
  },

  async update(id: string, data: Partial<FindingInput>): Promise<Finding> {
    const response = await axios.put(`${BASE_URL}/audits/findings/${id}`, data);
    return response.data;
  },

  async getTimeline(id: string): Promise<FindingTimelineEvent[]> {
    const response = await axios.get(`${BASE_URL}/audits/findings/${id}/timeline`);
    return response.data;
  },
};

// ============================================================================
// EVIDENCE API
// ============================================================================

export const evidenceApi = {
  async upload(file: File, entityId: string, entityType: 'workpaper' | 'finding'): Promise<Evidence> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityId', entityId);
    formData.append('entityType', entityType);

    const response = await axios.post(`${BASE_URL}/audits/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/audits/evidence/${id}`);
  },
};

// ============================================================================
// REPORTS API
// ============================================================================

export const reportsApi = {
  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await axios.get(`${BASE_URL}/audits/reports/templates`);
    return response.data;
  },

  async generate(params: ReportParams): Promise<Blob> {
    const response = await axios.post(
      `${BASE_URL}/audits/reports/generate`,
      params,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  async getScheduled(): Promise<ScheduledReport[]> {
    const response = await axios.get(`${BASE_URL}/audits/reports/scheduled`);
    return response.data;
  },
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsApi = {
  async getMetrics(params?: AnalyticsParams): Promise<AuditMetrics> {
    const response = await axios.get(`${BASE_URL}/audits/analytics/metrics`, {
      params,
    });
    return response.data;
  },

  async getAnalytics(params?: AnalyticsParams): Promise<AuditAnalytics> {
    const response = await axios.get(`${BASE_URL}/audits/analytics`, {
      params,
    });
    return response.data;
  },
};

// ============================================================================
// SETTINGS API
// ============================================================================

export const settingsApi = {
  async get(): Promise<AuditSettings> {
    const response = await axios.get(`${BASE_URL}/audits/settings`);
    return response.data;
  },

  async update(data: SettingsInput): Promise<AuditSettings> {
    const response = await axios.put(`${BASE_URL}/audits/settings`, data);
    return response.data;
  },

  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await axios.get(`${BASE_URL}/audits/settings/team`);
    return response.data;
  },

  async addTeamMember(data: TeamMemberInput): Promise<TeamMember> {
    const response = await axios.post(`${BASE_URL}/audits/settings/team`, data);
    return response.data;
  },

  async removeTeamMember(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/audits/settings/team/${id}`);
  },
};
```

### Phase 2: Update Server Actions

Update `app/_actions/audit-actions.ts` to use the API client:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { APIResponse } from '@/types';
import {
  auditPlansApi,
  workpapersApi,
  findingsApi,
  evidenceApi,
  reportsApi,
  analyticsApi,
  settingsApi,
} from '@/lib/api/audits-api';
import type { AuditFilters, AuditPlanInput } from '@/lib/types/audit-types';

/**
 * Get all audit plans with optional filters
 */
export async function getAuditPlans(filters?: AuditFilters): Promise<APIResponse> {
  const url = `/api/audits/plans`;

  try {
    const response = await auditPlansApi.getAll(filters);

    return {
      success: true,
      message: 'Audit plans fetched successfully',
      data: response.data,
      meta: response.meta,
    };
  } catch (error: Error | any) {
    console.error({
      endpoint: `GET | AUDIT PLANS ~ ${url}`,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data || error,
    });

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch audit plans',
      data: [],
    };
  }
}

/**
 * Create new audit plan
 */
export async function createAuditPlan(input: AuditPlanInput): Promise<APIResponse> {
  const url = `/api/audits/plans`;

  try {
    const response = await auditPlansApi.create(input);

    // Revalidate relevant paths
    revalidatePath('/dashboard/audit/plans');
    revalidatePath('/dashboard/home/audit');

    return {
      success: true,
      message: 'Audit plan created successfully',
      data: response,
    };
  } catch (error: Error | any) {
    console.error({
      endpoint: `POST | CREATE AUDIT PLAN ~ ${url}`,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data || error,
    });

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create audit plan',
      data: null,
    };
  }
}

// ... more actions following the same pattern
```

## Backend API Specification

### Expected Endpoints

#### Audit Plans

```
GET    /api/audits/plans
GET    /api/audits/plans/:id
POST   /api/audits/plans
PUT    /api/audits/plans/:id
DELETE /api/audits/plans/:id
```

#### Workpapers

```
GET    /api/audits/workpapers
GET    /api/audits/workpapers/:id
POST   /api/audits/workpapers
PUT    /api/audits/workpapers/:id
GET    /api/audits/workpapers/templates
```

#### Findings

```
GET    /api/audits/findings
GET    /api/audits/findings/:id
POST   /api/audits/findings
PUT    /api/audits/findings/:id
GET    /api/audits/findings/:id/timeline
```

#### Evidence

```
POST   /api/audits/evidence
DELETE /api/audits/evidence/:id
```

#### Reports

```
GET    /api/audits/reports/templates
POST   /api/audits/reports/generate
GET    /api/audits/reports/scheduled
```

#### Analytics

```
GET    /api/audits/analytics/metrics
GET    /api/audits/analytics
```

#### Settings

```
GET    /api/audits/settings
PUT    /api/audits/settings
GET    /api/audits/settings/team
POST   /api/audits/settings/team
DELETE /api/audits/settings/team/:id
```

### Request/Response Examples

#### Create Audit Plan

**Request:**
```http
POST /api/audits/plans
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Q1 2025 ISO 27001 Internal Audit",
  "standard": "ISO 27001:2022",
  "scope": ["Information Security", "Risk Management", "ISMS"],
  "objectives": "Verify compliance with ISO 27001:2022 controls and identify areas for improvement",
  "teamLeader": "john.doe@company.com",
  "teamMembers": ["jane.smith@company.com", "mike.jones@company.com"],
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-02-28T00:00:00.000Z",
  "status": "planned"
}
```

**Response (Success):**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "aud-2025-001",
  "title": "Q1 2025 ISO 27001 Internal Audit",
  "standard": "ISO 27001:2022",
  "scope": ["Information Security", "Risk Management", "ISMS"],
  "objectives": "Verify compliance with ISO 27001:2022 controls and identify areas for improvement",
  "teamLeader": "john.doe@company.com",
  "teamMembers": ["jane.smith@company.com", "mike.jones@company.com"],
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-02-28T00:00:00.000Z",
  "status": "planned",
  "progress": 0,
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z"
}
```

**Response (Error):**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "message": "Validation failed",
  "errors": [
    {
      "field": "endDate",
      "message": "End date must be after start date"
    }
  ]
}
```

#### Get Audit Plans with Filters

**Request:**
```http
GET /api/audits/plans?status=planned,in-progress&startDate=2025-01-01&search=ISO
Authorization: Bearer <token>
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [
    {
      "id": "aud-2025-001",
      "title": "Q1 2025 ISO 27001 Internal Audit",
      "status": "planned",
      // ... full audit plan object
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Error Handling

All API endpoints should return consistent error responses:

```typescript
{
  "message": "Error description",
  "error": "ERROR_CODE",
  "statusCode": 400,
  "errors": [ // Optional for validation errors
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

**Common Status Codes:**
- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid auth token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `500 Internal Server Error`: Server error

### Authentication

All API requests must include an authentication token:

```http
Authorization: Bearer <jwt-token>
```

The token should be obtained from the existing auth system and included in all requests.

### Pagination

List endpoints support pagination via query parameters:

```
?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Migration Checklist

- [ ] Create `lib/api/audits-api.ts`
- [ ] Implement all API client methods
- [ ] Add axios interceptors for auth
- [ ] Update server actions to use API client
- [ ] Test each endpoint with backend
- [ ] Handle error cases
- [ ] Verify data transformation (Date objects)
- [ ] Update environment variables
- [ ] Test pagination
- [ ] Test filtering
- [ ] Test file uploads
- [ ] Verify authentication
- [ ] Check authorization
- [ ] Performance testing
- [ ] Update documentation

## Environment Configuration

Add to `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
# or for production
NEXT_PUBLIC_API_URL=https://api.example.com/api
```

## Testing API Integration

### Manual Testing

```typescript
// Test in browser console
const testApi = async () => {
  try {
    const result = await fetch('/api/audits/plans');
    const data = await result.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('API Error:', error);
  }
};

testApi();
```

### Automated Testing

Consider adding API integration tests:

```typescript
// __tests__/api/audits.test.ts
describe('Audits API', () => {
  it('should fetch audit plans', async () => {
    const result = await auditPlansApi.getAll();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should create audit plan', async () => {
    const input = { /* ... */ };
    const result = await auditPlansApi.create(input);
    expect(result.id).toBeDefined();
  });
});
```

## Performance Considerations

1. **Caching**: TanStack Query handles client-side caching
2. **Rate Limiting**: Implement on backend
3. **Compression**: Enable gzip/brotli
4. **Batch Requests**: Consider GraphQL or batch endpoints
5. **Lazy Loading**: Load data as needed
6. **Pagination**: Always paginate large lists
7. **Filtering**: Filter on backend, not client

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Expiry**: Handle token refresh
3. **CORS**: Configure properly
4. **Input Validation**: Validate on both client and server
5. **File Upload**: Validate file types and sizes
6. **SQL Injection**: Use parameterized queries
7. **XSS Prevention**: Sanitize inputs
8. **CSRF Protection**: Implement CSRF tokens
