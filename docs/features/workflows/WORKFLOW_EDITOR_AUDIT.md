# Workflow Editor Data Flow Audit

## Overview
This document audits the complete data flow in the workflow editor, from fetching existing workflows to saving changes. It covers how the system distinguishes between new vs. existing states/transitions and routes them through the appropriate create/update server actions.

---

## 1. Data Fetching Phase (Edit Mode)

### 1.1 Entry Point - Fetching Workflow Data
**File**: `app/dashboard/workflow/manage/_components/workflow-editor.tsx` (lines 159-190)

When editing an existing workflow (`workflowId` is provided), the component uses TanStack Query to fetch data from three separate endpoints in parallel:

```typescript
const {
  data: fetchedWorkflow,
  isLoading,
  isError,
  error,
  refetch
} = useQuery({
  queryKey: [QUERY_KEYS.WORKFLOWS, workflowId],
  queryFn: async () => {
    if (!workflowId) return null;

    // Parallel fetch of workflow details, states, and transitions
    const [details, states, transitions] = await Promise.all([
      getWorkflowDetails(workflowId),      // Workflow metadata
      getWorkflowStates(workflowId),       // All workflow states
      getWorkflowTransitions(workflowId)   // All workflow transitions
    ]);

    if (!details.success || !states.success || !transitions.success) {
      throw new Error(details.message || "Failed to load workflow");
    }

    return transformWorkflowData({
      ...details.data,
      states: states?.data || [],
      transitions: transitions?.data || []
    });
  },
  enabled: !!workflowId,      // Only fetch if workflowId exists
  staleTime: 1000 * 60 * 5,   // Cache for 5 minutes
  retry: 1
});
```

### 1.2 Server Actions for Fetching
**File**: `app/_actions/workflow-actions.ts`

**getWorkflowDetails** (line 96-117):
- Endpoint: `GET /api/v1/simple-workflows/{workflowId}`
- Returns: Workflow metadata (name, description, status, etc.)

**getWorkflowStates** (line 126-144):
- Endpoint: `GET /api/v1/simple-workflows/states?workflow_id={workflowId}`
- Returns: Array of all states for the workflow

**getWorkflowTransitions** (line 252-270):
- Endpoint: `GET /api/v1/simple-workflow-transitions?workflow_id={workflowId}`
- Returns: Array of all transitions for the workflow

---

## 2. Data Transformation Phase

### 2.1 transformWorkflowData Function
**File**: `app/dashboard/workflow/manage/_components/workflow-editor.tsx` (lines 37-97)

This function converts API response format (snake_case) to editor format and **crucially marks all data as "synced"**:

```typescript
const transformWorkflowData = (apiWorkflow: any): Workflow => {
  // Map states from API format
  const mappedStates: State[] = (apiWorkflow?.states || []).map((state: any) => ({
    id: state.id,
    name: state.name,
    isInitial: state.is_initial ?? false,
    isFinal: state.is_final ?? false,
    position: state.position || { x: 100, y: 100 },
    description: state.description,
    color: state.color,
    display_order: state.display_order ?? 0,
    _changeType: "synced" as const,    // ✅ KEY: Marks as existing (from server)
    _serverId: state.id                // ✅ KEY: Stores original server ID
  }));

  // Map transitions from API format
  const mappedTransitions: Transition[] = (apiWorkflow?.transitions || []).map((trans: any) => ({
    id: trans.id,
    from_state_id: trans.from_state_id,
    to_state_id: trans.to_state_id,
    transition_name: trans.transition_name || trans.action_name || trans.name,
    permissions: (trans.permissions || []).map((perm: any) => ({
      id: perm.id || `perm-${Date.now()}`,
      role: perm.role?.name || perm.role_name || ""
    })),
    conditions: (trans.conditions || []).map((cond: any) => ({
      id: cond.id || `cond-${Date.now()}`,
      field: cond.field,
      operator: cond.operator,
      value: cond.value,
      description: cond.description
    })),
    actions: (trans.actions || []).map((action: any) => ({
      id: action.id || `action-${Date.now()}`,
      type: action.type,
      config: action.config || {},
      description: action.description
    })),
    description: trans.description,
    _changeType: "synced" as const,    // ✅ KEY: Marks as existing (from server)
    _serverId: trans.id                // ✅ KEY: Stores original server ID
  }));

  return {
    id: apiWorkflow.id,
    name: apiWorkflow.name,
    trigger_type: apiWorkflow.trigger_type || apiWorkflow.entity_type || "AUDIT_PLAN",  // ✅ FIXED: Use trigger_type
    states: mappedStates,
    transitions: mappedTransitions,
    entry_conditions: [...],
    description: apiWorkflow.description,
    status: apiWorkflow.status
  };
};
```

