# Frontend Developer API Guide

**Last Updated**: November 1, 2024
**API Version**: 2.0
**Base URL**: `http://localhost:8080/api/v1`

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Health & Status](#health--status)
4. [Authentication Endpoints](#authentication-endpoints)
5. [Backoffice (Super Admin)](#backoffice-super-admin)
6. [Organization & User Management](#organization--user-management)
7. [Risk Management](#risk-management)
8. [Audit Module](#audit-module)
9. [Working Papers](#working-papers)
10. [Workflows](#workflows)
11. [Common Patterns](#common-patterns)

---

## Getting Started

### Prerequisites

- Node.js/JavaScript knowledge
- Postman or similar API testing tool
- Understanding of RESTful APIs
- JWT authentication tokens

### Base URL

```
http://localhost:8080/api/v1
```

### Common Headers

All requests (except `/health` and `/auth/login`) must include:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "X-Organization-ID": "your-org-id",
  "X-User-ID": "your-user-id"
}
```

### Response Format

All successful responses follow this format:

```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "resource-id",
    "name": "Resource Name",
    "created_at": "2025-01-15T10:30:00Z",
    ...
  }
}
```

### Error Format

```json
{
  "status": "error",
  "code": 400,
  "message": "Error description",
  "details": {
    "field": "error message"
  }
}
```

---

## Authentication

### Step 1: Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "username": "john.doe",
  "password": "YourPassword123!"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "00000000-0000-0000-0000-000000000001",
      "username": "john.doe",
      "email": "john.doe@company.com",
      "organization_id": "00000000-0000-0000-0000-000000000002",
      "roles": ["Audit Manager"]
    },
    "mfa_required": false
  }
}
```

**Status Codes**:
- `201` - Login successful
- `401` - Invalid credentials
- `403` - MFA required (see next step)

### Step 2: MFA Verification (if required)

**Endpoint**: `POST /auth/verify-otp`

**Request Body**:
```json
{
  "otp_code": "123456",
  "user_id": "00000000-0000-0000-0000-000000000001"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 3: Store Token

Save the `token` from the response. Use it in all subsequent requests:

```javascript
// Example: Store in localStorage
localStorage.setItem('authToken', response.data.token);
localStorage.setItem('userId', response.data.user.id);
localStorage.setItem('organizationId', response.data.user.organization_id);

// Use in API calls
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'X-User-ID': localStorage.getItem('userId'),
  'X-Organization-ID': localStorage.getItem('organizationId')
};
```

### Step 4: Get User Profile

**Endpoint**: `GET /auth/setup`

**Headers Required**: Yes (with token)

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "user": {
      "id": "00000000-0000-0000-0000-000000000001",
      "username": "john.doe",
      "email": "john.doe@company.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1-555-0123",
      "organization_id": "00000000-0000-0000-0000-000000000002"
    },
    "permissions": [
      "view_risks",
      "create_audit_plans",
      "approve_budgets"
    ],
    "navigation_menu": [
      {
        "label": "Risk Management",
        "path": "/risks",
        "icon": "risk"
      },
      {
        "label": "Audit Plans",
        "path": "/audit-plans",
        "icon": "audit"
      }
    ]
  }
}
```

---

## Health & Status

### Check API Health

**Endpoint**: `GET /health`

**Headers Required**: No

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 3600,
  "version": "2.0.0"
}
```

---

## Authentication Endpoints

### Register New User

**Endpoint**: `POST /auth/register`

**Headers Required**: Yes (admin user)

**Request Body**:
```json
{
  "username": "new.user",
  "email": "new.user@company.com",
  "password": "SecurePassword123!",
  "first_name": "New",
  "last_name": "User",
  "phone": "+1-555-0456",
  "department": "Finance"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000003",
    "username": "new.user",
    "email": "new.user@company.com",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Validation Errors**:
- Username already exists: `409 Conflict`
- Email already exists: `409 Conflict`
- Weak password: `400 Bad Request`

### Change Password

**Endpoint**: `POST /auth/change-password`

**Headers Required**: Yes

**Request Body**:
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Password changed successfully"
}
```

---

## Backoffice (Super Admin)

### Countries

#### List All Countries

**Endpoint**: `GET /backoffice/countries`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Records per page (default: 20)
- `search` (string, optional): Search by name or code

**Example Request**:
```
GET /backoffice/countries?page=1&limit=20&search=Canada
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "Canada",
        "code": "CA",
        "region": "North America",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Country

**Endpoint**: `POST /backoffice/countries`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Canada",
  "code": "CA",
  "region": "North America"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "Canada",
    "code": "CA",
    "region": "North America",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Update Country

**Endpoint**: `PUT /backoffice/countries/update`

**Headers Required**: Yes

**Request Body**:
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "name": "Canada",
  "code": "CA",
  "region": "North America"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "Canada",
    "code": "CA",
    "region": "North America",
    "updated_at": "2025-01-15T10:35:00Z"
  }
}
```

### Provinces

#### Create Province

**Endpoint**: `POST /backoffice/provinces`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Ontario",
  "country_id": "00000000-0000-0000-0000-000000000001",
  "code": "ON"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000002",
    "name": "Ontario",
    "country_id": "00000000-0000-0000-0000-000000000001",
    "code": "ON",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### List Organization Provinces

**Endpoint**: `GET /provinces`

**Headers Required**: Yes

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000002",
        "name": "Ontario",
        "country_id": "00000000-0000-0000-0000-000000000001",
        "code": "ON"
      }
    ]
  }
}
```

### Towns

#### Create Town

**Endpoint**: `POST /backoffice/towns`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Toronto",
  "province_id": "00000000-0000-0000-0000-000000000002",
  "code": "TO"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000003",
    "name": "Toronto",
    "province_id": "00000000-0000-0000-0000-000000000002",
    "code": "TO",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### List Towns with Provinces

**Endpoint**: `GET /provinces/with-towns`

**Headers Required**: Yes

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000002",
        "name": "Ontario",
        "code": "ON",
        "towns": [
          {
            "id": "00000000-0000-0000-0000-000000000003",
            "name": "Toronto",
            "code": "TO"
          }
        ]
      }
    ]
  }
}
```

### Organizations

#### Create Organization

**Endpoint**: `POST /backoffice/organizations`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Acme Corporation",
  "email": "admin@acme.com",
  "phone": "+1-555-1234",
  "address": "123 Business St, Toronto, ON",
  "admin_username": "acme.admin",
  "admin_password": "AdminPassword123!",
  "admin_email": "admin@acme.com"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "organization": {
      "id": "00000000-0000-0000-0000-000000000004",
      "name": "Acme Corporation",
      "email": "admin@acme.com",
      "status": "active",
      "created_at": "2025-01-15T10:30:00Z"
    },
    "admin_user": {
      "id": "00000000-0000-0000-0000-000000000005",
      "username": "acme.admin",
      "email": "admin@acme.com"
    }
  }
}
```

