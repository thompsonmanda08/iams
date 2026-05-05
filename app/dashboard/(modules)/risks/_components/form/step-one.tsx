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
import { SearchSelectField } from "@/components/ui/search-select-field";
import {
  StepOneData,
  Department,
  RiskCategory,
  BusinessProcess,
  SubProcess
} from "@/lib/types/risk-type";

interface StepOneProps {
  data: StepOneData;
  onChange: (data: Partial<StepOneData>) => void;
  departments: Department[];
  categories: RiskCategory[];
  businessProcesses: BusinessProcess[];
  availableSubProcesses: SubProcess[];
  pillars: any[];
  isLoading: boolean;
  loadingDepartments: boolean;
  loadingCategories: boolean;
  loadingProcesses: boolean;
  loadingPillars: boolean;
}

export function StepOne({
  data,
  onChange,
  departments,
  categories,
  businessProcesses,
  availableSubProcesses,
  pillars,
  isLoading,
  loadingDepartments,
  loadingCategories,
  loadingProcesses,
  loadingPillars
}: StepOneProps) {
  return (
    <>
      <Input
        label="Risk Title"
        required
        id="title"
        placeholder="Enter risk title"
        value={data.title}
        onChange={(e) => onChange({ title: e.target.value })}
        disabled={isLoading}
      />

      <div className="grid gap-2">
        <Label htmlFor="recurrence">
          Recurrence<span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.recurrence}
          onValueChange={(value) => onChange({ recurrence: value as "ongoing" | "one-time" })}
          disabled={isLoading}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="one-time">One-time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        label="Impact Description"
        required
        id="description"
        placeholder="Describe the risk in detail"
        rows={3}
        value={data.description}
        onChange={(e) => onChange({ description: e.target.value })}
        disabled={isLoading}
      />

      <div className="grid grid-cols-2 gap-4">
        <SearchSelectField
          label="Department"
          required
          placeholder="Select department"
          options={departments}
          value={data.department_id}
          onValueChange={(value) => onChange({ department_id: value })}
          isLoading={loadingDepartments}
          isDisabled={isLoading || loadingDepartments}
          classNames={{ wrapper: "max-w-full" }}
        />
        <SearchSelectField
          label="Risk Category"
          required
          placeholder="Select category"
          options={categories}
          value={data.category_id}
          onValueChange={(value) => onChange({ category_id: value })}
          isLoading={loadingCategories}
          isDisabled={isLoading || loadingCategories}
          classNames={{ wrapper: "max-w-full" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SearchSelectField
          label="Macro Process"
          required
          placeholder="Select macro process"
          options={businessProcesses}
          value={data.macro_process_id}
          onValueChange={(value) => onChange({ macro_process_id: value })}
          isLoading={loadingProcesses}
          isDisabled={isLoading || loadingProcesses}
          classNames={{ wrapper: "max-w-full" }}
        />
        <SearchSelectField
          label="Sub Process (Optional)"
          placeholder={!data.macro_process_id ? "Select macro process first" : "Select sub process"}
          options={availableSubProcesses}
          value={data.sub_process_id}
          onValueChange={(value) => onChange({ sub_process_id: value })}
          isLoading={loadingProcesses}
          isDisabled={isLoading || loadingProcesses || !data.macro_process_id}
          classNames={{ wrapper: "max-w-full" }}
        />
      </div>

      <SearchSelectField
        label="Strategic Objective"
        required
        placeholder="Select strategic objective"
        options={pillars}
        value={data.strategic_objective_id}
        onValueChange={(value) => onChange({ strategic_objective_id: value })}
        isLoading={loadingPillars}
        isDisabled={isLoading || loadingPillars}
        classNames={{ wrapper: "max-w-full" }}
        listItemName="title"
      />

      <Textarea
        label="Root Cause"
        required
        id="root_cause"
        placeholder="Describe the underlying cause of this risk"
        rows={2}
        value={data.root_cause}
        onChange={(e) => onChange({ root_cause: e.target.value })}
        disabled={isLoading}
      />
    </>
  );
}
