# Risk Audit Management System - API Documentation

## Overview

This document outlines the RESTful API endpoints for the Risk Audit Management System. The system is built with Go, follows Clean Architecture principles, uses the standard `net/http` library, and leverages UUIDs for all primary keys. It features a robust, department-constrained Role-Based Access Control (RBAC) system.

## Base URL

All API requests should be prefixed with the base URL:
`http://localhost:8080`

## Authentication

All protected endpoints (unless otherwise noted) require a JSON Web Token (JWT) in the `Authorization` header.

**Header Example:**
`Authorization: Bearer <your_jwt_token>`

---

## Health Check

### Check Service Health (Public)

Verifies that the application is running and responsive.

-   **Endpoint:** `GET /health`
-   **Response:** `200 OK` with a plain text body:
    ```
    OK
    ```

---

## Authentication (Public & Protected)

### Register New User (Protected)

Registers a new user in the system.

-   **Endpoint:** `POST /api/v1/auth/register`
-   **Request Body:**
    ```json
    {
      "username": "john.doe",
      "email": "john.doe@example.com",
      "password": "securepassword123!",
      "first_name": "John",
      "last_name": "Doe",
      "branch_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "role_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12"
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
      "username": "john.doe",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "branch_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "role_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z"
    }
    ```

### Login (Public)

Authenticates a user and returns JWT access token or triggers MFA if enabled. The token contains user_id, department_id, role_id, and branch_id in the JWT claims.

-   **Endpoint:** `POST /api/v1/auth/login`
-   **Request Body:**
    ```json
    {
      "username": "john.doe",
      "password": "securepassword123!"
    }
    ```
    **OR**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "securepassword123!"
    }
    ```

-   **Response (MFA Disabled):** `200 OK`
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "message": "Authentication successful. Welcome back!",
      "mfa_required": false
    }
    ```

-   **Response (MFA Enabled):** `200 OK`
    ```json
    {
      "message": "Multi-factor authentication is enabled. Please check your email for the verification code to complete your sign-in.",
      "mfa_required": true
    }
    ```
    When MFA is enabled, a 6-digit OTP is sent to the user's email address. The OTP is valid for 10 minutes. Use the **Verify OTP** endpoint to complete authentication.

**JWT Token Claims:**
The access token contains the following claims:
- `user_id`: UUID of the authenticated user
- `username`: Username
- `email`: User email address
- `role_id`: UUID of user's role
- `department_id`: UUID of user's department
- `branch_id`: UUID of user's branch
- `exp`: Token expiration timestamp
- `iat`: Token issued at timestamp
- `nbf`: Token not before timestamp

### Verify OTP (Protected)

Verifies the one-time password (OTP) sent via email for multi-factor authentication and completes the login process.

-   **Endpoint:** `POST /api/v1/auth/verify-otp`
-   **Request Body:**
    ```json
    {
      "username": "john.doe",
      "otp": "123456"
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "message": "Authentication successful. Welcome back!",
      "mfa_required": false
    }
    ```
-   **Error Responses:**
    - `401 Unauthorized`: Invalid OTP or credentials
      ```json
      {"error": "invalid or expired OTP"}
      ```
    - `410 Gone`: OTP has expired
      ```json
      {"error": "OTP has expired"}
      ```

**Notes:**
- OTP is valid for 10 minutes from the time it was sent
- Each OTP can only be used once
- After successful verification, the OTP is cleared from the system
- If OTP expires, user must initiate login again to receive a new OTP

### Change Password (Protected)

Allows an authenticated user to change their own password.

-   **Endpoint:** `POST /api/v1/auth/change-password`
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
      "old_password": "current_secure_password",
      "new_password": "new_very_secure_password"
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "message": "Password changed successfully"
    }
    ```

### User Setup (Protected)

Retrieves complete user profile information including branch, department, role details, and accessible modules with permissions. This endpoint is called after login to set up the user interface with proper permissions and user context.

-   **Endpoint:** `GET /api/v1/auth/setup`
-   **Authentication:** Required (JWT Bearer token in Authorization header)
-   **Request Headers:**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
-   **Response:** `200 OK`
    ```json
    {
      "user": {
        "id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
        "username": "john.doe",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "branch_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
        "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
        "role_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "is_active": true,
        "is_ldap_user": false,
        "last_login": "2023-10-27T09:45:00Z",
        "created_at": "2023-10-27T10:00:00Z",
        "updated_at": "2023-10-27T10:00:00Z"
      },
      "branch": {
        "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
        "name": "Harare Branch",
        "code": "HRE",
        "province_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
        "address": "123 Main Street",
        "is_active": true
      },
      "department": {
        "id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
        "name": "Internal Audit",
        "code": "IA",
        "description": "Internal Audit Department",
        "is_active": true
      },
      "role": {
        "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
        "name": "Auditor",
        "code": "AUDITOR",
        "description": "Standard auditor role",
        "is_active": true
      },
      "permissions": [
        {
          "role_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
          "module_id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
          "can_view": true,
          "can_create": true,
          "can_edit": true,
          "can_delete": false,
          "can_approve": false,
          "can_export": true,
          "can_assign": false,
          "can_configure": false,
          "custom_permissions": {
            "can_run_reports": true
          },
          "granted_at": "2023-10-27T10:25:00Z",
          "granted_by": "e5f6a7b8-c9d0-4123-5678-90abcdef1234",
          "module": {
            "id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
            "module_code": "RISK_MGMT",
            "name": "Risk Management",
            "href": "/risks"
          }
        },
        {
          "role_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
          "module_id": "e5f6a7b8-c9d0-4123-5678-90abcdef1234",
          "can_view": true,
          "can_create": false,
          "can_edit": false,
          "can_delete": false,
          "can_approve": false,
          "can_export": false,
          "can_assign": false,
          "can_configure": false,
          "custom_permissions": null,
          "granted_at": "2023-10-27T10:25:00Z",
          "granted_by": "e5f6a7b8-c9d0-4123-5678-90abcdef1234",
          "module": {
            "id": "e5f6a7b8-c9d0-4123-5678-90abcdef1234",
            "module_code": "REPORTS",
            "name": "Reports",
            "href": "/reports"
          }
        }
      ]
    }
    ```

**Response Fields:**
- `user`: Complete user profile including all personal and organizational information
- `branch`: Branch details where the user is assigned
- `department`: Department details where the user belongs
- `role`: Role details assigned to the user
- `permissions`: Array of module permissions where `can_view` is true (only modules the user can access)

**Use Case:**
This endpoint is typically called immediately after successful login to:
1. Display user information in the UI
2. Set up the navigation menu based on accessible modules
3. Configure role-based access control on the frontend
4. Display branch and department context

**Notes:**
- Only returns modules where `can_view` is `true`
- Password hash is never included in the response
- User must have a valid JWT token in the Authorization header
- The user_id is extracted from the JWT token claims

---

## Branch Management (Protected)

### List All Branches

Retrieves a list of all branches, with optional filtering.

-   **Endpoint:** `GET /api/v1/branches`
-   **Query Parameters:**
    -   `province_id` (UUID, optional): Filter by province ID.
    -   `town_id` (UUID, optional): Filter by town ID.
    -   `is_active` (boolean, optional): Filter by active status (`true` or `false`).
    -   `limit` (int, optional): Maximum number of results (default: 50).
    -   `offset` (int, optional): Number of results to skip for pagination.
-   **Response:** `200 OK`
    ```json
    [
      {
        "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
        "name": "Harare Branch",
        "code": "HRE",
        "town_id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
        "province_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
        "province": "Central",
        "town": "Harare",
        "address": "123 Main Street",
        "is_active": true,
        "created_at": "2023-10-27T10:00:00Z",
        "updated_at": "2023-10-27T10:00:00Z"
      }
    ]
    ```

### Create Branch

Creates a new branch.

-   **Endpoint:** `POST /api/v1/branches`
-   **Request Body:**
    ```json
    {
      "name": "Harare Branch",
      "code": "HRE",
      "town_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "province_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "address": "123 Main Street",
      "province": "Central",
      "town": "Harare",
      "is_active": true
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "name": "Harare Branch",
      "code": "HRE",
      "town_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "province_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "address": "123 Main Street",
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:00:00Z",
      "province": "Central",
      "town": "Harare",
    }
    ```

### Get Branch by ID

Retrieves a single branch by its unique identifier.

-   **Endpoint:** `GET /api/v1/branches/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the branch.
-   **Response:** `200 OK`
    ```json
    {
      "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "name": "Harare Branch",
      "code": "HRE",
      "town_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "province_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "address": "123 Main Street",
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:00:00Z"
    }
    ```

