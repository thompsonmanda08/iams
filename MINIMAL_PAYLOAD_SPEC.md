# Minimal Payload Specification for Finding Updates

**Date**: 2025-12-03
**Status**: ✅ IMPLEMENTED
**Purpose**: Defines the minimal, consistent payload structure for updating findings across all framework types

---

## Update Payload Structure

All finding updates use the same **minimal payload structure** with only **required fields**:

```json
{
  "severity": "HIGH",
  "recommendation": "Updated recommendation",
  "compliance_status": "Partial",
  "compliance_percentage": 50
}
```

### Required Fields (All Frameworks)

**severity** (string, required for all)
- **Values**: `"LOW"`, `"MEDIUM"`, `"HIGH"`, `"CRITICAL"`
- **Purpose**: Impact level of the finding
- **Example**: `"severity": "HIGH"`

**recommendation** (string, required for all)
- **Purpose**: What should be done to remediate the finding
- **Example**: `"recommendation": "Implement annual review process"`

### Framework-Specific Fields (Optional, if populated)

Only the compliance fields for the audit plan's framework type are included.

#### ISO27001
- `compliance_status`: `"Compliant"` | `"Partial"` | `"Non-Compliant"` (checkbox field)
- `compliance_percentage`: number (0-100)

#### COSO
- `control_type`: string (Preventive, Detective, Corrective)
- `entity_level_control`: string (Yes/No)

#### COBIT
- `capability_level`: string (0-5, current level)
- `target_capability_level`: string (0-5, target level)

#### NIST
- `control_enhancement`: string (enhancement reference)
- `assessment_type`: string (Examination, Interview, Testing, Review)

---

## ISO27001 Example

### User Form Input
```
Severity: HIGH
Recommendation: "Implement annual compliance review"
Compliance Status: ☑ Partial (checkbox selected)
Compliance Percentage: 75
```

### Resulting Payload
```json
{
  "severity": "HIGH",
  "recommendation": "Implement annual compliance review",
  "compliance_status": "Partial",
  "compliance_percentage": 75
}
```

### API Request
```
PUT /api/v1/working-paper-findings/{finding_id}

{
  "severity": "HIGH",
  "recommendation": "Implement annual compliance review",
  "compliance_status": "Partial",
  "compliance_percentage": 75
}
```

---

## COSO Example

### User Form Input
```
Severity: CRITICAL
Recommendation: "Establish formal control oversight"
Control Type: Preventive
Entity-Level Control: Yes
```

### Resulting Payload
```json
{
  "severity": "CRITICAL",
  "recommendation": "Establish formal control oversight",
  "control_type": "Preventive",
  "entity_level_control": "Yes"
}
```

---

## COBIT Example

### User Form Input
```
Severity: MEDIUM
Recommendation: "Improve IT governance maturity"
Capability Level: 2 - Managed
Target Capability Level: 3 - Established
```

### Resulting Payload
```json
{
  "severity": "MEDIUM",
  "recommendation": "Improve IT governance maturity",
  "capability_level": "2 - Managed",
  "target_capability_level": "3 - Established"
}
```

---

## NIST Example

### User Form Input
```
Severity: HIGH
Recommendation: "Conduct immediate access review"
Control Enhancement: AC-2(1)
Assessment Type: Testing
```

### Resulting Payload
```json
{
  "severity": "HIGH",
  "recommendation": "Conduct immediate access review",
  "control_enhancement": "AC-2(1)",
  "assessment_type": "Testing"
}
```

---

## Payload Generation Logic

The `buildFindingPayload(formData, framework)` function:

1. Starts with an empty payload object
2. **Always includes** if present:
   - `severity` (required)
   - `recommendation` (required)
3. **Conditionally includes** framework-specific compliance fields:
   - Loops through `config.complianceFields`
   - Only adds fields with actual values (not empty, null, or undefined)
   - Never adds fields that are display-only

### Code Implementation
```typescript
export function buildFindingPayload(
  formData: Record<string, any>,
  framework: FrameworkType
): Record<string, any> {
  const config = getFrameworkFieldConfig(framework);
  const payload: Record<string, any> = {};

  // Required fields for all frameworks
  if (formData.severity) {
    payload.severity = formData.severity;
  }
  if (formData.recommendation) {
    payload.recommendation = formData.recommendation;
  }

  // Framework-specific compliance fields (only if populated)
  config.complianceFields.forEach((field) => {
    const value = formData[field.name];
    if (value !== undefined && value !== null && value !== "") {
      payload[field.name] = value;
    }
  });

  return payload;
}
```

