"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Save, FileText, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { CURRENCIES } from "@/lib/constants";
import { createBudget, createBudgetLine } from "@/app/_actions/audit-module-actions";
import { useDepartments } from "@/hooks/use-query-data";
import { useBudgets } from "@/hooks/use-audit-settings-query-data";

const BUDGET_CATEGORIES = ["PERSONNEL", "TECHNOLOGY", "TRAINING", "CONSULTING", "OTHER"];

interface BudgetFormData {
  department_id: string;
  year: number;
  title: string;
  total_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface BudgetLineFormData {
  budget_id: string;
  name: string;
  description: string;
  allocated_amount: number;
  spent_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  category: string;
}

const INIT_BUDGET_DATA: BudgetFormData = {
  department_id: "",
  year: new Date().getFullYear(),
  title: "",
  total_amount: 0,
  currency: "ZMW",
  start_date: "",
  end_date: "",
  description: ""
};

const INIT_LINE_DATA: BudgetLineFormData = {
  budget_id: "",
  name: "",
  description: "",
  allocated_amount: 0,
  spent_amount: 0,
  currency: "ZMW",
  start_date: "",
  end_date: "",
  category: "PERSONNEL"
};

const BudgetForm = ({
  budgetId,
  departmentId,
  mode = "budget"
}: {
  budgetId?: string;
  departmentId?: string;
  mode?: "budget" | "line";
}) => {
  const [budgetData, setBudgetData] = useState<BudgetFormData>({
    ...INIT_BUDGET_DATA,
    department_id: departmentId || ""
  });
  const [lineData, setLineData] = useState<BudgetLineFormData>({
    ...INIT_LINE_DATA,
    budget_id: budgetId || ""
  });
  const [isCreating, setIsCreating] = useState(false);

  // Use reusable hooks for data fetching
  const { data: departmentsResponse, isLoading: loadingDepartments } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });
  const departments = departmentsResponse?.data?.data || [];

  const { data: budgetsResponse, isLoading: loadingBudgets } = useBudgets();
  const budgetsData = budgetsResponse?.data?.data || [];

  const updateBudgetData = (fields: Partial<BudgetFormData>) => {
    setBudgetData((prev) => ({ ...prev, ...fields }));
  };

  const updateLineData = (fields: Partial<BudgetLineFormData>) => {
    setLineData((prev) => ({ ...prev, ...fields }));
  };

  const createBudgetHandler = async () => {
    setIsCreating(true);
    try {
      const budgetPayload = {
        department_id: budgetData.department_id,
        year: budgetData.year,
        title: budgetData.title,
        total_amount: budgetData.total_amount,
        currency: budgetData.currency,
        start_date: new Date(budgetData.start_date).toISOString(),
        end_date: new Date(budgetData.end_date).toISOString(),
        description: budgetData.description
      };

      const response = await createBudget(budgetPayload);

      if (response.success) {
        toast.success(response.message || "Budget created successfully");
      } else {
        toast.error(response.message || "Failed to create budget");
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error("Failed to create budget. Please try again");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const createBudgetLineHandler = async () => {
    setIsCreating(true);
    try {
      const linePayload = {
        name: lineData.name,
        description: lineData.description,
        allocated_amount: lineData.allocated_amount,
        spent_amount: lineData.spent_amount,
        currency: lineData.currency,
        start_date: new Date(lineData.start_date).toISOString(),
        end_date: new Date(lineData.end_date).toISOString(),
        category: lineData.category
      };

      const response = await createBudgetLine(lineData.budget_id, linePayload);

      if (response.success) {
        toast.success(response.message || "Budget line created successfully");
        setLineData({
          ...INIT_LINE_DATA,
          budget_id: budgetId as string
        });
      } else {
        toast.error(response.message || "Failed to create budget line");
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error("Failed to create budget line. Please try again.");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "budget") {
        await createBudgetHandler();
      } else {
        await createBudgetLineHandler();
      }
    } catch (error) {
      // Error handling is done via toast notifications
    }
  };

  const isEditMode = !!budgetId && mode === "budget";
  const selectedBudget = budgetsData?.find((b) => b.id === lineData.budget_id);

  return (
    <div className="from-background via-background to-muted/30 bg-gradient-to-br">
      <form id="budget-form" onSubmit={handleSubmit} className="space-y-6">
        {mode === "budget" ? (
          <Card className="animate-fade-in p-8">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Budget Information</h2>
                <p className="text-muted-foreground text-sm">Basic details about the budget</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <SearchSelectField
                    id="department"
                    label="Department"
                    required
                    placeholder="Search and select a department..."
                    options={departments}
                    value={budgetData.department_id}
                    onValueChange={(value) => updateBudgetData({ department_id: value })}
                    isDisabled={loadingDepartments}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    Year *
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    min="2020"
                    max="2100"
                    value={budgetData.year}
                    onChange={(e) => updateBudgetData({ year: Number(e.target.value) })}
                    placeholder="2025"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="text-muted-foreground h-4 w-4" />
                    Budget Title *
                  </Label>
                  <Input
                    id="title"
                    value={budgetData.title}
                    onChange={(e) => updateBudgetData({ title: e.target.value })}
                    placeholder="e.g., Q4 2025 Departmental Budget"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="totalAmount"
                    className="flex items-center gap-2 text-sm font-semibold">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    Total Amount *
                  </Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetData.total_amount || ""}
                    onChange={(e) => updateBudgetData({ total_amount: Number(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="currency"
                    className="flex items-center gap-2 text-sm font-semibold">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    Currency *
                  </Label>
                  <Select
                    value={budgetData.currency}
                    onValueChange={(value) => updateBudgetData({ currency: value })}>
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.currency} value={curr.currency}>
                          {curr.currency} - {curr.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    Start Date *
                  </Label>
                  <DatePicker
                    value={
                      budgetData?.start_date
                        ? (new Date(budgetData.start_date) as unknown as any)
                        : undefined
                    }
                    onValueChange={(date) =>
                      updateBudgetData({ start_date: date?.toISOString().split("T")[0] || "" })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    End Date *
                  </Label>
                  <DatePicker
                    value={
                      budgetData.end_date
                        ? (new Date(budgetData.end_date) as unknown as any)
                        : undefined
                    }
                    onValueChange={(date) =>
                      updateBudgetData({ end_date: date?.toISOString().split("T")[0] || "" })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={budgetData.description}
                  onChange={(e) => updateBudgetData({ description: e.target.value })}
                  rows={4}
                  placeholder="Provide a detailed description of the budget purpose and scope..."
                  className="resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                form="budget-form"
                disabled={isCreating || loadingDepartments}
                className="gap-2 shadow-lg">
                <Save className="h-4 w-4" />
                {isCreating ? "Creating..." : isEditMode ? "Save Changes" : "Create Budget"}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="animate-fade-in p-8">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <DollarSign className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Budget Line Information</h2>
                <p className="text-muted-foreground text-sm">
                  Details for the budget line allocation
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <SearchSelectField
                  id="budget"
                  label="Select Budget"
                  required
                  placeholder="Search and select a budget..."
                  options={
                    budgetsData?.map((budget: any) => ({
                      id: budget.id,
                      name: `${budget.title} - ${budget.currency} ${budget.total_amount.toLocaleString()}`
                    })) || []
                  }
                  value={lineData.budget_id}
                  onValueChange={(value) => updateLineData({ budget_id: value })}
                  isDisabled={loadingBudgets}
                />
                {selectedBudget && (
                  <div className="bg-muted/50 mt-2 rounded-lg p-3">
                    <p className="text-sm">
                      <strong>Selected Budget:</strong> {selectedBudget.title}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Total: {selectedBudget.currency}{" "}
                      {selectedBudget.total_amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    id="lineName"
                    label="Line Name"
                    value={lineData.name}
                    onChange={(e) => updateLineData({ name: e.target.value })}
                    placeholder="e.g., Personnel Costs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lineCategory" className="text-sm font-semibold">
                    Category *
                  </Label>
                  <Select
                    value={lineData.category}
                    onValueChange={(value) => updateLineData({ category: value })}>
                    <SelectTrigger id="lineCategory" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {BUDGET_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Input
                    id="lineAllocated"
                    label="Allocated Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={lineData.allocated_amount || ""}
                    onChange={(e) => updateLineData({ allocated_amount: Number(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    id="lineSpent"
                    label="Spent Amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={lineData.spent_amount || ""}
                    onChange={(e) => updateLineData({ spent_amount: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lineCurrency" className="text-sm font-semibold">
                    Currency *
                  </Label>
                  <Select
                    value={lineData.currency}
                    onValueChange={(value) => updateLineData({ currency: value })}>
                    <SelectTrigger id="lineCurrency" className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.currency} value={curr.currency}>
                          {curr.currency} - {curr.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    Start Date *
                  </Label>
                  <DatePicker
                    value={
                      lineData.start_date
                        ? (new Date(lineData.start_date) as unknown as any)
                        : undefined
                    }
                    onValueChange={(date) =>
                      updateLineData({ start_date: date?.toISOString().split("T")[0] || "" })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    End Date *
                  </Label>
                  <DatePicker
                    value={
                      lineData.end_date
                        ? (new Date(lineData.end_date) as unknown as any)
                        : undefined
                    }
                    onValueChange={(date) =>
                      updateLineData({ end_date: date?.toISOString().split("T")[0] || "" })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineDescription" className="text-sm font-semibold">
                  Description
                </Label>
                <Textarea
                  id="lineDescription"
                  value={lineData.description}
                  onChange={(e) => updateLineData({ description: e.target.value })}
                  rows={3}
                  placeholder="Describe the purpose and scope of this budget line..."
                  className="resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                form="budget-form"
                disabled={isCreating || loadingBudgets}
                className="gap-2 shadow-lg">
                <Save className="h-4 w-4" />
                {isCreating ? "Creating..." : "Create Budget Line"}
              </Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
};

export default BudgetForm;
