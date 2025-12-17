# Workflow UI Implementation Guide

**Status:** Ready to implement
**Time:** 6-8 hours total
**Difficulty:** Medium
**Priority:** 1 Critical bug + 4 Feature sets

---

## Overview

This guide provides step-by-step instructions to complete the workflow UI implementation. All backend integration is done; this is purely UI work.

---

## Phase 0: Fix Critical Bug (2 minutes)

### Bug Location
**File:** [instance-details.tsx](app/dashboard/workflow/manage/_components/instance-details.tsx)
**Line:** 31

### Current Code (WRONG)
```typescript
const { data: transitionsData, isLoading: transitionsLoading } = useAvailableTransitions(instanceId);
```

### Fixed Code (CORRECT)
```typescript
const { data: transitionsData, isLoading: transitionsLoading } = useAvailableTransitions(workflowId);
```

### How to Get workflowId
**Option 1:** From parent props
```typescript
interface InstanceDetailsProps {
  instanceId: string;
  workflowId: string;  // ← Add this
  workflowName?: string;
  onClose?: () => void;
}
```

**Option 2:** From instance data
```typescript
const workflowId = instanceData?.data?.workflow_id;
```

### After Fix
1. Transitions should load without errors
2. No console errors about missing parameter
3. Component should render correctly

---

## Phase 1: Add Approve Button (30 minutes)

### Step 1: Add Import
**File:** instance-details.tsx (line ~4)

Add to existing imports:
```typescript
import {
  useWorkflowInstance,
  useWorkflowApprovals,
  useAvailableTransitions,
  useApproveWorkflowTransition  // ← ADD THIS
} from "@/hooks/use-workflow-query-data";
```

### Step 2: Add Hook
**File:** instance-details.tsx (after existing hooks, ~line 30)

```typescript
const { mutate: approve, isPending: isApproving } = useApproveWorkflowTransition();
```

### Step 3: Add State (Optional)
**File:** instance-details.tsx (after other useState hooks)

```typescript
const [approvalComments, setApprovalComments] = useState("");
```

### Step 4: Add Handler
**File:** instance-details.tsx (before return statement)

```typescript
const handleApprove = () => {
  approve({
    instanceId,
    approvedBy: "current-user@company.com", // TODO: Get from auth context
    comments: approvalComments
  });
};
```

### Step 5: Add Button
Find the approvals section in JSX and add button:

```typescript
<div className="flex gap-2 mt-4">
  <Button
    onClick={handleApprove}
    disabled={isApproving}
    className="bg-green-600 hover:bg-green-700"
  >
    {isApproving ? "Approving..." : "Approve"}
  </Button>
</div>
```

### Test After
1. Click Approve button
2. Check Network tab: POST `/api/v1/simple-workflows/instances/{id}/approve`
3. Verify approvals list refreshes
4. Check for any console errors

---

## Phase 2: Add Reject Button (30 minutes)

### Step 1: Add Import
```typescript
import {
  // ... existing
  useRejectWorkflowTransition  // ← ADD THIS
} from "@/hooks/use-workflow-query-data";
```

### Step 2: Add Hook
```typescript
const { mutate: reject, isPending: isRejecting } = useRejectWorkflowTransition();
```

### Step 3: Add State
```typescript
const [rejectionReason, setRejectionReason] = useState("");
```

### Step 4: Add Handler
```typescript
const handleReject = () => {
  reject({
    instanceId,
    rejectedBy: "current-user@company.com", // TODO: Get from auth context
    reason: rejectionReason
  });
};
```

### Step 5: Add Button
Next to Approve button:

```typescript
<div className="flex gap-2 mt-4">
  <Button
    onClick={handleApprove}
    disabled={isApproving}
    className="bg-green-600 hover:bg-green-700"
  >
    Approve
  </Button>

  <Button
    onClick={handleReject}
    disabled={isRejecting}
    variant="destructive"
  >
    {isRejecting ? "Rejecting..." : "Reject"}
  </Button>
</div>
```

### Test After
1. Click Reject button
2. Check Network tab: POST `/api/v1/simple-workflows/instances/{id}/reject`
3. Verify instance status changes
4. Check approvals/transitions update accordingly

---

## Phase 3: Add Execute Transition Buttons (1 hour)

### Step 1: Add Import
```typescript
import {
  // ... existing
  useExecuteWorkflowTransition  // ← ADD THIS
} from "@/hooks/use-workflow-query-data";
```

### Step 2: Add Hook
```typescript
const { mutate: executeTransition, isPending: isExecuting } = useExecuteWorkflowTransition();
```

### Step 3: Add Handler
```typescript
const handleExecuteTransition = (transitionId: string, transitionName: string) => {
  executeTransition({
    instanceId,
    transitionId,
    executedBy: "current-user@company.com", // TODO: Get from auth context
    reason: `Manually executed: ${transitionName}`,
    actionData: {}
  });
};
```

### Step 4: Add Buttons Section
Find the transitions display area and add:

