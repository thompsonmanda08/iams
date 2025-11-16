"use client";
import { GitBranchPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Transition, Permission, Action, State, Condition } from "@/lib/types/workflow";
import PageHeader from "@/components/page-header";
import { SelectField } from "@/components/ui/select-field";
import { MultiSelectField } from "@/components/ui/multi-select-field";
import { useState, useEffect, useMemo } from "react";
import { STANDARD_STATUSES } from "@/lib/statuses";
import { useRoles } from "@/hooks/use-query-data";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
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
  workflowId?: string;
}

const ACTION_TYPES = [
  { value: "send_email", label: "Send Email" },
  { value: "create_log", label: "Create Log" },
  { value: "update_field", label: "Update Field" },
  { value: "trigger_webhook", label: "Trigger Webhook" }
];

// Convert StandardStatus values to SelectField options
const STATUS_OPTIONS = Object.values(STANDARD_STATUSES).map((config) => ({
  id: config.id,
  name: config.label
}));

export const TransitionPanel = ({
  transition,
  isOpen,
  onClose,
  onUpdate,
  states = []
}: TransitionPanelProps) => {
  const [localTransition, setLocalTransition] = useState<Transition | null>(transition);
  const [selectedFromStatus, setSelectedFromStatus] = useState("");
  const [selectedToStatus, setSelectedToStatus] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Fetch available roles from API
  const { data: rolesResponse, isLoading: rolesLoading } = useRoles({ is_Active: true });

  // Convert fetched roles to SelectField options
  const roleOptions: Array<{ id: string; name: string }> = useMemo(
    () =>
      rolesResponse?.success && rolesResponse?.data?.data
        ? rolesResponse.data.data.map((role: Role) => ({
            id: role.id,  // ✅ Use role ID, not name
            name: role.name
          }))
        : [],
    [rolesResponse]
  );

  // Create a mapping of status name to state (for finding state IDs by status)
  const statusToStateMap = useMemo(() => {
    const map = new Map<string, (typeof states)[0]>();
    states
      .filter((s) => s._changeType !== "deleted")
      .forEach((state) => {
        if (state.name) {
          map.set(state.name, state);
        }
      });
    return map;
  }, [states]);

  // Get all statuses that are already used by states
  const usedStatuses = useMemo(() => {
    return Array.from(statusToStateMap.keys());
  }, [statusToStateMap]);

  // Filter available statuses - only show statuses not already used, but always include currently selected ones
  const availableStatusOptions = useMemo(() => {
    const currentlySelected = new Set<string>();
    if (selectedFromStatus) currentlySelected.add(selectedFromStatus);
    if (selectedToStatus) currentlySelected.add(selectedToStatus);

    return STATUS_OPTIONS.filter((s) =>
      !usedStatuses.includes(s.name) || currentlySelected.has(s.id)
    );
  }, [usedStatuses, selectedFromStatus, selectedToStatus]);

  // Filter out selected status from the other dropdown to prevent selecting same status twice
  const fromStatusOptions = availableStatusOptions.filter((s) => s.id !== selectedToStatus);
  const toStatusOptions = availableStatusOptions.filter((s) => s.id !== selectedFromStatus);

  // Sync local state with prop changes and set defaults for new transitions
  // Note: Added isOpen to dependency array to ensure initialization runs when panel reopens
  useEffect(() => {
    setLocalTransition(transition);
    if (transition && isOpen) {
      let fromStatusId = "";
      let toStatusId = "";

      // Method 1: Try to get status from state objects (by state ID)
      if (transition.from_state_id && transition.to_state_id) {
        const fromStateObj = states.find((s) => s.id === transition.from_state_id);
        const toStateObj = states.find((s) => s.id === transition.to_state_id);

        if (fromStateObj?.name) {
          const matchingStatus = Object.entries(STANDARD_STATUSES).find(
            ([, config]) => config.label === fromStateObj.name
          );
          fromStatusId = matchingStatus?.[0] || "";
        }

        if (toStateObj?.name) {
          const matchingStatus = Object.entries(STANDARD_STATUSES).find(
            ([, config]) => config.label === toStateObj.name
          );
          toStatusId = matchingStatus?.[0] || "";
        }
      }

      // Method 2: Extract from transition_name (reliable fallback)
      // transition_name format: "FROM_STATUS_TO_TO_STATUS" (e.g., "DRAFT_TO_SUBMITTED")
      // This is the primary method for determining statuses since transition_name is always present
      const parts = transition.transition_name.split("_TO_");

      if (parts.length === 2) {
        const extractedFromStatus = parts[0];
        const extractedToStatus = parts[1];

        // Use extracted values if Method 1 didn't find them
        if (!fromStatusId && extractedFromStatus in STANDARD_STATUSES) {
          fromStatusId = extractedFromStatus;
        }
        if (!toStatusId && extractedToStatus in STANDARD_STATUSES) {
          toStatusId = extractedToStatus;
        }
      }

      setSelectedFromStatus(fromStatusId);
      setSelectedToStatus(toStatusId);
      setSelectedRole(transition.permissions[0]?.role || "");
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
    onUpdate(localTransition);
    onClose();
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);

    // Find the role object to get its name
    const selectedRoleObj = roleOptions.find((r) => r.id === roleId);
    const roleName = selectedRoleObj?.name || "";

    // Update transition with role ID and role name
    const permission: Permission = {
      id: localTransition.permissions[0]?.id || `perm-${Date.now()}`,
      role: roleName,  // Role name for display
      role_id: roleId   // Role ID for API requests
    };
    updateLocalTransition({
      permissions: roleId ? [permission] : []
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
            <Label htmlFor="from-status">From Status</Label>
            <SelectField
              id="from-status"
              options={fromStatusOptions}
              value={selectedFromStatus}
              onValueChange={(value) => {
                setSelectedFromStatus(value);
                if (!localTransition) return;

                // value is the StandardStatus id (e.g., "DRAFT")
                // Get the label (e.g., "Draft") and find the state with that name
                const statusLabel =
                  STANDARD_STATUSES[value as keyof typeof STANDARD_STATUSES]?.label;
                const matchingState = states.find(
                  (s) => s._changeType !== "deleted" && s.name === statusLabel
                );
                const fromStateId = matchingState?.id;

                // Update transition_name based on selected statuses
                // This should work regardless of whether matching states exist
                const newTransitionName = selectedToStatus
                  ? `${value}_TO_${selectedToStatus}`
                  : `${value}_TO_`;

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
              required
            />
            <p className="text-muted-foreground text-xs">
              The state this transition originates from
            </p>
          </div>

          {/* To Status */}
          <div className="space-y-2">
            <Label htmlFor="to-status">To Status</Label>
            <SelectField
              id="to-status"
              options={toStatusOptions}
              value={selectedToStatus}
              onValueChange={(value) => {
                setSelectedToStatus(value);
                if (!localTransition) return;

                // value is the StandardStatus id (e.g., "DRAFT")
                // Get the label (e.g., "Draft") and find the state with that name
                const statusLabel =
                  STANDARD_STATUSES[value as keyof typeof STANDARD_STATUSES]?.label;
                const matchingState = states.find(
                  (s) => s._changeType !== "deleted" && s.name === statusLabel
                );
                const toStateId = matchingState?.id;

                // Update transition_name based on selected statuses
                // This should work regardless of whether matching states exist
                const newTransitionName = selectedFromStatus
                  ? `${selectedFromStatus}_TO_${value}`
                  : `_TO_${value}`;

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
              placeholder="Select destination state..."
              listItemName="name"
              required
            />
            <p className="text-muted-foreground text-xs">The state this transition moves to</p>
          </div>

          {/* Required Role */}
          <div className="space-y-2">
            <Label htmlFor="required-role">Required Role</Label>
            <SelectField
              id="required-role"
              options={roleOptions}
              value={selectedRole}
              onValueChange={handleRoleChange}
              placeholder={rolesLoading ? "Loading roles..." : "Select role..."}
              listItemName="name"
              disabled={rolesLoading}
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
          <div className="space-y-3">
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Transition
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
