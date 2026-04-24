"use client";

import { useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createTemplateCategory,
  updateTemplateCategory
} from "@/app/_actions/audit-module-actions";
import { TemplateCategory } from "@/lib/types/audit-types";
import BackButton from "@/components/back-button";
import PageHeader from "@/components/page-header";
import { useWorkpaperTemplate } from "@/hooks/use-audit-query-data";
import Loader from "@/components/ui/loader";
import { cn, notify } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

// Framework field configurations
type FrameworkFields = {
  [key: string]: {
    label: string;
    fields: Array<{
      name: string;
      label: string;
      placeholder: string;
      required?: boolean;
    }>;
  };
};

const FRAMEWORK_FIELD_CONFIGS: FrameworkFields = {
  iso27001: {
    label: "ISO 27001",
    fields: [
      { name: "clause_number", label: "Clause Number", placeholder: "e.g., 4.1", required: true },
      {
        name: "clause_description",
        label: "Clause Description",
        placeholder: "e.g., Understanding the organization...",
        required: true
      }
    ]
  },

  coso: {
    label: "COSO",
    fields: [
      {
        name: "component",
        label: "Component",
        placeholder: "e.g., Governance and Independence",
        required: true
      },
      {
        name: "control_type",
        label: "Control Type",
        placeholder: "e.g., preventive, detective",
        required: true
      },
      {
        name: "principle",
        label: "Principle",
        placeholder: "e.g., Integrity and ethical values",
        required: false
      }
    ]
  },

  cobit: {
    label: "COBIT",
    fields: [
      { name: "domain", label: "Domain", placeholder: "e.g., EDM", required: true },
      { name: "process_code", label: "Process Code", placeholder: "e.g., EDM01", required: true },
      {
        name: "process_name",
        label: "Process Name",
        placeholder: "e.g., Establish governance framework",
        required: true
      }
    ]
  },

  nist: {
    label: "NIST",
    fields: [
      { name: "function", label: "Function", placeholder: "e.g., Identify", required: true },
      {
        name: "category",
        label: "Category",
        placeholder: "e.g., Asset Management",
        required: true
      },
      {
        name: "subcategory",
        label: "Subcategory",
        placeholder: "e.g., Inventory of hardware devices",
        required: true
      }
    ]
  }
};

interface NewCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
  initialData?: TemplateCategory;
  categoryId?: string;
}

