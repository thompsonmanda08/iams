"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getRiskCategories } from "@/app/_actions/risk-module-actions";
import { deleteRiskCategory, getDepartments } from "@/app/_actions/config-actions";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { RiskCategoryFormDialog } from "./risk-category-dialog";

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

export function RiskCategoriesConfig() {
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

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

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchDepartments();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getRiskCategories();
      if (response.success && response.data?.data) {
        setCategories(response.data.data);
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
      const response = await getDepartments();
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

  const handleAddCategory = () => {
    setFormDialog({
      open: true,
      mode: "create",
      category: null
    });
  };

  const handleEditCategory = (category: RiskCategory) => {
    setFormDialog({
      open: true,
      mode: "edit",
      category
    });
  };

  const handleDeleteClick = (category: RiskCategory) => {
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

  // Get department name for display
  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find((d) => d.id === departmentId);
    return dept ? `${dept.name} | ${dept.code}` : "Unknown Department";
  };

  if (isLoading || loadingDepartments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      {categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-4">
              <Plus className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">No Risk Categories Yet</h3>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              Get started by creating your first risk category to organize and classify risks.
            </p>
            <Button onClick={handleAddCategory} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="group transition-all">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="mb-2 text-lg">{category.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {getDepartmentName(category.department_id)}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                    {category.code}
                  </Badge>
                </div>
                <CardDescription className="mt-2 line-clamp-2">
                  {category.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                    className="flex-1 gap-1.5">
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(category)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
    </div>
  );
}
