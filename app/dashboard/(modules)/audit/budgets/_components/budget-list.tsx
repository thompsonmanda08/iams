"use client";
import { useState, useMemo } from "react";
import { useTableSearch } from "@/hooks/use-table-search";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Wallet, TrendingUp, Banknote, View } from "lucide-react";
import { BudgetLinesList } from "./budget-line-list";
import { CustomPagination } from "@/components/ui/pagination";
import { Pagination } from "@/lib/types";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils";
import { deleteBudget } from "@/app/_actions/audit-module-actions";
import { BudgetEditModal } from "./budget-edit-modal";
import { StatusBadge } from "@/components/status-badge";
import { usePermissions } from "@/hooks/use-permissions";

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
  department_id: string | null;
  department_name: string | null;
  created_at: string;
  budget_lines?: BudgetLine[];
}

interface BudgetListProps {
  budgets: Budget[];
  budgetLinesMap?: Record<string, BudgetLine[]>;
}

const BudgetList = ({ budgets, budgetLinesMap = {} }: BudgetListProps) => {
  const router = useRouter();
  const { checkPermission } = usePermissions();
  const { searchValue: searchTerm, setSearchValue: setSearchTerm, debouncedSearch } = useTableSearch({ debounceMs: 200 });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 10,
    total_pages: 1,
    totalCount: 0,
    has_next: false,
    has_prev: false
  });

  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Combine budgets with their budget lines
  const budgetsWithLines = useMemo(() => {
    return budgets.map((budget) => ({
      ...budget,
      budget_lines: budgetLinesMap[budget.id] || []
    }));
  }, [budgets, budgetLinesMap]);

  // Filter budgets based on search
  const filteredBudgets = useMemo(() => {
    if (!debouncedSearch.trim()) return budgetsWithLines;
    return budgetsWithLines.filter((budget) =>
      budget.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [budgetsWithLines, debouncedSearch]);

  // Calculate pagination
  const paginatedBudgets = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.page_size;
    const endIndex = startIndex + pagination.page_size;
    return filteredBudgets.slice(startIndex, endIndex);
  }, [filteredBudgets, pagination.page, pagination.page_size]);

  // Update pagination data
  const customPaginationData = useMemo(() => {
    const totalCount = filteredBudgets.length;
    const total_pages = Math.ceil(totalCount / pagination.page_size);

    return {
      ...pagination,
      total_pages,
      totalCount,
      has_next: pagination.page < total_pages,
      has_prev: pagination.page > 1
    };
  }, [filteredBudgets.length, pagination]);

  const updatePagination = ({ page, page_size }: { page: number; page_size?: number }) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: page_size ?? prev.page_size
    }));
  };

  const totalBudgets = budgets.length;
  const totalAmount = budgets.reduce((sum, b) => sum + b.total_amount, 0);
  const approvedBudgets = budgets.filter((b) => b.status === "APPROVED").length;

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

  const handleDeleteClick = (budget: Budget) => {
    if (!checkPermission("AUDIT_PLANS", "can_delete")) return;
    setBudgetToDelete(budget);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteBudget(budgetToDelete.id);

      if (response.success) {
        notify({ description: response.message || "Budget deleted successfully", type: "success" });
        setShowDeleteModal(false);
        setBudgetToDelete(null);
        router.refresh();
      } else {
        notify({ description: response.message || "Failed to delete budget", type: "error" });
      }
    } catch (error) {
      notify({ description: "Failed to delete budget. Please try again.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (budgetId: string) => {
    if (!checkPermission("AUDIT_PLANS", "can_edit")) return;
    setBudgetToEdit(budgetId);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    router.refresh();
    notify({ description: "Budget updated successfully", type: "success" });
  };

  if (budgets.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-medium">No Budgets Found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Get started by creating your first budget to track and manage your department's
            financial allocations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-l-primary animate-slide-in border-l-4 p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">Total Budgets</p>
              <p className="text-foreground text-3xl font-bold">{totalBudgets}</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-3">
              <Wallet className="text-primary h-8 w-8" />
            </div>
          </div>
        </Card>

        <Card className="border-l-accent animate-slide-in border-l-4 p-6 transition-all duration-300 [animation-delay:100ms] hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">Total Allocated</p>
              <p className="text-foreground text-3xl font-bold">
                {formatCurrency(totalAmount, budgets[0]?.currency || "ZMW")}
              </p>
            </div>
            <div className="bg-primary/10 rounded-xl p-3">
              <Banknote className="text-primary h-8 w-8" />
            </div>
          </div>
        </Card>

        <Card className="border-l-success animate-slide-in border-l-4 p-6 transition-all duration-300 [animation-delay:200ms] hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">Approved</p>
              <p className="text-foreground text-3xl font-bold">{approvedBudgets}</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-3">
              <TrendingUp className="text-primary h-8 w-8" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="animate-fade-in border-none [animation-delay:300ms]">
        {/* <div className="from-card to-muted/20 border-b bg-linear-to-r p-6">
          <div className="flex items-center justify-end">
            <Search
              placeholder="Search budgets..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
        </div> */}

        {filteredBudgets.length > 0 ? (
          <div className="bg-card rounded-lg border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-foreground/70 font-bold">BUDGET</TableHead>
                    <TableHead className="text-foreground/70 font-bold">DEPARTMENT</TableHead>
                    <TableHead className="text-foreground/70 font-bold">AMOUNT</TableHead>
                    <TableHead className="text-foreground/70 font-bold">BUDGET LINES</TableHead>
                    <TableHead className="text-foreground/70 font-bold">STATUS</TableHead>
                    {/* <TableHead className="text-foreground/70 font-bold">Year</TableHead> */}
                    <TableHead className="text-foreground/70 font-bold">START DATE</TableHead>
                    <TableHead className="text-foreground/70 font-bold">END DATE</TableHead>
                    <TableHead className="text-foreground text-center font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBudgets.map((budget, index) => (
                    <TableRow
                      key={budget.id}
                      className="hover:bg-muted/30 group transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}>
                      <TableCell>
                        <span className="text-primary hover:text-primary/80 flex items-center gap-2 font-semibold transition-colors">
                          {budget.title}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>
                          <p>{budget?.department_name || "No Department"}</p>
                          {budget.department_id ? (
                            <span className="text-[9px] font-medium">
                              {budget.department_id.slice(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-xs italic opacity-50">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-base font-bold">
                        {formatCurrency(budget.total_amount, budget.currency)}
                      </TableCell>
                      <TableCell>
                        <BudgetLinesList budgetLines={budget?.budget_lines || []} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={budget?.status} />
                      </TableCell>
                      {/* <TableCell className="text-muted-foreground">{budget.year}</TableCell> */}
                      <TableCell className="text-muted-foreground">
                        {formatDate(budget.start_date)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(budget.end_date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              router.push(`/dashboard/audit/budgets/${budget.id}`);
                              e.stopPropagation();
                            }}
                            className="h-8 gap-1.5">
                            <View className="h-3.5 w-3.5" />
                            View
                          </Button>
                          {budget.status !== "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(budget.id)}
                              className="h-8 gap-1.5">
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          )}
                          {budget.status !== "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(budget)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <CustomPagination
              pagination={customPaginationData}
              updatePagination={updatePagination}
              allowSetPageSize={true}
              showDetails={true}
              className="border-t"
            />
          </div>
        ) : (
          <div className="p-12 text-center">
            <Wallet className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
            <h3 className="text-foreground mb-2 text-lg font-semibold">No budgets found</h3>
            <p className="text-muted-foreground mb-6">
              No budgets match your search "{searchTerm}"
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}>
              Clear Search
            </Button>
          </div>
        )}
      </Card>

      <ConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Budget"
        description={`Are you sure you want to delete "${budgetToDelete?.title}"? This action cannot be undone.`}
        type="delete"
        isLoading={isDeleting}
      />

      {budgetToEdit && (
        <BudgetEditModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          budgetId={budgetToEdit}
          mode="budget"
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default BudgetList;
