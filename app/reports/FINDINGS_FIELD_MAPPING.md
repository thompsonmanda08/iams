# Findings Field Mapping: Workpapers to Reports

This document explains how fields from the `WorkpaperFinding` interface map to the `FindingSummary` interface used in reports.

## Field Mapping Table

| Workpaper Field             | Report Field            | Notes                                                       |
| --------------------------- | ----------------------- | ----------------------------------------------------------- |
| `id`                        | `id`                    | Direct mapping                                              |
| `finding_number`            | `reference_code`        | Human-readable reference (e.g., "F-2025-001")               |
| `category_name`             | `title`                 | Used as the finding title                                   |
| `category_name`             | `category_name`         | Also kept for categorization                                |
| `severity`                  | `severity`              | Convert to lowercase: "HIGH" → "high"                       |
| `status`                    | `status`                | Direct mapping: "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED" |
| `clause_number`             | `clause_number`         | **Primary field** - ISO clause number (e.g., "9.2.1")       |
| `clause_number`             | `clause`                | **Alias** - For backward compatibility                      |
| `clause_description`        | `clause_description`    | Description of the clause                                   |
| `workings_and_test_results` | `observation`           | Detailed observation text                                   |
| `conclusion`                | `observation`           | Alternative source for observation                          |
| `recommendation`            | `recommendation`        | Direct mapping                                              |
| `management_response`       | `management_response`   | Direct mapping                                              |
| `action_plan`               | `action_plan`           | Direct mapping                                              |
| `responsible_person`        | `responsible_person`    | Direct mapping                                              |
| `due_date`                  | `due_date`              | Direct mapping                                              |
| `conformity_status`         | `conformity_status`     | Direct mapping                                              |
| `is_conformity`             | `is_conformity`         | Direct mapping                                              |
| `compliance_status`         | `compliance_status`     | Direct mapping                                              |
| `compliance_percentage`     | `compliance_percentage` | Direct mapping                                              |
| `evidence_links`            | `evidence_links`        | Direct mapping                                              |
| `evidence_summary`          | `evidence_summary`      | Direct mapping                                              |
| `framework`                 | `framework`             | Direct mapping                                              |
| `category`                  | `category`              | Full category object with relationships                     |
| `created_at`                | `created_at`            | Direct mapping                                              |
| `updated_at`                | `updated_at`            | Direct mapping                                              |
| `created_by`                | `created_by`            | Direct mapping                                              |
| `updated_by`                | `updated_by`            | Direct mapping                                              |

## Important Notes

### 1. Clause Number vs Clause

- **Primary Field**: `clause_number` is the primary field from workpapers
- **Backward Compatibility**: `clause` is provided as an alias
- **Backend Should**: Return both fields with the same value
- **Frontend Uses**: `clause_number || clause` to ensure compatibility

### 2. Finding Type Mapping

The `finding_type` field is derived from conformity status:

```typescript
// Mapping logic
if (conformity_status === "CONFORMITY") {
  finding_type = "Conformity";
} else if (conformity_status === "NON_CONFORMITY") {
  // Determine if Major or Minor based on severity
  finding_type =
    severity === "high" || severity === "critical"
      ? "Major Non-Conformity"
      : "Minor Non-Conformity";
} else if (conformity_status === "PARTIAL_CONFORMITY") {
  finding_type = "Minor Non-Conformity";
}
```

### 3. Observation Field

The `observation` field can come from multiple sources:

1. `workings_and_test_results` (primary)
2. `conclusion` (fallback)
3. Concatenate both if needed

### 4. Severity Conversion

Workpapers use uppercase, reports use lowercase:

```typescript
// Backend conversion
severity: workpaperFinding.severity?.toLowerCase() as "critical" | "high" | "medium" | "low";
```

### 5. Category Object

The `category` object should include:

- Full workpaper category details
- Relationship to working_paper_id
- Template category reference
- Sort order for display

## Backend Implementation Example

