"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save, X, Calendar, DollarSign, FileText } from "lucide-react";
import { notify } from "@/lib/utils";
import { Budget, BudgetItem, BudgetLine } from "@/lib/types/audit-types";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";

export const mockBudgets: Budget[] = [
  {
    id: "1",
    name: "Departmental Budget",
    amount: 1000000,
    description: "This is the annual budget for all departments in the company",
    status: "BUDGET_CREATION",
    start_date: "2025-10-27",
    end_date: "2026-10-27",
    budget_lines: [
      {
        id: "1-1",
        name: "Operations",
        amount: 350000,
        description: "Budget under operations department",
        start_date: "2025-10-29",
        end_date: "2026-10-21"
      },
      {
        id: "1-2",
        name: "Finance",
        amount: 200000,
        description: "Budget under finance department",
        start_date: "2025-10-27",
        end_date: "2026-10-14"
      }
    ]
  },
  {
    id: "2",
    name: "Scheduled Budget",
    amount: 200000,
    description: "Quarterly scheduled budget allocations",
    status: "UNDER_REVIEW",
    start_date: "2025-10-22",
    end_date: "2027-02-27",
    budget_lines: [
      {
        id: "2-1",
        name: "Supplies",
        amount: 120000,
        description: "Office and operational supplies",
        start_date: "2025-10-22",
        end_date: "2027-02-27"
      },
      {
        id: "2-2",
        name: "Contingency",
        amount: 80000,
        description: "Emergency and contingency fund",
        start_date: "2025-10-22",
        end_date: "2027-02-27"
      }
    ]
  },
  {
    id: "3",
    name: "Latest Budget",
    amount: 200000,
    description: "Most recent budget allocation",
    status: "APPROVED",
    start_date: "2025-10-21",
    end_date: "2026-07-15",
    budget_lines: [
      {
        id: "3-1",
        name: "Training and Certifications",
        amount: 120000,
        description: "Employee development programs",
        start_date: "2025-10-21",
        end_date: "2026-07-15"
      },
      {
        id: "3-2",
        name: "Transport",
        amount: 80000,
        description: "Transportation and logistics",
        start_date: "2025-10-21",
        end_date: "2026-07-15"
      }
    ]
  }
];

export const mockBudgetItems: BudgetItem[] = [
  {
    id: "item-1",
    budget_line_id: "1-1",
    name: "Office Equipment",
    amount: 50000,
    description: "New computers and furniture",
    date: "2025-11-15"
  },
  {
    id: "item-2",
    budget_line_id: "1-1",
    name: "Software Licenses",
    amount: 30000,
    description: "Annual software subscriptions",
    date: "2025-12-01"
  },
  {
    id: "item-3",
    budget_line_id: "1-2",
    name: "Audit Services",
    amount: 75000,
    description: "External audit engagement",
    date: "2026-03-15"
  }
];