### Update Branch

Updates an existing branch's details.

-   **Endpoint:** `PUT /api/v1/branches/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the branch to update.
-   **Request Body:**
    ```json
    {
      "name": "Harare Central Branch",
      "code": "HRE-C",
      "town_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "province_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "address": "456 Main Street, Harare",
      "is_active": true,
      "manager_id": null
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "name": "Harare Central Branch",
      "code": "HRE-C",
      "town_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "province_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "address": "456 Main Street, Harare",
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:05:00Z"
    }
    ```

### Delete Branch

Deletes a branch by its ID.

-   **Endpoint:** `DELETE /api/v1/branches/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the branch to delete.
-   **Response:** `204 No Content`

---

## Department Management (Protected)

### List All Departments

Retrieves a list of all departments, with optional filtering.

-   **Endpoint:** `GET /api/v1/departments`
-   **Query Parameters:**
    -   `parent_id` (UUID, optional): Filter by parent department to get sub-departments.
    -   `is_active` (boolean, optional): Filter by active status (`true` or `false`).
    -   `limit` (int, optional): Maximum number of results (default: 50).
    -   `offset` (int, optional): Number of results to skip for pagination.
-   **Response:** `200 OK`
    ```json
    [
      {
        "id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
        "name": "Internal Audit",
        "code": "IA",
        "description": "Internal Audit Department",
        "parent_id": null,
        "is_active": true,
        "created_at": "2023-10-27T10:00:00Z",
        "updated_at": "2023-10-27T10:00:00Z"
      }
    ]
    ```

### Create Department

Creates a new department. Can be a root department (`parent_id: null`) or a sub-department.

-   **Endpoint:** `POST /api/v1/departments`
-   **Request Body:**
    ```json
    {
      "name": "Internal Audit",
      "code": "IA",
      "description": "Internal Audit Department",
      "parent_id": null
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "name": "Internal Audit",
      "code": "IA",
      "description": "Internal Audit Department",
      "parent_id": null,
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "20_23-10-27T10:00:00Z"
    }
    ```

### Get Department by ID

Retrieves a single department by its unique identifier.

-   **Endpoint:** `GET /api/v1/departments/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the department.
-   **Response:** `200 OK`
    ```json
    {
      "id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "name": "Internal Audit",
      "code": "IA",
      "description": "Internal Audit Department",
      "parent_id": null,
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:00:00Z"
    }
    ```

### Update Department

Updates an existing department's details.

-   **Endpoint:** `PUT /api/v1/departments/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the department to update.
-   **Request Body:**
    ```json
    {
      "name": "Internal Audit & Risk",
      "code": "IAR",
      "description": "Combined Internal Audit and Risk Department",
      "parent_id": null,
      "is_active": true
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "name": "Internal Audit & Risk",
      "code": "IAR",
      "description": "Combined Internal Audit and Risk Department",
      "parent_id": null,
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:10:00Z"
    }
    ```

### Delete Department

Deletes a department by its ID.

-   **Endpoint:** `DELETE /api/v1/departments/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the department to delete.
-   **Response:** `204 No Content`

### Get Department Modules

Retrieves all modules that are assigned to a specific department.

-   **Endpoint:** `GET /api/v1/departments/{id}/modules`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the department.
-   **Response:** `200 OK`
    ```json
    [
      {
        "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "module_code": "USER_MGMT",
        "name": "User Management",
        "description": "Manage system users",
        "parent_module_id": null,
        "href": "/users",
        "icon": "users",
        "sort_order": 1,
        "is_active": true
      }
    ]
    ```

### Assign Module to Department

Assigns an existing module to a department, making it available for roles within that department.

-   **Endpoint:** `POST /api/v1/departments/{id}/modules`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the department.
-   **Request Body:**
    ```json
    {
      "module_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef"
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "message": "Module assigned successfully"
    }
    ```

### Remove Module from Department

Removes the assignment of a module from a department. The path parameter for department ID is `id`.

-   **Endpoint:** `DELETE /api/v1/departments/{dept_id}/modules/{module_id}`
-   **Path Parameters:**
    -   `dept_id` (UUID, required): The ID of the department.
    -   `module_id` (UUID, required): The ID of the module to remove.
-   **Response:** `204 No Content`

---

## Module Management (Protected)

### List All Modules

Retrieves a list of all modules. Can return a flat list or a hierarchical structure.

-   **Endpoint:** `GET /api/v1/modules`
-   **Query Parameters:**
    -   `hierarchy` (boolean, optional): If `true`, returns modules in a parent-child tree structure.
-   **Response:** `200 OK`
    *Flat List (`hierarchy=false` or omitted):*
    ```json
    [
      {
        "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "module_code": "USER_MGMT",
        "name": "User Management",
        "href": null,
        "parent_module_id": null
      },
      {
        "id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
        "module_code": "USER_CREATE",
        "name": "Create User",
        "href": "/users/create",
        "parent_module_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12"
      }
    ]
    ```
    *Hierarchical List (`hierarchy=true`):*
    ```json
    [
      {
        "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "module_code": "USER_MGMT",
        "name": "User Management",
        "href": null,
        "sub_modules": [
          {
            "id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
            "module_code": "USER_CREATE",
            "name": "Create User",
            "href": "/users/create",
            "parent_module_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12"
          }
        ]
      }
    ]
    ```

### Create Module

Creates a new module.

-   **Endpoint:** `POST /api/v1/modules`
-   **Request Body:**
    ```json
    {
      "module_code": "USER_MGMT",
      "name": "User Management",
      "description": "Manage system users",
      "parent_module_id": null,
      "href": "/users",
      "icon": "users",
      "sort_order": 1
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
      "module_code": "USER_MGMT",
      "name": "User Management",
      "description": "Manage system users",
      "parent_module_id": null,
      "href": "/users",
      "icon": "users",
      "sort_order": 1,
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z"
    }
    ```

### Get Module by ID

Retrieves a single module by its ID.

-   **Endpoint:** `GET /api/v1/modules/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the module.
-   **Response:** `200 OK`
    ```json
    {
      "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
      "module_code": "USER_MGMT",
      "name": "User Management",
      "description": "Manage system users",
      "parent_module_id": null,
      "href": "/users",
      "icon": "users",
      "sort_order": 1,
      "is_active": true
    }
    ```

### Update Module

Updates an existing module.

-   **Endpoint:** `PUT /api/v1/modules/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the module to update.
-   **Request Body:**
    ```json
    {
      "module_code": "USER_MGMT_UPD",
      "name": "User Management Updated",
      "description": "Updated description",
      "parent_module_id": null,
      "href": "/users",
      "icon": "users",
      "sort_order": 1,
      "is_active": true
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
      "module_code": "USER_MGMT_UPD",
      "name": "User Management Updated",
      "description": "Updated description",
      "parent_module_id": null,
      "href": "/users",
      "icon": "users",
      "sort_order": 1,
      "is_active": true,
      "updated_at": "2023-10-27T10:15:00Z"
    }
    ```

### Delete Module

Deletes a module by its ID.

-   **Endpoint:** `DELETE /api/v1/modules/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the module to delete.
-   **Response:** `204 No Content`

### Get Sub-Modules

Retrieves all sub-modules for a given parent module.

-   **Endpoint:** `GET /api/v1/modules/{id}/submodules`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the parent module.
-   **Response:** `200 OK`
    ```json
    [
      {
        "id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
        "module_code": "USER_CREATE",
        "name": "Create User",
        "href": "/users/create",
        "parent_module_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "is_active": true
      }
    ]
    ```

