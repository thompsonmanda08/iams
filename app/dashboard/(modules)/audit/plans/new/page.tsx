"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createAuditPlan } from "@/app/_actions/audit-module-actions";
import { TemplateSelectorSimple } from "@/components/audit/template-selector-simple";
import { CategorySelector } from "@/components/audit/category-selector";
import { SelectField } from "@/components/ui/select-field";
import { WorkpaperTemplateDefinition } from "@/lib/types/audit-types";
import { useWorkpaperTemplatesWithCategories } from "@/hooks/use-audit-query-data";
import { notify } from "@/lib/utils";
import { useTeamMembers } from "@/hooks/use-users-query-data";
import { User } from "@/lib/types/account";
import { MultiSelectField } from "@/components/ui/multi-select-field";

const STEPS = [
  { id: 1, name: "Basic Details", icon: Calendar },
  { id: 2, name: "Template Selection", icon: FileText },
  { id: 3, name: "Category Selection", icon: CheckCircle2 }
];

export default function NewAuditPlanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: teamMemberResponse } = useTeamMembers({ page_size: 100 });
  const teamMembers = (teamMemberResponse.data as User[]) ?? [];

  // Form state
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    ref_no: "",
    audit_area: "",
    audit_scope: "",
    audit_criteria: "",
    audit_objective: "",
    management_standard: "ISO IEC 27001",
    audit_team_leader: "",
    audit_team_member: [] as string[],
    client_representative: "",
    audit_language: "English",
    start_date: null as Date | null,
    end_date: null as Date | null,
    opening_meeting_datetime: null as Date | null,
    closing_meeting_datetime: null as Date | null,
    working_paper_template_id: "",
    selectedCategories: [] as string[]
  });

  const { data: fullTemplateResponse, isLoading: loadingTemplateDetails } =
    useWorkpaperTemplatesWithCategories(formData.working_paper_template_id);

  const selectedTemplate: WorkpaperTemplateDefinition =
    fullTemplateResponse?.data ?? ({} as WorkpaperTemplateDefinition);

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (
        !formData.title ||
        !formData.ref_no ||
        !formData.audit_scope ||
        !formData.audit_objective ||
        !formData.start_date ||
        !formData.end_date ||
        !formData.audit_team_leader ||
        !formData.audit_area ||
        !formData.audit_criteria
      ) {
        setValidationError("Please fill in all required fields on this step.");
        notify({
          // title: "Validation Error",
          description: "Please fill in all required fields",
          type: "error"
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.working_paper_template_id) {
        setValidationError("Please select a working paper template.");
        notify({
          // title: "Validation Error",
          description: "Please select a template",
          type: "error"
        });
        return;
      }
    }
    setValidationError(null);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      setFormData((prev) => ({
        ...prev,
        working_paper_template_id: templateId,
        // selectedCategories: [] // Reset categories when template changes
        selectedCategories:
          selectedTemplate != null && selectedTemplate.categories
            ? selectedTemplate.categories?.map((cat) => cat.id as string)
            : []
      }));
    },
    [selectedTemplate]
  );

  async function handleSubmit() {
    setValidationError(null);

    // Validate that all required categories are selected
    const requiredCategoryIds =
      selectedTemplate.categories?.filter((c) => c.is_required).map((c) => c.id) ?? [];

    const missingRequired = requiredCategoryIds.filter(
      (id) => !formData.selectedCategories.includes(id as string)
    );

    if (missingRequired.length > 0) {
      const missingNames = missingRequired
        .map((id) => selectedTemplate.categories?.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const errorMsg = `You must select all required categories. Missing: ${missingNames}`;
      setValidationError(errorMsg);
      notify({
        title: "Validation Error",
        description: errorMsg,
        type: "error"
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare data according to new API structure
    const auditData = {
      year: formData.year,
      title: formData.title,
      description: formData.description || undefined,
      start_date: formData.start_date?.toISOString().split("T")[0] as string,
      end_date: formData.end_date?.toISOString().split("T")[0] as string,
      ref_no: formData.ref_no,
      audit_area: formData.audit_area,
      audit_scope: formData.audit_scope,
      audit_criteria: formData.audit_criteria,
      audit_objective: formData.audit_objective,
      management_standard: formData.management_standard,
      audit_team_leader: formData.audit_team_leader,
      audit_team_member: formData.audit_team_member.join(",") || undefined,
      client_representative: formData.client_representative || undefined,
      audit_language: formData.audit_language || undefined,
      opening_meeting_datetime: formData.opening_meeting_datetime?.toISOString() || undefined,
      closing_meeting_datetime: formData.closing_meeting_datetime?.toISOString() || undefined,
      working_paper_template_id: formData.working_paper_template_id || undefined
    };

    try {
      const result = await createAuditPlan(auditData);

      if (result.success) {
        notify({
          title: "Success",
          description:
            "Audit plan created successfully as Draft. You can submit it for approval when ready."
        });
        router.push("/dashboard/audit/plans");
      } else {
        notify({
          title: "Error",
          description: result.message || "Failed to create audit plan",
          type: "error"
        });
      }
    } catch (error) {
      notify({
        title: "Error",
        description: "An unexpected error occurred",
        type: "error"
      });
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
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/audit/plans">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Audit Plan</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Set up a new ISO 27001 audit plan with template and category selection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-4">
            <div className="grid grid-cols-3 place-items-center justify-center gap-4">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="relative grid place-items-center">
                    <div className="grid min-w-40 flex-col place-items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : ""} ${isCompleted ? "border-primary bg-primary text-primary-foreground" : ""} ${!isActive && !isCompleted ? "border-muted bg-background text-muted-foreground" : ""} `}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium text-nowrap ${isActive ? "text-foreground" : "text-muted-foreground"} `}>
                        {step.name}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`absolute left-[90%] mx-4 h-0.5 w-full transition-colors ${isCompleted ? "bg-primary" : "bg-muted"} `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <Card className="p-6">
            {validationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Error</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-6">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Calendar className="h-5 w-5" />
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        id="year"
                        type="number"
                        label="Year"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: parseInt(e.target.value) })
                        }
                        placeholder="2025"
                        required
                      />

                      <Input
                        id="ref_no"
                        label="Reference Number"
                        value={formData.ref_no}
                        onChange={(e) => setFormData({ ...formData, ref_no: e.target.value })}
                        placeholder="e.g., AP-2025-001"
                        required
                      />
                    </div>

                    <Input
                      id="title"
                      label="Audit Plan Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Annual Audit Plan 2025"
                      required
                    />

                    <Textarea
                      id="description"
                      label="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Comprehensive audit plan for fiscal year..."
                      rows={2}
                    />

                    <div className="flex gap-4">
                      <div className="space-y-2">
                        <SelectField
                          id="management_standard"
                          label="Management Standard"
                          required
                          value={formData.management_standard}
                          onValueChange={(v) =>
                            setFormData({ ...formData, management_standard: v })
                          }
                          options={[{ id: "ISO IEC 27001", name: "ISO IEC 27001" }]}
                        />
                      </div>

                      <Input
                        id="audit_area"
                        label="Audit Area"
                        value={formData.audit_area}
                        onChange={(e) => setFormData({ ...formData, audit_area: e.target.value })}
                        placeholder="e.g., ISMS based on ISO 27001:2022"
                        required
                      />
                    </div>

                    <Textarea
                      id="audit_scope"
                      label="Audit Scope"
                      value={formData.audit_scope}
                      onChange={(e) => setFormData({ ...formData, audit_scope: e.target.value })}
                      placeholder="All information security controls across the organization..."
                      rows={3}
                      required
                    />

                    <Input
                      id="audit_criteria"
                      label="Audit Criteria"
                      value={formData.audit_criteria}
                      onChange={(e) => setFormData({ ...formData, audit_criteria: e.target.value })}
                      placeholder="e.g., ISO 27001:2022 requirements"
                      required
                    />

                    <Textarea
                      label="Audit Objective"
                      id="audit_objective"
                      value={formData.audit_objective}
                      onChange={(e) =>
                        setFormData({ ...formData, audit_objective: e.target.value })
                      }
                      placeholder="Assess compliance with ISO 27001:2022 and effectiveness of ISMS..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Calendar className="h-5 w-5" />
                      Schedule & Timelines
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <DatePicker
                        label="Start Date"
                        required
                        value={(formData.start_date ?? undefined) as any}
                        onValueChange={(date) =>
                          setFormData({ ...formData, start_date: date || null })
                        }
                      />

                      <DatePicker
                        label="End Date"
                        required
                        value={(formData.end_date ?? undefined) as any}
                        onValueChange={(date) =>
                          setFormData({ ...formData, end_date: date || null })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <DateTimePicker
                        label="Opening Meeting"
                        value={formData.opening_meeting_datetime ?? undefined}
                        onValueChange={(date) =>
                          setFormData({ ...formData, opening_meeting_datetime: date || null })
                        }
                      />

                      <DateTimePicker
                        label="Closing Meeting"
                        value={formData.closing_meeting_datetime ?? undefined}
                        onValueChange={(date) =>
                          setFormData({ ...formData, closing_meeting_datetime: date || null })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Users className="h-5 w-5" />
                      Team & Stakeholders
                    </h3>

                    <div className="grid grid-cols-1 gap-4 space-y-2 sm:grid-cols-2">
                      <div>
                        <SelectField
                          id="audit_team_leader"
                          label="Audit Team Leader"
                          required
                          className="w-full"
                          placeholder="Choose team leader"
                          value={formData.audit_team_leader}
                          onValueChange={(v) => {
                            setFormData({ ...formData, audit_team_leader: v });
                          }}
                          options={teamMembers.map((member) => ({
                            id: member.id,
                            name: `${member.first_name} ${member.last_name}  - (${member.role.name})`
                          }))}
                        />
                      </div>

                      <Input
                        id="client_representative"
                        label="Client Representative"
                        value={formData.client_representative}
                        onChange={(e) =>
                          setFormData({ ...formData, client_representative: e.target.value })
                        }
                        placeholder="e.g., John Doe, CISO"
                      />
                    </div>

                    <div className="space-y-2">
                      <MultiSelectField
                        label="Audit Team Members"
                        required
                        placeholder="Choose team member"
                        value={formData.audit_team_member}
                        onValueChange={(values) => {
                          setFormData({ ...formData, audit_team_member: values });
                        }}
                        options={teamMembers.map((member) => ({
                          value: member.id,
                          label: `${member.first_name} ${member.last_name}  - (${member.role.name})`
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audit_language">Audit Language</Label>
                      <Input
                        id="audit_language"
                        value={formData.audit_language}
                        onChange={(e) =>
                          setFormData({ ...formData, audit_language: e.target.value })
                        }
                        placeholder="English"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Template Selection */}
              {currentStep === 2 && (
                <TemplateSelectorSimple
                  value={formData.working_paper_template_id}
                  onChange={handleTemplateChange}
                  selectedTemplate={selectedTemplate}
                  loadingTemplateDetails={loadingTemplateDetails}
                />
              )}

              {/* Step 3: Category Selection */}
              {currentStep === 3 && formData.working_paper_template_id && (
                <CategorySelector
                  templateId={formData.working_paper_template_id}
                  selectedCategories={formData.selectedCategories}
                  loadingTemplateDetails={loadingTemplateDetails}
                  selectedTemplate={selectedTemplate}
                  onCategoriesChange={(categories) =>
                    setFormData({ ...formData, selectedCategories: categories })
                  }
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={isSubmitting}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={isSubmitting}>
                    Cancel
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Audit Plan"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
