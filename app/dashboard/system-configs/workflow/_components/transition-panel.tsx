"use client";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Transition, Condition, Permission, Action } from "@/lib/types/workflow";
import { Badge } from "@/components/ui/badge";
import { RuleBuilder } from "./rule-builder";

interface TransitionPanelProps {
  transition: Transition | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (transition: Transition) => void;
}

export const TransitionPanel = ({
  transition,
  isOpen,
  onClose,
  onUpdate
}: TransitionPanelProps) => {
  if (!transition) return null;

  const handleUpdate = (updates: Partial<Transition>) => {
    onUpdate({ ...transition, ...updates });
  };

  const addPermission = () => {
    const newPermission: Permission = {
      id: `perm-${Date.now()}`,
      role: ""
    };
    handleUpdate({ permissions: [...transition.permissions, newPermission] });
  };

  const updatePermission = (id: string, role: string) => {
    handleUpdate({
      permissions: transition.permissions.map((p) => (p.id === id ? { ...p, role } : p))
    });
  };

  const deletePermission = (id: string) => {
    handleUpdate({
      permissions: transition.permissions.filter((p) => p.id !== id)
    });
  };

  const addCondition = (condition: Condition) => {
    handleUpdate({ conditions: [...transition.conditions, condition] });
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    handleUpdate({
      conditions: transition.conditions.map((c) => (c.id === id ? { ...c, ...updates } : c))
    });
  };

  const deleteCondition = (id: string) => {
    handleUpdate({
      conditions: transition.conditions.filter((c) => c.id !== id)
    });
  };

  const addAction = () => {
    const newAction: Action = {
      id: `action-${Date.now()}`,
      type: "send_email",
      config: {}
    };
    handleUpdate({ actions: [...transition.actions, newAction] });
  };

  const deleteAction = (id: string) => {
    handleUpdate({
      actions: transition.actions.filter((a) => a.id !== id)
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Configure Transition</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Action Name */}
          <div className="space-y-2">
            <Label htmlFor="action-name">Action Name</Label>
            <Input
              id="action-name"
              value={transition.actionName}
              onChange={(e) => handleUpdate({ actionName: e.target.value })}
              placeholder="e.g., APPROVE_HIAR"
            />
            <p className="text-muted-foreground text-xs">
              The action trigger name for this transition
            </p>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Required Roles</Label>
              <Button size="sm" variant="outline" onClick={addPermission}>
                <Plus className="mr-1 h-3 w-3" />
                Add Role
              </Button>
            </div>

            {transition.permissions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No role requirements</p>
            ) : (
              <div className="space-y-2">
                {transition.permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-2">
                    <Input
                      value={permission.role}
                      onChange={(e) => updatePermission(permission.id, e.target.value)}
                      placeholder="e.g., HIAR, CEO"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deletePermission(permission.id)}>
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <Label>Conditions</Label>
            <RuleBuilder
              conditions={transition.conditions}
              onAdd={addCondition}
              onUpdate={updateCondition}
              onDelete={deleteCondition}
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Post-Transition Actions</Label>
              <Button size="sm" variant="outline" onClick={addAction}>
                <Plus className="mr-1 h-3 w-3" />
                Add Action
              </Button>
            </div>

            {transition.actions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No actions configured</p>
            ) : (
              <div className="space-y-2">
                {transition.actions.map((action) => (
                  <div
                    key={action.id}
                    className="bg-card flex items-center justify-between rounded-md border p-3">
                    <div>
                      <Badge variant="secondary">{action.type}</Badge>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteAction(action.id)}>
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