---

## Role Management (Protected)

### List All Roles

Retrieves a list of all roles, with optional filtering.

-   **Endpoint:** `GET /api/v1/roles`
-   **Query Parameters:**
    -   `department_id` (UUID, optional): Filter by department.
    -   `is_active` (boolean, optional): Filter by active status (`true` or `false`).
    -   `limit` (int, optional): Maximum number of results (default: 50).
    -   `offset` (int, optional): Number of results to skip for pagination.
-   **Response:** `200 OK`
    ```json
    [
      {
        "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
        "name": "Auditor",
        "code": "AUDITOR",
        "description": "Standard auditor role",
        "is_active": true,
        "created_at": "2023-10-27T10:00:00Z"
      }
    ]
    ```

### Create Role

Creates a new role within a specific department.

-   **Endpoint:** `POST /api/v1/roles`
-   **Request Body:**
    ```json
    {
      "department_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "name": "Auditor",
      "code": "AUDITOR",
      "description": "Standard auditor role"
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
      "department_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "name": "Auditor",
      "code": "AUDITOR",
      "description": "Standard auditor role",
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:00:00Z"
    }
    ```

### Get Role by ID

Retrieves a single role by its ID.

-   **Endpoint:** `GET /api/v1/roles/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the role.
-   **Response:** `200 OK`
    ```json
    {
      "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
      "department_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "name": "Auditor",
      "code": "AUDITOR",
      "description": "Standard auditor role",
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:00:00Z"
    }
    ```

### Update Role

Updates an existing role. The `department_id` cannot be changed.

-   **Endpoint:** `PUT /api/v1/roles/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the role to update.
-   **Request Body:**
    ```json
    {
      "name": "Senior Auditor",
      "code": "SR_AUDITOR",
      "description": "Senior auditor role",
      "is_active": true
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
      "department_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "name": "Senior Auditor",
      "code": "SR_AUDITOR",
      "description": "Senior auditor role",
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:20:00Z"
    }
    ```

### Delete Role

Deletes a role by its ID.

-   **Endpoint:** `DELETE /api/v1/roles/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the role to delete.
-   **Response:** `204 No Content`

### Get Role Permissions

Retrieves all module permissions for a specific role. **Important:** Only returns permissions for modules that are assigned to the role's department.

-   **Endpoint:** `GET /api/v1/roles/{id}/permissions`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the role.
-   **Response:** `200 OK`
    ```json
    [
      {
        "role_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "module_id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
        "can_view": true,
        "can_create": true,
        "can_edit": true,
        "can_delete": false,
        "can_approve": false,
        "can_export": true,
        "can_assign": false,
        "can_configure": false,
        "custom_permissions": {
          "can_run_reports": true
        },
        "granted_at": "2023-10-27T10:25:00Z",
        "granted_by": "e5f6a7b8-c9d0-4123-5678-90abcdef1234"
      }
    ]
    ```

### Grant or Update Permission to Role

Grants or updates permissions for a role on a specific module. **Important:** The module must be assigned to the role's department.

-   **Endpoint:** `POST /api/v1/roles/{id}/permissions`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the role.
-   **Request Body:**
    ```json
    {
      "module_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": false,
      "can_approve": false,
      "can_export": true,
      "can_assign": false,
      "can_configure": false,
      "custom_permissions": {
        "can_run_reports": true
      }
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "message": "Permission granted successfully"
    }
    ```

### Revoke Permission from Role

Removes all permissions for a role on a specific module. The path parameter for role ID is `id`.

-   **Endpoint:** `DELETE /api/v1/roles/{role_id}/permissions/{module_id}`
-   **Path Parameters:**
    -   `role_id` (UUID, required): The ID of the role.
    -   `module_id` (UUID, required): The ID of the module to remove.
-   **Response:** `204 No Content`

### Get Available Modules for Role

Retrieves a list of modules that can be assigned permissions for a given role. **Important:** Only returns modules that are assigned to the role's department.

-   **Endpoint:** `GET /api/v1/roles/{id}/available-modules`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the role.
-   **Response:** `200 OK`
    ```json
    [
      {
        "id": "d4e5f6a7-b8c9-4012-4567-890abcdef123",
        "module_code": "USER_MGMT",
        "name": "User Management",
        "description": "Manage system users",
        "href": "/users",
        "icon": "users",
        "is_active": true
      }
    ]
    ```

---

## User Management (Protected)

The following endpoints are defined in the architecture but are currently placeholders.

### List All Users

-   **Endpoint:** `GET /api/v1/users`
-   **Authentication:** Required (JWT)
-   **Status:** ✅ Ready

### Create User

-   **Endpoint:** `POST /api/v1/users`
-   **Authentication:** Required (JWT)
-   **Request Body:** (Same as `POST /api/v1/auth/register`)
-   **Status:** ✅ Ready

### Get User by ID

-   **Endpoint:** `GET /api/v1/users/{id}`
-   **Authentication:** Required (JWT)
-   **Status:** ✅ Ready

### Update User

-   **Endpoint:** `PUT /api/v1/users/{id}`
-   **Authentication:** Required (JWT)
-   **Status:** ✅ Ready

### Delete User

-   **Endpoint:** `DELETE /api/v1/users/{id}`
-   **Authentication:** Required (JWT)
-   **Status:** ✅ Ready

### Reset User Password

-   **Endpoint:** `PATCH /api/v1/users/{id}/reset-password`
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
      "new_password": "a_new_secure_password"
    }
    ```
-   **Status:** ✅ Ready

### Activate User

-   **Endpoint:** `PATCH /api/v1/users/{id}/activate`
-   **Authentication:** Required (JWT)
-   **Status:** ✅ Ready

### Deactivate User

-   **Endpoint:** `PATCH /api/v1/users/{id}/deactivate`
-   **Authentication:** Required (JWT)
-   **Status:** ✅ Ready

### Get User Effective Permissions

-   **Endpoint:** `GET /api/v1/users/{id}/permissions`
-   **Authentication:** Required (JWT)
-   **Status:** ✅ Ready

### Assign Role to User

-   **Endpoint:** `POST /api/v1/users/{id}/assign-role`
-   **Authentication:** Required (JWT)
-   **Request Body:** `{"role_id": "new-role-uuid"}`
-   **Status:** ✅ Ready

### Assign Branch to User

-   **Endpoint:** `POST /api/v1/users/{id}/assign-branch`
-   **Authentication:** Required (JWT)
-   **Request Body:** `{"branch_id": "new-branch-uuid"}`
-   **Status:** ✅ Ready

---

## Province & Town Management (Protected)

### Create Province

-   **Endpoint:** `POST /api/v1/provinces`
-   **Request Body:**
    ```json
    {
      "name": "Harare",
      "code": "HRE"
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "name": "Harare",
      "code": "HRE",
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:00:00Z"
    }
    ```

### List Provinces

-   **Endpoint:** `GET /api/v1/provinces`
-   **Query Parameters:**
    -   `is_active` (boolean, optional): Filter by active status.
-   **Response:** `200 OK`

### Get Province by ID

-   **Endpoint:** `GET /api/v1/provinces/{id}`
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the province.
-   **Response:** `200 OK`

### Get Provinces with Towns

Retrieves a list of all provinces, with their associated towns nested within each province object.

-   **Endpoint:** `GET /api/v1/provinces/with-towns`
-   **Response:** `200 OK`
    ```json
    [
      {
        "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
        "name": "Harare",
        "code": "HRE",
        "is_active": true,
        "towns": [
          {
            "id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
            "name": "Harare",
            "code": "HRE",
            "province_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
            "is_active": true
          }
        ]
      }
    ]
    ```

### Create Town

-   **Endpoint:** `POST /api/v1/towns`
-   **Request Body:**
    ```json
    {
      "name": "Harare",
      "code": "HRE",
      "province_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef"
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "name": "Harare",
      "code": "HRE",
      "province_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "is_active": true,
      "created_at": "2023-10-27T10:00:00Z",
      "updated_at": "2023-10-27T10:00:00Z"
    }
    ```

### List Towns

