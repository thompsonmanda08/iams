# Sample Finding Payloads - Pre-Backend Submission

**Date**: 2025-12-03

This document shows example payloads that will be sent to the backend API when users submit findings for each framework type.

---

## ISO27001 Finding Example

### User Input (in Form)
```
Finding #F-001
Category: Access Control - Clause 5.1.1
Framework: ISO27001

Conformity Assessment:
  ☑ Conformity    ☐ Non-Conformity

Compliance Details:
  Clause Number: 5.1.1
  Clause Description: Information security policies and procedures
  Compliance Status: ☐ Compliant    ☑ Partial    ☐ Non-Compliant
  Compliance Percentage: 75

Workings & Test Results:
  "Reviewed policies. Found that access control policies are documented and implemented.
   However, they are not reviewed annually as required."

Conclusion:
  "Organization has implemented basic access controls but needs to formalize the review cycle."

Finding Details:
  Severity Level: HIGH
  Status: OPEN

Management Response:
  Recommendation: "Establish formal annual review process for access control policies"
  Management Response: "Agreed. Will implement quarterly reviews starting next month."
  Action Plan: "Schedule quarterly policy review meetings with IT and Security team"
  Responsible Person: John Doe
  Due Date: 2025-12-31

Evidence:
  Evidence Links: "https://example.com/policies/access-control.pdf ; https://example.com/audit-report.pdf"
```

### Built Payload (Before Backend Submission)
```json
{
  "is_conformity": true,
  "severity": "HIGH",
  "status": "OPEN",
  "clause_number": "5.1.1",
  "clause_description": "Information security policies and procedures",
  "compliance_status": "Partial",
  "compliance_percentage": 75,
  "workings_and_test_results": "Reviewed policies. Found that access control policies are documented and implemented. However, they are not reviewed annually as required.",
  "conclusion": "Organization has implemented basic access controls but needs to formalize the review cycle.",
  "recommendation": "Establish formal annual review process for access control policies",
  "management_response": "Agreed. Will implement quarterly reviews starting next month.",
  "action_plan": "Schedule quarterly policy review meetings with IT and Security team",
  "responsible_person": "user-id-john-doe-123",
  "due_date": "2025-12-31",
  "evidence_links": "https://example.com/policies/access-control.pdf ; https://example.com/audit-report.pdf"
}
```

### API Request
```bash
PUT /api/v1/working-paper-findings/finding-f001-uuid
Content-Type: application/json

{
  "is_conformity": true,
  "severity": "HIGH",
  "status": "OPEN",
  "clause_number": "5.1.1",
  "clause_description": "Information security policies and procedures",
  "compliance_status": "Partial",
  "compliance_percentage": 75,
  "workings_and_test_results": "Reviewed policies. Found that access control policies are documented and implemented. However, they are not reviewed annually as required.",
  "conclusion": "Organization has implemented basic access controls but needs to formalize the review cycle.",
  "recommendation": "Establish formal annual review process for access control policies",
  "management_response": "Agreed. Will implement quarterly reviews starting next month.",
  "action_plan": "Schedule quarterly policy review meetings with IT and Security team",
  "responsible_person": "user-id-john-doe-123",
  "due_date": "2025-12-31",
  "evidence_links": "https://example.com/policies/access-control.pdf ; https://example.com/audit-report.pdf"
}
```

---

## COSO Finding Example

### User Input (in Form)
```
Finding #F-002
Category: Control Environment
Framework: COSO

Conformity Assessment:
  ☐ Conformity    ☑ Non-Conformity

Compliance Details:
  COSO Component: Control Environment
  COSO Principle: The board of directors demonstrates independence and exercises oversight
  Control Type: Preventive
  Entity-Level Control: Yes

Workings & Test Results:
  "Tested board meeting minutes and found no documentation of internal control assessments."

Conclusion:
  "Control environment component is not effectively implemented."

Finding Details:
  Severity Level: CRITICAL
  Status: OPEN

Management Response:
  Recommendation: "Establish formal board-level control oversight process"
  Management Response: "Will add control assessment as standing agenda item for board meetings"
  Action Plan: "Create quarterly control assessment framework"
  Responsible Person: Jane Smith
  Due Date: 2025-06-30
```

### Built Payload (Before Backend Submission)
```json
{
  "is_conformity": false,
  "severity": "CRITICAL",
  "status": "OPEN",
  "coso_component": "Control Environment",
  "coso_principle": "The board of directors demonstrates independence and exercises oversight",
  "control_type": "Preventive",
  "entity_level_control": "Yes",
  "workings_and_test_results": "Tested board meeting minutes and found no documentation of internal control assessments.",
  "conclusion": "Control environment component is not effectively implemented.",
  "recommendation": "Establish formal board-level control oversight process",
  "management_response": "Will add control assessment as standing agenda item for board meetings",
  "action_plan": "Create quarterly control assessment framework",
  "responsible_person": "user-id-jane-smith-456"
  "due_date": "2025-06-30"
}
```