### 2.2 Default Workflow Template (Create Mode)
**File**: `app/dashboard/workflow/manage/_components/workflow-editor.tsx` (lines 103-157)

When creating a new workflow (no `workflowId`), the editor uses a default template:

```typescript
const createDefaultWorkflow = (): Workflow => ({
  id: `wf-${Date.now()}`,
  name: "New Workflow",
  trigger_type: "AUDIT_PLAN",  // ✅ FIXED: Use trigger_type instead of entity_type
  states: [
    {
      id: "state-1",
      name: "Draft",
      isInitial: true,
      isFinal: false,
      position: { x: 100, y: 100 },
      _changeType: "created"    // ✅ KEY: Marks as new (to be created)
    },
    // ... more default states
  ],
  transitions: [
    {
      id: "trans-1",
      from_state_id: "state-1",
      to_state_id: "state-2",
      transition_name: "SUBMIT",
      permissions: [{ id: "p1", role: "AUDITOR" }],
      conditions: [],
      actions: [],
      _changeType: "created"    // ✅ KEY: Marks as new (to be created)
    },
    // ... more default transitions
  ],
  entry_conditions: []
});
```

### 2.3 Initial Workflow Selection Logic
**File**: `app/dashboard/workflow/manage/_components/workflow-editor.tsx` (lines 192-221)

```typescript
// Determine the initial workflow (from API or default template)
const initialWorkflow = useMemo(() => {
  if (workflowId && fetchedWorkflow) {
    return fetchedWorkflow;        // Edit mode: use fetched data (marked "synced")
  }
  return createDefaultWorkflow();  // Create mode: use template (marked "created")
}, [workflowId, fetchedWorkflow]);

// Local state for editing
const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);

// Update local state when fetched data changes
useMemo(() => {
  if (initialWorkflow) {
    setWorkflow(initialWorkflow);
  }
}, [initialWorkflow]);
```

---

## 3. Editing Phase

### 3.1 Change Type Transitions

The system tracks changes by modifying the `_changeType` property:

| Operation | Initial State | New State | Action |
|-----------|---------------|-----------|--------|
| Add new state | N/A | `"created"` | POST (create new) |
| Edit existing state | `"synced"` | `"modified"` | PUT (update existing) |
| Delete state | Any | `"deleted"` | DELETE (soft delete) |
| Edit new state | `"created"` | `"created"` | POST (create new, already marked) |
| Edit deleted state | N/A | N/A | Ignored in UI (not rendered) |

### 3.2 State Update Example
**File**: `app/dashboard/workflow/manage/_components/workflow-editor.tsx` (lines 241-281)

```typescript
const handleStateUpdate = (updatedState: State) => {
  const states = workflow.states || [];

  // Enforce single initial/final states...

  // Mark as modified if it was synced (from server)
  const stateToUpdate = {
    ...updatedState,
    _changeType: (updatedState._changeType === "synced"
      ? "modified"           // ✅ Changed from synced to modified
      : updatedState._changeType) as any
  };

  // Update the state
  const newStates = states.map((s) => {
    if (s.id === updatedState.id) {
      return stateToUpdate;
    }
    // ... handle initial/final state constraints
    return s;
  });

  setWorkflow({
    ...workflow,
    states: newStates
  });
};
```