#### Get Organization Stats

**Endpoint**: `GET /backoffice/organizations/stats`

**Headers Required**: Yes

**Query Parameters**:
- `organization_id` (string, required): Organization ID

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "organization_id": "00000000-0000-0000-0000-000000000004",
    "total_users": 25,
    "total_risks": 120,
    "total_audit_plans": 8,
    "total_departments": 5,
    "active_workflows": 3,
    "last_activity": "2025-01-15T09:30:00Z"
  }
}
```

---

## Organization & User Management

### Branches

#### List Branches

**Endpoint**: `GET /branches`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page
- `search` (string, optional): Search by name

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000006",
        "name": "Head Office",
        "address": "123 Main St, Toronto",
        "manager": "Jane Smith",
        "phone": "+1-555-0123",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Branch

**Endpoint**: `POST /branches`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "New York Branch",
  "address": "456 Business Ave, New York, NY",
  "manager": "John Manager",
  "phone": "+1-555-9876"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000007",
    "name": "New York Branch",
    "address": "456 Business Ave, New York, NY",
    "manager": "John Manager",
    "phone": "+1-555-9876",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Update Branch

**Endpoint**: `PUT /branches/{id}`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Branch ID

**Request Body**:
```json
{
  "name": "New York Branch",
  "address": "789 Updated St, New York, NY",
  "manager": "Jane Manager",
  "phone": "+1-555-5555"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000007",
    "name": "New York Branch",
    "address": "789 Updated St, New York, NY",
    "manager": "Jane Manager",
    "phone": "+1-555-5555",
    "updated_at": "2025-01-15T10:35:00Z"
  }
}
```

#### Delete Branch

**Endpoint**: `DELETE /branches/{id}`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Branch ID

**Response** (204 No Content):
```
[Empty response body]
```

### Departments

#### List Departments

**Endpoint**: `GET /departments`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page
- `search` (string, optional): Search by name

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000008",
        "name": "Internal Audit",
        "description": "Department responsible for internal audit function",
        "code": "IA",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Department

**Endpoint**: `POST /departments`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Internal Audit Department",
  "description": "Department responsible for internal audit function",
  "code": "IA"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000008",
    "name": "Internal Audit Department",
    "description": "Department responsible for internal audit function",
    "code": "IA",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Assign Module to Department

**Endpoint**: `POST /departments/{id}/modules`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Department ID

**Request Body**:
```json
{
  "module_id": "00000000-0000-0000-0000-000000000010"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "department_id": "00000000-0000-0000-0000-000000000008",
    "module_id": "00000000-0000-0000-0000-000000000010",
    "assigned_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Get Department Modules

**Endpoint**: `GET /departments/{id}/modules`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Department ID

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000010",
        "name": "Risk Management Module",
        "description": "Module for risk identification and management"
      }
    ]
  }
}
```

### Modules

#### List Modules

**Endpoint**: `GET /modules`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000010",
        "name": "Risk Management Module",
        "description": "Module for risk identification and management",
        "status": "active",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Module

**Endpoint**: `POST /modules`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Risk Management Module",
  "description": "Module for risk identification and management",
  "status": "active"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000010",
    "name": "Risk Management Module",
    "description": "Module for risk identification and management",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Roles & Permissions

#### List Roles

**Endpoint**: `GET /roles`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page
- `search` (string, optional): Search by name

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000011",
        "name": "Audit Manager",
        "description": "Role for audit managers with oversight permissions",
        "organization_id": "00000000-0000-0000-0000-000000000004",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Role

**Endpoint**: `POST /roles`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Audit Manager",
  "description": "Role for audit managers with oversight permissions"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000011",
    "name": "Audit Manager",
    "description": "Role for audit managers with oversight permissions",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Grant Permission to Role

**Endpoint**: `POST /roles/{id}/permissions`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Role ID

**Request Body**:
```json
{
  "permission_id": "00000000-0000-0000-0000-000000000012",
  "permission_name": "audit_review"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "role_id": "00000000-0000-0000-0000-000000000011",
    "permission_id": "00000000-0000-0000-0000-000000000012",
    "permission_name": "audit_review",
    "assigned_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Get Role Permissions

**Endpoint**: `GET /roles/{id}/permissions`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Role ID

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000012",
        "name": "audit_review",
        "description": "Can review and approve audits"
      }
    ]
  }
}
```

### Users

#### List Users

**Endpoint**: `GET /users`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page
- `search` (string, optional): Search by name or email
- `status` (string, optional): Filter by status (active, inactive, locked)

**Example Request**:
```
GET /users?page=1&limit=20&search=john&status=active
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000001",
        "username": "john.doe",
        "email": "john.doe@company.com",
        "first_name": "John",
        "last_name": "Doe",
        "status": "active",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create User