-   **Endpoint:** `GET /api/v1/towns`
-   **Query Parameters:**
    -   `province_id` (UUID, optional): Filter by province.
    -   `is_active` (boolean, optional): Filter by active status.

---

## Risk Category Management (Protected)

### List Risk Categories
-   **Endpoint:** `GET /api/v1/risk-categories`
-   **Query Parameters:**
    -   `department_id` (UUID, optional): Filter by department.
    -   `is_active` (boolean, optional): Filter by active status.

### Create Risk Category
-   **Endpoint:** `POST /api/v1/risk-categories`

### Get Risk Category by ID
-   **Endpoint:** `GET /api/v1/risk-categories/{id}`

### Update Risk Category
-   **Endpoint:** `PUT /api/v1/risk-categories/{id}`

### Delete Risk Category
-   **Endpoint:** `DELETE /api/v1/risk-categories/{id}`

### Get Department Risk Categories
-   **Endpoint:** `GET /api/v1/departments/{id}/risk-categories`

---

## Risk Management (Protected)

INFRATEL Risk Management Framework - Comprehensive risk register covering Risk Identification, Assessment, Response, and Closure tracking.

### List All Risks

Retrieves a list of all risks with comprehensive filtering options.

-   **Endpoint:** `GET /api/v1/risks`
-   **Authentication:** Required (JWT)
-   **Query Parameters:**
    -   `category_id` (UUID, optional): Filter by risk category
    -   `department_id` (UUID, optional): Filter by department
    -   `status` (string, optional): Filter by status (OPEN, CLOSED)
    -   `risk_response` (string, optional): Filter by response strategy (REDUCE, ACCEPT, TRANSFER, AVOID)
    -   `risk_appetite_status` (string, optional): Filter by appetite status (WITHIN, ABOVE)
    -   `inherent_rating` (string, optional): Filter by inherent risk rating (LOW, MEDIUM, HIGH)
    -   `residual_rating` (string, optional): Filter by residual risk rating (LOW, MEDIUM, HIGH)
    -   `limit` (integer, optional): Number of results to return (default: 20, max: 100)
    -   `offset` (integer, optional): Number of results to skip (default: 0)
-   **Response:** `200 OK`
    ```json
    [
      {
        "id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
        "title": "Cyber Security Breach Risk",
        "description": "Potential unauthorized access to sensitive company data",
        "category_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
        "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",

        "inherent_likelihood": 4,
        "inherent_impact": 5,
        "inherent_score": 20,
        "inherent_rating": "HIGH",

        "residual_likelihood": 2,
        "residual_impact": 3,
        "residual_score": 6,
        "residual_rating": "MEDIUM",

        "existing_controls": "Firewall, antivirus software, employee training",
        "control_effectiveness": 3,
        "treatment_plan": "Implement multi-factor authentication across all systems",
        "risk_response": "REDUCE",
        "risk_owner_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",

        "risk_appetite_status": "WITHIN",
        "target_closing_date": "2025-12-31",
        "revised_target_date": null,
        "date_closed": null,

        "status": "OPEN",
        "overdue_days": null,
        "review_date": "2025-11-30",
        "mitigation_cost": 50000.00,
        "latest_update": "MFA implementation phase 1 completed",

        "created_at": "2025-10-23T10:00:00Z",
        "updated_at": "2025-10-23T10:00:00Z",

        "category": {
          "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
          "name": "Information Systems Risks",
          "code": "IT_SECURITY",
          "color": "#A29BFE"
        },
        "department": {
          "id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
          "name": "Risk Management",
          "code": "RM"
        },
        "risk_owner": {
          "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@company.com"
        }
      }
    ]
    ```

### Create Risk

Creates a new risk following the INFRATEL Risk Register structure.

