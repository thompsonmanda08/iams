import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SearchSelectField } from "@/components/ui/search-select-field";

import { StepThreeData, User } from "@/lib/types/risk-type";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RiskSlider } from "../risk-slider";
import { RiskScoreDisplay } from "../risk-score-display";

interface StepThreeProps {
  data: StepThreeData;
  onChange: (data: Partial<StepThreeData>) => void;
  users: Array<{ id: string; name: string }>;
  closeDate: Date | undefined;
  onCloseDateChange: (date: Date | undefined) => void;
  likelihoodRange: { min: number; max: number };
  impactRange: { min: number; max: number };
  hasMatrixSelected: boolean;
  hasDepartmentSelected: boolean;
  isLoading: boolean;
  loadingUsers: boolean;
}

export function StepThree({
  data,
  onChange,
  users,
  closeDate,
  onCloseDateChange,
  likelihoodRange,
  impactRange,
  hasMatrixSelected,
  hasDepartmentSelected,
  isLoading,
  loadingUsers
}: StepThreeProps) {
  const residualScore = data.residual_likelihood * data.residual_impact;

  return (
    <>
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Residual Risk Assessment</h3>
        <p className="text-muted-foreground text-sm">
          Assess the risk after considering planned controls
        </p>

        {!hasMatrixSelected && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              ⚠️ Please select a Risk Matrix in Step 2 before assessing residual risk.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <RiskSlider
            id="residual_likelihood"
            label="Likelihood"
            value={data.residual_likelihood}
            min={likelihoodRange.min}
            max={likelihoodRange.max}
            onChange={(value) => onChange({ residual_likelihood: value })}
            disabled={isLoading || !hasMatrixSelected}
            minLabel="Rare"
            maxLabel="Almost Certain"
          />
          <RiskSlider
            id="residual_impact"
            label="Impact"
            value={data.residual_impact}
            min={impactRange.min}
            max={impactRange.max}
            onChange={(value) => onChange({ residual_impact: value })}
            disabled={isLoading || !hasMatrixSelected}
            minLabel="Insignificant"
            maxLabel="Catastrophic"
          />
        </div>

        <RiskScoreDisplay
          score={residualScore}
          likelihood={data.residual_likelihood}
          impact={data.residual_impact}
          label="Residual"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="treatment_plan">
          Treatment Plan <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="treatment_plan"
          placeholder="Describe the risk mitigation strategy"
          rows={3}
          value={data.treatment_plan}
          onChange={(e) => onChange({ treatment_plan: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="risk_response">Risk Response</Label>
          <Select
            value={data.risk_response}
            onValueChange={(value) => onChange({ risk_response: value })}
            disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REDUCE">Reduce</SelectItem>
              <SelectItem value="ACCEPT">Accept</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
              <SelectItem value="AVOID">Avoid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="risk_appetite_status">Risk Appetite Status</Label>
          <Select
            value={data.risk_appetite_status}
            onValueChange={(value) =>
              onChange({ risk_appetite_status: value as "WITHIN" | "ABOVE" })
            }
            disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WITHIN">Within Appetite</SelectItem>
              <SelectItem value="ABOVE">Above Appetite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SearchSelectField
        label="Risk Owner"
        required
        placeholder={!hasDepartmentSelected ? "Select department first" : "Select risk owner"}
        options={users}
        value={data.risk_owner_id}
        onValueChange={(value) => onChange({ risk_owner_id: value })}
        isLoading={loadingUsers}
        isDisabled={isLoading || loadingUsers || !hasDepartmentSelected}
        descriptionText={
          !hasDepartmentSelected ? "Please select a department in Step 1 to load users" : undefined
        }
        classNames={{ wrapper: "max-w-full" }}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="target_closing_date">Target Closing Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !closeDate && "text-muted-foreground"
                )}
                disabled={isLoading}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {closeDate ? format(closeDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={closeDate}
                onSelect={onCloseDateChange}
                disabled={isLoading}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mitigation_cost">Mitigation Cost</Label>
          <Input
            id="mitigation_cost"
            type="number"
            placeholder="0.00"
            value={data.mitigation_cost || ""}
            onChange={(e) => onChange({ mitigation_cost: parseFloat(e.target.value) || 0 })}
            disabled={isLoading}
          />
        </div>
      </div>
    </>
  );
}