const INIT_FORM_DATA: Budget = {
  id: "",
  name: "",
  amount: 0,
  description: "",
  status: "BUDGET_CREATION",
  start_date: "",
  end_date: "",
  budget_lines: []
};
const BudgetForm = ({ budgetId, initialData }: { budgetId?: string; initialData?: Budget }) => {
  const router = useRouter();

  const [formData, setFormData] = useState<Budget>(
    initialData && budgetId ? initialData : INIT_FORM_DATA
  );

  const updateFormData = (fields: Partial<Budget>) => {
    setFormData((prevData) => ({
      ...prevData,
      ...fields
    }));
  };

  useEffect(() => {
    if (budgetId) {
      const budget = mockBudgets.find((b) => b.id === budgetId);
      if (budget) {
        updateFormData(budget);
      }
    }
  }, [budgetId]);

  const addBudgetLine = () => {
    const newLine: BudgetLine = {
      id: `line-${Date.now()}`,
      name: "",
      amount: 0,
      description: "",
      start_date: "",
      end_date: ""
    };
    updateFormData({
      budget_lines: [...formData.budget_lines, newLine]
    });
    // setBudgetLines([...budget_lines, newLine]);
  };

  const removeBudgetLine = (id: string) => {
    updateFormData({
      budget_lines: formData.budget_lines.filter((line) => line.id !== id)
    });
  };

  const updateBudgetLine = (id: string, field: keyof BudgetLine, value: string | number) => {
    updateFormData({
      budget_lines: formData.budget_lines.filter((line) => line.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    notify({
      title: budgetId ? "Budget Updated" : "Budget Created",
      description: `${formData.name} has been ${budgetId ? "updated" : "created"} successfully.`
    });
    router.push("/budget");
  };

  const isEditMode = !!budgetId;

  return (
    <div className="from-background via-background to-muted/30 min-h-screen bg-linear-to-br">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="animate-slide-up mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-2 text-4xl font-bold">
              {isEditMode ? "Edit Budget" : "Create New Budget"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update budget details and budget lines"
                : "Set up a new budget with budget lines"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/budget")}
              className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" form="budget-form" className="gap-2 shadow-lg">
              <Save className="h-4 w-4" />
              {isEditMode ? "Save Changes" : "Create Budget"}
            </Button>
          </div>
        </div>

        <form id="budget-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Budget Information */}
          <Card className="animate-fade-in p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground text-2xl font-bold">Budget Information</h2>
                <p className="text-muted-foreground text-sm">Basic details about the budget</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="budgetName"
                    className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="text-muted-foreground h-4 w-4" />
                    Budget Title
                  </Label>
                  <Input
                    id="budgetName"
                    // label="Budget Title"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder="Enter budget name"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="budgetAmount"
                    className="flex items-center gap-2 text-sm font-semibold">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    Total Amount
                  </Label>
                  <Input
                    id="budgetAmount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => updateFormData({ amount: Number(e.target.value) })}
                    placeholder="0.00"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <DatePicker
                    label="Start Date"
                    required
                    value={(formData.start_date ?? undefined) as any}
                    onValueChange={(date) =>
                      updateFormData({ start_date: date?.toISOString().split("T")[0] || null })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="space-y-2 md:col-span-3">
                  <Textarea
                    id="description"
                    label="  Description"
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    rows={4}
                    placeholder="Provide a detailed description of the budget..."
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <DatePicker
                    label="End Date"
                    required
                    value={(formData.end_date ?? undefined) as any}
                    onValueChange={(date) =>
                      updateFormData({ end_date: date?.toISOString().split("T")[0] || null })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Budget Lines */}
          <Card className="animate-fade-in p-8 shadow-xl [animation-delay:100ms]">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 rounded-lg p-2.5">
                  <DollarSign className="text-accent h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-foreground text-2xl font-bold">Budget Lines</h2>
                  <p className="text-muted-foreground text-sm">
                    Departmental allocations within the budget
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={addBudgetLine}
                variant="outline"
                className="hover:bg-accent/10 hover:text-accent hover:border-accent gap-2 transition-all">
                <Plus className="h-4 w-4" />
                Add Line
              </Button>
            </div>

            {formData.budget_lines?.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed py-12 text-center">
                <DollarSign className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
                <h3 className="text-foreground mb-2 text-lg font-semibold">No budget lines yet</h3>
                <p className="text-muted-foreground mb-6">
                  Add budget lines to organize departmental allocations
                </p>
                <Button type="button" onClick={addBudgetLine} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Line
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.budget_lines?.map((line, index) => (
                  <div
                    key={line.id}
                    className="from-card to-muted/20 animate-slide-in rounded-xl border-2 bg-linear-to-br p-6 transition-all hover:shadow-lg"
                    style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div className="space-y-2">
                          <Label htmlFor={`lineName-${line.id}`} className="text-sm font-medium">
                            Line Name
                          </Label>
                          <Input
                            id={`lineName-${line.id}`}
                            value={line.name}
                            onChange={(e) => updateBudgetLine(line.id, "name", e.target.value)}
                            placeholder="e.g., Operations"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`lineAmount-${line.id}`} className="text-sm font-medium">
                            Amount
                          </Label>
                          <Input
                            id={`lineAmount-${line.id}`}
                            type="number"
                            value={line.amount}
                            onChange={(e) =>
                              updateBudgetLine(line.id, "amount", Number(e.target.value))
                            }
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <DatePicker
                            id={`lineStartDate-${line.id}`}
                            type="date"
                            value={line.start_date as any}
                            onValueChange={(date) =>
                              updateBudgetLine(
                                line.id,
                                "start_date",
                                date?.toISOString().split("T")[0] as string
                              )
                            }
                            required
                          />
                          <DatePicker
                            id={`lineEndDate-${line.id}`}
                            type="date"
                            label="End Date"
                            value={line.end_date as any}
                            onValueChange={(date) =>
                              updateBudgetLine(
                                line.id,
                                "end_date",
                                date?.toISOString().split("T")[0] || ""
                              )
                            }
                            required
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            onClick={() => removeBudgetLine(line.id)}
                            variant="destructive"
                            size="icon"
                            className="h-10 w-full">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Textarea
                          id={`lineDescription-${line.id}`}
                          label="  Description"
                          value={line.description}
                          onChange={(e) => updateBudgetLine(line.id, "description", e.target.value)}
                          rows={2}
                          placeholder="Describe this budget line..."
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