**Endpoint**: `POST /users`

**Headers Required**: Yes

**Request Body**:
```json
{
  "username": "john.doe",
  "email": "john.doe@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1-555-0123",
  "department": "Finance",
  "password": "InitialPassword123!"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000001",
    "username": "john.doe",
    "email": "john.doe@company.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1-555-0123",
    "department": "Finance",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Update User

**Endpoint**: `PUT /users/{id}`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): User ID

**Request Body**:
```json
{
  "email": "john.updated@company.com",
  "first_name": "John",
  "last_name": "Updated",
  "phone": "+1-555-9999"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000001",
    "username": "john.doe",
    "email": "john.updated@company.com",
    "first_name": "John",
    "last_name": "Updated",
    "phone": "+1-555-9999",
    "updated_at": "2025-01-15T10:35:00Z"
  }
}
```

#### Reset User Password

**Endpoint**: `PATCH /users/{id}/reset-password`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): User ID

**Request Body**:
```json
{
  "temporary_password": "TempPass123!@#",
  "send_to_email": true
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Password reset successfully. Temporary password sent to user email."
}
```

#### Lock User Account

**Endpoint**: `POST /users/{id}/lock`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): User ID

**Request Body**:
```json
{
  "reason": "Account locked for security review",
  "locked_by": "admin",
  "lock_reason": "Account security incident"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "user_id": "00000000-0000-0000-0000-000000000001",
    "status": "locked",
    "locked_at": "2025-01-15T10:30:00Z",
    "lock_reason": "Account security incident"
  }
}
```

#### Unlock User Account

**Endpoint**: `POST /users/{id}/unlock`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): User ID

**Request Body**:
```json
{
  "reason": "Account unlocked after verification",
  "unlocked_by": "admin"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "user_id": "00000000-0000-0000-0000-000000000001",
    "status": "active",
    "unlocked_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Assign Role to User

**Endpoint**: `POST /users/{id}/assign-role`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): User ID

