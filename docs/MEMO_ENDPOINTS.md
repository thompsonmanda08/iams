# Audit Memo API Endpoints

This document describes the API endpoints for managing audit memos and memo templates in the Risk Audit Management System.

## Overview

The memo system consists of two main entities:
- **Audit Memos**: Audit-specific memos attached to audit plans, can be edited in DRAFT status
- **Memo Templates**: Organization-wide templates that serve as starting points for creating memos

Key features:
- Memos are created and edited at the audit plan level
- Templates are shared organization-wide resources
- Edit history tracking for audit trails
- Automatic PDF generation and sending to client representative on audit plan approval
- HTML-based memo content with automatic PDF conversion

## Memo Endpoints

**Important:** One memo per audit plan - Creating a new memo will replace any existing memo for that audit plan.

### Create Audit Memo

**Endpoint:** `POST /api/audit-plans/{auditPlanId}/memo`

**Description:** Create a new audit memo for an audit plan (or replace existing memo)

**Request:**
```json
{
  "subject": "Q1 2025 Audit Findings",
  "content": "<h2>Audit Summary</h2><p>The audit identified...</p>",
  "status": "DRAFT"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "audit_plan_id": "550e8400-e29b-41d4-a716-446655440001",
  "subject": "Q1 2025 Audit Findings",
  "content": "<h2>Audit Summary</h2><p>The audit identified...</p>",
  "status": "DRAFT",
  "created_by": "550e8400-e29b-41d4-a716-446655440002",
  "created_at": "2025-12-22T10:30:00Z",
  "updated_at": "2025-12-22T10:30:00Z"
}
```

**Status Codes:**
- `201 Created` - Memo created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to create memo
- `404 Not Found` - Audit plan not found

---

### Update Audit Memo

**Endpoint:** `PUT /api/audit-plans/{auditPlanId}/memo`

**Description:** Update the audit memo for a plan (only possible in DRAFT status)

**Request:**
```json
{
  "subject": "Q1 2025 Audit Findings - Updated",
  "content": "<h2>Audit Summary</h2><p>Updated content...</p>",
  "status": "DRAFT"
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "audit_plan_id": "550e8400-e29b-41d4-a716-446655440001",
  "subject": "Q1 2025 Audit Findings - Updated",
  "content": "<h2>Audit Summary</h2><p>Updated content...</p>",
  "status": "DRAFT",
  "created_by": "550e8400-e29b-41d4-a716-446655440002",
  "created_at": "2025-12-22T10:30:00Z",
  "updated_by": "550e8400-e29b-41d4-a716-446655440002",
  "updated_at": "2025-12-22T10:35:00Z"
}
```

**Notes:**
- Edit creates an entry in memo history tracking
- History records previous and current values for audit trail
- Only memos in DRAFT status can be updated

**Status Codes:**
- `200 OK` - Memo updated successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to update memo
- `404 Not Found` - Memo or audit plan not found
- `409 Conflict` - Memo cannot be updated (not in DRAFT status)

---

### Get Audit Memo

**Endpoint:** `GET /api/audit-plans/{auditPlanId}/memo`

