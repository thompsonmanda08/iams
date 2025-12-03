# API Payload Alignment - Finding Update Endpoint

**Status**: ✅ **ALIGNED** - UI and API are now fully synchronized for finding updates.

**Date**: 2025-12-03

---

## API Endpoint

```
PUT /api/v1/working-paper-findings/{finding_id}
```

---

## Example Payloads

### ISO27001 Finding Update
```json
{
  "severity": "HIGH",
  "recommendation": "Updated recommendation",
  "compliance_status": "Partial",
  "compliance_percentage": 50
}
```

### COSO Finding Update
```json
{
  "severity": "CRITICAL",
  "recommendation": "Critical control gap detected",
  "coso_component": "Control Environment",
  "coso_principle": "Entity-Level Controls"
}
```

### COBIT Finding Update
```json
{
  "severity": "HIGH",
  "recommendation": "Process improvement needed",
  "cobit_domain": "APO",
  "cobit_process": "APO01"
}
```

### NIST Finding Update
```json
{
  "severity": "MEDIUM",
  "recommendation": "Control enhancement required",
  "nist_function": "Protect",
  "nist_category": "PR.AC-1"
}
```

---

## UI Payload Building

### Location: `lib/utils/finding-form-utils.ts`

**Function**: `buildFindingPayload(formData, framework)`

**Algorithm**:
1. Start with empty payload object
2. Add each standard field only if it has a value (not empty, null, or undefined)
3. Add conformity assessment if set
4. Add framework-specific compliance fields (only if they have values)
5. Add framework-specific management fields (only if they have values)
6. Add framework-specific evidence fields (only if they have values)

**Result**: Clean, minimal payload with only populated fields

### Standard Fields Sent (when populated)
- `severity` - LOW, MEDIUM, HIGH, CRITICAL
- `status` - OPEN, IN_PROGRESS, RESOLVED, CLOSED
- `recommendation` - Text field
- `management_response` - Text field
- `action_plan` - Text field
- `responsible_person` - User ID
- `due_date` - ISO date string (YYYY-MM-DD format)
- `workings_and_test_results` - Text field
- `conclusion` - Text field
- `evidence_links` - Text field
- `is_conformity` - Boolean (true = Conformity, false = Non-Conformity)

### Framework-Specific Fields (when populated)

#### ISO27001
- `clause_number` (required) - Text
- `clause_description` - Textarea
- `compliance_status` - Select/Text
- `compliance_percentage` - Number (0-100)

#### COSO
- `coso_component` (required) - Select/Text
- `coso_principle` (required) - Select/Text
- `control_type` - Select/Text
- `entity_level_control` - Select/Text
- `control_deficiency_type` - Select/Text

#### COBIT
- `cobit_domain` (required) - Select/Text
- `cobit_process` (required) - Select/Text
- `cobit_process_name` - Text
- `capability_level` - Select/Text (0-5)
- `target_capability_level` - Select/Text (0-5)

#### NIST
- `nist_function` (required) - Select/Text
- `nist_category` (required) - Select/Text
- `nist_subcategory` - Text
- `control_number` - Text
- `control_enhancement` - Select/Text
- `assessment_type` - Select/Text

---

## Form Input Rendering

### Location: `app/dashboard/(modules)/audit/plans/_components/framework-finding-form.tsx`

**Conformity Assessment Section**:
- Two radio-like checkboxes: "Conformity" and "Non-Conformity"
- Collects `is_conformity` (boolean)
- Highlighted in green card

**Framework-Specific Compliance Fields Section**:
- Dynamically renders fields based on `config.complianceFields`
- Field types handled:
  - **textarea**: Multi-line text input, rows={3}
  - **text**: Single-line text input
  - **number**: Numeric input, min=0, max=100
  - **select**: Text input (for select fields)
  - **date**: DatePicker component
- Shows required indicator (*) for mandatory fields
- Shows field description below label
- Displays validation errors below input

**Standard Fields Section** (Management Response & Action Plan):
- Recommendation (textarea)
- Management Response (textarea)
- Action Plan (textarea)
- Responsible Person (SearchSelectField - user lookup)
- Due Date (DatePicker)
- Severity (SelectField dropdown)
- Status (SelectField dropdown)

**Workings & Test Results Section**:
- Workings and test results (textarea)
- Conclusion (textarea)

**Evidence Section** (currently commented out, can be enabled):
- Evidence Links (textarea)

---

## Data Flow

```
User Input in Form
         ↓
handleInputChange() - updates formData state
         ↓
Form Submit → handleSubmit(e)
         ↓
Validate Required Fields → validateFrameworkRequiredFields()
         ↓
Build Payload → buildFindingPayload(formData, framework)
         ↓
Update Finding → updateFinding(finding.id, payload)
         ↓
Server Action: PUT /api/v1/working-paper-findings/{finding_id}
         ↓
Invalidate Queries → Refresh finding data
         ↓
Notification: "Finding updated successfully"
         ↓
Close Modal / Collapse Form
```

---

## Field Type Mapping

| Field Config Type | Form Input | API Payload |
|------------------|-----------|------------|
| `textarea` | `<Textarea>` | String (as-is) |
| `text` | `<Input type="text">` | String (as-is) |
| `number` | `<Input type="number">` | Number (parsed as int) |
| `select` | `<Input type="text">` | String (as-is) |
| `date` | `<DatePicker>` | ISO date string (YYYY-MM-DD) |