**Request Body**:
```json
{
  "role_id": "00000000-0000-0000-0000-000000000011",
  "effective_date": "2025-01-15T00:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "user_id": "00000000-0000-0000-0000-000000000001",
    "role_id": "00000000-0000-0000-0000-000000000011",
    "assigned_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Assign Branch to User

**Endpoint**: `POST /users/{id}/assign-branch`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): User ID

**Request Body**:
```json
{
  "branch_id": "00000000-0000-0000-0000-000000000006",
  "effective_date": "2025-01-15T00:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "user_id": "00000000-0000-0000-0000-000000000001",
    "branch_id": "00000000-0000-0000-0000-000000000006",
    "assigned_at": "2025-01-15T10:30:00Z"
  }
}
```

---

## Risk Management

### Risk Categories

#### List Risk Categories

**Endpoint**: `GET /risk-categories`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000013",
        "name": "Operational Risk",
        "description": "Risk related to failures in processes, people, or systems",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Risk Category

**Endpoint**: `POST /risk-categories`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Operational Risk",
  "description": "Risk related to failures in processes, people, or systems"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000013",
    "name": "Operational Risk",
    "description": "Risk related to failures in processes, people, or systems",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Risks

#### List Risks

**Endpoint**: `GET /risks`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page
- `search` (string, optional): Search by title
- `category_id` (string, optional): Filter by category
- `status` (string, optional): Filter by status (open, mitigated, accepted)
- `rating` (string, optional): Filter by rating (low, medium, high, critical)

**Example Request**:
```
GET /risks?page=1&limit=20&category_id=00000000-0000-0000-0000-000000000013&status=open
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000014",
        "title": "Financial Reporting Risk",
        "description": "Risk of material misstatement in financial reporting due to inadequate controls",
        "category_id": "00000000-0000-0000-0000-000000000013",
        "owner": "CFO",
        "inherent_rating": "high",
        "residual_rating": "medium",
        "status": "open",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Risk (Full)

**Endpoint**: `POST /risks`

**Headers Required**: Yes

