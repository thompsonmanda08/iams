"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { Save, FileText, Banknote } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { CURRENCIES } from "@/lib/constants";
import { useDepartments } from "@/hooks/use-query-data";
import { useBudgets } from "@/hooks/use-audit-settings-query-data";
import { useCreateBudgetMutation, useCreateBudgetLineMutation } from "@/hooks/use-budget-mutations";
import { Budget } from "@/lib/types/audit-types";
import { cn, notify } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { format } from "date-fns";

import { MODULE_CODES } from "@/lib/constants/module-codes";

const formatCurrency = (num: number): string => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatInputDisplay = (value: string): string => {
  const numValue = Number(value.replace(/,/g, "")) || 0;
  return formatCurrency(numValue);
};

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
  mode = "budget",
  onBudgetCreated,
  initialData
}: {
  budgetId?: string;
  departmentId?: string;
  mode?: "budget" | "line";
  onBudgetCreated?: (budgetId: string) => void;
  initialData?: Budget;
}) => {
  const router = useRouter();
  const { checkPermission, hasPermission } = usePermissions();

  const [budgetData, setBudgetData] = useState<BudgetFormData>({
    ...INIT_BUDGET_DATA,
    department_id: departmentId || ""
  });
  const [lineData, setLineData] = useState<BudgetLineFormData>({
    ...INIT_LINE_DATA,
    budget_id: budgetId || ""
  });

  const { mutate: createBudgetMutation, isPending: isCreatingBudget } = useCreateBudgetMutation({
    onSuccess: (response) => {
      const createdBudgetId = response?.data?.id;
      setBudgetData(INIT_BUDGET_DATA);
      if (onBudgetCreated && createdBudgetId) {
        onBudgetCreated(createdBudgetId);
      }
    }
  });

  const { mutate: createBudgetLineMutation, isPending: isCreatingLine } = useCreateBudgetLineMutation({
    onSuccess: () => {
      setLineData({
        ...INIT_LINE_DATA,
        budget_id: budgetId as string
      });
    }
  });

  const isCreating = isCreatingBudget || isCreatingLine;

  // Hydrate form when initialData arrives (edit mode)
  useEffect(() => {
    if (!initialData) return;
    setBudgetData({
      department_id: initialData.department_id ?? "",
      year: initialData.year ?? new Date().getFullYear(),
      title: initialData.title ?? "",
      total_amount: initialData.total_amount ?? 0,
      currency: initialData.currency ?? "ZMW",
      start_date: initialData.start_date
        ? format(new Date(initialData.start_date), "yyyy-MM-dd")
        : "",
      end_date: initialData.end_date
        ? format(new Date(initialData.end_date), "yyyy-MM-dd")
        : "",
      description: initialData.description ?? ""
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const totalAmountRef = useRef<HTMLInputElement>(null);
  const allocatedAmountRef = useRef<HTMLInputElement>(null);
  const spentAmountRef = useRef<HTMLInputElement>(null);

  // Use reusable hooks for data fetching
  const { data: departmentsResponse, isLoading: loadingDepartments } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });
  const departments = departmentsResponse?.data?.data || [];

  const { data: budgetsResponse, isLoading: loadingBudgets } = useBudgets();
  const budgetsData = budgetsResponse?.data || [];

  const updateBudgetData = (fields: Partial<BudgetFormData>) => {
    setBudgetData((prev) => ({ ...prev, ...fields }));
  };

  const updateLineData = (fields: Partial<BudgetLineFormData>) => {
    setLineData((prev) => ({ ...prev, ...fields }));
  };

  const createBudgetHandler = () => {
    // Validate date range
    const startDate = new Date(budgetData.start_date);
    const endDate = new Date(budgetData.end_date);

    if (endDate <= startDate) {
      return;
    }

    // Validate total amount
    if (budgetData.total_amount <= 0) {
      return;
    }

    // Validate required fields
    if (!budgetData.department_id) {
      return;
    }

    if (!budgetData.title.trim()) {
      return;
    }

    const budgetPayload = {
      department_id: budgetData.department_id,
      year: budgetData.year,
      title: budgetData.title,
      total_amount: budgetData.total_amount,
      currency: budgetData.currency,
      start_date: budgetData.start_date,
      end_date: budgetData.end_date,
      description: budgetData.description
    };

    createBudgetMutation(budgetPayload);
  };

  const createBudgetLineHandler = () => {
    if (!lineData.budget_id) return;
    if (!lineData.start_date || !lineData.end_date) return;

    if (selectedBudget?.start_date && selectedBudget?.end_date) {
      const budgetStart = new Date(selectedBudget.start_date);
      const budgetEnd = new Date(selectedBudget.end_date);
      const lineStart = new Date(lineData.start_date);
      const lineEnd = new Date(lineData.end_date);
      if (lineStart < budgetStart || lineEnd > budgetEnd) {
        notify({
          description: `Budget line dates must fall within the parent budget range (${format(budgetStart, "yyyy-MM-dd")} to ${format(budgetEnd, "yyyy-MM-dd")})`,
          type: "error"
        });
        return;
      }
    }

    const linePayload = {
      name: lineData.name,
      description: lineData.description,
      allocated_amount: lineData.allocated_amount,
      spent_amount: lineData.spent_amount,
      currency: lineData.currency,
      start_date: lineData.start_date,
      end_date: lineData.end_date,
      category: lineData.category
    };

    createBudgetLineMutation({ budgetId: lineData.budget_id, data: linePayload });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_create")) return;

    if (mode === "budget") {
      createBudgetHandler();
    } else {
      createBudgetLineHandler();
    }
  };

  const isEditMode = !!budgetId && mode === "budget";
  const selectedBudget: Budget | undefined = budgetsData?.find((b) => b.id === lineData.budget_id);

  return (
    <div className="from-background via-background to-muted/30 bg-linear-to-br">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <SearchSelectField
                    id="department"
                    label="Department"
                    required
                    className="w-full max-w-none"
                    classNames={{
                      wrapper: "max-w-none"
                    }}
                    placeholder="Search and select a department..."
                    options={departments}
                    value={budgetData.department_id}
                    onValueChange={(value) => updateBudgetData({ department_id: value })}
                    isDisabled={loadingDepartments}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="2020"
                    max="2100"
                    value={budgetData.year}
                    onChange={(e) => updateBudgetData({ year: Number(e.target.value) })}
                    placeholder="2025"
                    label="Year"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    id="title"
                    name="title"
                    value={budgetData.title}
                    onChange={(e) => updateBudgetData({ title: e.target.value })}
                    placeholder="e.g., Q4 2025 Departmental Budget"
                    label="Budget Title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    ref={totalAmountRef}
                    id="totalAmount"
                    name="totalAmount"
                    type="text"
                    inputMode="decimal"
                    min="0"
                    defaultValue={budgetData.total_amount}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");
                      const numValue = Number(rawValue) || 0;
                      updateBudgetData({ total_amount: numValue });
                    }}
                    onBlur={(e) => {
                      if (e.target.value) {
                        e.target.value = formatInputDisplay(e.target.value);
                      }
                    }}
                    placeholder="0.00"
                    label="Total Amount"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <SearchSelectField
                    id="currency"
                    name="currency"
                    label="Currency"
                    className="w-full max-w-none"
                    required
                    value={budgetData.currency}
                    onValueChange={(value) => updateBudgetData({ currency: value })}
                    placeholder="Select currency"
                    options={CURRENCIES.map((curr) => ({
                      id: curr.currency,
                      name: `${curr.currency} - ${curr.country}`,
                      value: curr.currency
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <DatePicker
                    label="Start Date"
                    name="start_date"
                    required
                    value={
                      budgetData?.start_date
                        ? (new Date(budgetData.start_date) as unknown as any)
                        : undefined
                    }
                    onValueChange={(date) =>
                      updateBudgetData({ start_date: date ? format(date, "yyyy-MM-dd") : "" })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <DatePicker
                    label="End Date"
                    name="end_date"
                    required
                    value={
                      budgetData.end_date
                        ? (new Date(budgetData.end_date) as unknown as any)
                        : undefined
                    }
                    onValueChange={(date) =>
                      updateBudgetData({ end_date: date ? format(date, "yyyy-MM-dd") : "" })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  id="description"
                  name="description"
                  label="Description"
                  value={budgetData.description}
                  onChange={(e) => updateBudgetData({ description: e.target.value })}
                  rows={4}
                  placeholder="Provide a detailed description of the budget purpose and scope..."
                  className="resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant={"destructive"}
                disabled={isCreating || loadingBudgets}
                onClick={() => {
                  router.back();
                }}
                className="gap-2 shadow-lg">
                Cancel
              </Button>
              <Button
                type="submit"
                form="budget-form"
                disabled={
                  isCreating ||
                  loadingDepartments ||
                  !budgetData.department_id ||
                  !budgetData.title ||
                  !budgetData.total_amount ||
                  Number(budgetData.total_amount) <= 0 ||
                  !budgetData.start_date ||
                  !budgetData.end_date
                }
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
                <Banknote className="text-primary h-5 w-5" />
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
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
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
                  <SelectField
                    id="lineCategory"
                    name="lineCategory"
                    label="Category"
                    required
                    className="w-full"
                    value={lineData.category}
                    onValueChange={(value) => updateLineData({ category: value })}
                    placeholder="Select category"
                    options={BUDGET_CATEGORIES.map((cat) => ({
                      id: cat,
                      name: cat,
                      value: cat
                    }))}
                  />
                </div>

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

              <Input
                id="lineName"
                name="lineName"
                value={lineData.name}
                onChange={(e) => updateLineData({ name: e.target.value })}
                placeholder="e.g., Personnel Costs"
                label="Line Name"
                required
                className="w-full"
                classNames={{
                  wrapper: "max-w-none w-full",
                  input: "max-w-none"
                }}
              />

              <div
                className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", {
                  "md:grid-cols-3": isEditMode
                })}>
                <Input
                  ref={allocatedAmountRef}
                  id="lineAllocated"
                  name="lineAllocated"
                  type="text"
                  inputMode="decimal"
                  min="0"
                  defaultValue={lineData.allocated_amount}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, "");
                    const numValue = Number(rawValue) || 0;
                    updateLineData({ allocated_amount: numValue });
                  }}
                  onBlur={(e) => {
                    if (e.target.value) {
                      e.target.value = formatInputDisplay(e.target.value);
                    }
                  }}
                  placeholder="0.00"
                  label="Allocated Amount"
                  required
                />

                {isEditMode && (
                  <Input
                    ref={spentAmountRef}
                    id="lineSpent"
                    name="lineSpent"
                    type="text"
                    inputMode="decimal"
                    min="0"
                    defaultValue={lineData.spent_amount}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");
                      const numValue = Number(rawValue) || 0;
                      updateLineData({ spent_amount: numValue });
                    }}
                    onBlur={(e) => {
                      if (e.target.value) {
                        e.target.value = formatInputDisplay(e.target.value);
                      }
                    }}
                    placeholder="0.00"
                    label="Spent Amount"
                  />
                )}

                <SearchSelectField
                  id="lineCurrency"
                  name="lineCurrency"
                  label="Currency"
                  required
                  className="w-full max-w-none"
                  classNames={{
                    wrapper: "w-full max-w-none"
                  }}
                  value={lineData.currency}
                  onValueChange={(value) => updateLineData({ currency: value })}
                  placeholder="Select currency"
                  options={CURRENCIES.map((curr) => ({
                    id: curr.currency,
                    name: `${curr.currency} - ${curr.country}`,
                    value: curr.currency
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DatePicker
                  label="Start Date"
                  name="lineStartDate"
                  minDate={
                    selectedBudget?.start_date ? new Date(selectedBudget.start_date) : undefined
                  }
                  maxDate={
                    selectedBudget?.end_date ? new Date(selectedBudget.end_date) : undefined
                  }
                  required
                  value={
                    lineData.start_date
                      ? (new Date(lineData.start_date) as unknown as any)
                      : undefined
                  }
                  onValueChange={(date) =>
                    updateLineData({ start_date: date ? format(date, "yyyy-MM-dd") : "" })
                  }
                />

                <DatePicker
                  label="End Date"
                  name="lineEndDate"
                  minDate={
                    selectedBudget?.start_date ? new Date(selectedBudget.start_date) : undefined
                  }
                  maxDate={
                    selectedBudget?.end_date ? new Date(selectedBudget.end_date) : undefined
                  }
                  required
                  value={
                    lineData.end_date ? (new Date(lineData.end_date) as unknown as any) : undefined
                  }
                  onValueChange={(date) =>
                    updateLineData({ end_date: date ? format(date, "yyyy-MM-dd") : "" })
                  }
                />
              </div>

              <Textarea
                id="lineDescription"
                name="lineDescription"
                label="Description"
                value={lineData.description}
                onChange={(e) => updateLineData({ description: e.target.value })}
                rows={3}
                placeholder="Describe the purpose and scope of this budget line..."
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant={"destructive"}
                disabled={isCreating || loadingBudgets}
                onClick={() => {
                  router.back();
                }}
                className="gap-2 shadow-lg">
                Cancel
              </Button>
              <Button
                type="submit"
                form="budget-form"
                disabled={
                  isCreating ||
                  loadingBudgets ||
                  !lineData.budget_id ||
                  !lineData.name ||
                  !lineData.allocated_amount ||
                  Number(lineData.allocated_amount) <= 0 ||
                  !lineData.currency ||
                  !lineData.category ||
                  !lineData.start_date ||
                  !lineData.end_date
                }
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