**Description:** Retrieve the audit memo for a plan

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "audit_plan_id": "550e8400-e29b-41d4-a716-446655440001",
  "subject": "Q1 2025 Audit Findings",
  "content": "<h2>Audit Summary</h2><p>The audit identified...</p>",
  "status": "DRAFT",
  "created_by": "550e8400-e29b-41d4-a716-446655440002",
  "created_at": "2025-12-22T10:30:00Z",
  "updated_by": "550e8400-e29b-41d4-a716-446655440002",
  "updated_at": "2025-12-22T10:35:00Z"
}
```

**Status Codes:**
- `200 OK` - Memo retrieved successfully
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to view memo
- `404 Not Found` - Memo or audit plan not found

---

### Delete Audit Memo

**Endpoint:** `DELETE /api/audit-plans/{auditPlanId}/memo`

**Description:** Delete the audit memo for a plan

**Response:** `204 No Content`

**Status Codes:**
- `204 No Content` - Memo deleted successfully
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to delete memo
- `404 Not Found` - Memo or audit plan not found

---

### Get Memo History

**Endpoint:** `GET /api/audit-plans/{auditPlanId}/memo/history`

**Description:** Get the edit history for the audit memo

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 20, max: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "memo_id": "550e8400-e29b-41d4-a716-446655440000",
      "edited_by": "550e8400-e29b-41d4-a716-446655440002",
      "previous_subject": "Q1 2025 Audit Findings",
      "current_subject": "Q1 2025 Audit Findings - Updated",
      "previous_content": "<h2>Audit Summary</h2><p>The audit identified...</p>",
      "current_content": "<h2>Audit Summary</h2><p>Updated content...</p>",
      "previous_status": "DRAFT",
      "current_status": "DRAFT",
      "created_at": "2025-12-22T10:35:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**Status Codes:**
- `200 OK` - History retrieved successfully
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to view history
- `404 Not Found` - Memo or audit plan not found

---

## Memo Template Endpoints

### Create Memo Template

**Endpoint:** `POST /api/memo-templates`

**Description:** Create a new organization-wide memo template

**Request:**
```json
{
  "name": "Standard Audit Memo",
  "description": "Standard template for audit memos",
  "category": "audit_findings",
  "html": "<h2>Audit Findings Summary</h2><p>Insert findings here...</p>"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440050",
  "organization_id": "550e8400-e29b-41d4-a716-446655440099",
  "name": "Standard Audit Memo",
  "description": "Standard template for audit memos",
  "category": "audit_findings",
  "html": "<h2>Audit Findings Summary</h2><p>Insert findings here...</p>",
  "created_by": "550e8400-e29b-41d4-a716-446655440002",
  "created_at": "2025-12-22T10:30:00Z",
  "updated_at": "2025-12-22T10:30:00Z"
}
```

**Status Codes:**
- `201 Created` - Template created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to create template

---

### Update Memo Template

**Endpoint:** `PUT /api/memo-templates/{templateId}`

**Description:** Update a memo template

**Request:**
```json
{
  "name": "Standard Audit Memo - Updated",
  "description": "Updated template for audit memos",
  "category": "audit_findings",
  "html": "<h2>Audit Findings Summary</h2><p>Updated template...</p>"
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440050",
  "organization_id": "550e8400-e29b-41d4-a716-446655440099",
  "name": "Standard Audit Memo - Updated",
  "description": "Updated template for audit memos",
  "category": "audit_findings",
  "html": "<h2>Audit Findings Summary</h2><p>Updated template...</p>",
  "created_by": "550e8400-e29b-41d4-a716-446655440002",
  "created_at": "2025-12-22T10:30:00Z",
  "updated_by": "550e8400-e29b-41d4-a716-446655440002",
  "updated_at": "2025-12-22T10:35:00Z"
}
```

**Status Codes:**
- `200 OK` - Template updated successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to update template
- `404 Not Found` - Template not found

---

### List Memo Templates

**Endpoint:** `GET /api/memo-templates`

**Description:** List all memo templates for the organization with pagination

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 20, max: 100)
- `offset` (optional): Number of records to skip (default: 0)
- `category` (optional): Filter by template category

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "organization_id": "550e8400-e29b-41d4-a716-446655440099",
      "name": "Standard Audit Memo",
      "description": "Standard template for audit memos",
      "category": "audit_findings",
      "html": "<h2>Audit Findings Summary</h2><p>Insert findings here...</p>",
      "created_by": "550e8400-e29b-41d4-a716-446655440002",
      "created_at": "2025-12-22T10:30:00Z",
      "updated_at": "2025-12-22T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**Status Codes:**
- `200 OK` - Templates retrieved successfully
- `401 Unauthorized` - Not authenticated

---

### Delete Memo Template

**Endpoint:** `DELETE /api/memo-templates/{templateId}`

**Description:** Delete a memo template

**Response:** `204 No Content`

**Status Codes:**
- `204 No Content` - Template deleted successfully
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to delete template
- `404 Not Found` - Template not found

---

## PDF Generation & Delivery

### Automatic PDF Sending

When an audit plan approval workflow reaches its final state:

1. **PDF Generation**: The latest memo is automatically converted to PDF
   - HTML content is stripped of tags and converted to plain text
   - PDF includes memo metadata (subject, IDs, timestamps)
   - Formatting preserved (lists, paragraphs, line breaks)

2. **Email Delivery**: PDF is sent to the client representative (HOD)
   - Subject: "Audit Closure Complete: {Audit Plan Title}"
   - Attachment: `audit_memo.pdf`
   - Email is sent via configured SMTP settings

3. **Logging**: All operations are logged for audit trail
   - Success/failure of PDF generation
   - Email delivery confirmation
   - Any errors encountered

### Manual PDF Download (Future Enhancement)

Future versions may support downloading memo as PDF via:
```
GET /api/audit-plans/{auditPlanId}/memos/{memoId}/download
```

---

## Memo Status Lifecycle

Memos follow this status lifecycle:

```
DRAFT → APPROVED → FINALIZED
  ↓
  └─ Only DRAFT memos can be edited
     Other status memos are read-only