```typescript
{availableTransitions && availableTransitions.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Execute Transition</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {availableTransitions.map(transition => (
        <Button
          key={transition.id}
          onClick={() => handleExecuteTransition(transition.id, transition.name)}
          disabled={isExecuting}
          variant="outline"
          className="w-full justify-start"
        >
          {isExecuting ? "Executing..." : `Execute: ${transition.name}`}
        </Button>
      ))}
    </CardContent>
  </Card>
)}
```

### Test After
1. Click Execute button
2. Check Network tab: POST `/api/v1/simple-workflow-transitions`
3. Verify state changes
4. Verify new available transitions appear
5. Verify timeline updates

---

## Phase 4: Add Worker Controls (30 minutes)

### File
**File:** [workflow-worker-status.tsx](app/dashboard/workflow/manage/_components/workflow-worker-status.tsx)

### Step 1: Add Imports
```typescript
import {
  useTriggerWorkerProcess,
  useRestartWorker
} from "@/hooks/use-workflow-query-data";
```

### Step 2: Add Hooks
```typescript
const { mutate: trigger, isPending: isTriggering } = useTriggerWorkerProcess();
const { mutate: restart, isPending: isRestarting } = useRestartWorker();
```

### Step 3: Add Handlers
```typescript
const handleTrigger = () => {
  trigger({});
};

const handleRestart = () => {
  restart({});
};
```

### Step 4: Add Buttons
In the worker status card:

```typescript
<div className="flex gap-2 mt-4">
  <Button
    onClick={handleTrigger}
    disabled={isTriggering}
    variant="outline"
  >
    {isTriggering ? "Triggering..." : "Trigger Process"}
  </Button>

  <Button
    onClick={handleRestart}
    disabled={isRestarting}
    variant="outline"
  >
    {isRestarting ? "Restarting..." : "Restart Worker"}
  </Button>
</div>
```

### Test After
1. Click Trigger button
2. Check Network tab: POST `/api/v1/simple-workflows/worker/process`
3. Click Restart button
4. Check Network tab: POST `/api/v1/simple-workflows/worker/restart`

---

## Phase 5: Enhancements (Optional, 2+ hours)

### Enhancement 1: Better User Feedback

Add toast notifications:

```typescript
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();

// Modify handlers
const handleApprove = () => {
  approve(
    { instanceId, approvedBy: "user@company.com", comments: approvalComments },
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Approval recorded successfully"
        });
        setApprovalComments("");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to approve",
          variant: "destructive"
        });
      }
    }
  );
};
```

### Enhancement 2: Modal for Inputs

Add comment/reason modal:

```typescript
<Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Approve Workflow</DialogTitle>
    </DialogHeader>
    <Textarea
      placeholder="Comments (optional)"
      value={approvalComments}
      onChange={(e) => setApprovalComments(e.target.value)}
    />
    <DialogFooter>
      <Button onClick={handleApprove} disabled={isApproving}>
        Confirm Approval
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<Button onClick={() => setShowApproveDialog(true)}>
  Approve
</Button>
```

### Enhancement 3: Real-Time Status

Show "waiting for other approvers" message:

```typescript
{approvals?.some(a => !a.approved_at) && (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Waiting for {approvals.filter(a => !a.approved_at).length} more approval(s)
    </AlertDescription>
  </Alert>
)}
```

### Enhancement 4: Create Instance Feature

**File:** [workflow-administration.tsx](app/dashboard/workflow/manage/_components/workflow-administration.tsx)

Add Create Instance button:

```typescript
import { useStartWorkflowInstance } from "@/hooks/use-workflow-query-data";

const { mutate: createInstance } = useStartWorkflowInstance();

const handleCreateInstance = (workflowId: string, entityId: string) => {
  createInstance({
    workflowId,
    entityId,
    entityType: "risk", // Get from selection
    initiatedBy: "current-user@company.com" // TODO: From auth
  });
};

// Add button to Instances tab
<Button onClick={() => {/* show modal */}}>
  Create Workflow Instance
</Button>
```

---

## Testing Checklist

### Unit Test - Approve
- [ ] Click Approve button
- [ ] Network shows POST to `/api/v1/simple-workflows/instances/{id}/approve`
- [ ] Request body has `approved_by` and `comments`
- [ ] Approvals list updates immediately
- [ ] Button shows loading state during request

### Unit Test - Reject
- [ ] Click Reject button
- [ ] Network shows POST to `/api/v1/simple-workflows/instances/{id}/reject`
- [ ] Instance status changes to REJECTED
- [ ] No more transitions available

### Unit Test - Execute
- [ ] Click Execute button
- [ ] Network shows POST to `/api/v1/simple-workflow-transitions`
- [ ] Current state changes to next state
- [ ] Timeline updates with new entry
- [ ] New transitions appear (if available)

### Integration Test - Complete Flow
- [ ] Create instance (if implemented)
- [ ] Approve (if required)
- [ ] Execute transition
- [ ] Verify state chain: DRAFT → IN_REVIEW → FINAL → COMPLETED
- [ ] Verify approvals and timeline are correct

### Real-Time Test
- [ ] Open same instance in two windows
- [ ] Approve in first window
- [ ] Wait 15 seconds (React Query refresh)
- [ ] Verify second window shows approval automatically
- [ ] No manual refresh needed