-   **Endpoint:** `POST /api/v1/risks`
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
      "title": "Cyber Security Breach Risk",
      "description": "Potential unauthorized access to sensitive company data",
      "category_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",

      "inherent_likelihood": 4,
      "inherent_impact": 5,

      "residual_likelihood": 2,
      "residual_impact": 3,

      "existing_controls": "Firewall, antivirus software, employee training",
      "control_effectiveness": 3,
      "treatment_plan": "Implement multi-factor authentication",
      "risk_response": "REDUCE",
      "risk_owner_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",

      "risk_appetite_status": "WITHIN",
      "target_closing_date": "2025-12-31",
      "review_date": "2025-11-30",
      "mitigation_cost": 50000.00
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "status": "success",
      "message": "Risk created successfully",
      "data": {
        "id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
        "title": "Cyber Security Breach Risk",
        "description": "Potential unauthorized access to sensitive company data",
        "category_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
        "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",

        "inherent_likelihood": 4,
        "inherent_impact": 5,
        "inherent_score": 20,
        "inherent_rating": "HIGH",

        "residual_likelihood": 2,
        "residual_impact": 3,
        "residual_score": 6,
        "residual_rating": "MEDIUM",

        "existing_controls": "Firewall, antivirus software, employee training",
        "control_effectiveness": 3,
        "treatment_plan": "Implement multi-factor authentication",
        "risk_response": "REDUCE",
        "risk_owner_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",

        "risk_appetite_status": "WITHIN",
        "target_closing_date": "2025-12-31",
        "revised_target_date": null,
        "date_closed": null,

        "status": "OPEN",
        "overdue_days": null,
        "review_date": "2025-11-30",
        "mitigation_cost": 50000.00,
        "latest_update": null,

        "created_at": "2025-10-23T11:00:00Z",
        "updated_at": "2025-10-23T11:00:00Z"
      }
    }
    ```

### Get Risk by ID

Retrieves a single risk with all details and relationships.

-   **Endpoint:** `GET /api/v1/risks/{id}`
-   **Authentication:** Required (JWT)
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the risk
-   **Response:** `200 OK`
    ```json
    {
      "id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
      "title": "Cyber Security Breach Risk",
      "description": "Potential unauthorized access to sensitive company data",
      "category_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",

      "inherent_likelihood": 4,
      "inherent_impact": 5,
      "inherent_score": 20,
      "inherent_rating": "HIGH",

      "residual_likelihood": 2,
      "residual_impact": 3,
      "residual_score": 6,
      "residual_rating": "MEDIUM",

      "existing_controls": "Firewall, antivirus software, employee training",
      "control_effectiveness": 3,
      "treatment_plan": "Implement multi-factor authentication across all systems",
      "risk_response": "REDUCE",
      "risk_owner_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",

      "risk_appetite_status": "WITHIN",
      "target_closing_date": "2025-12-31",
      "revised_target_date": null,
      "date_closed": null,

      "status": "OPEN",
      "overdue_days": null,
      "review_date": "2025-11-30",
      "mitigation_cost": 50000.00,
      "latest_update": "MFA implementation phase 1 completed",

      "created_at": "2025-10-23T10:00:00Z",
      "updated_at": "2025-10-23T10:00:00Z",

      "category": {
        "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
        "name": "Information Systems Risks",
        "code": "IT_SECURITY"
      },
      "department": {
        "id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
        "name": "Risk Management",
        "code": "RM"
      },
      "risk_owner": {
        "id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@company.com"
      }
    }
    ```

### Update Risk

Updates an existing risk. All fields are optional; only provided fields will be updated.

-   **Endpoint:** `PUT /api/v1/risks/{id}`
-   **Authentication:** Required (JWT)
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the risk to update
-   **Request Body:**
    ```json
    {
      "title": "Updated Cyber Security Risk",
      "description": "Updated description with more details",
      "residual_likelihood": 1,
      "residual_impact": 2,
      "latest_update": "MFA fully implemented across all departments",
      "status": "CLOSED",
      "date_closed": "2025-10-25",
      "revised_target_date": "2025-10-30"
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "status": "success",
      "message": "Risk updated successfully",
      "data": {
        "id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
        "title": "Updated Cyber Security Risk",
        "residual_score": 2,
        "residual_rating": "LOW",
        "status": "CLOSED",
        "date_closed": "2025-10-25",
        "updated_at": "2025-10-25T14:30:00Z"
      }
    }
    ```

### Delete Risk

Deletes a risk by its ID.

-   **Endpoint:** `DELETE /api/v1/risks/{id}`
-   **Authentication:** Required (JWT)
-   **Path Parameters:**
    -   `id` (UUID, required): The ID of the risk to delete
-   **Response:** `204 No Content`

### Get Risk Matrix (Simple)

> **Note:** This is a lightweight endpoint for simple aggregations. For detailed heatmaps with risk information and supporting context, use [Get Detailed Risk Heatmap](#get-detailed-risk-heatmap) instead.

Retrieves simple aggregated risk counts by rating for lightweight dashboard widgets.

-   **Endpoint:** `GET /api/v1/risks/matrix`
-   **Authentication:** Required (JWT)
-   **Use Cases:**
    - Simple dashboard widgets requiring only counts
    - Lightweight API calls with minimal data transfer
    - Quick health checks
-   **Response:** `200 OK`
    ```json
    {
      "low": 12,
      "medium": 25,
      "high": 8
    }
    ```

**For comprehensive heatmaps with details, see:** [Get Detailed Risk Heatmap](#get-detailed-risk-heatmap)

**Field Descriptions (INFRATEL Framework Mapping):**

- **RISK IDENTIFICATION**
  - `title`: Risk title/name
  - `description`: RISK DESCRIPTION - Brief summary of the risk
  - `category_id`: RISK CATEGORY (Strategic, Financial, Operational, etc.)
  - `department_id`: BUSINESS UNIT affected by risk
  - `created_at`: RISK DATE - Date first identified

- **INHERENT RISK (Before Mitigation)**
  - `inherent_likelihood`: LIKELIHOOD (PROBABILITY LEVEL) - 1 (LOW) to 5 (HIGH)
  - `inherent_impact`: IMPACT LEVEL - 1 (LOW) to 5 (HIGH)
  - `inherent_score`: INHERENT RISK score - Likelihood × Impact
  - `inherent_rating`: Risk magnitude (LOW/MEDIUM/HIGH) based on score

- **RESIDUAL RISK (After Controls)**
  - `residual_likelihood`: Likelihood after controls - 1 to 5
  - `residual_impact`: Impact after controls - 1 to 5
  - `residual_score`: Residual risk score
  - `residual_rating`: Risk magnitude after controls

- **RESPONSE TO RESIDUAL RISKS**
  - `existing_controls`: EXISTING CONTROLS description
  - `control_effectiveness`: EFFECTIVENESS LEVEL - 1 to 4 (Exposure Level)
  - `treatment_plan`: MITIGATION ACTION - What action to take
  - `risk_response`: RESPONSE - How to address (REDUCE, ACCEPT, TRANSFER, AVOID)
  - `risk_owner_id`: OWNER - Who's responsible
  - `risk_appetite_status`: RISK APPETITE STATUS (WITHIN/ABOVE)
  - `mitigation_cost`: ESTIMATED COST OF MITIGATION

- **CLOSURE TRACKING**
  - `target_closing_date`: TARGET CLOSIN & DATE
  - `revised_target_date`: REVISED TARGET & DATE
  - `date_closed`: DATE CLOSED (dd/mm/yy)
  - `status`: STATUS (OPEN/CLOSED)
  - `overdue_days`: OVERDUE DAYS (calculated)
  - `latest_update`: LATEST STATUS UPDATE / Action Taken

### Get Detailed Risk Heatmap

Retrieves a comprehensive 5x5 risk heatmap with detailed risk information and supporting context for each cell. This enhanced heatmap provides complete transparency into risk distribution, individual risk details, and statistical summaries.

-   **Endpoint:** `GET /api/v1/risks/heatmap`
-   **Authentication:** Required (JWT)
-   **Query Parameters:**
    - `type` (optional): "inherent" or "residual" (default: "inherent")
    - `register_id` (optional): UUID of specific risk register to filter by
-   **Response:** `200 OK`
    ```json
    {
      "status": "success",
      "message": "Heatmap generated successfully",
      "data": {
        "type": "inherent",
        "register_id": null,
        "metadata": {
          "title": "Inherent Risk Heatmap",
          "description": "Comprehensive inherent risk heatmap with detailed risk information",
          "register_name": null,
          "date_range": null,
          "total_risks": 45,
          "generated_at": "2025-10-24T00:30:00Z"
        },
        "matrix": [
          {
            "likelihood": 5,
            "impact": 5,
            "score": 25,
            "rating": "VERY_HIGH",
            "color": "red",
            "count": 3,
            "risks": [
              {
                "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
                "title": "Cybersecurity Breach",
                "description": "Potential data breach affecting customer information",
                "category_name": "IT Security",
                "department_name": "Information Technology",
                "risk_owner_name": "John Doe",
                "status": "OPEN",
                "risk_response": "REDUCE",
                "risk_appetite_status": "ABOVE",
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-10-20T15:30:00Z",
                "controls_count": 1,
                "mitigation_cost": 150000.00,
                "target_closing_date": "2025-12-31T00:00:00Z"
              }
            ]
          },
          {
            "likelihood": 4,
            "impact": 5,
            "score": 20,
            "rating": "VERY_HIGH",
            "color": "red",
            "count": 5,
            "risks": [...]
          },
          {
            "likelihood": 3,
            "impact": 3,
            "score": 9,
            "rating": "HIGH",
            "color": "orange",
            "count": 12,
            "risks": [...]
          }
        ],
        "summary": {
          "low_count": 8,
          "medium_count": 15,
          "high_count": 18,
          "very_high_count": 4,
          "average_score": 8.5,
          "highest_score": 25,
          "lowest_score": 2,
          "above_appetite_count": 12,
          "within_appetite_count": 33
        }
      }
    }
    ```

**Heatmap Structure:**

- **Metadata**: Contextual information about the heatmap
  - `title`: Descriptive title
  - `description`: Detailed description
  - `register_name`: Name of risk register (if filtered)
  - `date_range`: Start and end dates (for register-specific heatmaps)
  - `total_risks`: Total number of risks included
  - `generated_at`: Timestamp of heatmap generation

- **Matrix**: Array of 25 cells (5x5 grid) containing:
  - `likelihood`: Y-axis value (1-5)
  - `impact`: X-axis value (1-5)
  - `score`: Calculated risk score (likelihood × impact)
  - `rating`: Risk category (LOW, MEDIUM, HIGH, VERY_HIGH)
  - `color`: Visual indicator (green, yellow, orange, red)
  - `count`: Number of risks in this cell
  - `risks`: Array of detailed risk references

- **Risk References**: Each risk includes:
  - Core identification (id, title, description)
  - Categorization (category_name, department_name)
  - Ownership (risk_owner_name)
  - Status and response information
  - Controls and mitigation details
  - Financial information (mitigation_cost)
  - Timeline data (target_closing_date)

- **Summary Statistics**:
  - Risk distribution by rating (low, medium, high, very high)
  - Average, highest, and lowest scores
  - Risk appetite compliance (above vs within appetite)

**Use Cases:**
1. **Executive Dashboard**: High-level risk visualization with drill-down capability
2. **Risk Committee Reports**: Detailed risk distribution with supporting evidence
3. **Compliance Documentation**: Complete audit trail with risk context
4. **Trend Analysis**: Compare inherent vs residual risk heatmaps
5. **Register-Specific Analysis**: Focus on specific risk registers or timeframes

### Get Register-Specific Heatmap

Retrieves a detailed heatmap for risks within a specific risk register.

-   **Endpoint:** `GET /api/v1/risk-registers/{registerId}/heatmap`
-   **Authentication:** Required (JWT)
-   **Path Parameters:**
    - `registerId`: UUID of the risk register
-   **Query Parameters:**
    - `type` (optional): "inherent" or "residual" (default: "inherent")
-   **Response:** Same structure as detailed heatmap above, but filtered to the specified register

**Example Request:**
```
GET /api/v1/risk-registers/f6a7b8c9-d0e1-4234-6789-0abcdef12345/heatmap?type=residual
```

**Response includes register context:**
```json
{
  "status": "success",
  "message": "Register heatmap generated successfully",
  "data": {
    "type": "residual",
    "register_id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
    "metadata": {
      "title": "Residual Risk Heatmap - Q1 2025 Risk Assessment",
      "description": "Comprehensive residual risk heatmap with detailed risk information for register: Q1 2025 Risk Assessment",
      "register_name": "Q1 2025 Risk Assessment",
      "date_range": {
        "start_date": "2025-01-01T00:00:00Z",
        "end_date": "2025-03-31T00:00:00Z"
      },
      "total_risks": 23,
      "generated_at": "2025-10-24T00:30:00Z"
    },
    "matrix": [...],
    "summary": {...}
  }
}
```

**Rating Scale (INFRATEL Framework):**
- **Score 1-3**: LOW (Green) - Acceptable risk appetite
- **Score 4-6**: MEDIUM (Yellow) - Moderate/cautious tolerance
- **Score 7-15**: HIGH (Orange) - Close monitoring required
- **Score 16-25**: VERY_HIGH (Red) - Unacceptable risk tolerance

---

## Risk Register Management (Protected)

The Risk Register workflow enables structured risk management through three main steps:
1. **Initialize Risk Register** - Create a container for risks with timeline tracking
2. **Create Risks (3-Step Process)** - Guided risk creation from identification to response
3. **Department Approval & Closure** - Track department submissions and close register

### Initialize Risk Register

Creates a new risk register for a specific branch with timeline tracking.

-   **Endpoint:** `POST /api/v1/risk-registers`
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
      "branch_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "name": "Q1 2025 Risk Assessment",
      "start_date": "2025-01-01",
      "due_date": "2025-03-31"
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "status": "success",
      "message": "Risk register initialized successfully",
      "data": {
        "id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
        "branch_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
        "name": "Q1 2025 Risk Assessment",
        "start_date": "2025-01-01",
        "due_date": "2025-03-31",
        "status": "OPEN",
        "timeline_status": "ON_TRACK",
        "created_at": "2025-01-01T10:00:00Z",
        "updated_at": "2025-01-01T10:00:00Z"
      }
    }
    ```