**Key Observations**:
- `is_conformity: false` indicates Non-Conformity
- COSO-specific fields: coso_component, coso_principle, control_type, entity_level_control
- Standard management fields included
- No compliance_status or compliance_percentage (those are ISO27001 only)

---

## COBIT Finding Example

### User Input (in Form)
```
Finding #F-003
Category: IT Governance - Processes
Framework: COBIT

Conformity Assessment:
  ☑ Conformity    ☐ Non-Conformity

Compliance Details:
  COBIT Domain: Align, Plan & Organize (APO)
  COBIT Process: APO01
  Process Name: Manage IT Management Framework
  Current Capability Level: 2 - Managed
  Target Capability Level: 3 - Established

Workings & Test Results:
  "Reviewed IT governance documentation. Organization has implemented most IT management practices."

Conclusion:
  "IT management framework is largely in place with good governance controls."

Finding Details:
  Severity Level: LOW
  Status: IN_PROGRESS

Management Response:
  Recommendation: "Enhance IT governance to Level 3"
  Management Response: "Currently working on achieving Level 3 maturity"
  Action Plan: "Implement standardized IT governance processes across all departments"
  Responsible Person: Bob Johnson
  Due Date: 2025-12-31
```

### Built Payload (Before Backend Submission)
```json
{
  "is_conformity": true,
  "severity": "LOW",
  "status": "IN_PROGRESS",
  "cobit_domain": "APO",
  "cobit_process": "APO01",
  "cobit_process_name": "Manage IT Management Framework",
  "capability_level": "2 - Managed",
  "target_capability_level": "3 - Established",
  "workings_and_test_results": "Reviewed IT governance documentation. Organization has implemented most IT management practices.",
  "conclusion": "IT management framework is largely in place with good governance controls.",
  "recommendation": "Enhance IT governance to Level 3",
  "management_response": "Currently working on achieving Level 3 maturity",
  "action_plan": "Implement standardized IT governance processes across all departments",
  "responsible_person": "user-id-bob-johnson-789",
  "due_date": "2025-12-31"
}
```

**Key Observations**:
- `is_conformity: true` indicates Conformity
- COBIT-specific fields: cobit_domain, cobit_process, cobit_process_name, capability_level, target_capability_level
- Status is IN_PROGRESS (partially remediated finding)
- No COSO fields or ISO compliance fields

---

## NIST Finding Example

### User Input (in Form)
```
Finding #F-004
Category: Access Control
Framework: NIST

Conformity Assessment:
  ☐ Conformity    ☑ Non-Conformity

Compliance Details:
  NIST Function: Protect (PR)
  NIST Category: PR.AC-1
  NIST Subcategory: Access is controlled and appropriate access rights are managed
  Control Number: AC-2
  Control Enhancement: AC-2(1) - Account Management

Workings & Test Results:
  "Reviewed user access logs. Found 15 user accounts with excessive privileges that have not been reviewed in over 12 months."

Conclusion:
  "Access control deficiency: Excessive and unreviewed user privileges."

Finding Details:
  Severity Level: HIGH
  Status: OPEN

Management Response:
  Recommendation: "Conduct immediate access review and privilege audit"
  Management Response: "Assigning security team to conduct privilege audit"
  Action Plan: "Complete access review for all 50 critical system accounts"
  Responsible Person: Alice Wilson
  Due Date: 2025-03-31
```

### Built Payload (Before Backend Submission)
```json
{
  "is_conformity": false,
  "severity": "HIGH",
  "status": "OPEN",
  "nist_function": "Protect",
  "nist_category": "PR.AC-1",
  "nist_subcategory": "Access is controlled and appropriate access rights are managed",
  "control_number": "AC-2",
  "control_enhancement": "AC-2(1)",
  "workings_and_test_results": "Reviewed user access logs. Found 15 user accounts with excessive privileges that have not been reviewed in over 12 months.",
  "conclusion": "Access control deficiency: Excessive and unreviewed user privileges.",
  "recommendation": "Conduct immediate access review and privilege audit",
  "management_response": "Assigning security team to conduct privilege audit",
  "action_plan": "Complete access review for all 50 critical system accounts",
  "responsible_person": "user-id-alice-wilson-321",
  "due_date": "2025-03-31"
}
```

**Key Observations**:
- `is_conformity: false` indicates Non-Conformity
- NIST-specific fields: nist_function, nist_category, nist_subcategory, control_number, control_enhancement
- High severity open finding requires urgent remediation
- No COBIT or COSO fields

---

## Minimal Payload Example

