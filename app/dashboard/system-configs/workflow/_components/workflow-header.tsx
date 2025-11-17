"use client";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntityType, WorkflowTriggerType } from "@/lib/types/workflow";
import { SelectField } from "@/components/ui/select-field";
import { WORKFLOW_TRIGGER_TYPES } from "@/lib/constants";
import { useMemo } from "react";

interface WorkflowHeaderProps {
  workflowName: string;
  triggerType: WorkflowTriggerType;
  onWorkflowNameChange: (name: string) => void;
  onTriggerTypeChange: (type: WorkflowTriggerType) => void;
  onSave: () => void;
  onBack: () => void;
  onStateAdd: () => void;
  isLoading?: boolean;
}

export const WorkflowHeader = ({
  workflowName,
  triggerType,
  onStateAdd,
  onWorkflowNameChange,
  onTriggerTypeChange,
  onSave,
  onBack,
  isLoading = false
}: WorkflowHeaderProps) => {
  const triggerOptions = useMemo(
    () =>
      WORKFLOW_TRIGGER_TYPES.map((trigger) => ({
        id: trigger,
        name: trigger.replace(/_/g, " "),
        value: trigger
      })),
    []
  );
  return (
    <div className="bg-card border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-1 items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex max-w-2xl flex-1 items-center gap-3">
            <Input
              value={workflowName}
              onChange={(e) => onWorkflowNameChange(e.target.value)}
              placeholder="Workflow Name"
              className="font-semibold"
            />

            <SelectField
              value={triggerType}
              onValueChange={(value) => onTriggerTypeChange(value as WorkflowTriggerType)}
              options={triggerOptions}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={isLoading} onClick={onStateAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add a new state
          </Button>
          {/* <Button variant="outline" size="sm" disabled={isLoading}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button> */}
          <Button
            size="sm"
            onClick={onSave}
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Saving...">
            Save Workflow
          </Button>
        </div>
      </div>
    </div>
  );
};
