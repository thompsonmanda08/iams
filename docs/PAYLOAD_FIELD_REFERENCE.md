# Payload Field Reference Guide

**Purpose**: Complete reference for all fields that may appear in finding update payloads

**Date**: 2025-12-03

---

## Standard Fields (All Frameworks)

These fields appear in payloads for all framework types when they have values.

### Conformity Assessment
**Field**: `is_conformity`
- **Type**: Boolean
- **Values**: `true` (Conformity) or `false` (Non-Conformity)
- **Required**: No (but recommended)
- **Example**: `"is_conformity": true`
- **Used In**: All frameworks
- **UI Element**: Two checkboxes at top of form (green card)

### Severity Level
**Field**: `severity`
- **Type**: String (enum)
- **Values**: `"LOW"`, `"MEDIUM"`, `"HIGH"`, `"CRITICAL"`
- **Required**: Yes (almost all frameworks)
- **Example**: `"severity": "HIGH"`
- **Used In**: All frameworks
- **UI Element**: SelectField dropdown

### Status
**Field**: `status`
- **Type**: String (enum)
- **Values**: `"OPEN"`, `"IN_PROGRESS"`, `"RESOLVED"`, `"CLOSED"`
- **Required**: No
- **Example**: `"status": "OPEN"`
- **Used In**: All frameworks
- **UI Element**: SelectField dropdown

### Recommendation
**Field**: `recommendation`
- **Type**: String (text)
- **Max Length**: 2000+ characters
- **Required**: No
- **Example**: `"recommendation": "Establish formal annual review process"`
- **Used In**: All frameworks
- **UI Element**: Textarea (3 rows)

### Management Response
**Field**: `management_response`
- **Type**: String (text)
- **Max Length**: 2000+ characters
- **Required**: No
- **Example**: `"management_response": "Agreed. Will implement quarterly reviews."`
- **Used In**: All frameworks
- **UI Element**: Textarea (3 rows)

### Action Plan
**Field**: `action_plan`
- **Type**: String (text)
- **Max Length**: 2000+ characters
- **Required**: No
- **Example**: `"action_plan": "Schedule quarterly policy review meetings"`
- **Used In**: All frameworks
- **UI Element**: Textarea (3 rows)

### Responsible Person
**Field**: `responsible_person`
- **Type**: String (UUID)
- **Format**: User ID from team members list
- **Required**: No
- **Example**: `"responsible_person": "user-id-12345-abc"`
- **Used In**: All frameworks
- **UI Element**: SearchSelectField (dropdown with search)
- **Note**: Converted from user name to user ID before submission

### Due Date
**Field**: `due_date`
- **Type**: String (date)
- **Format**: `YYYY-MM-DD` ISO 8601
- **Required**: No
- **Example**: `"due_date": "2025-12-31"`
- **Used In**: All frameworks
- **UI Element**: DatePicker component
- **Note**: Converted from Date object to string before submission

### Workings and Test Results
**Field**: `workings_and_test_results`
- **Type**: String (text)
- **Max Length**: 5000+ characters
- **Required**: No
- **Example**: `"workings_and_test_results": "Reviewed policies. Found that access control policies are documented..."`
- **Used In**: All frameworks
- **UI Element**: Textarea (5 rows)
- **Purpose**: Document audit procedures performed

### Conclusion
**Field**: `conclusion`
- **Type**: String (text)
- **Max Length**: 2000+ characters
- **Required**: No
- **Example**: `"conclusion": "Organization has implemented basic access controls..."`
- **Used In**: All frameworks
- **UI Element**: Textarea (4 rows)
- **Purpose**: Summarize audit findings

### Evidence Links
**Field**: `evidence_links`
- **Type**: String (text)
- **Format**: Semicolon-separated URLs
- **Required**: No
- **Example**: `"evidence_links": "https://example.com/policy.pdf ; https://example.com/report.pdf"`
- **Used In**: All frameworks
- **UI Element**: Textarea (3 rows)
- **Note**: Multiple links separated by semicolons (;)

---

## ISO27001 Framework Fields

Fields specific to ISO 27001:2022 ISMS audits.

