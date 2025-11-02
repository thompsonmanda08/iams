"use client";
import { Plus, Trash2, GitBranchPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Transition, Condition, Permission, Action } from "@/lib/types/workflow";
import { RuleBuilder } from "./rule-builder";
import PageHeader from "@/components/page-header";
import CustomAlert from "@/components/ui/custom-alert";
import { SelectField } from "@/components/ui/select-field";
import { MultiSelectField } from "@/components/ui/multi-select-field";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface TransitionPanelProps {
  transition: Transition | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (transition: Transition) => void;
}

// Available roles - TODO: fetch from API
const AVAILABLE_ROLES = [
  { id: "ADMIN", name: "ADMIN" },
  { id: "AUDITOR", name: "AUDITOR" },
  { id: "HIAR", name: "HIAR" },
  { id: "CEO", name: "CEO" },
  { id: "MANAGER", name: "MANAGER" },
  { id: "VIEWER", name: "VIEWER" }
];

const ACTION_TYPES = [
  { value: "send_email", label: "Send Email" },
  { value: "create_log", label: "Create Log" },
  { value: "update_field", label: "Update Field" },
  { value: "trigger_webhook", label: "Trigger Webhook" }
];

export const TransitionPanel = ({
  transition,
  isOpen,
  onClose,
  onUpdate
}: TransitionPanelProps) => {
  const [localTransition, setLocalTransition] = useState<Transition | null>(transition);
  const [actionNameInput, setActionNameInput] = useState("");

  // Debounce action name to avoid excessive updates
  const debouncedActionName = useDebounce(actionNameInput, 500);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalTransition(transition);
    if (transition) {
      setActionNameInput(transition.action_name);
    }
  }, [transition]);

  // Update parent when debounced value changes
  useEffect(() => {
    if (localTransition && debouncedActionName !== localTransition.action_name) {
      handleUpdate({ action_name: debouncedActionName });
    }
  }, [debouncedActionName]);

  if (!localTransition) return null;

  const handleUpdate = (updates: Partial<Transition>) => {
    const updated = { ...localTransition, ...updates };
    setLocalTransition(updated);
    onUpdate(updated);
  };

  const addPermission = () => {
    const newPermission: Permission = {
      id: `perm-${Date.now()}`,
      role: ""
    };
    handleUpdate({ permissions: [...localTransition.permissions, newPermission] });
  };

  const updatePermission = (id: string, role: string) => {
    handleUpdate({
      permissions: localTransition.permissions.map((p) => (p.id === id ? { ...p, role } : p))
    });
  };

  const deletePermission = (id: string) => {
    handleUpdate({
      permissions: localTransition.permissions.filter((p) => p.id !== id)
    });
  };

  const addCondition = (condition: Condition) => {
    handleUpdate({ conditions: [...localTransition.conditions, condition] });
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    handleUpdate({
      conditions: localTransition.conditions.map((c) => (c.id === id ? { ...c, ...updates } : c))
    });
  };

  const deleteCondition = (id: string) => {
    handleUpdate({
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
    handleUpdate({ actions: newActions });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-0 pt-4 sm:max-w-xl">
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
          {/* Action Name */}
          <div className="space-y-2">
            <Input
              label="Action Name"
              id="action-name"
              value={actionNameInput}
              onChange={(e) => setActionNameInput(e.target.value)}
              placeholder="e.g., APPROVE_HIAR"
              descriptionText="The action trigger name for this transition"
              required
            />
          </div>

          {/* Permissions / Required Roles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Required Roles</Label>
              <Button size="sm" variant="outline" type="button" onClick={addPermission}>
                <Plus className="mr-1 h-3 w-3" />
                Add Role
              </Button>
            </div>

            {localTransition.permissions.length === 0 ? (
              <CustomAlert type="info" message="No role requirements" />
            ) : (
              <div className="space-y-2">
                {localTransition.permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-2">
                    <SelectField
                      options={AVAILABLE_ROLES}
                      value={permission.role}
                      onValueChange={(value) => updatePermission(permission.id, value)}
                      placeholder="Select role..."
                      className="w-full flex-1"
                      listItemName="name"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      type="button"
                      onClick={() => deletePermission(permission.id)}>
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              Specify which roles can execute this transition
            </p>
          </div>

          {/* Conditions */}
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
        </div>
      </SheetContent>
    </Sheet>
  );
};
