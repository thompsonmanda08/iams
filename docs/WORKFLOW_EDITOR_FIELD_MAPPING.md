# Workflow Editor - Complete Field Mapping Guide

**Date:** November 2, 2025
**Status:** ✅ Complete Field Prefilling Implemented

---

## Overview

When a user clicks "Edit" on an existing workflow, the `WorkflowEditor` fetches the workflow from the API and **prefills ALL fields** for editing. This document explains the complete field mapping from API response to editor format.

---

## API Response Structure

The backend API returns workflow data in **snake_case** format:

```json
{
  "id": "workflow-uuid",
  "name": "Risk Assessment Workflow",
  "entity_type": "RISK",
  "states": [
    {
      "id": "state-uuid-1",
      "name": "Draft",
      "is_initial": true,
      "is_final": false,
      "position": { "x": 100, "y": 100 }
    }
  ],
  "transitions": [
    {
      "id": "trans-uuid-1",
      "from_state_id": "state-uuid-1",
      "to_state_id": "state-uuid-2",
      "action_name": "SUBMIT",
      "permissions": [
        {
          "id": "perm-uuid-1",
          "role": "AUDITOR"
        }
      ],
      "conditions": [
        {
          "id": "cond-uuid-1",
          "field": "budget",
          "operator": "<",
          "value": "10000"
        }
      ],
      "actions": [
        {
          "id": "action-uuid-1",
          "type": "send_email",
          "config": { "recipient": "auditor@example.com" }
        }
      ]
    }
  ],
  "entry_conditions": []
}
```

---

## Complete Field Mapping

### 1. Workflow Level Fields

| API Field (snake_case) | Editor Field (camelCase) | Type | Prefilled? |
|------------------------|-------------------------|------|------------|
| `id` | `id` | string | ✅ Yes |
| `name` | `name` | string | ✅ Yes |
| `entity_type` | `entityType` | EntityType | ✅ Yes |
| `states` | `states` | State[] | ✅ Yes (mapped) |
| `transitions` | `transitions` | Transition[] | ✅ Yes (mapped) |
| `entry_conditions` | `entryConditions` | Condition[] | ✅ Yes |

---

### 2. State Fields

Each state in the `states` array is mapped:

| API Field | Editor Field | Type | Prefilled? | Default |
|-----------|--------------|------|------------|---------|
| `id` | `id` | string | ✅ Yes | - |
| `name` | `name` | string | ✅ Yes | - |
| `is_initial` | `isInitial` | boolean | ✅ Yes | `false` |
| `is_final` | `isFinal` | boolean | ✅ Yes | `false` |
| `position` | `position` | {x, y} | ✅ Yes | `{x: 100, y: 100}` |

**Code:**
```typescript
const mappedStates: State[] = (apiWorkflow.states || []).map((state: any) => ({
  id: state.id,
  name: state.name,
  isInitial: state.is_initial ?? false,
  isFinal: state.is_final ?? false,
  position: state.position || { x: 100, y: 100 }
}));
```

---

### 3. Transition Fields

Each transition in the `transitions` array is mapped:

| API Field | Editor Field | Type | Prefilled? | Fallback |
|-----------|--------------|------|------------|----------|
| `id` | `id` | string | ✅ Yes | - |
| `from_state_id` | `fromStateId` | string | ✅ Yes | - |
| `to_state_id` | `toStateId` | string | ✅ Yes | - |
| `action_name` or `name` | `actionName` | string | ✅ Yes | - |
| `permissions` | `permissions` | Permission[] | ✅ Yes (mapped) | `[]` |
| `conditions` | `conditions` | Condition[] | ✅ Yes (mapped) | `[]` |
| `actions` | `actions` | Action[] | ✅ Yes (mapped) | `[]` |