### 3.3 Transition Update with State Renaming
**File**: `app/dashboard/workflow/manage/_components/workflow-editor.tsx` (lines 289-363)

When a transition is updated:

```typescript
const handleTransitionUpdate = (updatedTransition: Transition) => {
  // Mark as modified if it was synced
  const transitionToUpdate = {
    ...updatedTransition,
    _changeType: (updatedTransition._changeType === "synced"
      ? "modified"           // ✅ Changed from synced to modified
      : updatedTransition._changeType) as any
  };

  // Update workflow with the new transition
  let updatedWorkflow = {
    ...workflow,
    transitions: (workflow.transitions || []).map((t) =>
      t.id === updatedTransition.id ? transitionToUpdate : t
    )
  };

  // Rename states to match the transition's status labels immediately
  updatedWorkflow = applyStateRenaming({
    ...updatedWorkflow,
    transitions: updatedWorkflow.transitions || []
  });

  setWorkflow(updatedWorkflow);
  setSelectedTransition(transitionToUpdate);
  toast.success("Transition updated");
};
```

---

## 4. Save Phase - Categorization & Routing

### 4.1 Save Entry Point
**File**: `app/dashboard/workflow/manage/_components/workflow-editor.tsx` (lines 478-566)

```typescript
const handleSave = async () => {
  // Validation...

  const isExisting = !!workflowId;  // Determine if workflow is new or existing

  const result = await saveOrUpdateWorkflow(workflowToSave, isExisting);

  if (result.success) {
    toast.success(isExisting ? "Workflow updated successfully" : "Workflow created successfully");
    await queryClient.invalidateQueries({ queryKey: ["workflows"] });
    onBack();
  } else {
    toast.error(result.error || "Failed to save workflow");
  }
};
```

### 4.2 Categorization by _changeType
**File**: `hooks/use-workflow-mutations.ts` (lines 434-532)

The `saveOrUpdateWorkflow` function categorizes all items by their `_changeType`:

```typescript
const saveOrUpdateWorkflow = async (
  workflow: Workflow,
  isExisting: boolean
): Promise<SaveWorkflowResult> => {
  setState({ isLoading: true, error: null });

  try {
    // Step 1: Create or update the workflow itself
    let workflowResult: SaveWorkflowResult;

    if (isExisting) {
      workflowResult = await updateWorkflow(workflow.id, workflow);
    } else {
      workflowResult = await saveWorkflow(workflow);
    }

    if (!workflowResult.success) {
      throw new Error(workflowResult.error || "Failed to save workflow");
    }

    const workflowId = workflowResult.data?.id || workflow.id;

    // Step 2: Categorize states by change type
    const statesToCreate = (workflow.states || [])
      .filter((s) => s._changeType === "created");
    const statesToUpdate = (workflow.states || [])
      .filter((s) => s._changeType === "modified");
    const statesToDelete = (workflow.states || [])
      .filter((s) => s._changeType === "deleted");

    // Step 3: Categorize transitions by change type
    const transitionsToCreate = (workflow.transitions || [])
      .filter((t) => t._changeType === "created");
    const transitionsToUpdate = (workflow.transitions || [])
      .filter((t) => t._changeType === "modified");
    const transitionsToDelete = (workflow.transitions || [])
      .filter((t) => t._changeType === "deleted");

    // Step 4: Save states (delete first, then update, then create)
    if (statesToDelete.length > 0) {
      const deleteResult = await deleteStates(statesToDelete);
      if (!deleteResult.success) throw new Error(deleteResult.error || "Failed to delete states");
    }

    if (statesToUpdate.length > 0) {
      const updateResult = await updateStates(workflowId, statesToUpdate);
      if (!updateResult.success) throw new Error(updateResult.error || "Failed to update states");
    }

    if (statesToCreate.length > 0) {
      const createResult = await createStates(workflowId, statesToCreate);
      if (!createResult.success) throw new Error(createResult.error || "Failed to create states");
    }

    // Step 5: Save transitions (delete first, then update, then create)
    // ... similar logic for transitions

    setState({ isLoading: false, error: null });
    return { success: true, data: workflow };
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to save workflow";
    setState({ isLoading: false, error: errorMessage });
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};
```

