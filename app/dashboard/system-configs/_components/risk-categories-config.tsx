"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save, X, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createRiskCategory,
  updateRiskCategory,
  getRiskCategories
} from "@/app/_actions/risk-module-actions";
import { deleteRiskCategory, getDepartments } from "@/app/_actions/config-actions";
import { useRouter } from "next/navigation";

type RiskCategory = {
  id?: string;
  department_id: string;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  editing?: boolean;
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
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
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
        setCategories(response.data?.data);
      }
    } catch (error) {
      toast.error("Failed to load risk categories");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await getDepartments({ isActive: true });
      if (response.success && response.data?.data) {
        setDepartments(response.data?.data);
      }
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleAddCategory = () => {
    const tempId = `temp-${Date.now()}`;
    const newCategory: RiskCategory = {
      id: tempId,
      department_id: "",
      name: "",
      code: "",
      description: "",
      sort_order: categories.length + 1,
      is_active: true,
      editing: true
    };
    setCategories([...categories, newCategory]);
  };

  const handleEditCategory = (id: string) => {
    setCategories(categories?.map((cat) => (cat.id === id ? { ...cat, editing: true } : cat)));
  };

  const handleSaveCategory = async (category: RiskCategory) => {
    if (!category.name.trim()) {
      toast.info("Category name is required");
      return;
    }

    if (!category.code.trim()) {
      toast.info("Category code is required");
      return;
    }

    if (!category.department_id) {
      toast.info("Department is required");
      return;
    }
    setSavingIds((prev) => new Set(prev).add(category.id!));

    try {
      const isNew = category.id?.startsWith("temp-");

      const payload = {
        department_id: category.department_id,
        name: category.name,
        code: category.code,
        description: category.description || "",
        sort_order: category.sort_order
      };

      let response;
      if (isNew) {
        response = await createRiskCategory(payload);
      } else {
        response = await updateRiskCategory(category.id!, payload);
      }

      if (response.success) {
        toast.success(`Risk category ${isNew ? "created" : "updated"} successfully`);
        router.refresh();
        await fetchCategories();
      } else {
        toast.error(response.message || "Failed to save category");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setSavingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(category.id!);
        return newSet;
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (id?.startsWith("temp-")) {
      setCategories(categories.filter((cat) => cat.id !== id));
      return;
    }
    try {
      const response = await deleteRiskCategory(id);
      if (response.success) {
        toast.success(response.message || "Risk category deleted successfully");
        router.refresh();
      }
    } catch (error) {
      toast.success("Failed to delete risk category");
    }
  };

  const handleCancelEdit = (id: string) => {
    if (id?.startsWith("temp-")) {
      setCategories(categories.filter((cat) => cat.id !== id));
    } else {
      setCategories(categories.map((cat) => (cat.id === id ? { ...cat, editing: false } : cat)));
    }
  };

  const handleUpdateCategory = (id: string, field: keyof RiskCategory, value: any) => {
    setCategories(categories.map((cat) => (cat.id === id ? { ...cat, [field]: value } : cat)));
  };

  if (isLoading) {
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
          <h2 className="text-foreground text-2xl font-semibold">Risk Categories</h2>
          <p className="text-muted-foreground text-sm">
            Manage risk categories and their classifications
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {categories?.map((category) => {
          const isSaving = savingIds.has(category.id!);
          const isNew = category.id?.startsWith("temp-");

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {category.editing ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2" htmlFor={`name-${category.id}`}>
                            Category Name *
                          </Label>
                          <Input
                            id={`name-${category.id}`}
                            value={category.name}
                            onChange={(e) =>
                              handleUpdateCategory(category.id!, "name", e.target.value)
                            }
                            placeholder="e.g., Financial Risk"
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <Label className="mb-2" htmlFor={`code-${category.id}`}>
                            Code *
                          </Label>
                          <Input
                            id={`code-${category.id}`}
                            value={category.code}
                            onChange={(e) =>
                              handleUpdateCategory(
                                category.id!,
                                "code",
                                e.target.value.toUpperCase()
                              )
                            }
                            placeholder="e.g., FIN"
                            maxLength={10}
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <Label className="mb-2" htmlFor={`department-${category.id}`}>
                            Department *
                          </Label>
                          <Select
                            value={category.department_id}
                            onValueChange={(value) =>
                              handleUpdateCategory(category.id!, "department_id", value)
                            }
                            disabled={loadingDepartments || isSaving}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select department">
                                {loadingDepartments
                                  ? "Loading..."
                                  : category.department_id
                                    ? departments.find((d) => d.id === category.department_id)
                                        ?.name || "Select department"
                                    : "Select department"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {departments?.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    <span>{dept.name}</span>
                                    <span className="text-muted-foreground text-xs">
                                      ({dept.code})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="mb-2" htmlFor={`description-${category.id}`}>
                            Description
                          </Label>
                          <Input
                            id={`description-${category.id}`}
                            value={category.description || ""}
                            onChange={(e) =>
                              handleUpdateCategory(category.id!, "description", e.target.value)
                            }
                            placeholder="Brief description"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="mb-2 flex items-center gap-2">
                          {category.name}
                        </CardTitle>
                        <CardDescription>
                          Code: {category.code} |{" "}
                          {departments.find((d) => d.id === category.department_id)?.name}
                        </CardDescription>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {category.editing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveCategory(category)}
                          disabled={isSaving}>
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelEdit(category.id!)}
                          disabled={isSaving}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category.id!)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id!)}>
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              {!category.editing && category.description && (
                <CardContent>
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No risk categories found</p>
            <Button onClick={handleAddCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Category
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
