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

import { RiskResponse, StepThreeData, User } from "@/lib/types/risk-type";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RiskSlider } from "../risk-slider";
import { RiskScoreDisplay } from "../risk-score-display";

interface StepThreeProps {
  data: StepThreeData;
  onChange: (data: Partial<StepThreeData>) => void;
  users: Array<{ id: string; name: string }>;
  responses: RiskResponse[];
  closeDate: Date | undefined;
  onCloseDateChange: (date: Date | undefined) => void;
  likelihoodRange: { min: number; max: number };
  impactRange: { min: number; max: number };
  hasMatrixSelected: boolean;
  hasDepartmentSelected: boolean;
  isLoading: boolean;
  loadingUsers: boolean;
  loadingResponses: boolean;
}

export function StepThree({
  data,
  onChange,
  users,
  closeDate,
  onCloseDateChange,
  hasDepartmentSelected,
  isLoading,
  loadingUsers,
  loadingResponses,
  responses
}: StepThreeProps) {

  return (
    <>
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
        <SearchSelectField
          label="Risk Response"
          required
          placeholder="Select risk response"
          options={responses}
          value={data.risk_response_id}
          onValueChange={(value) => onChange({ risk_response_id: value })}
          isLoading={loadingResponses}
          isDisabled={isLoading || loadingResponses}
          classNames={{ wrapper: "max-w-full" }}
        />
        <div className="grid gap-2">
          <Label htmlFor="title">
            Risk Appetite Status<span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Enter risk title"
            value={data.risk_appetite_status}
            disabled
          />
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
          <Label htmlFor="target_closing_date">
            Target Closing Date<span className="text-destructive">*</span>
          </Label>
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
          <Label htmlFor="mitigation_cost">
            Mitigation Cost<span className="text-destructive">*</span>
          </Label>
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