---

## 5. Server Actions for State Management

### 5.1 Create States
**File**: `hooks/use-workflow-mutations.ts` (lines 188-223)

Handles POST requests for new states:

```typescript
const createStates = async (workflowId: string, states: State[]): Promise<SaveWorkflowResult> => {
  try {
    const createdStates: State[] = [];

    for (let i = 0; i < states.length; i++) {
      const state = states[i];

      const response = await createWorkflowState(workflowId, {
        workflow_id: workflowId,
        state_name: state.name,
        description: state.description || "",
        display_order: i,           // Auto-increment based on order
        is_initial: state.isInitial,
        is_final: state.isFinal
      });

      if (!response.success) {
        throw new Error(`Failed to create state "${state.name}": ${response.message}`);
      }

      createdStates.push(response.data);
    }

    return { success: true, data: { states: createdStates } as any };
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to create workflow states";
    setState({ isLoading: false, error: errorMessage });
    return { success: false, error: errorMessage };
  }
};
```

**Server Action**: `createWorkflowState` in `app/_actions/workflow-actions.ts` (lines 149-184)
- Endpoint: `POST /api/v1/simple-workflows/states?workflow_id={workflowId}`
- Creates new state without `_serverId` (uses `id` from request)

### 5.2 Update States
**File**: `hooks/use-workflow-mutations.ts` (lines 229-262)

Handles PUT requests for modified states:

```typescript
const updateStates = async (_workflowId: string, states: State[]): Promise<SaveWorkflowResult> => {
  try {
    const updatedStates: State[] = [];

    for (const state of states) {
      if (!state._serverId) continue;  // Skip if no server ID (safeguard)

      const response = await updateWorkflowState(state._serverId, {
        name: state.name,
        description: state.description,
        is_initial: state.isInitial,
        is_final: state.isFinal
      });

      if (!response.success) {
        throw new Error(`Failed to update state "${state.name}": ${response.message}`);
      }

      updatedStates.push(response.data);
    }

    return { success: true, data: { states: updatedStates } as any };
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to update workflow states";
    setState({ isLoading: false, error: errorMessage });
    return { success: false, error: errorMessage };
  }
};
```

**Server Action**: `updateWorkflowState` in `app/_actions/workflow-actions.ts` (lines 189-218)
- Endpoint: `PUT /api/v1/simple-workflows/states/{stateId}`
- Uses `_serverId` (original server ID) to identify which state to update
- Key: The safeguard `if (!state._serverId) continue;` ensures only states with server IDs are updated

### 5.3 Delete States
**File**: `hooks/use-workflow-mutations.ts` (lines 268-291)

Handles DELETE requests for soft-deleted states:

```typescript
const deleteStates = async (states: State[]): Promise<SaveWorkflowResult> => {
  try {
    for (const state of states) {
      if (!state._serverId) continue;  // Skip if no server ID (never saved)

      const response = await deleteWorkflowState(state._serverId);

      if (!response.success) {
        throw new Error(`Failed to delete state "${state.name}": ${response.message}`);
      }
    }

    return { success: true };
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to delete workflow states";
    setState({ isLoading: false, error: errorMessage });
    return { success: false, error: errorMessage };
  }
};
```

**Server Action**: `deleteWorkflowState` in `app/_actions/workflow-actions.ts` (lines 223-243)
- Endpoint: `DELETE /api/v1/simple-workflows/states/{stateId}`
- Uses `_serverId` to identify which state to delete
- Only deletes states that were previously saved to server (have `_serverId`)

---

## 6. Server Actions for Transition Management

### 6.1 Create Transitions
**File**: `hooks/use-workflow-mutations.ts` (lines 296-343)

Handles POST requests for new transitions with StandardStatus extraction:

```typescript
const createTransitions = async (
  workflowId: string,
  transitions: Transition[]
): Promise<SaveWorkflowResult> => {
  try {
    const createdTransitions: Transition[] = [];

    for (const transition of transitions) {
      // Extract StandardStatus values from transition_name
      // Format: "FROM_STATUS_TO_TO_STATUS" (e.g., "DRAFT_TO_PENDING")
      const parts = transition.transition_name.split("_TO_");
      if (parts.length !== 2) {
        throw new Error(`Invalid transition name format: "${transition.transition_name}"`);
      }

      const fromStatus = parts[0];
      const toStatus = parts[1];

      // For now, use first role if available, else use a default
      const roleId = transition.permissions[0]?.role_id || "SYSTEM";  // ✅ FIXED: Use role_id instead of role

      const response = await createWorkflowTransition({
        workflow_id: workflowId,
        from_status: fromStatus,      // ✅ StandardStatus value (e.g., "DRAFT")
        to_status: toStatus,          // ✅ StandardStatus value (e.g., "PENDING")
        required_role_id: roleId
      });

      if (!response.success) {
        throw new Error(
          `Failed to create transition "${transition.transition_name}": ${response.message}`
        );
      }

      createdTransitions.push(response.data);
    }

    return { success: true, data: { transitions: createdTransitions } as any };
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to create workflow transitions";
    setState({ isLoading: false, error: errorMessage });
    return { success: false, error: errorMessage };
  }
};
```

**Server Action**: `createWorkflowTransition` in `app/_actions/workflow-actions.ts` (lines 275+)
- Endpoint: `POST /api/v1/simple-workflow-transitions`
- Takes StandardStatus values directly (not state IDs)

### 6.2 Update Transitions
**File**: `hooks/use-workflow-mutations.ts` (lines 350-398)

Handles PUT requests for modified transitions:

```typescript
const updateTransitions = async (
  transitions: Transition[]
): Promise<SaveWorkflowResult> => {
  try {
    const updatedTransitions: Transition[] = [];

    for (const transition of transitions) {
      if (!transition._serverId) continue;  // Skip if no server ID (never saved)

      // Extract StandardStatus values from transition_name
      // Format: "FROM_STATUS_TO_TO_STATUS" (e.g., "PENDING_TO_APPROVED")
      const parts = transition.transition_name.split("_TO_");
      if (parts.length !== 2) {
        throw new Error(`Invalid transition name format: "${transition.transition_name}"`);
      }

      const fromStatus = parts[0];
      const toStatus = parts[1];

      const roleId = transition.permissions[0]?.role_id || "SYSTEM";  // ✅ FIXED: Use role_id instead of role

      const response = await updateWorkflowTransition(transition._serverId, {
        from_status: fromStatus,      // ✅ StandardStatus value
        to_status: toStatus,          // ✅ StandardStatus value
        required_role_id: roleId
      });

      if (!response.success) {
        throw new Error(
          `Failed to update transition "${transition.transition_name}": ${response.message}`
        );
      }

      updatedTransitions.push(response.data);
    }

    return { success: true, data: { transitions: updatedTransitions } as any };
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to update workflow transitions";
    setState({ isLoading: false, error: errorMessage });
    return { success: false, error: errorMessage };
  }
};
```

**Server Action**: `updateWorkflowTransition` in `app/_actions/workflow-actions.ts`
- Endpoint: `PUT /api/v1/simple-workflow-transitions/{transitionId}`
- Uses `_serverId` to identify which transition to update
- Takes StandardStatus values directly

### 6.3 Delete Transitions
**File**: `hooks/use-workflow-mutations.ts` (lines 403-428)

Handles DELETE requests for soft-deleted transitions:

```typescript
const deleteTransitions = async (transitions: Transition[]): Promise<SaveWorkflowResult> => {
  try {
    for (const transition of transitions) {
      if (!transition._serverId) continue;  // Skip if no server ID (never saved)

      const response = await deleteWorkflowTransition(transition._serverId);

      if (!response.success) {
        throw new Error(
          `Failed to delete transition "${transition.transition_name}": ${response.message}`
        );
      }
    }

    return { success: true };
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to delete workflow transitions";
    setState({ isLoading: false, error: errorMessage });
    return { success: false, error: errorMessage };
  }
};
```