**Code:**
```typescript
const mappedTransitions: Transition[] = (apiWorkflow.transitions || []).map((trans: any) => ({
  id: trans.id,
  fromStateId: trans.from_state_id,
  toStateId: trans.to_state_id,
  actionName: trans.action_name || trans.name,
  permissions: (trans.permissions || []).map(/* ... */),
  conditions: (trans.conditions || []).map(/* ... */),
  actions: (trans.actions || []).map(/* ... */)
}));
```

---

### 4. Permission Fields (Nested in Transitions)

Each permission in `transition.permissions` is mapped:

| API Field | Editor Field | Type | Prefilled? | Fallback |
|-----------|--------------|------|------------|----------|
| `id` | `id` | string | ✅ Yes | Auto-generated |
| `role` or `role_name` | `role` | string | ✅ Yes | Empty string |

**Code:**
```typescript
permissions: (trans.permissions || []).map((perm: any) => ({
  id: perm.id || `perm-${Date.now()}`,
  role: perm.role || perm.role_name || ""
}))
```

**What Gets Prefilled:**
- ✅ Role names (e.g., "AUDITOR", "HIAR", "CEO")
- ✅ Permission IDs for editing
- ✅ All assigned roles show in the transition panel

---

### 5. Condition Fields (Nested in Transitions)

Each condition in `transition.conditions` is mapped:

| API Field | Editor Field | Type | Prefilled? | Fallback |
|-----------|--------------|------|------------|----------|
| `id` | `id` | string | ✅ Yes | Auto-generated |
| `field` | `field` | string | ✅ Yes | - |
| `operator` | `operator` | OperatorType | ✅ Yes | - |
| `value` | `value` | string | ✅ Yes | - |

**Code:**
```typescript
conditions: (trans.conditions || []).map((cond: any) => ({
  id: cond.id || `cond-${Date.now()}`,
  field: cond.field,
  operator: cond.operator,
  value: cond.value
}))
```

**What Gets Prefilled:**
- ✅ Field names (e.g., "budget", "status")
- ✅ Operators (e.g., "<", ">", "=", "contains")
- ✅ Values (e.g., "10000", "approved")
- ✅ All conditions show in the rule builder

---

### 6. Action Fields (Nested in Transitions)

Each action in `transition.actions` is mapped:

| API Field | Editor Field | Type | Prefilled? | Fallback |
|-----------|--------------|------|------------|----------|
| `id` | `id` | string | ✅ Yes | Auto-generated |
| `type` | `type` | ActionType | ✅ Yes | - |
| `config` | `config` | Record<string, any> | ✅ Yes | `{}` |

**Code:**
```typescript
actions: (trans.actions || []).map((action: any) => ({
  id: action.id || `action-${Date.now()}`,
  type: action.type,
  config: action.config || {}
}))
```

**What Gets Prefilled:**
- ✅ Action types (e.g., "send_email", "create_log", "update_field", "trigger_webhook")
- ✅ Action configurations (e.g., `{ recipient: "auditor@example.com" }`)
- ✅ All actions show in the actions list

---

## Prefilling Scenarios

### Scenario 1: Edit Complete Workflow

**User Action:** Clicks "Edit" on a workflow card

**What Happens:**
1. ✅ Workflow name prefilled in header input
2. ✅ Entity type prefilled in dropdown
3. ✅ All states render on canvas with correct positions
4. ✅ Initial/Final state badges show correctly
5. ✅ All transitions render as arrows between states
6. ✅ Click transition → panel opens with:
   - ✅ Action name
   - ✅ All assigned roles
   - ✅ All conditions
   - ✅ All actions

**Example:**
```
Workflow: "Risk Assessment Workflow"
Entity Type: RISK

States on Canvas:
┌─────────┐        ┌────────────┐        ┌──────────┐
│  Draft  │───────→│  Reviewed  │───────→│ Approved │
│ (Start) │        │            │        │  (End)   │
└─────────┘        └────────────┘        └──────────┘

Click "Draft → Reviewed" transition:
  Action Name: "SUBMIT_FOR_REVIEW"
  Roles: ["AUDITOR", "ANALYST"]
  Conditions: [
    { field: "completeness", operator: "=", value: "100%" }
  ]
  Actions: [
    { type: "send_email", config: { recipient: "reviewer@org.com" } }
  ]
```

