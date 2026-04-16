"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select-field";
import { Loader2 } from "lucide-react";
import { notify } from "@/lib/utils";
import { createRiskCategory, updateRiskCategory } from "@/app/_actions/risk-module-actions";

type Department = {
  id: string;
  name: string;
  code: string;
};

type RiskCategory = {
  id?: string;
  department_id: string;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

interface RiskCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: RiskCategory | null;
  departments: Department[];
  onSuccess: () => void;
  mode: "create" | "edit";
}

export function RiskCategoryFormDialog({
  open,
  onOpenChange,
  category,
  departments,
  onSuccess,
  mode
}: RiskCategoryFormDialogProps) {
  const [formData, setFormData] = useState<Omit<RiskCategory, "id">>({
    department_id: "",
    name: "",
    code: "",
    description: "",
    sort_order: 1,
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && category) {
        setFormData({
          department_id: category.department_id,
          name: category.name,
          code: category.code,
          description: category.description || "",
          sort_order: category.sort_order,
          is_active: category.is_active
        });
      } else {
        setFormData({
          department_id: "",
          name: "",
          code: "",
          description: "",
          sort_order: 1,
          is_active: true
        });
      }
    }
  }, [open, mode, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      notify({ description: "Category name is required", type: "error" });
      return;
    }
    if (!formData.code.trim()) {
      notify({ description: "Category code is required", type: "error" });
      return;
    }
    if (!formData.department_id) {
      notify({ description: "Department is required", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        department_id: formData.department_id,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || "",
        sort_order: formData.sort_order,
        is_active: formData.is_active
      };

      let response;
      if (mode === "edit" && category?.id) {
        response = await updateRiskCategory(category.id, payload);
      } else {
        response = await createRiskCategory(payload);
      }

      if (response.success) {
        notify({
          description: `Risk category ${mode === "edit" ? "updated" : "created"} successfully`,
          type: "success"
        });
        onSuccess();
        onOpenChange(false);
      } else {
        notify({ description: response.message || `Failed to ${mode} category`, type: "error" });
      }
    } catch (error) {
      console.error(`Error ${mode}ing category:`, error);
      notify({ description: `Failed to ${mode} category. Please try again.`, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Risk Category" : "Create Risk Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department">
              Department <span className="text-destructive">*</span>
            </Label>
            <SelectField
              value={formData.department_id}
              onValueChange={(value) => handleChange("department_id", value)}
              placeholder="Select department"
              options={departments.map((dept) => ({
                id: dept.id,
                name: dept.name
              }))}
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Operational Risk"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">
                Category Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                placeholder="e.g., OPR"
                maxLength={10}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Provide a brief description of this risk category..."
              rows={3}
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              min="1"
              value={formData.sort_order}
              onChange={(e) => handleChange("sort_order", parseInt(e.target.value) || 1)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