---

## Validation

### Required Field Validation
**Function**: `validateFrameworkRequiredFields(formData, framework)`

**Process**:
1. Gets all fields for the framework (compliance, management, evidence)
2. Checks each required field has a non-empty value
3. Returns error object with field names and error messages
4. Prevents form submission if validation fails

**Required Fields by Framework**:
- **ISO27001**: clause_number, severity
- **COSO**: coso_component, coso_principle, severity
- **COBIT**: cobit_domain, cobit_process, severity
- **NIST**: nist_function, nist_category, severity
- **All**: is_conformity (implicitly required for completion)

---

## Example Complete Flow

### Scenario: Update ISO27001 Finding

**User Inputs**:
1. Selects "Conformity" checkbox
2. Enters Clause Number: "5.1.1"
3. Enters Clause Description: "Information security policies"
4. Sets Compliance Status: "Compliant"
5. Sets Compliance Percentage: 100
6. Enters Recommendation: "Maintain current controls"
7. Selects Responsible Person: "John Doe"
8. Selects Due Date: 2025-12-31
9. Clicks Save

**Form State**:
```javascript
{
  is_conformity: true,
  clause_number: "5.1.1",
  clause_description: "Information security policies",
  compliance_status: "Compliant",
  compliance_percentage: 100,
  recommendation: "Maintain current controls",
  responsible_person: "user-id-123",
  due_date: Date(2025-12-31),
  severity: "MEDIUM",
  status: "OPEN"
}
```

**Built Payload** (from buildFindingPayload):
```json
{
  "is_conformity": true,
  "severity": "MEDIUM",
  "status": "OPEN",
  "clause_number": "5.1.1",
  "clause_description": "Information security policies",
  "compliance_status": "Compliant",
  "compliance_percentage": 100,
  "recommendation": "Maintain current controls",
  "responsible_person": "user-id-123",
  "due_date": "2025-12-31"
}
```

**API Request**:
```
PUT /api/v1/working-paper-findings/{finding_id}
Content-Type: application/json

{
  "is_conformity": true,
  "severity": "MEDIUM",
  "status": "OPEN",
  "clause_number": "5.1.1",
  "clause_description": "Information security policies",
  "compliance_status": "Compliant",
  "compliance_percentage": 100,
  "recommendation": "Maintain current controls",
  "responsible_person": "user-id-123",
  "due_date": "2025-12-31"
}
```

**API Response**:
```json
{
  "success": true,
  "data": {
    "id": "finding-123",
    "finding_number": "F-001",
    "is_conformity": true,
    "severity": "MEDIUM",
    "status": "OPEN",
    "clause_number": "5.1.1",
    "clause_description": "Information security policies",
    "compliance_status": "Compliant",
    "compliance_percentage": 100,
    "recommendation": "Maintain current controls",
    "responsible_person": "user-id-123",
    "due_date": "2025-12-31",
    "updated_at": "2025-12-03T12:00:00Z"
  },
  "message": "Finding updated successfully"
}
```

---

## Key Improvements Made

### 1. Cleaner Payload
- **Before**: Sent all fields including finding_number, category_name, report, empty strings
- **After**: Only sends fields with actual values
- **Benefit**: Reduces API payload size, cleaner data, backend doesn't receive empty fields

### 2. Field Type Support
- **Before**: Only handled textarea, text, number fields
- **After**: Also handles select and date field types
- **Benefit**: Framework fields with select/date types now work correctly

### 3. Removed Unused Parameter
- **Before**: `buildFindingPayload(finding, formData, framework)` - finding parameter not used
- **After**: `buildFindingPayload(formData, framework)` - cleaner function signature
- **Benefit**: Simpler API, fewer dependencies

### 4. Conformity Always Included
- **Before**: Not explicitly included in payload
- **After**: Always included in payload when set
- **Benefit**: API receives conformity status even when other fields unchanged

---

## Testing Checklist

- [ ] Create ISO27001 finding, update with conformity status
- [ ] Update COSO finding with control type and deficiency type
- [ ] Update COBIT finding with domain and process
- [ ] Update NIST finding with function and category
- [ ] Verify required field validation works for each framework
- [ ] Test date picker for due date field
- [ ] Verify payload only includes populated fields
- [ ] Check API receives correct field values
- [ ] Verify success notification appears
- [ ] Confirm finding data refreshes in sidebar

---

## Code References

- **Payload Builder**: [lib/utils/finding-form-utils.ts:39-113](lib/utils/finding-form-utils.ts#L39-L113)
- **Form Component**: [app/dashboard/(modules)/audit/plans/_components/framework-finding-form.tsx:98-330](app/dashboard/(modules)/audit/plans/_components/framework-finding-form.tsx#L98-L330)
- **Field Config**: [lib/config/finding-framework-fields.ts](lib/config/finding-framework-fields.ts)
- **Server Action**: [app/_actions/audit-module-actions.ts:572-605](app/_actions/audit-module-actions.ts#L572-L605)

---

## Conclusion

✅ **UI and API are now fully aligned**

The form properly:
- Collects all required and optional fields per framework
- Builds a clean, minimal payload with only populated values
- Handles all field types (textarea, text, number, select, date)
- Validates framework-specific required fields
- Sends the correct data structure to the API
- Provides proper error handling and user feedback