**Request Body**:
```json
{
  "title": "Financial Reporting Risk",
  "description": "Risk of material misstatement in financial reporting due to inadequate controls",
  "category_id": "00000000-0000-0000-0000-000000000013",
  "inherent_rating": "high",
  "owner": "CFO",
  "likelihood": "medium",
  "impact": "high"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000014",
    "title": "Financial Reporting Risk",
    "description": "Risk of material misstatement in financial reporting due to inadequate controls",
    "category_id": "00000000-0000-0000-0000-000000000013",
    "inherent_rating": "high",
    "owner": "CFO",
    "status": "open",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Create Risk (Step 1)

**Endpoint**: `POST /risks/step-one`

**Headers Required**: Yes

**Request Body**:
```json
{
  "title": "Financial Reporting Risk",
  "description": "Risk of material misstatement in financial reporting",
  "department": "Finance"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000014",
    "title": "Financial Reporting Risk",
    "description": "Risk of material misstatement in financial reporting",
    "department": "Finance",
    "status": "incomplete",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Add Risk Evaluation (Step 2)

**Endpoint**: `PUT /risks/{id}/step-two`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Risk ID

**Request Body**:
```json
{
  "likelihood": "medium",
  "impact": "high",
  "inherent_rating": "high",
  "notes": "Risk assessment complete"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000014",
    "title": "Financial Reporting Risk",
    "likelihood": "medium",
    "impact": "high",
    "inherent_rating": "high",
    "updated_at": "2025-01-15T10:35:00Z"
  }
}
```

#### Add Risk Response (Step 3)

**Endpoint**: `PUT /risks/{id}/step-three`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Risk ID

**Request Body**:
```json
{
  "response_strategy": "mitigate",
  "owner": "Finance Director",
  "action_plan": "Implement controls",
  "target_date": "2025-03-31"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000014",
    "title": "Financial Reporting Risk",
    "response_strategy": "mitigate",
    "owner": "Finance Director",
    "target_date": "2025-03-31",
    "status": "complete",
    "updated_at": "2025-01-15T10:35:00Z"
  }
}
```

#### Create Risk Response

**Endpoint**: `POST /risk-responses`

**Headers Required**: Yes

**Request Body**:
```json
{
  "response_strategy": "mitigate",
  "owner": "Finance Director",
  "action": "Implement additional reconciliation controls and monthly management reviews",
  "target_date": "2025-03-31",
  "status": "in_progress"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000015",
    "response_strategy": "mitigate",
    "owner": "Finance Director",
    "action": "Implement additional reconciliation controls and monthly management reviews",
    "target_date": "2025-03-31",
    "status": "in_progress",
    "created_at": "2025-01-15T10:30:00Z",
    "created_by": "00000000-0000-0000-0000-000000000001"
  }
}
```

#### Accept Risk

**Endpoint**: `POST /risks/{id}/accept`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Risk ID

**Request Body**:
```json
{
  "acceptance_reason": "Risk within acceptable limits",
  "accepted_by": "risk_officer",
  "acceptance_date": "2025-01-15T00:00:00Z"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "risk_id": "00000000-0000-0000-0000-000000000014",
    "status": "accepted",
    "acceptance_reason": "Risk within acceptable limits",
    "accepted_at": "2025-01-15T10:30:00Z"
  }
}
```

### Risk Registers

#### Create Risk Register

**Endpoint**: `POST /risk-registers`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Enterprise Risk Register 2025",
  "year": 2025,
  "status": "open",
  "owner": "Risk Management Committee"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000016",
    "name": "Enterprise Risk Register 2025",
    "year": 2025,
    "status": "open",
    "owner": "Risk Management Committee",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### List Risk Registers

**Endpoint**: `GET /risk-registers`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page
- `status` (string, optional): Filter by status

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000016",
        "name": "Enterprise Risk Register 2025",
        "year": 2025,
        "status": "open",
        "owner": "Risk Management Committee",
        "total_risks": 15,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Close Risk Register

**Endpoint**: `POST /risk-registers/{id}/close`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Risk Register ID

**Request Body**:
```json
{
  "closure_reason": "Period closed for review cycle",
  "status": "closed",
  "closed_date": "2025-01-15T00:00:00Z"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000016",
    "name": "Enterprise Risk Register 2025",
    "status": "closed",
    "closed_at": "2025-01-15T10:30:00Z"
  }
}
```

### Risk Controls

#### Create Risk Control

**Endpoint**: `POST /risks/{riskId}/controls`

**Headers Required**: Yes

**Path Parameters**:
- `riskId` (string, required): Risk ID

**Request Body**:
```json
{
  "title": "Monthly Bank Reconciliation",
  "description": "Control for validating bank transactions",
  "frequency": "monthly",
  "owner": "Finance Manager"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000017",
    "risk_id": "00000000-0000-0000-0000-000000000014",
    "title": "Monthly Bank Reconciliation",
    "description": "Control for validating bank transactions",
    "frequency": "monthly",
    "owner": "Finance Manager",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

## Audit Module

### Strategic Pillars

#### List Strategic Pillars

**Endpoint**: `GET /audit/strategic-pillars`

**Headers Required**: Yes

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000018",
        "name": "Organizational Excellence",
        "description": "Strategic pillar focused on achieving organizational excellence and operational efficiency",
        "status": "active",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Create Strategic Pillar

**Endpoint**: `POST /audit/strategic-pillars`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Organizational Excellence",
  "description": "Strategic pillar focused on achieving organizational excellence and operational efficiency",
  "status": "active"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000018",
    "name": "Organizational Excellence",
    "description": "Strategic pillar focused on achieving organizational excellence and operational efficiency",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Create Strategic Initiative

**Endpoint**: `POST /audit/strategic-pillars/{pillarId}/initiatives`

**Headers Required**: Yes

**Path Parameters**:
- `pillarId` (string, required): Strategic Pillar ID

**Request Body**:
```json
{
  "name": "Digital Transformation Initiative",
  "description": "Strategic initiative for digital transformation",
  "status": "active"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000019",
    "pillar_id": "00000000-0000-0000-0000-000000000018",
    "name": "Digital Transformation Initiative",
    "description": "Strategic initiative for digital transformation",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Audit Configuration

#### Create Auditable Area

**Endpoint**: `POST /audit/auditable-areas`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "IT Systems and Controls",
  "description": "Auditable area covering IT systems, infrastructure, and control environment",
  "status": "active"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000020",
    "name": "IT Systems and Controls",
    "description": "Auditable area covering IT systems, infrastructure, and control environment",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Create Indicative Target

**Endpoint**: `POST /audit/indicative-targets`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "IT Control Testing",
  "description": "Indicative target for testing IT controls and system access",
  "area_id": "00000000-0000-0000-0000-000000000020",
  "status": "active"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000021",
    "name": "IT Control Testing",
    "description": "Indicative target for testing IT controls and system access",
    "area_id": "00000000-0000-0000-0000-000000000020",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Create Universe Item

**Endpoint**: `POST /audit/universe-items`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "SAP Financial System",
  "description": "Universe item representing the SAP financial system for audit planning",
  "target_id": "00000000-0000-0000-0000-000000000021",
  "status": "active"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000022",
    "name": "SAP Financial System",
    "description": "Universe item representing the SAP financial system for audit planning",
    "target_id": "00000000-0000-0000-0000-000000000021",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Audit Plans

#### Create Audit Plan

**Endpoint**: `POST /audit-plans`

**Headers Required**: Yes

**Request Body**:
```json
{
  "year": 2025,
  "status": "draft",
  "scope": "Internal audit plan covering financial, operational, and IT audit areas",
  "budget_id": "00000000-0000-0000-0000-000000000023"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000024",
    "year": 2025,
    "status": "draft",
    "scope": "Internal audit plan covering financial, operational, and IT audit areas",
    "budget_id": "00000000-0000-0000-0000-000000000023",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### List Audit Plans

**Endpoint**: `GET /audit-plans`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page
- `status` (string, optional): Filter by status

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000024",
        "year": 2025,
        "status": "draft",
        "scope": "Internal audit plan covering financial, operational, and IT audit areas",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Submit Audit Plan

**Endpoint**: `POST /audit-plans/{id}/submit`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Audit Plan ID

**Request Body**:
```json
{
  "submission_date": "2025-01-15T00:00:00Z",
  "submitted_by": "audit_manager",
  "comments": "Ready for review"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000024",
    "status": "submitted",
    "submitted_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Approve Audit Plan (HIAR)

**Endpoint**: `POST /audit-plans/{id}/approve/hiar`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Audit Plan ID

**Request Body**:
```json
{
  "approval_status": "approved",
  "approval_level": "hiar",
  "comments": "Approved at HIAR level"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000024",
    "status": "approved_hiar",
    "approved_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Approve Audit Plan (CEO)

**Endpoint**: `POST /audit-plans/{id}/approve/ceo`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Audit Plan ID

**Request Body**:
```json
{
  "approval_status": "approved",
  "approval_level": "ceo",
  "comments": "Approved at CEO level"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000024",
    "status": "approved_ceo",
    "approved_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Reject Audit Plan

**Endpoint**: `POST /audit-plans/{id}/reject`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Audit Plan ID

**Request Body**:
```json
{
  "reason": "Does not meet current requirements",
  "comments": "Please revise and resubmit"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000024",
    "status": "rejected",
    "rejected_at": "2025-01-15T10:30:00Z",
    "rejection_reason": "Does not meet current requirements"
  }
}
```

#### Activate Audit Plan

**Endpoint**: `POST /audit-plans/{id}/activate`

**Headers Required**: Yes

**Path Parameters**:
- `id` (string, required): Audit Plan ID

**Request Body**:
```json
{
  "activation_date": "2025-01-15T00:00:00Z",
  "status": "active",
  "started_by": "audit_director"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000024",
    "status": "active",
    "activated_at": "2025-01-15T10:30:00Z"
  }
}
```

### Audit Budget

#### Create Audit Budget

**Endpoint**: `POST /audit/budgets`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "FY2025 Audit Budget",
  "year": 2025,
  "amount": 500000,
  "status": "draft",
  "description": "Annual audit budget allocation for 2025"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000023",
    "name": "FY2025 Audit Budget",
    "year": 2025,
    "amount": 500000,
    "status": "draft",
    "description": "Annual audit budget allocation for 2025",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Approve Audit Budget

**Endpoint**: `POST /audit/budgets/{budgetId}/approve`

**Headers Required**: Yes

**Path Parameters**:
- `budgetId` (string, required): Budget ID

**Request Body**:
```json
{
  "reason": "Request meets approval criteria",
  "comments": "Approved based on audit review"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000023",
    "status": "approved",
    "approved_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Create Budget Line Item

**Endpoint**: `POST /audit/budgets/{budgetId}/lines`

**Headers Required**: Yes

**Path Parameters**:
- `budgetId` (string, required): Budget ID

**Request Body**:
```json
{
  "description": "Audit field work",
  "amount": 75000,
  "category": "Staff Costs"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000025",
    "budget_id": "00000000-0000-0000-0000-000000000023",
    "description": "Audit field work",
    "amount": 75000,
    "category": "Staff Costs",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### Update Budget Line Spent

**Endpoint**: `PUT /audit/budget-lines/{lineId}/spent`

**Headers Required**: Yes

**Path Parameters**:
- `lineId` (string, required): Budget Line ID

**Request Body**:
```json
{
  "amount": 25000,
  "currency": "USD",
  "date_spent": "2025-01-15T00:00:00Z"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "00000000-0000-0000-0000-000000000025",
    "budget_id": "00000000-0000-0000-0000-000000000023",
    "amount_allocated": 75000,
    "amount_spent": 25000,
    "remaining": 50000,
    "updated_at": "2025-01-15T10:35:00Z"
  }
}
```

---

## Working Papers

### Working Paper Templates

#### Create Template

**Endpoint**: `POST /working-paper-templates`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Audit Program Template",
  "description": "Template for audit program development",
  "category": "audit_program"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000026",
    "name": "Audit Program Template",
    "description": "Template for audit program development",
    "category": "audit_program",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Working Papers

#### Create Working Paper

**Endpoint**: `POST /working-papers`

**Headers Required**: Yes

**Request Body**:
```json
{
  "title": "Controls Testing - General Ledger",
  "template_id": "00000000-0000-0000-0000-000000000026",
  "audit_plan_id": "00000000-0000-0000-0000-000000000024",
  "status": "in_progress"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000027",
    "title": "Controls Testing - General Ledger",
    "template_id": "00000000-0000-0000-0000-000000000026",
    "audit_plan_id": "00000000-0000-0000-0000-000000000024",
    "status": "in_progress",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

#### List Working Papers

**Endpoint**: `GET /working-papers`

**Headers Required**: Yes

**Query Parameters**:
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page
- `audit_plan_id` (string, optional): Filter by audit plan

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "id": "00000000-0000-0000-0000-000000000027",
        "title": "Controls Testing - General Ledger",
        "audit_plan_id": "00000000-0000-0000-0000-000000000024",
        "status": "in_progress",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Working Paper Finding

**Endpoint**: `POST /working-paper-findings`

**Headers Required**: Yes

**Request Body**:
```json
{
  "title": "Finding: Incomplete Reconciliation Documentation",
  "description": "Monthly bank reconciliations lack supporting documentation for reconciling items",
  "working_paper_id": "00000000-0000-0000-0000-000000000027",
  "severity": "medium",
  "finding_type": "control_deficiency"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000028",
    "title": "Finding: Incomplete Reconciliation Documentation",
    "description": "Monthly bank reconciliations lack supporting documentation for reconciling items",
    "working_paper_id": "00000000-0000-0000-0000-000000000027",
    "severity": "medium",
    "finding_type": "control_deficiency",
    "status": "open",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

## Workflows

### Create Workflow

**Endpoint**: `POST /workflows`

**Headers Required**: Yes

**Request Body**:
```json
{
  "name": "Audit Finding Approval Workflow",
  "description": "Workflow for reviewing and approving audit findings",
  "status": "active"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000029",
    "name": "Audit Finding Approval Workflow",
    "description": "Workflow for reviewing and approving audit findings",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Create Workflow State

**Endpoint**: `POST /workflows/states`

**Headers Required**: Yes

**Request Body**:
```json
{
  "state_name": "In Review",
  "description": "Workflow state for items under review",
  "order": 2
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000030",
    "state_name": "In Review",
    "description": "Workflow state for items under review",
    "order": 2,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Create Workflow Transition

**Endpoint**: `POST /workflows/transitions`

**Headers Required**: Yes

**Request Body**:
```json
{
  "from_state": "Draft",
  "to_state": "In Review",
  "transition_name": "Submit for Review",
  "description": "Transition to review state"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000031",
    "from_state": "Draft",
    "to_state": "In Review",
    "transition_name": "Submit for Review",
    "description": "Transition to review state",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Create Workflow Trigger

**Endpoint**: `POST /workflows/transitions/triggers`

**Headers Required**: Yes

**Request Body**:
```json
{
  "trigger_name": "On Approval",
  "trigger_type": "approval",
  "action": "notify_stakeholders",
  "description": "Trigger when item is approved"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": "00000000-0000-0000-0000-000000000032",
    "trigger_name": "On Approval",
    "trigger_type": "approval",
    "action": "notify_stakeholders",
    "description": "Trigger when item is approved",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

## Common Patterns

### Pagination

All list endpoints support pagination:

**Query Parameters**:
```
GET /risks?page=2&limit=50
```

**Response Format**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 50,
      "total": 250,
      "pages": 5
    }
  }
}
```

### Search & Filtering

Most list endpoints support search and filtering:

```
GET /users?search=john&status=active&page=1&limit=20
GET /risks?category_id=xxx&status=open&rating=high
GET /audit-plans?status=draft
```

### Error Handling

**Common Error Codes**:

- `400` - Bad Request: Invalid parameters or request body
- `401` - Unauthorized: Missing or invalid token
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource doesn't exist
- `409` - Conflict: Resource already exists
- `500` - Server Error: Internal server error

**Error Response Example**:
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

### Status Codes Summary

| Code | Meaning | Use Case |
|------|---------|----------|
| `200` | OK | GET, PUT, PATCH successful |
| `201` | Created | POST successful |
| `204` | No Content | DELETE successful |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | No permission |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists |
| `500` | Server Error | Server error |

---

## Best Practices

### 1. Token Management

```javascript
// Store token securely
localStorage.setItem('authToken', token);

// Add to all requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'X-Organization-ID': organizationId,
  'X-User-ID': userId
};

// Refresh token periodically
// Implement token refresh logic
```

### 2. Error Handling

```javascript
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
      }
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Show user-friendly error message
  }
}
```

### 3. Request Structure

```javascript
const apiRequest = async (method, endpoint, data = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      'X-Organization-ID': getOrgId(),
      'X-User-ID': getUserId()
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(
    `http://localhost:8080/api/v1${endpoint}`,
    options
  );

  return response.json();
};

// Usage
const user = await apiRequest('POST', '/users', {
  username: 'john.doe',
  email: 'john@company.com'
});
```

### 4. Timeout Handling

```javascript
const apiCallWithTimeout = async (url, options, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return await response.json();
  } finally {
    clearTimeout(id);
  }
};
```

---

## Troubleshooting

### Common Issues

**"401 Unauthorized"**
- Check if token is valid and not expired
- Ensure token is included in Authorization header
- Use `GET /auth/refresh-token` to get new token

**"403 Forbidden"**
- Verify user has required permissions
- Check user role assignments
- Ensure organization_id matches user's organization

**"404 Not Found"**
- Verify resource ID is correct
- Check if resource has been deleted
- Ensure endpoint path is correct

**"400 Bad Request"**
- Validate request body matches expected format
- Check all required fields are provided
- Ensure data types are correct

---

## Support

For questions or issues:
1. Check this guide first
2. Review the API logs
3. Verify request/response format
4. Contact API support team

---

**Document Version**: 2.0
**Last Updated**: November 1, 2024
**Status**: Production Ready