**Server Action**: `deleteWorkflowTransition` in `app/_actions/workflow-actions.ts`
- Endpoint: `DELETE /api/v1/simple-workflow-transitions/{transitionId}`
- Uses `_serverId` to identify which transition to delete

---

## 7. Summary - Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      EDIT MODE FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. FETCH PHASE
   workflowId provided
      ↓
   useQuery with Promise.all([
      getWorkflowDetails(id),
      getWorkflowStates(id),
      getWorkflowTransitions(id)
   ])
      ↓
   transformWorkflowData()
      ↓
   All items marked: _changeType = "synced", _serverId = server_id
      ↓
   setWorkflow(fetchedWorkflow)

2. EDIT PHASE
   User makes changes:

   a) Edit existing item (synced → modified)
      - State: _changeType = "modified", _serverId preserved
      - Transition: _changeType = "modified", _serverId preserved

   b) Add new item (not in list → created)
      - State: _changeType = "created", _serverId = undefined
      - Transition: _changeType = "created", _serverId = undefined

   c) Delete item (any → deleted)
      - State: _changeType = "deleted", _serverId preserved
      - Transition: _changeType = "deleted", _serverId preserved

3. SAVE PHASE
   handleSave() → saveOrUpdateWorkflow(workflow, isExisting: true)
      ↓
   Categorize by _changeType:
      ├─ statesToCreate (created) → createStates() → POST
      ├─ statesToUpdate (modified) → updateStates() → PUT
      └─ statesToDelete (deleted) → deleteStates() → DELETE
      ├─ transitionsToCreate (created) → createTransitions() → POST
      ├─ transitionsToUpdate (modified) → updateTransitions() → PUT
      └─ transitionsToDelete (deleted) → deleteTransitions() → DELETE

┌─────────────────────────────────────────────────────────────────┐
│                      CREATE MODE FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. FETCH PHASE
   No workflowId provided
      ↓
   createDefaultWorkflow()
      ↓
   All items marked: _changeType = "created", _serverId = undefined
      ↓
   setWorkflow(defaultWorkflow)

2. EDIT PHASE
   User edits template items:
      - Items remain: _changeType = "created"
      - User adds new items: _changeType = "created"
      - User deletes items: _changeType = "deleted" (but not sent to server)

3. SAVE PHASE
   handleSave() → saveOrUpdateWorkflow(workflow, isExisting: false)
      ↓
   First: saveWorkflow() → POST workflow metadata → returns workflow.id
      ↓
   Then: Categorize states/transitions by _changeType:
      ├─ statesToCreate (created) → createStates() → POST
      ├─ transitionsToCreate (created) → createTransitions() → POST
      └─ deleted items ignored (never sent to server)
