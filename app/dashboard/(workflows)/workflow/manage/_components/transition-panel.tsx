"use client";
import { GitBranchPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Transition, Permission, Action, State, Condition } from "@/lib/types/workflow";
import PageHeader from "@/components/page-header";
import { SelectField } from "@/components/ui/select-field";
import { MultiSelectField } from "@/components/ui/multi-select-field";
import { useState, useEffect, useMemo } from "react";
import { useRoles } from "@/hooks/use-query-data";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { notify } from "@/lib/utils";
import {
  createWorkflowTransition,
  updateWorkflowTransition
} from "@/app/_actions/workflow-actions";
import type { Role } from "@/lib/types/account";

interface TransitionPanelProps {
  transition: Transition | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (transition: Transition) => void;
  states?: State[];
  transitions?: Transition[];
  workflowId?: string;
}

const ACTION_TYPES = [
  { value: "send_email", label: "Send Email" },
  { value: "create_log", label: "Create Log" },
  { value: "update_field", label: "Update Field" },
  { value: "trigger_webhook", label: "Trigger Webhook" }
];

// Status options will be generated from workflow states, not STANDARD_STATUSES
// This allows dynamic workflow states instead of hardcoded statuses

export const TransitionPanel = ({
  transition,
  isOpen,
  onClose,
  onUpdate,
  states = [],
  transitions = []
}: TransitionPanelProps) => {
  const [localTransition, setLocalTransition] = useState<Transition | null>(transition);
  const [selectedFromStatus, setSelectedFromStatus] = useState("");
  const [selectedToStatus, setSelectedToStatus] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Fetch available roles from API
  const { data: rolesResponse, isLoading: rolesLoading } = useRoles({ is_Active: true });

  // Convert fetched roles to SelectField options
  const roleOptions: Array<{ id: string; name: string }> = useMemo(
    () =>
      rolesResponse?.success && rolesResponse?.data?.data
        ? rolesResponse.data.data.map((role: Role) => ({
            id: role.id, // ✅ Use role ID, not name
            name: role.name
          }))
        : [],
    [rolesResponse]
  );

  // Generate status options from workflow states
  // Each state name becomes an option that users can select for from_status and to_status
  const stateStatusOptions = useMemo(
    () =>
      (states || [])
        .filter((state) => state._changeType !== "deleted")
        .map((state) => ({
          id: state.name, // Use state name as the ID (this will be from_status/to_status value)
          name: state.name // Display the state name
        })),
    [states]
  );

  // Filter options to prevent selecting the same state twice
  const fromStatusOptions = stateStatusOptions.filter(
    (option) => option.id !== selectedToStatus || !selectedToStatus
  );

  const toStatusOptions = stateStatusOptions.filter(
    (option) => option.id !== selectedFromStatus || !selectedFromStatus
  );

  // Sync local state with prop changes and set defaults for new transitions
  // Note: Added isOpen to dependency array to ensure initialization runs when panel reopens
  useEffect(() => {
    setDuplicateError(null);
    setLocalTransition(transition);
    if (transition && isOpen) {
      let fromStatusValue = "";
      let toStatusValue = "";

      // Get from_state_id and to_state_id and find their corresponding state names
      if (transition.from_state_id && transition.to_state_id) {
        const fromState = states?.find((s) => s.id === transition.from_state_id);
        const toState = states?.find((s) => s.id === transition.to_state_id);

        if (fromState) {
          fromStatusValue = fromState.name; // State name is the from_status value
        }
        if (toState) {
          toStatusValue = toState.name; // State name is the to_status value
        }
      }

      setSelectedFromStatus(fromStatusValue);
      setSelectedToStatus(toStatusValue);
      setSelectedRoleId(transition.required_role_id || "");
    }
  }, [transition, states, isOpen]);

  if (!localTransition) return null;

  // Update local state without immediately calling parent
  const updateLocalTransition = (updates: Partial<Transition>) => {
    const updated = { ...localTransition, ...updates };
    setLocalTransition(updated);
  };

  // Save all changes and close panel
  const handleSave = () => {
    if (!localTransition) return;

    setDuplicateError(null);

    // Validation: Prevent saving if from_status and to_status are the same
    if (selectedFromStatus && selectedToStatus && selectedFromStatus === selectedToStatus) {
      notify({ description: "From State and To State cannot be the same", type: "error" });
      return;
    }

    // Validation: Both states must be selected
    if (!selectedFromStatus || !selectedToStatus) {
      notify({ description: "Both From State and To State must be selected", type: "error" });
      return;
    }

    // Validation: Role must be selected
    if (!selectedRoleId) {
      notify({ description: "A role must be selected for this transition", type: "error" });
      return;
    }

    // Check for duplicate transition (same from/to states + same role)
    const isDuplicate = transitions.some(
      (t) =>
        t.id !== localTransition.id &&
        t._changeType !== "deleted" &&
        t.from_state_id === localTransition.from_state_id &&
        t.to_state_id === localTransition.to_state_id &&
        t.required_role_id === selectedRoleId
    );

    if (isDuplicate) {
      setDuplicateError(
        "A transition between these two states with this role already exists. Please choose a different state or role."
      );
      return;
    }

    onUpdate(localTransition);
    onClose();
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    setDuplicateError(null);
    updateLocalTransition({
      required_role_id: roleId
    });
  };

  const addCondition = (condition: Condition) => {
    updateLocalTransition({ conditions: [...localTransition.conditions, condition] });
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    updateLocalTransition({
      conditions: localTransition.conditions.map((c) => (c.id === id ? { ...c, ...updates } : c))
    });
  };

  const deleteCondition = (id: string) => {
    updateLocalTransition({
      conditions: localTransition.conditions.filter((c) => c.id !== id)
    });
  };

  // Get selected action types as string array for MultiSelectField
  const selectedActionTypes = localTransition.actions.map((a) => a.type);

  const handleActionsChange = (selectedTypes: string[]) => {
    // Create action objects from selected types
    const newActions: Action[] = selectedTypes.map((type) => {
      // Try to find existing action with this type to preserve config
      const existing = localTransition.actions.find((a) => a.type === type);
      return (
        existing || {
          id: `action-${Date.now()}-${type}`,
          type: type as Action["type"],
          config: {}
        }
      );
    });
    updateLocalTransition({ actions: newActions });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-0 pt-4 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            <PageHeader
              title="Configure Transition"
              description="Setup how the workflow will be implemented and actioned"
              Icon={GitBranchPlus}
            />
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-6">
          {/* From Status */}
          <div className="space-y-2">
            <SelectField
              id="from-state"
              label="From State"
              options={fromStatusOptions}
              value={selectedFromStatus}
              onValueChange={(value) => {
                setSelectedFromStatus(value);
                setDuplicateError(null);
                if (!localTransition) return;

                // value is the state name (e.g., "Staff Submit")
                // Find the state with that name
                const matchingState = states.find(
                  (s) => s._changeType !== "deleted" && s.name === value
                );
                const fromStateId = matchingState?.id;

                // Update transition_name based on selected statuses
                // Format: "State Name-|-Other State Name"
                // Use the new value for fromStatus since we just updated it
                const toStatus = selectedToStatus || "";
                const newTransitionName = toStatus ? `${value}-|-${toStatus}` : `${value}-|-`;

                const updatedTransition = {
                  ...localTransition,
                  ...(fromStateId && { from_state_id: fromStateId }), // Only update state ID if found
                  transition_name: newTransitionName,
                  _changeType: (localTransition._changeType === "synced"
                    ? "modified"
                    : localTransition._changeType) as any
                };

                setLocalTransition(updatedTransition);
              }}
              placeholder="Select initial state..."
              listItemName="name"
              className="w-full"
              required
            />
            <p className="text-muted-foreground text-xs">
              The state this transition originates from
            </p>
          </div>

          {/* To Status */}
          <div className="space-y-2">
            <SelectField
              id="to-state"
              label="To State"
              placeholder="-- Select Destination State --"
              className="w-full"
              options={toStatusOptions}
              value={selectedToStatus}
              onValueChange={(value) => {
                setSelectedToStatus(value);
                setDuplicateError(null);
                if (!localTransition) return;

                // value is the state name (e.g., "Supervisor Review")
                // Find the state with that name
                const matchingState = states.find(
                  (s) => s._changeType !== "deleted" && s.name === value
                );
                const toStateId = matchingState?.id;

                // Update transition_name based on selected statuses
                // Format: "State Name-|-Other State Name"
                // Use the new value for toStatus since we just updated it
                const fromStatus = selectedFromStatus || "";
                const newTransitionName = fromStatus ? `${fromStatus}-|-${value}` : `-|-${value}`;

                const updatedTransition = {
                  ...localTransition,
                  ...(toStateId && { to_state_id: toStateId }), // Only update state ID if found
                  transition_name: newTransitionName,
                  _changeType: (localTransition._changeType === "synced"
                    ? "modified"
                    : localTransition._changeType) as any
                };

                setLocalTransition(updatedTransition);
              }}
              listItemName="name"
              required
            />
            <p className="text-muted-foreground text-xs">The state this transition moves to</p>
          </div>

          {/* Status Change Indicator */}
          {selectedFromStatus && selectedToStatus && (
            <div className="rounded-lg border border-dashed p-3">
              {selectedFromStatus === selectedToStatus ? (
                <p className="text-sm font-medium text-amber-600">
                  ⚠️ No Status Change - This transition stays in the same state
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Transition: {selectedFromStatus} → {selectedToStatus}
                </p>
              )}
            </div>
          )}

          {/* Required Role */}
          <div className="space-y-2">
            <SelectField
              id="required-role"
              label="Required User Role"
              options={roleOptions}
              value={selectedRoleId}
              onValueChange={handleRoleChange}
              placeholder={rolesLoading ? "Loading roles..." : "Select role..."}
              listItemName="name"
              disabled={rolesLoading}
              className="w-full"
            />
            <p className="text-muted-foreground text-xs">
              The role that can execute this transition
            </p>
          </div>

          {/* Conditions - Commented Out */}
          {/*
          <div className="space-y-3">
            <Label>Conditions</Label>
            <RuleBuilder
              conditions={localTransition.conditions}
              onAdd={addCondition}
              onUpdate={updateCondition}
              onDelete={deleteCondition}
            />
            <p className="text-muted-foreground text-xs">
              Define rules that must be met for this transition to execute
            </p>
          </div>
          */}

          {/* Post-Transition Actions */}
          {/* <div className="space-y-3">
            <Label>Post-Transition Actions</Label>
            <MultiSelectField
              options={ACTION_TYPES}
              value={selectedActionTypes}
              onValueChange={handleActionsChange}
              placeholder="Select actions..."
              label=""
            />
            <p className="text-muted-foreground text-xs">
              Actions that will be executed after this transition completes
            </p>
          </div> */}

          {/* Action Buttons */}
          {duplicateError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {duplicateError}
            </div>
          )}

          <div className="flex gap-2 pt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={
                !selectedFromStatus || !selectedToStatus || selectedFromStatus === selectedToStatus
              }>
              Save Transition
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
