"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Loader2, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { getRiskCategories } from "@/app/_actions/risk-module-actions";
import { deleteRiskCategory, getDepartments } from "@/app/_actions/config-actions";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { RiskCategoryFormDialog } from "./risk-category-dialog";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomPagination } from "@/components/ui/pagination";

type RiskCategory = {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  department?: {
    id: string;
    name: string;
    code: string;
  };
};

type Department = {
  id: string;
  name: string;
  code: string;
};

type PaginationState = {
  page: number;
  page_size: number;
  total_pages: number;
  total: number;
  has_prev: boolean;
  has_next: boolean;
};

export function RiskCategoriesConfig() {
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total_pages: 0,
    total: 0,
    has_prev: false,
    has_next: false
  });

  // Modal states
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    category: RiskCategory | null;
  }>({
    open: false,
    mode: "create",
    category: null
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoryId: string | null;
    categoryName: string | null;
  }>({
    open: false,
    categoryId: null,
    categoryName: null
  });

  const router = useRouter();
  const { checkPermission } = usePermissions();

  // Fetch categories when pagination changes
  useEffect(() => {
    fetchCategories();
  }, [pagination.page, pagination.page_size]);

  // Fetch departments only once
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getRiskCategories({
        page: pagination.page,
        page_size: pagination.page_size
      });

      if (response.success && response.data?.data) {
        setCategories(response.data.data);

        // Update pagination from API response
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: response.data.pagination.page || prev.page,
            page_size: response.data.pagination.page_size || prev.page_size,
            total: response.data.pagination.total || 0,
            total_pages: response.data.pagination.total_pages || 0,
            has_prev: response.data.pagination.has_prev || false,
            has_next: response.data.pagination.has_next || false
          }));
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load risk categories");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await getDepartments({
        page: 1,
        page_size: 100 // Get all departments for dropdown
      });
      if (response.success && response.data?.data) {
        setDepartments(response.data.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const updatePagination = (updates: { page?: number; page_size?: number }) => {
    setPagination((prev) => ({
      ...prev,
      page: updates.page || prev.page,
      page_size: updates.page_size || prev.page_size
    }));
  };

  const handleAddCategory = () => {
    if (!checkPermission("RISK_MODULE_CONFIGS", "can_create")) return;
    setFormDialog({
      open: true,
      mode: "create",
      category: null
    });
  };

  const handleEditCategory = (category: RiskCategory) => {
    if (!checkPermission("RISK_MODULE_CONFIGS", "can_edit")) return;
    setFormDialog({
      open: true,
      mode: "edit",
      category
    });
  };

  const handleDeleteClick = (category: RiskCategory) => {
    if (!checkPermission("RISK_MODULE_CONFIGS", "can_delete")) return;
    setDeleteDialog({
      open: true,
      categoryId: category.id,
      categoryName: category.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.categoryId) return;

    try {
      const response = await deleteRiskCategory(deleteDialog.categoryId);
      if (response.success) {
        toast.success("Risk category deleted successfully");
        await fetchCategories();
        router.refresh();
        setDeleteDialog({ open: false, categoryId: null, categoryName: null });
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete risk category");
    }
  };

  const handleFormSuccess = async () => {
    await fetchCategories();
    router.refresh();
  };

  if (isLoading || loadingDepartments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Risk Categories</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage risk categories and their classifications
          </p>
        </div>
        <Button onClick={handleAddCategory} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Risk Category
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted mb-4 rounded-full p-4">
                      <FolderTree className="text-muted-foreground h-8 w-8" />
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      No Risk Categories Yet
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center text-sm">
                      Get started by creating your first risk category to organize and classify
                      risks.
                    </p>
                    <Button onClick={handleAddCategory} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Category
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <p className="text-foreground font-medium">{category.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {category.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {category.department?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">{category.department?.code || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {category.description || "No description provided"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                        className="h-8 gap-1.5">
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(category)}
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

        {categories.length > 0 && (
          <CustomPagination
            pagination={pagination}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </div>

      <RiskCategoryFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog({ open, mode: "create", category: null })}
        category={formDialog.category}
        departments={departments}
        onSuccess={handleFormSuccess}
        mode={formDialog.mode}
      />

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, categoryId: null, categoryName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Risk Category"
        description={`Are you sure you want to delete "${deleteDialog.categoryName}"? This action cannot be undone.`}
        type="delete"
      />
    </Card>
  );
}