---

### Scenario 2: Edit Minimal Workflow

**User Action:** Edits a workflow with no transitions/conditions

**What Happens:**
1. ✅ Workflow name prefilled
2. ✅ Entity type prefilled
3. ✅ States render
4. ✅ Empty transitions array = no arrows
5. ✅ User can add new transitions

---

### Scenario 3: Missing Optional Fields

**API Response:**
```json
{
  "states": [
    {
      "id": "state-1",
      "name": "Draft",
      // Missing: is_initial, is_final, position
    }
  ]
}
```

**Editor Behavior:**
- ✅ `isInitial`: Defaults to `false`
- ✅ `isFinal`: Defaults to `false`
- ✅ `position`: Defaults to `{ x: 100, y: 100 }`
- ✅ State still renders and is editable

---

## Validation Before Prefilling

The code includes proper validation:

```typescript
// Check if response is successful
if (response.success && response.data) {
  // Proceed with mapping
} else {
  toast.error("Failed to load workflow");
  setWorkflow(createDefaultWorkflow());
}

// Safe array mapping with fallbacks
const mappedStates = (apiWorkflow.states || []).map(/* ... */);

// Null coalescing for booleans
isInitial: state.is_initial ?? false

// Logical OR for strings
role: perm.role || perm.role_name || ""
```

---

## User Experience Flow

```
┌─────────────────────────────────────────┐
│ 1. User clicks "Edit" button           │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 2. Loading spinner appears              │
│    "Loading workflow..."                │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 3. API fetches workflow details         │
│    GET /api/v1/workflows/details        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 4. Data transformed & mapped            │
│    snake_case → camelCase               │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 5. Editor renders with ALL fields       │
│    ✅ Name input filled                 │
│    ✅ Entity type selected              │
│    ✅ States on canvas                  │
│    ✅ Transitions as arrows             │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 6. User clicks on a transition          │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 7. Panel opens with:                    │
│    ✅ Action name                       │
│    ✅ Roles list                        │
│    ✅ Conditions list                   │
│    ✅ Actions list                      │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 8. User modifies and saves              │
│    PUT /api/v1/workflows/update         │
└─────────────────────────────────────────┘
```

---

## What Gets Prefilled - Complete Checklist

### Header Section
- [x] Workflow name input
- [x] Entity type dropdown

### Canvas Section
- [x] All state nodes with names
- [x] State positions (x, y coordinates)
- [x] Initial state badge (green)
- [x] Final state badge (red)
- [x] All transition arrows between states

### Transition Panel (when clicked)
- [x] Action name input
- [x] All assigned roles
- [x] All conditions with field/operator/value
- [x] All post-transition actions

### Entry Conditions
- [x] Workflow-level entry conditions

---

## Error Handling

If API returns incomplete data:

```typescript
// States missing
states: apiWorkflow.states || []  // Default to empty array

// Position missing
position: state.position || { x: 100, y: 100 }  // Default position

// Permissions missing
permissions: trans.permissions || []  // Default to empty array

// Config missing
config: action.config || {}  // Default to empty object
```

---

## Conclusion

✅ **All fields are properly prefilled** when editing a workflow:
- Workflow metadata (name, entity type)
- States (name, initial/final flags, positions)
- Transitions (action names, from/to states)
- Permissions (roles)
- Conditions (field, operator, value)
- Actions (type, config)

The mapping handles:
- ✅ snake_case to camelCase conversion
- ✅ Missing optional fields with sensible defaults
- ✅ Nested arrays (permissions, conditions, actions)
- ✅ Multiple field name variations (role vs role_name)
- ✅ Error states and fallbacks

**Result:** Users can edit existing workflows with complete confidence that all their data is loaded and editable.

---

**Documentation By:** Claude Code Assistant
**Date:** November 2, 2025
**Version:** 1.0