export default function NewCategoryPage({ params, initialData, categoryId }: NewCategoryPageProps) {
  const { id: templateId } = use(params);
  const router = useRouter();
  const { checkPermission } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setUpdating] = useState(initialData && categoryId);

  // Fetch template data to get framework type
  const { data: templateResponse, isLoading } = useWorkpaperTemplate(templateId);

  // Get framework type from template data or use default
  let frameworkType = "iso27001";
  const templateData = templateResponse?.data?.data || templateResponse?.data;
  if (templateData?.framework_type) {
    frameworkType = templateData.framework_type.toLowerCase();
  } else if (templateData?.standard) {
    frameworkType = templateData.standard.toLowerCase();
  }

  const [formData, setFormData] = useState<TemplateCategory>(
    initialData && categoryId
      ? {
          ...initialData
        }
      : {
          name: "",
          sort_order: 0,
          metadata: {},
          template_id: templateId
        }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name) {
      notify({ description: "Category name is required", type: "error" });
      return;
    }

    if (isUpdating && categoryId) {
      if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_edit")) return;
    } else {
      if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_create")) return;
    }

    setIsSubmitting(true);

    try {
      // Build the new payload structure with metadata only
      const newData: TemplateCategory = {
        template_id: templateId,
        name: formData.name,
        sort_order: formData.sort_order || 0,
        metadata: formData.metadata || {}
      };

      const result =
        isUpdating && categoryId
          ? await updateTemplateCategory(categoryId, newData)
          : await createTemplateCategory(newData);

      if (result.success) {
        notify({ description: `Category ${isUpdating ? "updated" : "created"} successfully`, type: "success" });
        router.push(`/dashboard/system-configs/audit-settings/templates/${templateId}`);
      } else {
        notify({ description: result.message || `Failed to ${isUpdating ? "update" : "create"} category`, type: "error" });
      }
    } catch (error) {
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const deleteCategory = useCallback(
    (idx: number) => {
      const updated = (formData.metadata?.[frameworkType] || []).filter((_, i) => i !== idx);
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          [frameworkType]: updated
        }
      });
    },
    [formData, frameworkType]
  );

  const updateCategoryItem = useCallback(
    (idx: number, fieldName: string, value: string) => {
      const updated = [...(formData.metadata?.[frameworkType] || [])];
      updated[idx] = { ...updated[idx], [fieldName]: value };
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          [frameworkType]: updated
        }
      });
    },
    [formData, frameworkType]
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <PageHeader
              title={`${isUpdating ? "Update" : "Create"} Template Category`}
              description="Define a category with framework-specific clauses"
            />
            <BackButton className="mb-0 h-8!" title="Back to Template" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          {isLoading && (
            <Card className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-2">
                <Loader className="h-6 w-6 animate-spin" />
                <p className="text-muted-foreground text-sm">Loading template information...</p>
              </div>
            </Card>
          )}

          {!isLoading && (
            <form onSubmit={handleSubmit}>
              <Card className="bg-card p-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="grid gap-1">
                      <h3 className="text-lg font-semibold">Category Information</h3>
                      <p className="text-muted-foreground text-sm">
                        Define the basic details for this category
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        id="name"
                        label="Category Name"
                        classNames={{
                          wrapper: "max-w-none w-full flex-1"
                        }}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Context of the Organisation"
                        required
                      />
                      <Input
                        id="sort_order"
                        label="Sort Order"
                        type="number"
                        classNames={{
                          wrapper: "max-w-xs w-full flex-[0.5]"
                        }}
                        value={formData.sort_order || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                        }
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* Framework Metadata - Dynamic Fields */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid gap-1">
                      <h3 className="text-lg font-semibold">Framework Metadata</h3>
                      <p className="text-muted-foreground text-sm">
                        Define{" "}
                        {FRAMEWORK_FIELD_CONFIGS[frameworkType]?.label ||
                          frameworkType.toUpperCase()}
                        -specific items
                      </p>
                    </div>

                    <div className="space-y-4 rounded-lg border bg-slate-50 p-4 dark:bg-slate-900/5">
                      {/* Items for Selected Framework */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            {FRAMEWORK_FIELD_CONFIGS[frameworkType]?.label ||
                              frameworkType.toUpperCase()}{" "}
                            TEMPLATE FIELDS
                          </Label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const currentItems = formData.metadata?.[frameworkType] || [];
                              const newItem: Record<string, string> = {};
                              FRAMEWORK_FIELD_CONFIGS[frameworkType]?.fields.forEach((field) => {
                                newItem[field.name] = "";
                              });
                              setFormData({
                                ...formData,
                                metadata: {
                                  ...formData.metadata,
                                  [frameworkType]: [...currentItems, newItem]
                                }
                              });
                            }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                          </Button>
                        </div>

                        {/* List of Items */}
                        <div className="space-y-2">
                          {(formData.metadata?.[frameworkType] || []).map((item, idx) => (
                            <div key={idx} className="flex gap-2 rounded-lg border bg-white/5 p-3">
                              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                                {FRAMEWORK_FIELD_CONFIGS[frameworkType]?.fields.map((field) => (
                                  <Input
                                    key={field.name}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    value={item[field.name] || ""}
                                    // onChange={(e) => {
                                    //   const updated = [
                                    //     ...(formData.metadata?.[frameworkType] || [])
                                    //   ];
                                    //   updated[idx] = {
                                    //     ...updated[idx],
                                    //     [field.name]: e.target.value
                                    //   };
                                    //   setFormData({
                                    //     ...formData,
                                    //     metadata: {
                                    //       ...formData.metadata,
                                    //       [frameworkType]: updated
                                    //     }
                                    //   });
                                    // }}
                                    onChange={(e) =>
                                      updateCategoryItem(idx, field.name, e.target.value)
                                    }
                                    className={cn("w-full max-w-none", {
                                      "max-w-xs":
                                        field.name === "clause_number" ||
                                        field.name === "domain" ||
                                        field.name === "component"
                                    })}
                                    classNames={{
                                      wrapper: cn({
                                        "max-w-xs":
                                          field.name === "clause_number" ||
                                          field.name === "domain" ||
                                          field.name === "component"
                                      })
                                    }}
                                  />
                                ))}
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="mt-auto bg-red-50/50 hover:bg-red-50"
                                onClick={() => deleteCategory(idx)}>
                                <Trash2 className="text-destructive h-4 w-4" />
                              </Button>
                            </div>
                          ))}

                          {(!formData.metadata?.[frameworkType] ||
                            formData.metadata[frameworkType].length === 0) && (
                            <p className="text-muted-foreground py-2 text-center text-sm">
                              No items added yet. Click "Add Item" to add one.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="sticky bottom-0 flex flex-col-reverse justify-end gap-3 border-t pt-6 backdrop-blur sm:-mx-6 sm:flex-row sm:px-8 sm:pb-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      loadingText="Saving...">
                      {categoryId ? "Update Category" : "Create Category"}
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
