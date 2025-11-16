# Debugging: Transition Name Label Not Updating

## Issue
When editing a transition and changing the From Status or To Status, then clicking "Save Transition", the transition line label on the canvas doesn't update to reflect the new transition_name.

## Debugging Strategy
Added comprehensive logging at each step of the flow:

### 1. TransitionPanel.tsx - Status Change Handlers
**Location**: Lines 240-276 (From Status) and 293-329 (To Status)

Logs when either status dropdown changes:
```
=== FROM STATUS CHANGE ===
value (new from status): [STATUS_ID]
selectedToStatus: [STATUS_ID]
newTransitionName generated: [NEW_NAME]
=========================

=== TO STATUS CHANGE ===
value (new to status): [STATUS_ID]
selectedFromStatus: [STATUS_ID]
newTransitionName generated: [NEW_NAME]
=======================
```

**What to look for**:
- Does the transition_name get generated correctly (e.g., "IN_REVIEW_TO_APPROVED")?
- When changing From, does it use the current selectedToStatus value?
- When changing To, does it use the current selectedFromStatus value?

### 2. TransitionPanel.tsx - Save Handler
**Location**: Lines 157-170

Logs when Save button is clicked:
```
=== TRANSITION PANEL SAVE ===
localTransition before onUpdate: {
  id, from_state_id, to_state_id,
  transition_name, _changeType
}
============================
```

**What to look for**:
- Is the transition_name correct at save time?
- Does it match what was generated in the status change handlers?

### 3. WorkflowEditor.tsx - handleTransitionUpdate
**Location**: Lines 289-332

Logs when the panel calls onUpdate():
```
=== WORKFLOW EDITOR HANDLE UPDATE ===
updatedTransition received: {
  id, from_state_id, to_state_id,
  transition_name, _changeType
}
transitionToUpdate being saved: {
  id, from_state_id, to_state_id,
  transition_name, _changeType
}
workflow.transitions after update: [
  { id, transition_name },
  ...
]
====================================
```

**What to look for**:
- Does the transition_name come through in updatedTransition?
- Is it the same in transitionToUpdate?
- Does workflow.transitions show the updated transition_name in the final array?

### 4. WorkflowCanvas.tsx - Render
**Location**: Lines 60-65

Logs on every canvas render:
```
=== CANVAS RENDERING TRANSITION ===
Transition [ID]: {
  from_state_id, to_state_id,
  transition_name
}
```

**What to look for**:
- Does the canvas receive the updated transition_name?
- Is it rendering with the new value?

## Expected Flow
1. User changes status in dropdown
2. Handler generates new transition_name (FROM LOGS 1)
3. User clicks Save
4. Panel saves localTransition with new transition_name (FROM LOGS 2)
5. Parent receives update with new transition_name (FROM LOGS 3)
6. Canvas re-renders with updated transition_name (FROM LOGS 4)

## How to Run
1. Open browser DevTools (F12)
2. Go to Console tab
3. Reproduce the issue:
   - Open transition for editing
   - Change From Status
   - Change To Status
   - Click Save Transition
4. Look at the console output and compare with expected values at each step

## Possible Issues

### If transition_name is incomplete (e.g., "DRAFT_TO_" or "_TO_APPROVED")
- The issue is in the status change handlers
- Check if selectedToStatus/selectedFromStatus is empty when the opposite status changes
- This would indicate a React state timing issue with setSelectedToStatus/setSelectedFromStatus

### If transition_name is correct in panel but wrong in editor
- The issue is in the onUpdate call or parent component
- Check if updatedTransition has the correct value in logs 2 and 3

### If transition_name is correct in editor but wrong in canvas
- The issue is in how workflow state is being set
- Check if the correct transition is being found in the map operation

### If canvas never logs the updated transition_name
- The component isn't re-rendering
- Check if setWorkflow is actually triggering a re-render