### Get All Risk Registers

Retrieves all risk registers with pagination and filters.

-   **Endpoint:** `GET /api/v1/risk-registers`
-   **Authentication:** Required (JWT)
-   **Query Parameters:**
    -   `branch_id` (UUID, optional): Filter by branch
    -   `status` (string, optional): Filter by status (OPEN, CLOSED)
    -   `name` (string, optional): Search by name
    -   `page` (integer, optional): Page number (default: 1)
    -   `page_size` (integer, optional): Items per page (default: 20, max: 100)
-   **Response:** `200 OK`
    ```json
    {
      "status": "success",
      "message": "Risk registers retrieved successfully",
      "data": {
        "registers": [
          {
            "id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
            "branch_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
            "name": "Q1 2025 Risk Assessment",
            "start_date": "2025-01-01",
            "due_date": "2025-03-31",
            "status": "OPEN",
            "timeline_status": "ON_TRACK",
            "branch": {
              "id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
              "name": "Head Office",
              "code": "HO"
            },
            "created_at": "2025-01-01T10:00:00Z",
            "updated_at": "2025-01-01T10:00:00Z"
          }
        ],
        "total": 10,
        "page": 1,
        "page_size": 20,
        "total_pages": 1
      }
    }
    ```

### Get Risk Register by ID

Retrieves a specific risk register with department status tracking.

-   **Endpoint:** `GET /api/v1/risk-registers/{id}`
-   **Authentication:** Required (JWT)
-   **Response:** `200 OK`
    ```json
    {
      "status": "success",
      "message": "Risk register retrieved successfully",
      "data": {
        "register": {
          "id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
          "branch_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
          "name": "Q1 2025 Risk Assessment",
          "start_date": "2025-01-01",
          "due_date": "2025-03-31",
          "status": "OPEN",
          "timeline_status": "ON_TRACK",
          "created_at": "2025-01-01T10:00:00Z",
          "updated_at": "2025-01-01T10:00:00Z"
        },
        "department_statuses": {
          "Risk Management": {
            "OPEN": 5,
            "CLOSED": 2
          },
          "IT Department": {
            "OPEN": 3,
            "CLOSED": 1
          }
        }
      }
    }
    ```

### Update Risk Register

Updates an existing risk register.

-   **Endpoint:** `PUT /api/v1/risk-registers/{id}`
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
      "name": "Q1 2025 Risk Assessment - Updated",
      "start_date": "2025-01-01",
      "due_date": "2025-04-15",
      "status": "OPEN"
    }
    ```
-   **Response:** `200 OK`

### Close Risk Register

Closes a risk register after validating all departments have submitted their risks.

-   **Endpoint:** `POST /api/v1/risk-registers/{id}/close`
-   **Authentication:** Required (JWT)
-   **Response:** `200 OK` or `400 Bad Request` if departments haven't closed their risks
    ```json
    {
      "status": "error",
      "error": "cannot close register: the following departments still have open risks: Risk Management (5 open), IT Department (3 open)"
    }
    ```

### Delete Risk Register

Deletes a risk register (sets risk_register_id to NULL for associated risks).

-   **Endpoint:** `DELETE /api/v1/risk-registers/{id}`
-   **Authentication:** Required (JWT)
-   **Response:** `200 OK`

### Get Risk Registers by Branch

Retrieves all risk registers for a specific branch.

-   **Endpoint:** `GET /api/v1/branches/{branchId}/risk-registers`
-   **Authentication:** Required (JWT)
-   **Response:** `200 OK`

---

## Multi-Step Risk Creation Workflow (Protected)

The multi-step workflow guides users through creating comprehensive risks in three stages:
1. **Step 1: Risk Details** - Identification and categorization
2. **Step 2: Evaluation** - Inherent risk assessment and existing controls
3. **Step 3: Response** - Residual risk, mitigation, and ownership

All risks in this workflow start with status `DRAFT` and become `OPEN` after completing Step 3.

### Step 1: Create Risk Details

Creates a new risk in DRAFT status with identification information.

-   **Endpoint:** `POST /api/v1/risks/step-one`
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
      "risk_register_id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
      "title": "Data Center Power Failure",
      "description": "Risk of prolonged power outage affecting critical services",
      "category_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
      "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
      "macro_process": "Infrastructure Management",
      "sub_process": "Power Management",
      "strategic_objective": "Ensure 99.9% uptime for critical systems",
      "root_cause": "Aging UPS systems and lack of generator redundancy",
      "recurrence": "ongoing"
    }
    ```
-   **Response:** `201 Created`
    ```json
    {
      "status": "success",
      "message": "Risk Step 1 created successfully",
      "data": {
        "id": "g7h8i9j0-k1l2-5678-9012-3def456789ab",
        "risk_register_id": "f6a7b8c9-d0e1-4234-6789-0abcdef12345",
        "title": "Data Center Power Failure",
        "description": "Risk of prolonged power outage affecting critical services",
        "category_id": "a1b2c3d4-e5f6-4789-1234-567890abcdef",
        "department_id": "b2c3d4e5-f6a7-4890-2345-67890abcdef1",
        "macro_process": "Infrastructure Management",
        "sub_process": "Power Management",
        "strategic_objective": "Ensure 99.9% uptime for critical systems",
        "root_cause": "Aging UPS systems and lack of generator redundancy",
        "recurrence": "ongoing",
        "step": 1,
        "status": "DRAFT",
        "department_status": "OPEN",
        "created_at": "2025-01-15T10:00:00Z"
      }
    }
    ```

**Field Descriptions:**
- `risk_register_id`: **Required** - The risk register this risk belongs to
- `title`: **Required** - Short risk title
- `description`: **Required** - Detailed risk description
- `category_id`: **Required** - Risk category (from risk_categories)
- `department_id`: **Required** - Department owning this risk
- `macro_process`: **Optional** - High-level business process affected
- `sub_process`: **Optional** - Specific subprocess affected
- `strategic_objective`: **Optional** - Strategic goal this risk impacts
- `root_cause`: **Optional** - Underlying cause of the risk
- `recurrence`: **Optional** - "ongoing" or "one-time"

