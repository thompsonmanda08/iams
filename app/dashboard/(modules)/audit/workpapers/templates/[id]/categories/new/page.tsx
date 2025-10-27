"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createTemplateCategory,
  updateTemplateCategory
} from "@/app/_actions/audit-module-actions";
import { useToast } from "@/hooks/use-toast";
import { TemplateCategory, TemplateCategoryGroup } from "@/lib/types/audit-types";
import { SelectField } from "@/components/ui/select-field";
import { Checkbox } from "@/components/ui/checkbox";
import { group } from "console";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setUpdating] = useState(initialData && categoryId);

  const [formData, setFormData] = useState<TemplateCategory>(
    initialData && categoryId
      ? ({
          ...initialData,
          clauses: ((initialData.clauses || "") as unknown as string).split(",") as any
        } as unknown as TemplateCategory)
      : {
          name: "",
          display_name: "",
          objectives: "",
          scope: "",
          clauses: [],
          clause_range: "",
          description: "",
          group: "main-clauses",
          documents_obtained: "",
          source_documents: "",
          sample_size: "",
          frequency_of_control: "",
          sampling_methodology: "",
          audit_procedure: "",
          sort_order: 0,
          is_required: false,
          template_id: templateId
        }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Category name is required");
      // toast({
      //   title: "Validation Error",
      //   description: "Category name is required",
      //   variant: "destructive"
      // });
      return;
    }

    setIsSubmitting(true);

    try {
      const newData: TemplateCategory = {
        template_id: templateId,
        name: formData.name,
        display_name: formData.display_name,
        objectives: formData.objectives,
        scope: formData.scope,
        documents_obtained: formData.documents_obtained,
        source_documents: formData.source_documents,
        sample_size: formData.sample_size,
        frequency_of_control: formData.frequency_of_control,
        sampling_methodology: formData.sampling_methodology,
        audit_procedure: formData.audit_procedure,
        sort_order: formData.sort_order,
        group: formData.group,
        description: formData.description,
        clauses: formData.clauses.join(",") as any,
        clause_range: formData.clause_range,
        is_required: formData.is_required
      };
      const result =
        isUpdating && categoryId
          ? await updateTemplateCategory(categoryId, newData)
          : await createTemplateCategory(newData);

      if (result.success) {
        toast.success(`Category ${isUpdating ? "updated" : "created"} successfully`);
        // toast({
        //   title: "Success",
        //   description: `Category ${isUpdating ? "updated" : "created"} successfully`
        // });
        router.push(`/dashboard/audit/workpapers/templates/${templateId}`);
      } else {
        toast.error(result.message || `Failed to ${isUpdating ? "update" : "create"} category`);
        // toast({
        //   title: "Error",
        //   description: result.message || `Failed to ${isUpdating ? "update" : "create"} category`,
        //   variant: "destructive"
        // });
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      // toast({
      //   title: "Error",
      //   description: "An unexpected error occurred",
      //   variant: "destructive"
      // });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isUpdating ? "Update" : "Create"} Template Category
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {isUpdating ? "Update" : "Create"} a new category for this template
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit}>
            <Card className="p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="grid gap-1">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      You are required to fill in too the required details. Use "N/A" if not
                      applicable
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
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value.replaceAll(" ", "-") })
                      }
                      placeholder="e.g., context-of-the-organisation"
                      required
                    />
                    <Input
                      id="order"
                      label="Sort Order"
                      classNames={{
                        wrapper: "max-w-xs w-full flex-[0.5]"
                      }}
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                      }
                      placeholder="1"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="name"
                      label="Category Display Name"
                      className="flex-1"
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_name: e.target.value
                        })
                      }
                      placeholder="e.g., Context of the Organisation (Annex A: 5.1-5.37)"
                      required
                    />
                    <SelectField
                      id="group"
                      label="Group Name"
                      options={[
                        {
                          id: "main-clauses",
                          name: "Main Clauses"
                        },
                        {
                          id: "annex-a-controls",
                          name: "Annex A Controls"
                        },
                        {
                          id: "other",
                          name: "Other"
                        }
                      ]}
                      value={formData.group}
                      onValueChange={(group) =>
                        setFormData({ ...formData, group: group as TemplateCategoryGroup })
                      }
                      placeholder="e.g., Main Clauses, Annex A Controls"
                      className="w-full"
                      required
                    />
                  </div>

                  <Input
                    id="description"
                    label="Description"
                    className=""
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Understanding the context of the organisation..."
                    required
                  />

                  <Textarea
                    id="objectives"
                    label="Objectives"
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    placeholder="Assess understanding of organizational context..."
                    rows={3}
                    required
                  />

                  <Textarea
                    id="scope"
                    label="Scope"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    placeholder="All business units..."
                    rows={3}
                    required
                  />

                  <Textarea
                    id="clauses"
                    label="Clauses"
                    value={formData.clauses.join(",")}
                    onChange={(e) =>
                      setFormData({ ...formData, clauses: e.target.value.split(",") })
                    }
                    placeholder="Separated by commas. E.g. A.5.1, A.5.2, A.5.3, A.5.4, A.5.5"
                    rows={2}
                    required
                  />
                  <Input
                    id="clause_range"
                    label="Clause Range"
                    className=""
                    value={formData.clause_range}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clause_range: e.target.value
                      })
                    }
                    placeholder="A.5.1 - 5.37"
                    required
                  />
                </div>

                {/* Audit Documentation */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Audit Documentation</h3>

                  <Textarea
                    id="documents_obtained"
                    label="Documents Obtained"
                    value={formData.documents_obtained}
                    onChange={(e) =>
                      setFormData({ ...formData, documents_obtained: e.target.value })
                    }
                    placeholder="Strategic plan, risk register..."
                    rows={2}
                    required
                  />

                  <Textarea
                    id="source_documents"
                    label="Source Documents"
                    value={formData.source_documents}
                    onChange={(e) => setFormData({ ...formData, source_documents: e.target.value })}
                    placeholder="Business plan (Jan 2025), Risk assessment (Q4 2024)..."
                    rows={2}
                    required
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      id="sample_size"
                      label="Sample Size"
                      value={formData.sample_size}
                      onChange={(e) => setFormData({ ...formData, sample_size: e.target.value })}
                      placeholder="e.g., 10 departments"
                      required
                    />

                    <Input
                      id="frequency_of_control"
                      label="Frequency of Control"
                      value={formData.frequency_of_control}
                      onChange={(e) =>
                        setFormData({ ...formData, frequency_of_control: e.target.value })
                      }
                      placeholder="e.g., Quarterly"
                      required
                    />
                  </div>

                  <Textarea
                    id="sampling_methodology"
                    label="Sampling Methodology"
                    value={formData.sampling_methodology}
                    onChange={(e) =>
                      setFormData({ ...formData, sampling_methodology: e.target.value })
                    }
                    placeholder="Random, stratified, systematic..."
                    rows={2}
                    required
                  />
                  <p className="flex items-center gap-2 text-sm text-orange-400">
                    <AlertTriangle className="aspect-square h-5 w-5 text-orange-400" />
                    <span className="font-semibold">Note:</span>
                    Enter the value "N/A" for fields that do not apply for this category.
                  </p>
                </div>

                {/* Audit Procedure */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Audit Procedure</h3>

                  <div className="space-y-2">
                    <Textarea
                      id="audit_procedure"
                      label="Procedure Steps"
                      value={formData.audit_procedure}
                      onChange={(e) =>
                        setFormData({ ...formData, audit_procedure: e.target.value })
                      }
                      placeholder="1. Review documents&#10;2. Interview stakeholders&#10;3. Verify compliance..."
                      rows={4}
                      descriptionText=""
                      required
                    />
                    <p className="text-muted-foreground text-xs">
                      Define the audit testing procedures for this category
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 self-end">
                    <Checkbox
                      id="is_required"
                      required
                      checked={formData?.is_required}
                      title="Define whether this category is a required audit category"
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_required: checked }) as any)
                      }
                    />
                    <Label
                      htmlFor="is_required"
                      className="text-foreground cursor-pointer text-sm font-medium">
                      Is a Required Category
                    </Label>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Define whether this category is a required audit category
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-6">
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
        </div>
      </div>
    </div>
  );
}