```

- **DRAFT**: Initial status, can be edited and updated
- **APPROVED**: Memo approved by audit lead
- **FINALIZED**: Memo finalized and locked for editing

---

## Content Format

### HTML Support

Memos support HTML content with the following elements:

**Supported Tags:**
- Headings: `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
- Paragraphs: `<p>`
- Line breaks: `<br>`, `<br/>`, `<br />`
- Lists: `<ul>`, `<ol>`, `<li>`
- Text formatting: `<strong>`, `<em>`, `<b>`, `<i>`
- Dividers: `<div>`
- Other: `<span>`, `<a>` (links)

**HTML Entities:**
- `&nbsp;` - Non-breaking space
- `&lt;` - Less than `<`
- `&gt;` - Greater than `>`
- `&amp;` - Ampersand `&`
- `&quot;` - Double quote `"`
- `&#39;` - Single quote `'`

**PDF Conversion:**
- HTML tags are stripped during PDF generation
- Formatting is preserved through text conversion
- Multiple newlines are collapsed to max 2 for readability

---

## Example Workflows

### Creating and Submitting a Memo

1. Create memo in DRAFT status:
```bash
POST /api/audit-plans/{auditPlanId}/memo
{
  "subject": "Annual Audit Report",
  "content": "<h2>Executive Summary</h2><p>...</p>",
  "status": "DRAFT"
}
```

2. Edit memo multiple times (creates history entries):
```bash
PUT /api/audit-plans/{auditPlanId}/memo
{
  "subject": "Annual Audit Report - Updated",
  "content": "<h2>Executive Summary</h2><p>Updated...</p>",
  "status": "DRAFT"
}
```

3. View edit history:
```bash
GET /api/audit-plans/{auditPlanId}/memo/history
```

4. Approve audit plan workflow:
```bash
POST /api/workflows/instances/{instanceId}/approve
```

5. System automatically:
   - Generates PDF from memo
   - Sends PDF to client representative via email
   - Logs delivery confirmation

---

## Error Handling

All endpoints return standard HTTP status codes with JSON error responses:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": ["error message"]
  }
}
```

Common errors:
- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized
- `CONFLICT` - Cannot perform operation in current state
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

API endpoints are subject to rate limiting:
- 100 requests per minute per user
- 1000 requests per minute per organization

---

## Authentication

All endpoints require authentication via:
- JWT Bearer token in Authorization header: `Authorization: Bearer {token}`
- Valid organization context

---

## Pagination

Endpoints that return lists support pagination:
- `limit`: Records per page (default: 20, max: 100)
- `offset`: Number of records to skip (default: 0)
- `total`: Total number of records available

Example:
```bash
GET /api/memo-templates?limit=10&offset=20
```