### Step 2: Add Risk Evaluation

Completes Step 2 by adding inherent risk assessment and existing controls.

-   **Endpoint:** `PUT /api/v1/risks/{id}/step-two`
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
      "inherent_likelihood": 4,
      "inherent_impact": 5,
      "existing_controls": "UPS systems, backup generator, monitoring systems",
      "control_effectiveness": 2
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "status": "success",
      "message": "Risk Step 2 completed successfully",
      "data": {
        "id": "g7h8i9j0-k1l2-5678-9012-3def456789ab",
        "title": "Data Center Power Failure",
        "inherent_likelihood": 4,
        "inherent_impact": 5,
        "inherent_score": 20,
        "inherent_rating": "HIGH",
        "existing_controls": "UPS systems, backup generator, monitoring systems",
        "control_effectiveness": 2,
        "step": 2,
        "status": "DRAFT"
      }
    }
    ```

**Field Descriptions:**
- `inherent_likelihood`: **Required** - Probability before controls (1-5)
- `inherent_impact`: **Required** - Impact before controls (1-5)
- `existing_controls`: **Optional** - Description of current controls
- `control_effectiveness`: **Optional** - Effectiveness level (1-4, where 1=most effective)

### Step 3: Complete Risk Response

Finalizes the risk by adding residual risk, mitigation plan, and ownership. Changes status to OPEN.

-   **Endpoint:** `PUT /api/v1/risks/{id}/step-three`
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
      "residual_likelihood": 2,
      "residual_impact": 3,
      "treatment_plan": "Upgrade UPS systems, install redundant generators, implement predictive maintenance",
      "risk_response": "REDUCE",
      "risk_owner_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
      "risk_appetite_status": "WITHIN",
      "target_closing_date": "2025-12-31",
      "mitigation_cost": 250000.00
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "status": "success",
      "message": "Risk Step 3 completed successfully. Risk is now OPEN.",
      "data": {
        "id": "g7h8i9j0-k1l2-5678-9012-3def456789ab",
        "title": "Data Center Power Failure",
        "residual_likelihood": 2,
        "residual_impact": 3,
        "residual_score": 6,
        "residual_rating": "MEDIUM",
        "treatment_plan": "Upgrade UPS systems, install redundant generators, implement predictive maintenance",
        "risk_response": "REDUCE",
        "risk_owner_id": "c3d4e5f6-a7b8-4901-3456-7890abcdef12",
        "risk_appetite_status": "WITHIN",
        "target_closing_date": "2025-12-31",
        "mitigation_cost": 250000.00,
        "step": 3,
        "status": "OPEN"
      }
    }
    ```

**Field Descriptions:**
- `residual_likelihood`: **Required** - Probability after controls (1-5)
- `residual_impact`: **Required** - Impact after controls (1-5)
- `treatment_plan`: **Optional** - Mitigation actions to be taken
- `risk_response`: **Required** - Response strategy: REDUCE, ACCEPT, TRANSFER, AVOID, OPTIMIZE
- `risk_owner_id`: **Required** - User responsible for managing this risk
- `risk_appetite_status`: **Optional** - WITHIN or ABOVE risk appetite
- `target_closing_date`: **Optional** - Target date for mitigation completion
- `mitigation_cost`: **Optional** - Estimated cost of mitigation

### Get Risks in Register

Retrieves all risks within a specific risk register.

-   **Endpoint:** `GET /api/v1/risk-registers/{registerId}/risks`
-   **Authentication:** Required (JWT)
-   **Response:** `200 OK`
    ```json
    {
      "status": "success",
      "message": "Risks retrieved successfully",
      "data": [
        {
          "id": "g7h8i9j0-k1l2-5678-9012-3def456789ab",
          "title": "Data Center Power Failure",
          "step": 3,
          "status": "OPEN",
          "department_status": "OPEN",
          "inherent_rating": "HIGH",
          "residual_rating": "MEDIUM"
        }
      ]
    }
    ```

### Update Risk Status

Updates the status of an individual risk.

-   **Endpoint:** `PUT /api/v1/risks/{id}/status`
-   **Authentication:** Required (JWT)
-   **Request Body:**
    ```json
    {
      "status": "CLOSED"
    }
    ```
-   **Response:** `200 OK`
    ```json
    {
      "status": "success",
      "message": "Risk status updated successfully",
      "data": null
    }
    ```

**Valid Status Values:** DRAFT, OPEN, CLOSED

### Submit Department Risks

Marks all risks from a specific department as submitted (closes department_status).

-   **Endpoint:** `POST /api/v1/risk-registers/{registerId}/departments/{departmentId}/submit`
-   **Authentication:** Required (JWT)
-   **Response:** `200 OK`
    ```json
    {
      "status": "success",
      "message": "Department risks submitted successfully",
      "data": null
    }
    ```

**Workflow:**
1. Department creates risks (Step 1-3)
2. Department reviews and finalizes all their risks
3. Department submits (this endpoint) - sets all their risks' `department_status` to CLOSED
4. Once all departments submit, the register can be closed

---

## KRI Register Management (Protected)

KRI Registers serve as parent containers for KRIs, typically representing reporting periods or organizational groupings (e.g., "Quarterly EMC Report Q1 2025", "Annual ARC Review 2025"). The hierarchy is: **KRI Register → KRI → KRI Measurements**.

### List KRI Registers
-   **Endpoint:** `GET /api/v1/kri-registers`
-   **Authentication:** Required (JWT)
-   **Query Parameters:**
    -   `is_active` (boolean, optional) - Filter by active status
    -   `limit` (int, optional) - Pagination limit (default: 50, max: 100)
    -   `offset` (int, optional) - Pagination offset

**Response Example:**
```json
[
  {
    "id": "uuid",
    "name": "Quarterly EMC Report Q1 2025",
    "description": "Executive Management Committee quarterly KRI tracking for Q1",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create KRI Register
-   **Endpoint:** `POST /api/v1/kri-registers`
-   **Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "Quarterly EMC Report Q1 2025",
  "description": "Executive Management Committee quarterly KRI tracking for Q1"
}
```

**Validation Rules:**
- `name` (required, string)
- `description` (optional, string)

### Get KRI Register by ID
-   **Endpoint:** `GET /api/v1/kri-registers/{id}`
-   **Authentication:** Required (JWT)

Returns complete KRI Register details including all associated KRIs.

