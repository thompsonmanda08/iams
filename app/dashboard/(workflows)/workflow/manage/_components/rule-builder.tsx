"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/ui/permission-button";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Condition, OperatorType } from "@/lib/types/workflow";
import CustomAlert from "@/components/ui/custom-alert";

interface RuleBuilderProps {
  conditions: Condition[];
  onAdd: (condition: Condition) => void;
  onUpdate: (id: string, updates: Partial<Condition>) => void;
  onDelete: (id: string) => void;
}

const operators: OperatorType[] = ["=", "!=", ">", "<", ">=", "<=", "is", "contains"];

export const RuleBuilder = ({ conditions, onAdd, onUpdate, onDelete }: RuleBuilderProps) => {
  const handleAdd = () => {
    const newCondition: Condition = {
      id: `cond-${Date.now()}`,
      field: "",
      operator: "=",
      value: ""
    };
    onAdd(newCondition);
  };

  return (
    <div className="space-y-3">
      {conditions.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed py-6 text-center">
          <Button size="sm" variant="outline" type="button" onClick={handleAdd}>
            <Plus className="mr-1 h-3 w-3" />
            Add Condition
          </Button>
        </div>
      ) : (
        <>
          {conditions.map((condition, index) => (
            <div key={condition.id} className="space-y-2">
              {index > 0 && (
                <div className="text-muted-foreground pl-2 text-xs font-medium">AND</div>
              )}
              <div className="bg-card flex items-center gap-2 rounded-lg border p-3">
                <Input
                  value={condition.field}
                  onChange={(e) => onUpdate(condition.id, { field: e.target.value })}
                  placeholder="Field"
                  className="flex-1"
                />

                <Select
                  value={condition.operator}
                  onValueChange={(value) =>
                    onUpdate(condition.id, { operator: value as OperatorType })
                  }>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op} value={op}>
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={condition.value}
                  onChange={(e) => onUpdate(condition.id, { value: e.target.value })}
                  placeholder="Value"
                  className="flex-1"
                />

                <PermissionButton
                  moduleCode={MODULE_CODES.WORKFLOW_CONFIG}
                  action="can_configure"
                  size="icon"
                  variant="outline"
                  type="button"
                  onClick={() => onDelete(condition.id)}>
                  <Trash2 className="text-destructive h-4 w-4" />
                </PermissionButton>
              </div>
            </div>
          ))}

          <Button size="sm" variant="outline" type="button" onClick={handleAdd} className="w-full">
            <Plus className="mr-1 h-3 w-3" />
            Add Condition
          </Button>
        </>
      )}
    </div>
  );
};
