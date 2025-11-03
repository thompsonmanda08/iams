"use client";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntityType } from "@/lib/types/workflow";
import { SelectField } from "@/components/ui/select-field";

interface WorkflowHeaderProps {
  workflowName: string;
  entityType: EntityType;
  onWorkflowNameChange: (name: string) => void;
  onEntityTypeChange: (type: EntityType) => void;
  onSave: () => void;
  onBack: () => void;
  onStateAdd: () => void;
  isLoading?: boolean;
}

export const WorkflowHeader = ({
  workflowName,
  entityType,
  onStateAdd,
  onWorkflowNameChange,
  onEntityTypeChange,
  onSave,
  onBack,
  isLoading = false
}: WorkflowHeaderProps) => {
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
              value={entityType}
              onValueChange={(value) => onEntityTypeChange(value as EntityType)}
              options={[
                { id: "RISK", name: "Risk" },
                { id: "AUDIT_PLAN", name: "Audit Plan" },
                { id: "FINDING", name: "Finding" },
                { id: "RECOMMENDATION", name: "Recommendation" }
              ]}
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