```typescript
// Example transformation function
function transformWorkpaperFindingToReportFinding(
  workpaperFinding: WorkpaperFinding
): FindingSummary {
  return {
    id: workpaperFinding.id,
    reference_code: workpaperFinding.finding_number,
    title: workpaperFinding.category_name,
    severity: workpaperFinding.severity?.toLowerCase() as any,
    status: workpaperFinding.status,
    category_name: workpaperFinding.category_name,
    is_selected: false, // Frontend manages this

    // Clause fields - provide both
    clause_number: workpaperFinding.clause_number,
    clause: workpaperFinding.clause_number, // Alias
    clause_description: workpaperFinding.clause_description,

    // Determine finding_type from conformity_status
    finding_type: determineFindingType(
      workpaperFinding.conformity_status,
      workpaperFinding.severity
    ),

    // Observation from workings or conclusion
    observation: workpaperFinding.workings_and_test_results || workpaperFinding.conclusion,

    // Action fields
    recommendation: workpaperFinding.recommendation,
    management_response: workpaperFinding.management_response,
    action_plan: workpaperFinding.action_plan,
    responsible_person: workpaperFinding.responsible_person,
    due_date: workpaperFinding.due_date,

    // Conformity fields
    conformity_status: workpaperFinding.conformity_status,
    is_conformity: workpaperFinding.is_conformity,
    compliance_status: workpaperFinding.compliance_status,
    compliance_percentage: workpaperFinding.compliance_percentage,

    // Evidence
    evidence_links: workpaperFinding.evidence_links,
    evidence_summary: workpaperFinding.evidence_summary,

    // Framework
    framework: workpaperFinding.framework,

    // Category relationship
    category: workpaperFinding.category,

    // Metadata
    created_at: workpaperFinding.created_at,
    updated_at: workpaperFinding.updated_at,
    created_by: workpaperFinding.created_by,
    updated_by: workpaperFinding.updated_by
  };
}

function determineFindingType(
  conformityStatus: string | null | undefined,
  severity: string | null | undefined
): string | undefined {
  if (conformityStatus === "CONFORMITY") {
    return "Conformity";
  } else if (conformityStatus === "NON_CONFORMITY") {
    const sev = severity?.toUpperCase();
    return sev === "HIGH" || sev === "CRITICAL" ? "Major Non-Conformity" : "Minor Non-Conformity";
  } else if (conformityStatus === "PARTIAL_CONFORMITY") {
    return "Minor Non-Conformity";
  }
  return undefined;
}
```

## API Endpoint

### GET `/api/findings?audit_plan_id={id}`

**Query Parameters:**

- `audit_plan_id` (required): The audit plan ID to fetch findings for

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "finding-uuid",
      "reference_code": "F-2025-001",
      "title": "Unauthorized Cloud Storage Usage",
      "severity": "high",
      "status": "OPEN",
      "category_name": "A.12 Operations Security",
      "is_selected": false,
      "clause_number": "12.3.1",
      "clause": "12.3.1",
      "clause_description": "Information backup",
      "finding_type": "Minor Non-Conformity",
      "observation": "Employees are using unsanctioned Dropbox...",
      "recommendation": "Implement a policy to restrict...",
      "management_response": "Management agrees...",
      "action_plan": "1. Draft policy\n2. Obtain approval...",
      "responsible_person": "IT Security Manager",
      "due_date": "2025-06-30",
      "conformity_status": "NON_CONFORMITY",
      "is_conformity": false,
      "compliance_status": "Non-Compliant",
      "compliance_percentage": 40,
      "evidence_links": "https://...",
      "evidence_summary": "Screenshots of...",
      "framework": "ISO27001",
      "category": {
        "id": "cat-uuid",
        "working_paper_id": "wp-uuid",
        "template_category_id": "tpl-cat-uuid",
        "name": "A.12 Operations Security",
        "sort_order": 12,
        "organization_id": "org-uuid",
        "clause": "A.12",
        "description": "Operations Security controls"
      },
      "created_at": "2025-01-10T10:00:00Z",
      "updated_at": "2025-01-14T15:30:00Z",
      "created_by": "user-uuid",
      "updated_by": "user-uuid"
    }
  ]
}
```

## Testing Checklist

- [ ] Both `clause_number` and `clause` are returned with the same value
- [ ] `finding_type` is correctly derived from `conformity_status`
- [ ] Severity is lowercase in the response
- [ ] Category object includes all required fields
- [ ] Observation field is populated from workings or conclusion
- [ ] All metadata fields (timestamps, user IDs) are included
- [ ] Frontend can access findings using either `clause_number` or `clause`