### Clause Number
**Field**: `clause_number`
- **Type**: String
- **Format**: Clause reference (e.g., "5.1.1", "A.5.1.2")
- **Required**: Yes ✓
- **Example**: `"clause_number": "5.1.1"`
- **UI Element**: Text input
- **Purpose**: Reference the specific ISO 27001 clause

### Clause Description
**Field**: `clause_description`
- **Type**: String (textarea)
- **Max Length**: 1000+ characters
- **Required**: No
- **Example**: `"clause_description": "Information security policies and procedures"`
- **UI Element**: Textarea (2 rows)
- **Purpose**: Describe the clause requirement
- **Note**: Disabled field in some cases

### Compliance Status
**Field**: `compliance_status`
- **Type**: String (enum)
- **Values**: `"Compliant"`, `"Partial"`, `"Non-Compliant"`
- **Required**: No
- **Example**: `"compliance_status": "Partial"`
- **UI Element**: Horizontal checkboxes (single-select) ✓ NEW
- **Purpose**: Assess compliance level for this clause

### Compliance Percentage
**Field**: `compliance_percentage`
- **Type**: Number (integer)
- **Range**: 0-100
- **Required**: No
- **Example**: `"compliance_percentage": 75`
- **UI Element**: Number input (min=0, max=100)
- **Purpose**: Percentage of clause requirements met

### ISO27001 Payload Example
```json
{
  "is_conformity": true,
  "severity": "HIGH",
  "status": "OPEN",
  "clause_number": "5.1.1",
  "clause_description": "Information security policies",
  "compliance_status": "Partial",
  "compliance_percentage": 75,
  "workings_and_test_results": "Reviewed policies...",
  "conclusion": "Organization has implemented...",
  "recommendation": "Establish formal annual...",
  "responsible_person": "user-id-123",
  "due_date": "2025-12-31"
}
```

---

## COSO Framework Fields

Fields specific to COSO Internal Control Framework audits.

### COSO Component
**Field**: `coso_component`
- **Type**: String
- **Values**: Component names (e.g., "Control Environment", "Risk Assessment")
- **Required**: Yes ✓
- **Example**: `"coso_component": "Control Environment"`
- **UI Element**: SelectField or text input
- **Purpose**: Reference the COSO component

### COSO Principle
**Field**: `coso_principle`
- **Type**: String
- **Values**: Principle descriptions
- **Required**: Yes ✓
- **Example**: `"coso_principle": "The board of directors demonstrates independence"`
- **UI Element**: SelectField or text input
- **Purpose**: Specific principle within the component

### Control Type
**Field**: `control_type`
- **Type**: String
- **Values**: `"Preventive"`, `"Detective"`, `"Corrective"`
- **Required**: No
- **Example**: `"control_type": "Preventive"`
- **UI Element**: SelectField or text input
- **Purpose**: Classify control mechanism

### Entity-Level Control
**Field**: `entity_level_control`
- **Type**: String
- **Values**: "Yes", "No", or description
- **Required**: No
- **Example**: `"entity_level_control": "Yes"`
- **UI Element**: SelectField or text input
- **Purpose**: Indicate if control is at entity level

### COSO Payload Example
```json
{
  "is_conformity": false,
  "severity": "CRITICAL",
  "status": "OPEN",
  "coso_component": "Control Environment",
  "coso_principle": "The board demonstrates independence",
  "control_type": "Preventive",
  "entity_level_control": "Yes",
  "workings_and_test_results": "Tested board meeting minutes...",
  "conclusion": "Control environment not effectively implemented",
  "recommendation": "Establish formal board oversight",
  "responsible_person": "user-id-456",
  "due_date": "2025-06-30"
}
```

---

## COBIT Framework Fields

Fields specific to COBIT 2019 IT Governance framework.

### COBIT Domain
**Field**: `cobit_domain`
- **Type**: String
- **Values**: Domain codes (e.g., "EDM", "APO", "BAI", "DSS", "MEA")
- **Required**: Yes ✓
- **Example**: `"cobit_domain": "APO"`
- **UI Element**: SelectField or text input
- **Purpose**: Reference the COBIT domain

