"use client";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { EntityType } from "@/lib/types/workflow";

interface WorkflowHeaderProps {
  workflowName: string;
  entityType: EntityType;
  onWorkflowNameChange: (name: string) => void;
  onEntityTypeChange: (type: EntityType) => void;
  onSave: () => void;
  onBack: () => void;
}

export const WorkflowHeader = ({
  workflowName,
  entityType,
  onWorkflowNameChange,
  onEntityTypeChange,
  onSave,
  onBack
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

            <Select
              value={entityType}
              onValueChange={(value) => onEntityTypeChange(value as EntityType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RISK">Risk</SelectItem>
                <SelectItem value="AUDIT_PLAN">Audit Plan</SelectItem>
                <SelectItem value="FINDING">Finding</SelectItem>
                <SelectItem value="RECOMMENDATION">Recommendation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button size="sm" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Workflow
          </Button>
        </div>
      </div>
    </div>
  );
};