### User Input (Quick Update - Only Partial Data)
```
Finding #F-005 (Already exists, updating only status)

Finding Details:
  Status: RESOLVED
  Severity: MEDIUM

Management Response:
  Recommendation: "Update security policies quarterly"
```

### Built Payload (Before Backend Submission)
**Note**: Only populated fields are included. Empty fields are omitted.
```json
{
  "severity": "MEDIUM",
  "status": "RESOLVED",
  "recommendation": "Update security policies quarterly"
}
```

**Key Observations**:
- `is_conformity` NOT included (user didn't change it)
- Framework-specific fields NOT included (not modified)
- Only 3 fields sent instead of full payload
- Cleaner, more efficient payload
- Backend receives only what was actually changed

---

## Complete Field Reference

### Fields That May Be Included in Payload

#### Always Possible (All Frameworks)
```typescript
{
  // Conformity Assessment
  "is_conformity": true | false,

  // Standard Management Fields
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "status": "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
  "recommendation": "string",
  "management_response": "string",
  "action_plan": "string",
  "responsible_person": "user-id-string",
  "due_date": "YYYY-MM-DD",

  // Audit Working Paper Fields
  "workings_and_test_results": "string",
  "conclusion": "string",
  "evidence_links": "string"
}
```

#### ISO27001 Only
```typescript
{
  "clause_number": "string",
  "clause_description": "string",
  "compliance_status": "Compliant" | "Partial" | "Non-Compliant",
  "compliance_percentage": number (0-100)
}
```

#### COSO Only
```typescript
{
  "coso_component": "string",
  "coso_principle": "string",
  "control_type": "Preventive" | "Detective" | "Corrective",
  "entity_level_control": "string"
}
```

#### COBIT Only
```typescript
{
  "cobit_domain": "string",
  "cobit_process": "string",
  "cobit_process_name": "string",
  "capability_level": "string",
  "target_capability_level": "string"
}
```

#### NIST Only
```typescript
{
  "nist_function": "Identify" | "Protect" | "Detect" | "Respond" | "Recover",
  "nist_category": "string",
  "nist_subcategory": "string",
  "control_number": "string",
  "control_enhancement": "string"
}
```

---

## Payload Generation Logic

### How buildFindingPayload() Works

```typescript
// 1. Start with empty object
const payload = {};

// 2. Add each standard field only if it has a value
if (formData.severity) payload.severity = formData.severity;
if (formData.status) payload.status = formData.status;
// ... etc for all standard fields

// 3. Add conformity if set
if (formData.is_conformity !== null && formData.is_conformity !== undefined) {
  payload.is_conformity = formData.is_conformity;
}

// 4. Add framework-specific fields (only if they have values)
config.complianceFields.forEach((field) => {
  const value = formData[field.name];
  if (value !== undefined && value !== null && value !== "") {
    payload[field.name] = value;
  }
});

// Result: Clean payload with only populated fields
return payload;
```

---

## Validation Before Submission

### Required Field Check
Before the payload is sent, the form validates:
- All required fields have values
- Required fields vary by framework
- Example ISO27001 required: `clause_number`, `severity`
- Example COSO required: `coso_component`, `coso_principle`, `severity`

### Validation Error Example
```javascript
// If user tries to submit without filling required fields:
{
  valid: false,
  errors: {
    "clause_number": "Clause Number is required",
    "coso_component": "COSO Component is required"
  }
}

// Form shows error message: "Please fill in all required fields"
// Form does NOT send payload to backend
```

---

## API Response Example

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "finding-f001-uuid",
    "finding_number": "F-001",
    "is_conformity": true,
    "severity": "HIGH",
    "status": "OPEN",
    "clause_number": "5.1.1",
    "clause_description": "Information security policies and procedures",
    "compliance_status": "Partial",
    "compliance_percentage": 75,
    "workings_and_test_results": "Reviewed policies...",
    "conclusion": "Organization has implemented...",
    "recommendation": "Establish formal annual...",
    "management_response": "Agreed. Will implement...",
    "action_plan": "Schedule quarterly...",
    "responsible_person": "user-id-john-doe-123",
    "due_date": "2025-12-31",
    "evidence_links": "https://example.com/policies/...",
    "updated_at": "2025-12-03T12:34:56Z",
    "updated_by": "user-id-current-user"
  },
  "message": "Finding updated successfully"
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "clause_number": "must be a valid clause reference"
  },
  "message": "Invalid field values provided"
}
```

---

## Summary

✅ **Payload Structure Verified**

The form properly:
- Collects all required and optional fields per framework
- Builds clean payloads with only populated fields
- Validates required fields before submission
- Sends framework-specific fields for the selected audit type
- Handles all field types (text, textarea, number, select, checkbox, date)
- Formats dates correctly (YYYY-MM-DD)
- Handles user lookups (responsible_person -> user ID)

The payload is ready to be sent to the backend API.