### COBIT Process
**Field**: `cobit_process`
- **Type**: String
- **Values**: Process codes (e.g., "APO01", "APO02")
- **Required**: Yes ✓
- **Example**: `"cobit_process": "APO01"`
- **UI Element**: SelectField or text input
- **Purpose**: Specific process within domain

### COBIT Process Name
**Field**: `cobit_process_name`
- **Type**: String
- **Values**: Full process name
- **Required**: No
- **Example**: `"cobit_process_name": "Manage IT Management Framework"`
- **UI Element**: Text input
- **Purpose**: Descriptive name of process

### Capability Level
**Field**: `capability_level`
- **Type**: String or Number
- **Values**: "0 - Incomplete", "1 - Performed", "2 - Managed", "3 - Established", "4 - Predictable", "5 - Optimizing"
- **Required**: No
- **Example**: `"capability_level": "2 - Managed"`
- **UI Element**: SelectField or text input
- **Purpose**: Current maturity level

### Target Capability Level
**Field**: `target_capability_level`
- **Type**: String or Number
- **Values**: Same as capability_level
- **Required**: No
- **Example**: `"target_capability_level": "3 - Established"`
- **UI Element**: SelectField or text input
- **Purpose**: Desired maturity level

### COBIT Payload Example
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
  "workings_and_test_results": "Reviewed IT governance documentation...",
  "conclusion": "IT management framework is largely in place",
  "recommendation": "Enhance IT governance to Level 3",
  "responsible_person": "user-id-789",
  "due_date": "2025-12-31"
}
```

---

## NIST Framework Fields

Fields specific to NIST Cybersecurity Framework / SP 800-53.

### NIST Function
**Field**: `nist_function`
- **Type**: String
- **Values**: `"Identify"`, `"Protect"`, `"Detect"`, `"Respond"`, `"Recover"`
- **Required**: Yes ✓
- **Example**: `"nist_function": "Protect"`
- **UI Element**: SelectField or text input
- **Purpose**: Reference the NIST CSF function

### NIST Category
**Field**: `nist_category`
- **Type**: String
- **Values**: Category codes (e.g., "ID.AM-1", "PR.AC-1")
- **Required**: Yes ✓
- **Example**: `"nist_category": "PR.AC-1"`
- **UI Element**: SelectField or text input
- **Purpose**: Specific category within function

### NIST Subcategory
**Field**: `nist_subcategory`
- **Type**: String
- **Max Length**: 500+ characters
- **Required**: No
- **Example**: `"nist_subcategory": "Access is controlled and appropriate rights are managed"`
- **UI Element**: Text input or textarea
- **Purpose**: Detailed subcategory description

### Control Number
**Field**: `control_number`
- **Type**: String
- **Format**: NIST SP 800-53 control reference (e.g., "AC-2", "AU-2")
- **Required**: No
- **Example**: `"control_number": "AC-2"`
- **UI Element**: Text input
- **Purpose**: Reference specific SP 800-53 control

### Control Enhancement
**Field**: `control_enhancement`
- **Type**: String
- **Format**: Enhancement reference (e.g., "AC-2(1)", "AC-2(2)")
- **Required**: No
- **Example**: `"control_enhancement": "AC-2(1)"`
- **UI Element**: SelectField or text input
- **Purpose**: Specific control enhancement

### NIST Payload Example
```json
{
  "is_conformity": false,
  "severity": "HIGH",
  "status": "OPEN",
  "nist_function": "Protect",
  "nist_category": "PR.AC-1",
  "nist_subcategory": "Access is controlled and appropriate rights managed",
  "control_number": "AC-2",
  "control_enhancement": "AC-2(1)",
  "workings_and_test_results": "Found 15 accounts with excessive privileges",
  "conclusion": "Access control deficiency",
  "recommendation": "Conduct immediate access review",
  "responsible_person": "user-id-321",
  "due_date": "2025-03-31"
}
```

---

## Field Value Examples by Type

### String Fields
```json
{
  "clause_description": "Information security policies",
  "coso_principle": "The board demonstrates independence",
  "nist_subcategory": "Access is controlled",
  "recommendation": "Establish formal annual review process"
}
```

### Enum/Select Fields
```json
{
  "severity": "HIGH",
  "status": "OPEN",
  "compliance_status": "Partial",
  "control_type": "Preventive",
  "nist_function": "Protect"
}
```

### Boolean Fields
```json
{
  "is_conformity": true
}
```

### Numeric Fields
```json
{
  "compliance_percentage": 75
}
```

### Date Fields (ISO 8601)
```json
{
  "due_date": "2025-12-31"
}
```

### User ID Fields (UUID)
```json
{
  "responsible_person": "user-id-12345-abcdef"
}
```

---

## Conditional Field Presence

### Fields Always Present (if set)
- `is_conformity` - If user selected Conformity/Non-Conformity
- `severity` - If user selected severity level
- `status` - If user selected status

### Fields Present Only for Specific Frameworks
- ISO27001: `clause_number`, `clause_description`, `compliance_status`, `compliance_percentage`
- COSO: `coso_component`, `coso_principle`, `control_type`, `entity_level_control`
- COBIT: `cobit_domain`, `cobit_process`, `cobit_process_name`, `capability_level`, `target_capability_level`
- NIST: `nist_function`, `nist_category`, `nist_subcategory`, `control_number`, `control_enhancement`

### Fields Present Only if User Provided Values
- `recommendation` - Only if user entered text
- `management_response` - Only if user entered text
- `action_plan` - Only if user entered text
- `responsible_person` - Only if user selected a person
- `due_date` - Only if user selected a date
- `evidence_links` - Only if user entered links

---

## Payload Size Guidelines

### Minimal Payload (1 field)
```json
{
  "status": "RESOLVED"
}
```
**Size**: ~30 bytes

### Typical Payload (10 fields)
```json
{
  "is_conformity": true,
  "severity": "HIGH",
  "status": "OPEN",
  "recommendation": "Establish formal annual review process",
  "management_response": "Agreed to implement",
  "action_plan": "Schedule quarterly reviews",
  "responsible_person": "user-id-123",
  "due_date": "2025-12-31",
  "conclusion": "Need to formalize review",
  "compliance_status": "Partial"
}
```
**Size**: ~400 bytes

### Complete Payload (20+ fields)
All fields populated with full content
**Size**: ~2000-3000 bytes

---

## Common Payload Patterns

### Closing a Finding (Resolved)
```json
{
  "status": "RESOLVED",
  "conclusion": "All corrective actions completed",
  "recommendation": "Monitor for 6 months"
}
```

### Assigning Responsibility
```json
{
  "responsible_person": "user-id-123",
  "due_date": "2025-06-30",
  "action_plan": "Implement corrective measures"
}
```

### Updating Compliance Status (ISO27001)
```json
{
  "compliance_status": "Compliant",
  "compliance_percentage": 100,
  "conclusion": "All requirements now met"
}
```

### Escalating Priority
```json
{
  "severity": "CRITICAL",
  "status": "OPEN",
  "recommendation": "Immediate remediation required"
}
```

---

## API Validation Rules

### Field Length Limits
- Text fields: 255 characters
- Textarea fields: 5000+ characters
- User ID: UUID format (36 characters)
- Date: YYYY-MM-DD format (10 characters)
- Percentage: 0-100 integer

### Required Field Combinations
- Severity must be provided if updating management fields
- Clause number must be provided for ISO27001 findings
- Due date should be provided with action plan
- Responsible person should be provided with due date

### Validation Failures Return
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field_name": "error message"
  }
}
```

---

## Summary Table

| Field | Type | Framework(s) | Required | Example |
|-------|------|---|----------|---------|
| is_conformity | Boolean | All | No | `true` |
| severity | Enum | All | Yes | `"HIGH"` |
| status | Enum | All | No | `"OPEN"` |
| clause_number | String | ISO27001 | Yes | `"5.1.1"` |
| compliance_status | Enum | ISO27001 | No | `"Partial"` |
| coso_component | String | COSO | Yes | `"Control Environment"` |
| cobit_domain | String | COBIT | Yes | `"APO"` |
| nist_function | String | NIST | Yes | `"Protect"` |
| recommendation | Text | All | No | `"Establish review..."` |
| responsible_person | UUID | All | No | `"user-id-123"` |
| due_date | Date | All | No | `"2025-12-31"` |

---

**Reference Complete** ✅

Use this guide to understand all possible payload fields and their properties.