### Update KRI Register
-   **Endpoint:** `PUT /api/v1/kri-registers/{id}`
-   **Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "Quarterly EMC Report Q1 2025 - Updated",
  "description": "Updated description",
  "is_active": true
}
```

### Delete KRI Register
-   **Endpoint:** `DELETE /api/v1/kri-registers/{id}`
-   **Authentication:** Required (JWT)
-   **Response:** 204 No Content

**Note:** Deleting a KRI Register does not delete associated KRIs; they will simply no longer have a register assignment.

---

## KRI (Key Risk Indicator) Management (Protected)

KRIs are measured **monthly** to monitor risk levels and trigger alerts when thresholds are breached. Each KRI belongs to a **Risk Category** and optionally to a **KRI Register**. The system implements the **INFRATEL Risk Management Framework** with a three-level threshold system.

### KRI Structure

Each KRI includes:
- **Basic Information**: Name, description, category assignment, KRI register assignment
- **INFRATEL Three-Level Threshold System** (Text-based for flexibility):
  - **Target Value** (Green Zone): Acceptable risk appetite (e.g., "10%", "4", "98.3% ≥ but > 98.1%")
  - **Trigger Value** (Amber Zone): Moderate/cautious tolerance (e.g., "9.5% ≥ but > 9%", "4 ≥ but > 3")
  - **Limit Value** (Red Zone): Unacceptable tolerance (e.g., "8.8%", "3", "98%")
- **Monitoring**: Frequency (Daily, Weekly, Monthly, Quarterly, Annually)
- **Management Fields**: Commentary, Mitigants/Action Plan
- **Calculated Metrics**: Average risk score (calculated from monthly measurements)

**Note:** Threshold values are stored as **text** to support various formats including percentages, numbers, ranges, and other custom criteria as per INFRATEL framework requirements.

### List KRIs
-   **Endpoint:** `GET /api/v1/kris`
-   **Authentication:** Required (JWT)
-   **Query Parameters:**
    -   `category_id` (UUID, optional) - Filter by risk category
    -   `department_id` (UUID, optional) - Filter by department
    -   `is_active` (boolean, optional) - Filter by active status
    -   `monitoring_frequency` (string, optional) - Filter by frequency
    -   `owner_id` (UUID, optional) - Filter by owner
    -   `last_status` (string, optional) - Filter by status (Green, Amber, Red)
    -   `limit` (int, optional) - Pagination limit (default: 50, max: 100)
    -   `offset` (int, optional) - Pagination offset

**Response Example:**
```json
[
  {
    "id": "uuid",
    "name": "Customer Retention Rate",
    "description": "Percentage of customers retained",
    "kri_register_id": "uuid",
    "category_id": "uuid",
    "department_id": "uuid",
    "target_value": "10%",
    "trigger_value": "9.5% ≥ but > 9%",
    "limit_value": "8.8%",
    "monitoring_frequency": "Monthly",
    "owner_id": "uuid",
    "is_active": true,
    "last_measured_date": "2025-01-15T00:00:00Z",
    "last_measured_value": 94.0,
    "last_status": "Amber",
    "commentary": "Performance within acceptable range",
    "mitigant_plan": "Continue current customer engagement strategies",
    "average_risk_score": 2.5,
    "category": {
      "id": "uuid",
      "name": "Strategic / Business Performance Risk",
      "code": "BPR",
      "color": "#FF5733"
    },
    "kri_register": {
      "id": "uuid",
      "name": "Quarterly EMC Report Q1 2025",
      "description": "Executive Management Committee quarterly KRI tracking"
    },
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

### Create KRI
-   **Endpoint:** `POST /api/v1/kris`
-   **Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "Customer Retention Rate",
  "description": "Percentage of customers retained annually",
  "kri_register_id": "uuid",
  "category_id": "uuid",
  "department_id": "uuid",
  "target_value": "95%",
  "trigger_value": "90% ≥ but > 85%",
  "limit_value": "85%",
  "monitoring_frequency": "Monthly",
  "owner_id": "uuid",
  "commentary": "Initial setup for customer retention tracking",
  "mitigant_plan": "Implement customer feedback survey quarterly"
}
```

**Validation Rules:**
- `name` (required, string)
- `target_value` (optional, string) - Green zone threshold (text format: can be "95%", "4", "98.3% ≥ but > 98.1%", etc.)
- `trigger_value` (optional, string) - Amber zone threshold (text format: can be "90%", "3 ≥ but > 2", ranges, etc.)
- `limit_value` (optional, string) - Red zone threshold (text format: flexible text representation)
- `monitoring_frequency` (required, one of: Daily, Weekly, Monthly, Quarterly, Annually)
- `kri_register_id` (optional, must reference existing KRI register)
- `category_id` (optional, must reference existing risk category)
- `department_id` (optional, must reference existing department)

**How Threshold Zones Work:**
The three threshold values use **text format** for maximum flexibility. They can contain:
- Simple values: `"10%"`, `"4"`, `"0.5%"`
- Ranges: `"98.3% ≥ but > 98.1%"`, `"4 ≥ but > 3"`, `"9.5% ≥ but > 9%"`
- Any other text representation needed for your KRI measurement criteria

**Examples from INFRATEL Framework:**
- Customer Retention: `target_value: "10%"`, `trigger_value: "9.5% ≥ but > 9%"`, `limit_value: "8.8%"`
- Service Quality Score: `target_value: "4"`, `trigger_value: "4 ≥ but > 3"`, `limit_value: "3"`
- Availability: `target_value: "99.98%"`, `trigger_value: "99.95% ≥ but > 99.90%"`, `limit_value: "99%"`

### Get KRI by ID
-   **Endpoint:** `GET /api/v1/kris/{id}`
-   **Authentication:** Required (JWT)

Returns complete KRI details including relationships (category, department, owner) and calculated average risk score.

### Update KRI
-   **Endpoint:** `PUT /api/v1/kris/{id}`
-   **Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "Customer Retention Rate",
  "description": "Updated description",
  "kri_register_id": "uuid",
  "category_id": "uuid",
  "department_id": "uuid",
  "target_value": "10%",
  "trigger_value": "9.5% ≥ but > 9%",
  "limit_value": "8.8%",
  "monitoring_frequency": "Monthly",
  "owner_id": "uuid",
  "commentary": "Updated commentary after Q1 review",
  "mitigant_plan": "Enhanced action plan with quarterly reviews",
  "is_active": true
}
```

### Delete KRI
-   **Endpoint:** `DELETE /api/v1/kris/{id}`
-   **Authentication:** Required (JWT)
-   **Response:** 204 No Content

### Add KRI Measurement
-   **Endpoint:** `POST /api/v1/kris/{id}/measurements`
-   **Authentication:** Required (JWT)

**Request Body:**
```json
{
  "measurement_date": "2025-01-31T00:00:00Z",
  "measured_value": 94.0,
  "status": "Green",
  "notes": "January performance exceeded target",
  "measured_by": "uuid"
}
```

**Status Values:**
- `Green` - Target: Acceptable risk appetite rating set by Board and Management
- `Amber` - Trigger: Moderate/cautious risk tolerance before limit is breached
- `Red` - Limit: Unacceptable risk tolerance rating that Company is not willing to accept

**Note:** Adding a measurement automatically updates the KRI's `last_measured_date`, `last_measured_value`, `last_status`, and recalculates the `average_risk_score`.

### Get KRI Measurements
-   **Endpoint:** `GET /api/v1/kris/{id}/measurements`
-   **Authentication:** Required (JWT)
-   **Query Parameters:**
    -   `start_date` (date, optional, format: YYYY-MM-DD)
    -   `end_date` (date, optional, format: YYYY-MM-DD)

Returns all measurements for the KRI within the specified date range (monthly measurements as per INFRATEL framework).

### Get Active KRIs Due for Measurement
-   **Endpoint:** `GET /api/v1/kris/due-measurement`
-   **Authentication:** Required (JWT)
-   **Query Parameters:**
    -   `as_of_date` (date, optional, format: YYYY-MM-DD) - Defaults to current date

Returns all active KRIs that are due for measurement based on their monitoring frequency.

### Get KRI Status Summary
-   **Endpoint:** `GET /api/v1/kris/status-summary`
-   **Authentication:** Required (JWT)
-   **Query Parameters:**
    -   `department_id` (UUID, optional)

**Response Example:**
```json
{
  "Green": 15,
  "Amber": 5,
  "Red": 2,
  "Total": 22
}
```

---

## General Notes

-   **UUIDs**: All resource identifiers (IDs) are UUIDs.
-   **Department-Constrained RBAC**: Roles can only be granted permissions on modules that are explicitly assigned to their department. This is enforced by the API.
-   **Hierarchical Modules**: Modules can have parent-child relationships. Parent modules typically have `href = NULL`.
-   **Granular Permissions**: Role-module permissions include 8 standard boolean flags (`can_view`, `can_create`, `can_edit`, `can_delete`, `can_approve`, `can_export`, `can_assign`, `can_configure`) and a `custom_permissions` JSONB field for module-specific permissions.
-   **Audit Fields**: Most entities include `created_at`, `updated_at`, `created_by`, and `updated_by` for audit trails.
-   **Development Status**: Management routes (Branch, Department, Module, Role) are currently **unprotected** for ease of development and testing. They will require authentication and RBAC middleware in a production environment. User, Province, and Town management endpoints are currently placeholders.

---

## Error Responses

The API generally returns JSON error objects for non-2xx responses.

**Example Error Response:**
```json
{
  "error": "Error message describing the issue",
  "code": "ERROR_CODE_ENUM_OR_STRING", // Optional, for programmatic handling
  "details": {
    "field": "Additional details about the error, e.g., validation errors"
  }
}