---

## Display-Only Fields (NOT Sent in Payload)

These fields are collected by the form but **NOT included** in update payloads:

- workings_and_test_results
- conclusion
- evidence_links
- management_response
- action_plan
- responsible_person
- due_date
- status
- is_conformity (conformity assessment)

These fields are **for display purposes only** and are loaded from the backend when viewing a finding.

---

## Consistent Behavior Across Frameworks

### All Frameworks Send
```json
{
  "severity": "<value>",
  "recommendation": "<value>",
  "<framework_field_1>": "<value>",
  "<framework_field_2>": "<value>"
}
```

### Key Consistency Rules
1. ✅ `severity` is always included if present
2. ✅ `recommendation` is always included if present
3. ✅ Framework-specific fields vary by framework type
4. ✅ Only populated fields are sent (no empty strings, null, or undefined)
5. ✅ No display-only fields in payload
6. ✅ Payload size is minimal and efficient

---

## Validation Before Submission

### Required Fields Check
The form validates that:
- `severity` has a value
- `recommendation` has a value
- Framework-specific required fields have values

### Validation Error Example
```json
{
  "valid": false,
  "errors": {
    "severity": "Severity is required",
    "recommendation": "Recommendation is required"
  }
}
```

If validation fails, the form **does not submit** and shows error messages.

---

## API Response

### Success (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "finding-123",
    "severity": "HIGH",
    "recommendation": "Implement annual compliance review",
    "compliance_status": "Partial",
    "compliance_percentage": 75,
    "updated_at": "2025-12-03T12:34:56Z"
  },
  "message": "Finding updated successfully"
}
```

### Error (400+ Status)
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid field values provided"
}
```

---

## Field Mapping by Framework

| Framework | Required Fields | Optional Fields |
|-----------|---|---|
| ISO27001 | severity, recommendation | compliance_status, compliance_percentage |
| COSO | severity, recommendation | control_type, entity_level_control |
| COBIT | severity, recommendation | capability_level, target_capability_level |
| NIST | severity, recommendation | control_enhancement, assessment_type |
| GENERAL | severity, recommendation | (none) |
| CUSTOM | severity, recommendation | (none) |

---

## Implementation Files

### Core Payload Builder
**File**: `lib/utils/finding-form-utils.ts`
**Function**: `buildFindingPayload(formData, framework)`
- Takes form data and framework type
- Returns minimal payload with only required + populated fields
- Framework-aware field inclusion

### Form Component
**File**: `app/dashboard/(modules)/audit/plans/_components/framework-finding-form.tsx`
**Line**: 112
- Calls `buildFindingPayload(formData, framework)`
- Submits payload to API
- Handles success/error responses

### API Server Action
**File**: `app/_actions/audit-module-actions.ts`
**Function**: `updateFinding(finding_id, payload)`
- Sends PUT request to `/api/v1/working-paper-findings/{finding_id}`
- Accepts flexible payload structure
- Returns success/error response

---

## Testing Checklist

- [ ] ISO27001: Send severity, recommendation, compliance_status, compliance_percentage
- [ ] COSO: Send severity, recommendation, control_type, entity_level_control
- [ ] COBIT: Send severity, recommendation, capability_level, target_capability_level
- [ ] NIST: Send severity, recommendation, control_enhancement, assessment_type
- [ ] Verify no display-only fields are sent
- [ ] Verify only populated fields are included
- [ ] Test with minimal payload (only severity + recommendation)
- [ ] Test with full payload (all fields populated)
- [ ] Verify API receives correct field values
- [ ] Verify success response after update

---

## Summary

✅ **Minimal Payload Structure Implemented**

- Consistent across all framework types
- Only required fields (severity, recommendation) + framework-specific compliance fields
- Clean, efficient payloads
- No display-only fields
- Framework-aware field inclusion
- Ready for backend integration

---

## Future: ManagementFields Support

**Status**: 🕐 Commented Out (TODO)
**Location**: `lib/utils/finding-form-utils.ts`

When management fields are enabled:
1. Uncomment `managementFields` in `FrameworkFieldConfig`
2. Uncomment `getVisibleFieldsForFramework()` function
3. Update `validateFrameworkRequiredFields()` to include management field validation
4. Management fields will be included in payload when populated

**Commented Code Locations**:
- Line 134-141: `getVisibleFieldsForFramework()` function
- Line 156: Management field validation in `validateFrameworkRequiredFields()`

---

**Last Updated**: 2025-12-03
**Status**: Production Ready ✅