```

---

## 8. Key Safeguards & Implementation Details

### 8.1 _changeType Property
Tracks the lifecycle of each item:
- `"created"`: New item, not yet saved to server
- `"synced"`: Existing item from server, no changes
- `"modified"`: Existing item from server, has been edited
- `"deleted"`: Marked for deletion (soft delete in UI)

### 8.2 _serverId Property
Stores the original server ID for:
- Identifying which item to update via PUT
- Identifying which item to delete via DELETE
- Safeguard: Only items with `_serverId` are sent to update/delete endpoints
- New items have no `_serverId` until first save

### 8.3 Create vs. Update Logic

**States:**
```
if (_changeType === "created") → createWorkflowState() [POST]
if (_changeType === "modified") → updateWorkflowState() [PUT with _serverId]
if (_changeType === "deleted") → deleteWorkflowState() [DELETE with _serverId]
```

**Transitions:**
```
if (_changeType === "created") → createWorkflowTransition() [POST]
if (_changeType === "modified") → updateWorkflowTransition() [PUT with _serverId]
if (_changeType === "deleted") → deleteWorkflowTransition() [DELETE with _serverId]
```

### 8.4 StandardStatus Extraction for Transitions

Transitions store `transition_name` in format: `"FROM_STATUS_TO_TO_STATUS"`
- Example: `"DRAFT_TO_PENDING"`, `"PENDING_TO_APPROVED"`
- During save, this is split: `transition_name.split("_TO_")`
- Extracted values sent to server: `from_status`, `to_status`
- Ensures semantic data (statuses) instead of opaque IDs

### 8.5 Order of Save Operations

For consistency and to prevent foreign key issues:
1. Delete operations (oldest items first)
2. Update operations (modified items)
3. Create operations (new items)

This ensures:
- No foreign key constraints are violated
- Updated items exist when transitions reference them
- New items are created before transitions reference them

---

## 9. Current Implementation Status

### ✅ Completed
- Data fetching from three separate endpoints
- Transformation with proper _changeType and _serverId marking
- State create/update/delete routing
- Transition create/update/delete routing
- StandardStatus extraction from transition_name
- Soft deletion support (UI hiding)
- Delete confirmation dialog with cascade indication

### ⚠️ Notes
- `updateWorkflow` server action is mocked (per user request)
- No explicit validation that states match transitions' from/to references
- Deleted items created during editing are never sent to server (expected)
- Position data for states is preserved but not sent to server on save

---

## 10. Testing Scenarios

### Scenario 1: Edit Existing Workflow
```
1. Open workflow (workflowId provided)
2. Fetch details, states, transitions in parallel
3. Transform all items: _changeType = "synced", _serverId = id
4. Edit state name
5. State: _changeType = "modified", _serverId preserved
6. Save → updateStates() → PUT /api/v1/simple-workflows/states/{_serverId}
```

### Scenario 2: Create New Workflow
```
1. New workflow (no workflowId)
2. Load default template
3. All items: _changeType = "created", _serverId = undefined
4. Add state, edit transition
5. Items still: _changeType = "created", _serverId = undefined
6. Save → createWorkflow() → POST workflow
7. Then → createStates() → POST states
8. Then → createTransitions() → POST transitions
```

### Scenario 3: Delete State with Transitions
```
1. Edit workflow (existing states and transitions)
2. Delete state → _changeType = "deleted"
3. Associated transitions also marked _changeType = "deleted"
4. Save → deleteTransitions() then deleteStates()
5. Uses _serverId to identify items for deletion
```

### Scenario 4: Add New State to Existing Workflow
```
1. Edit workflow (existing states fetched, marked "synced")
2. Add new state → _changeType = "created", _serverId = undefined
3. Save → Mixed categorization:
   - Existing states: update (if modified) or skip
   - New state: createStates() → POST
```

---

## 11. API Endpoints Reference

| Operation | Method | Endpoint | Input | Output |
|-----------|--------|----------|-------|--------|
| List Workflows | GET | `/api/v1/simple-workflows` | - | Array[Workflow] |
| Get Workflow Details | GET | `/api/v1/simple-workflows/{id}` | - | Workflow |
| Create Workflow | POST | `/api/v1/simple-workflows` | name, trigger_type | Workflow |
| Update Workflow | PUT | `/api/v1/simple-workflows/{id}` | name, trigger_type | Workflow |
| Get States | GET | `/api/v1/simple-workflows/states?workflow_id={id}` | - | Array[State] |
| Create State | POST | `/api/v1/simple-workflows/states?workflow_id={id}` | state_name, display_order, is_initial, is_final | State |
| Update State | PUT | `/api/v1/simple-workflows/states/{id}` | name, is_initial, is_final | State |
| Delete State | DELETE | `/api/v1/simple-workflows/states/{id}` | - | - |
| Get Transitions | GET | `/api/v1/simple-workflow-transitions?workflow_id={id}` | - | Array[Transition] |
| Create Transition | POST | `/api/v1/simple-workflow-transitions` | workflow_id, from_status, to_status, required_role_id | Transition |
| Update Transition | PUT | `/api/v1/simple-workflow-transitions/{id}` | from_status, to_status, required_role_id | Transition |
| Delete Transition | DELETE | `/api/v1/simple-workflow-transitions/{id}` | - | - |

