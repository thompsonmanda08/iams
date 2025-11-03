// budget-details.tsx
"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Wallet,
  DollarSign,
  Calendar,
  Package,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { BudgetStatusBadge } from "./budget-status-badge";
import { DatePicker } from "@/components/ui/date-picker";
import Link from "next/link";
import { BudgetStatus } from "@/lib/types/audit-types";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES } from "@/lib/constants";
import {
  createBudgetLine,
  updateBudgetLine,
  deleteBudgetLine
} from "@/app/_actions/audit-module-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CustomPagination } from "@/components/ui/pagination";
import { Pagination } from "@/lib/types";
import { useRouter } from "next/navigation";

const BUDGET_CATEGORIES = ["PERSONNEL", "TECHNOLOGY", "TRAINING", "CONSULTING", "OTHER"];

interface Budget {
  id: string;
  title: string;
  total_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  description: string;
  status: string;
  year: number;
}

interface BudgetLine {
  id: string;
  name: string;
  description: string;
  allocated_amount: number;
  spent_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  category: string;
}

interface BudgetDetailsProps {
  budget: Budget;
  budgetLines: BudgetLine[];
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

const BudgetDetails = ({ budget, budgetLines }: BudgetDetailsProps) => {
  const router = useRouter();
  const [lineData, setLineData] = useState<BudgetLineFormData>({
    ...INIT_LINE_DATA,
    budget_id: budget?.id || "",
    currency: budget?.currency || "ZMW"
  });
  const [showLineForm, setShowLineForm] = useState(false);
  const [editingLine, setEditingLine] = useState<BudgetLine | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lineToDelete, setLineToDelete] = useState<BudgetLine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 10,
    total_pages: 1,
    totalCount: 0,
    has_next: false,
    has_prev: false
  });

  const safeBudgetLines = Array.isArray(budgetLines) ? budgetLines : [];

  // Paginated budget lines
  const paginatedBudgetLines = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.page_size;
    const endIndex = startIndex + pagination.page_size;
    return safeBudgetLines.slice(startIndex, endIndex);
  }, [safeBudgetLines, pagination.page, pagination.page_size]);

  // Update pagination data
  const customPaginationData = useMemo(() => {
    const totalCount = safeBudgetLines.length;
    const total_pages = Math.ceil(totalCount / pagination.page_size);

    return {
      ...pagination,
      total_pages,
      totalCount,
      has_next: pagination.page < total_pages,
      has_prev: pagination.page > 1
    };
  }, [safeBudgetLines.length, pagination]);

  const updatePagination = ({ page, page_size }: { page: number; page_size?: number }) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: page_size ?? prev.page_size
    }));
  };

  if (!budget) {
    return (
      <div className="from-background via-background to-muted/30 flex min-h-screen items-center justify-center bg-gradient-to-br">
        <Card className="max-w-md p-8 text-center">
          <Wallet className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
          <h2 className="mb-4 text-2xl font-bold">Budget Not Found</h2>
          <p className="text-muted-foreground mb-6">The budget you're looking for doesn't exist.</p>
          <Link href="/dashboard/audit/budgets">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Budgets
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
  };

  const totalAllocated = safeBudgetLines.reduce(
    (sum, line) => sum + (line.allocated_amount || 0),
    0
  );
  const totalSpent = safeBudgetLines.reduce((sum, line) => sum + (line.spent_amount || 0), 0);
  const remainingBudget = budget.total_amount - totalAllocated;

  const updateLineData = (fields: Partial<BudgetLineFormData>) => {
    setLineData((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      let response;
      if (editingLine) {
        response = await updateBudgetLine(editingLine.id, linePayload, budget.id);
      } else {
        response = await createBudgetLine(lineData.budget_id, linePayload);
      }

      if (response.success) {
        toast.success(
          response.message || `Budget line ${editingLine ? "updated" : "created"} successfully`
        );
        setShowLineForm(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(
          response.message || `Failed to ${editingLine ? "update" : "create"} budget line`
        );
      }
    } catch (error) {
      toast.error(`Failed to ${editingLine ? "update" : "create"} budget line. Please try again.`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditLine = (line: BudgetLine) => {
    setEditingLine(line);
    setLineData({
      budget_id: budget.id,
      name: line.name,
      description: line.description,
      allocated_amount: line.allocated_amount,
      spent_amount: line.spent_amount,
      currency: line.currency,
      start_date: line.start_date,
      end_date: line.end_date,
      category: line.category
    });
    setShowLineForm(true);
  };

  const handleDeleteClick = (line: BudgetLine) => {
    setLineToDelete(line);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!lineToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteBudgetLine(budget.id, lineToDelete.id);

      if (response.success) {
        toast.success(response.message || "Budget line deleted successfully");
        setShowDeleteModal(false);
        setLineToDelete(null);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete budget line");
      }
    } catch (error) {
      toast.error("Failed to delete budget line. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setLineData({
      ...INIT_LINE_DATA,
      budget_id: budget.id,
      currency: budget.currency
    });
    setEditingLine(null);
  };

  const handleCancelForm = () => {
    setShowLineForm(false);
    resetForm();
  };

  return (
    <>
      <div className="animate-slide-up mb-8 flex items-center justify-between">
        <Link href="/dashboard/audit/budgets">
          <Button variant="outline" className="gap-2" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Budgets
          </Button>
        </Link>
        {!showLineForm && (
          <Button onClick={() => setShowLineForm(true)} className="gap-2" size="sm">
            <Plus className="h-5 w-5" />
            Budget Line
          </Button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="animate-fade-in p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2.5">
              <Wallet className="text-primary h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold">Budget Overview</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground text-xs">Budget Title</p>
              <p className="text-lg font-bold">{budget.title}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Amount</p>
              <p className="text-primary text-2xl font-bold">
                {formatCurrency(budget.total_amount, budget.currency)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <BudgetStatusBadge status={budget.status as BudgetStatus} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Year</p>
              <p className="font-semibold">{budget.year}</p>
            </div>
          </div>
        </Card>

        <Card className="animate-fade-in p-6 [animation-delay:100ms]">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2.5">
              <DollarSign className="text-primary h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold">Allocation Summary</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground text-xs">Total Allocated</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalAllocated, budget.currency)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Spent</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalSpent, budget.currency)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Remaining</p>
              <p
                className={`text-2xl font-bold ${remainingBudget < 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(remainingBudget, budget.currency)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="animate-fade-in p-6 [animation-delay:200ms]">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2.5">
              <Calendar className="text-primary h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold">Period & Lines</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground text-xs">Start Date</p>
              <p className="font-semibold">{formatDate(budget.start_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">End Date</p>
              <p className="font-semibold">{formatDate(budget.end_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Budget Lines</p>
              <p className="text-2xl font-bold">{budgetLines.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Line Form */}
      {showLineForm && (
        <Card className="animate-slide-up mb-8 p-8">
          <div className="mb-6 flex items-center gap-3 border-b pb-4">
            <div className="bg-primary/10 rounded-lg p-2.5">
              <Package className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-bold">
                {editingLine ? "Edit Budget Line" : "New Budget Line"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {editingLine ? "Update budget line details" : "Create a new budget line"}
              </p>
            </div>
          </div>
          <form id="line-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lineName" className="text-sm font-semibold">
                  Line Name *
                </Label>
                <Input
                  id="lineName"
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
                <Label htmlFor="lineAllocated" className="text-sm font-semibold">
                  Allocated Amount *
                </Label>
                <Input
                  id="lineAllocated"
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
                <Label htmlFor="lineSpent" className="text-sm font-semibold">
                  Spent Amount
                </Label>
                <Input
                  id="lineSpent"
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
                    lineData.end_date ? (new Date(lineData.end_date) as unknown as any) : undefined
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

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={handleCancelForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="gap-2 shadow-lg">
                <Save className="h-4 w-4" />
                {isCreating
                  ? editingLine
                    ? "Updating..."
                    : "Creating..."
                  : editingLine
                    ? "Update Line"
                    : "Create Line"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="animate-fade-in [animation-delay:200ms]">
        <div className="from-card to-muted/20 border-b bg-gradient-to-r p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2.5">
              <Package className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-bold">Budget Lines</h2>
              <p className="text-muted-foreground text-sm">Detailed breakdown of allocations</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-foreground">Line Name</TableHead>
                <TableHead className="text-foreground">Category</TableHead>
                <TableHead className="text-foreground">Allocated</TableHead>
                <TableHead className="text-foreground">Spent</TableHead>
                <TableHead className="text-foreground">Remaining</TableHead>
                <TableHead className="text-foreground">Period</TableHead>
                <TableHead className="text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBudgetLines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      No budget lines yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Add your first budget line to get started
                    </p>
                    <Button onClick={() => setShowLineForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add First Line
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBudgetLines.map((line, index) => (
                  <TableRow
                    key={line.id}
                    className="hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}>
                    <TableCell className="font-semibold">{line.name}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {line.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-lg font-bold text-blue-600">
                      {formatCurrency(line.allocated_amount, line.currency)}
                    </TableCell>
                    <TableCell className="font-bold text-orange-600">
                      {formatCurrency(line.spent_amount, line.currency)}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(line.allocated_amount - line.spent_amount, line.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(line.start_date)} - {formatDate(line.end_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditLine(line)}
                          className="h-8 gap-1.5">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(line)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {safeBudgetLines.length > 0 && (
          <CustomPagination
            pagination={customPaginationData}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </Card>

      <ConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Budget Line"
        description={`Are you sure you want to delete "${lineToDelete?.name}"? This action cannot be undone.`}
        type="delete"
        isLoading={isDeleting}
      />
    </>
  );
};

export default BudgetDetails;