### Error Test
- [ ] Disconnect network
- [ ] Click button
- [ ] Verify error toast/message shows
- [ ] Reconnect and retry

---

## Common Issues & Fixes

### Issue: "Cannot read property 'map' of undefined"
**Cause:** availableTransitions is null/undefined
**Fix:** Add null check: `availableTransitions?.map(...)`

### Issue: "useAvailableTransitions is not a function"
**Cause:** Import not added
**Fix:** Add import statement at top of file

### Issue: Button click doesn't do anything
**Cause:** Handler not connected
**Fix:** Verify `onClick={handleApprove}` is on button

### Issue: API returns 404
**Cause:** Wrong path being called
**Fix:** Check Network tab; verify path is `/api/v1/simple-workflows/...`

### Issue: Approvals don't update after clicking
**Cause:** Cache not invalidated
**Fix:** Already handled by mutation hook; check React Query DevTools

### Issue: Loading state stuck indefinitely
**Cause:** API error
**Fix:** Check Network tab for error response; add error handling toast

---

## Code Templates (Copy & Paste)

### Full InstanceDetails Component with All Features

```typescript
"use client";

import { useState } from "react";
import {
  useWorkflowInstance,
  useWorkflowApprovals,
  useAvailableTransitions,
  useApproveWorkflowTransition,
  useRejectWorkflowTransition,
  useExecuteWorkflowTransition
} from "@/hooks/use-workflow-query-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface InstanceDetailsProps {
  instanceId: string;
  workflowId: string;  // ← IMPORTANT
  workflowName?: string;
  onClose?: () => void;
}

export const InstanceDetails = ({
  instanceId,
  workflowId,
  workflowName = "Workflow",
  onClose
}: InstanceDetailsProps) => {
  // Queries
  const { data: instanceData, isLoading } = useWorkflowInstance(instanceId);
  const { data: approvalsData } = useWorkflowApprovals(instanceId);
  const { data: transitionsData } = useAvailableTransitions(workflowId);  // ← Fixed!

  // Mutations
  const { mutate: approve, isPending: isApproving } = useApproveWorkflowTransition();
  const { mutate: reject, isPending: isRejecting } = useRejectWorkflowTransition();
  const { mutate: executeTransition, isPending: isExecuting } = useExecuteWorkflowTransition();

  // State
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Data
  const instance = instanceData?.data;
  const approvals = approvalsData?.data || [];
  const availableTransitions = transitionsData?.data || [];

  // Handlers
  const handleApprove = () => {
    approve({
      instanceId,
      approvedBy: "user@company.com", // TODO: From auth
      comments: approvalComments
    });
  };

  const handleReject = () => {
    reject({
      instanceId,
      rejectedBy: "user@company.com", // TODO: From auth
      reason: rejectionReason
    });
  };

  const handleExecuteTransition = (transitionId: string) => {
    executeTransition({
      instanceId,
      transitionId,
      executedBy: "user@company.com", // TODO: From auth
      reason: "Executed"
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (!instance) return <div>Instance not found</div>;

  return (
    <div className="space-y-4">
      {/* Instance Info */}
      <Card>
        <CardHeader>
          <CardTitle>Instance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Entity</p>
              <p className="font-mono">{instance.entity_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">State</p>
              <Badge>{instance.current_state}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="secondary">{instance.workflow_status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Approvals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvals.length > 0 ? (
            approvals.map(a => (
              <div key={a.id} className="flex justify-between p-2 bg-muted rounded">
                <div>
                  <p className="font-medium">{a.approved_by}</p>
                  {a.comments && <p className="text-sm text-muted-foreground">{a.comments}</p>}
                </div>
                <Badge>✓ Approved</Badge>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No approvals yet</p>
          )}
          <div className="flex gap-2">
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? "Approving..." : "Approve"}
            </Button>
            <Button onClick={handleReject} disabled={isRejecting} variant="destructive">
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transitions */}
      {availableTransitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execute Transition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableTransitions.map(t => (
              <Button
                key={t.id}
                onClick={() => handleExecuteTransition(t.id)}
                disabled={isExecuting}
                variant="outline"
                className="w-full justify-start"
              >
                {isExecuting ? "Executing..." : `Execute: ${t.name}`}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

---

## Summary

| Phase | Time | Priority | Components |
|-------|------|----------|-----------|
| Bug fix | 2 min | 🔴 CRITICAL | Line 31 fix |
| Approve | 30 min | 🟡 HIGH | 1 button |
| Reject | 30 min | 🟡 HIGH | 1 button |
| Execute | 1 hr | 🟡 HIGH | Dynamic buttons |
| Worker | 30 min | 🟡 MEDIUM | 2 buttons |
| Polish | 2 hr | 🟡 MEDIUM | Toasts, modals |
| Create Instance | 2 hr | 🟢 LOW | Modal form |
| Testing | 1-2 hr | 🟡 HIGH | All features |

**Total:** 6-8 hours to implement and test everything
**Minimum:** 2.5 hours for critical (bug + core buttons)

---

**Ready to start?** Begin with Phase 0 (bug fix), then proceed in order.
