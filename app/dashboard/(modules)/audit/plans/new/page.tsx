"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheckIcon,
  TelescopeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { createAuditPlan } from "@/app/_actions/audit-module-actions";
import { TemplateSelectorSimple } from "@/app/dashboard/(modules)/audit/plans/_components/template-selector-simple";
import { CategorySelector } from "@/app/dashboard/(modules)/audit/plans/_components/category-selector";
import { SelectField } from "@/components/ui/select-field";
import { WorkpaperTemplateDefinition } from "@/lib/types/audit-types";
import { useWorkpaperTemplateCategories } from "@/hooks/use-audit-query-data";
import { notify } from "@/lib/utils";
import { useTeamMembers } from "@/hooks/use-users-query-data";
import { useDepartments } from "@/hooks/use-query-data";
import { User } from "@/lib/types/account";
import { MultiSelectField } from "@/components/ui/multi-select-field";
import PageHeader from "@/components/page-header";
import BackButton from "@/components/back-button";
import {
  useUniverses,
  useUniverseItems,
  useBudgets,
  useBudgetLines
} from "@/hooks/use-audit-settings-query-data";
import { SearchSelectField } from "@/components/ui/search-select-field";

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
  const teamMembers = ((teamMemberResponse?.data?.data || []) as User[]) ?? [];

  const { data: departmentsResponse, isLoading: loadingDepartments } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });
  const departmentsData = departmentsResponse?.data?.data || [];

  // Form state
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    ref_no: "",
    department_id: "",
    audit_area: "",
    audit_scope: "",
    audit_criteria: "",
    audit_objective: "",
    management_standard: "ISO",
    audit_team_leader: "",
    audit_team_member: [] as string[],
    client_representative: "",
    audit_language: "English",
    start_date: null as Date | null,
    end_date: null as Date | null,
    audit_plan_date: null as Date | null,
    opening_meeting_datetime: null as Date | null,
    closing_meeting_datetime: null as Date | null,
    working_paper_template_id: "",
    selected_audit_universe_id: "" as string,
    audit_universe_item_ids: [] as string[],
    budget_id: "" as string,
    budget_item_ids: [] as string[],
    selectedCategories: [] as string[]
  });

  // Store the complete template object with categories from template selector
  const [selectedTemplateWithCategories, setSelectedTemplateWithCategories] =
    useState<WorkpaperTemplateDefinition | null>(null);

  // Fetch universes dynamically for the dropdown
  const { data: universesResponse, isLoading: loadingUniverses } = useUniverses();
  const universesData = Array.isArray(universesResponse?.data)
    ? universesResponse.data
    : Array.isArray(universesResponse)
      ? universesResponse
      : [];

  // Fetch universe items based on selected universe
  // const { data: universeItemsResponse, isLoading: loadingUniverseItems } = useUniverseItems(
  //   String(formData.selected_audit_universe_id) || undefined
  // );
  // Fetch universe items for the selected universe
  const universeIdForItems = formData.selected_audit_universe_id
    ? String(formData.selected_audit_universe_id)
    : undefined;

  const { data: universeItemsResponse, isLoading: loadingUniverseItems } =
    useUniverseItems(universeIdForItems);
  // const universeItemsData = universeIdForItems ? universeItemsResponse?.data : [];

  const universeItemsData = Array.isArray(universeItemsResponse?.data)
    ? universeItemsResponse.data
    : Array.isArray(universeItemsResponse)
      ? universeItemsResponse
      : [];

  // Fetch budgets
  const { data: budgetsResponse, isLoading: loadingBudgets } = useBudgets({
    is_active: true
    // status: "APPROVED"
  });

  const budgetsData = Array.isArray(budgetsResponse?.data)
    ? budgetsResponse.data
    : Array.isArray(budgetsResponse)
      ? budgetsResponse
      : [];

  const { data: budgetLinesResponse, isLoading: loadingBudgetLines } = useBudgetLines(
    formData.budget_id
  );
  const budgetLinesData = Array.isArray(budgetLinesResponse?.data?.data)
    ? budgetLinesResponse.data.data
    : Array.isArray(budgetLinesResponse?.data)
      ? budgetLinesResponse?.data
      : Array.isArray(budgetLinesResponse)
        ? budgetLinesResponse
        : [];

  const { data: fullTemplateResponse, isLoading: loadingTemplateDetails } =
    useWorkpaperTemplateCategories(formData.working_paper_template_id);

  const selectedTemplate: WorkpaperTemplateDefinition =
    fullTemplateResponse?.data ?? ({} as WorkpaperTemplateDefinition);

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (
        !formData.title ||
        !formData.ref_no ||
        !formData.department_id ||
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

  const handleTemplateChange = useCallback((template: WorkpaperTemplateDefinition) => {
    setFormData((prev) => ({
      ...prev,
      working_paper_template_id: template.id as string,
      // selectedCategories: [] // Reset categories when template changes
      selectedCategories:
        template != null && template.categories
          ? template.categories?.map((cat) => cat.id as string)
          : []
    }));
    // Store the complete template object with categories
    setSelectedTemplateWithCategories(template);
  }, []);

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

    // Prepare data according to API structure
    const auditData = {
      year: formData.year,
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date?.toISOString().split("T")[0] as string,
      end_date: formData.end_date?.toISOString().split("T")[0] as string,
      ref_no: formData.ref_no,
      audit_plan_date: formData.audit_plan_date?.toISOString() || new Date().toISOString(),
      audit_area: formData.audit_area,
      audit_scope: formData.audit_scope,
      audit_criteria: formData.audit_criteria,
      audit_objective: formData.audit_objective,
      management_standard: formData.management_standard,
      audit_team_leader: formData.audit_team_leader,
      audit_team_members: formData.audit_team_member || [],
      client_representative: formData.client_representative,
      audit_language: formData.audit_language,
      opening_meeting_datetime: formData.opening_meeting_datetime?.toISOString() || undefined,
      closing_meeting_datetime: formData.closing_meeting_datetime?.toISOString() || undefined,
      working_paper_template_id: formData.working_paper_template_id,
      department_id: formData.department_id,
      audit_universe_item_ids: formData.audit_universe_item_ids || [],
      budget_item_ids: formData.budget_item_ids || []
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

  const budgetsOptions = useMemo(() => {
    return budgetsData.map((budget: any) => ({
      value: budget.id,
      label: `${budget.title} - ${budget.currency} ${budget.total_amount.toLocaleString("en-GB")} [${budget.status}]`
    }));
  }, [budgetsData]);

  const budgetLinesOptions = useMemo(() => {
    return budgetLinesData.map((budgetLine: any) => ({
      value: budgetLine.id,
      label: `${budgetLine.name} (${budgetLine.currency} ${budgetLine.allocated_amount?.toLocaleString("en-GB")}) - ${budgetLine.category}`
    }));
  }, [budgetLinesData]);

  const universesOptions = useMemo(() => {
    return universesData.map((universe: any) => ({
      value: universe.id,
      label: universe.universe_name
    }));
  }, [universesData]);

  const universeItemsOptions = useMemo(
    () =>
      universeItemsData.map((universeItem: any) => ({
        value: universeItem.id,
        label: universeItem.name
      })),
    [universeItemsData]
  );

  // console.log({ universeItemsData });

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <PageHeader
              title="New Audit Plan"
              description="Create a new audit plan and track its progress"
              Icon={ClipboardCheckIcon}
            />
            <BackButton title="Back to plans" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8">
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

                    <SearchSelectField
                      id="department_id"
                      label="Department / Functional Unit"
                      required
                      placeholder="--Select a Department / Functional Unit--"
                      className="w-full max-w-none"
                      value={formData.department_id}
                      onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                      options={(departmentsData as any) || []}
                      isLoading={loadingDepartments}
                    />

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

                    <SelectField
                      id="management_standard"
                      label="Management Standard"
                      value={formData.management_standard}
                      onValueChange={(value) =>
                        setFormData({ ...formData, management_standard: value })
                      }
                      // onChange={(e) =>
                      //   setFormData({ ...formData, management_standard: e.target.value })
                      // }
                      options={[
                        { id: "ISO", name: "ISO 27001" },
                        { id: "ISO-IMIS", name: "ISO 27001 IMIS" },
                        { id: "ISO-IEC", name: "ISO 27001 IEC" }
                      ]}
                      placeholder="e.g., ISO IEC 27001"
                      required
                    />

                    <Textarea
                      id="audit_area"
                      label="Audit Area"
                      rows={2}
                      value={formData.audit_area}
                      onChange={(e) => setFormData({ ...formData, audit_area: e.target.value })}
                      placeholder="e.g., ISMS based on ISO 27001:2022"
                      required
                    />

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

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <DatePicker
                        label="Audit Plan Date"
                        value={(formData.audit_plan_date ?? undefined) as any}
                        onValueChange={(date) =>
                          setFormData({ ...formData, audit_plan_date: date || null })
                        }
                      />
                      <DatePicker
                        label="Audit Start Date"
                        required
                        value={(formData.start_date ?? undefined) as any}
                        onValueChange={(date) =>
                          setFormData({ ...formData, start_date: date || null })
                        }
                      />

                      <DatePicker
                        label="Audit End Date"
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
                      <TelescopeIcon className="h-5 w-5" />
                      Audit Scope Selection
                    </h3>

                    <div className="grid grid-cols-1 gap-4 space-y-2 md:grid-cols-2">
                      {universesData.length === 0 && !loadingUniverses && (
                        <Alert variant="default" className="border-blue-200 bg-blue-50">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            No universes available. Please create a universe first before creating
                            an audit plan.
                          </AlertDescription>
                        </Alert>
                      )}
                      <SearchSelectField
                        label="Select Universe"
                        placeholder="-- Choose a universe --"
                        value={formData.selected_audit_universe_id}
                        onValueChange={(value) =>
                          setFormData((prev) => {
                            return {
                              ...prev,
                              selected_audit_universe_id: value,
                              audit_universe_item_ids: [] // Reset universe items when universe changes
                            };
                          })
                        }
                        options={universesOptions}
                        isLoading={loadingUniverses}
                        isDisabled={universesData.length === 0}
                      />
                      <SearchSelectField
                        label="Budget"
                        placeholder="Select budget"
                        value={formData.budget_id}
                        onValueChange={(value) => {
                          setFormData({ ...formData, budget_id: value });
                        }}
                        options={budgetsOptions}
                        disabled={loadingBudgets}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 space-y-2 md:grid-cols-2">
                      <MultiSelectField
                        label="Universe Items"
                        placeholder="Select universe items to audit"
                        value={formData.audit_universe_item_ids}
                        onValueChange={(values) => {
                          setFormData({ ...formData, audit_universe_item_ids: values });
                        }}
                        options={universeItemsOptions}
                        disabled={loadingUniverseItems || !formData.selected_audit_universe_id}
                        isLoading={loadingUniverseItems}
                      />
                      <MultiSelectField
                        label="Budget Lines"
                        placeholder="-- Select budget lines --"
                        value={formData.budget_item_ids}
                        onValueChange={(values) => {
                          setFormData({ ...formData, budget_item_ids: values });
                        }}
                        options={budgetLinesOptions}
                        disabled={loadingBudgetLines || !formData.budget_id}
                        isLoading={loadingBudgetLines}
                      />
                    </div>

                    {formData.opening_meeting_datetime && formData.closing_meeting_datetime && (
                      <div className="bg-muted rounded-md p-4">
                        <Label className="text-base font-medium">Audit Period</Label>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {formData.opening_meeting_datetime.toLocaleDateString()} -{" "}
                          {formData.closing_meeting_datetime.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Users className="h-5 w-5" />
                      Team & Stakeholders
                    </h3>

                    <div className="grid grid-cols-1 gap-4 space-y-2 sm:grid-cols-2">
                      <div>
                        <SearchSelectField
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
                  loadingTemplateDetails={loadingTemplateDetails}
                />
              )}

              {/* Step 3: Category Selection */}
              {currentStep === 3 && formData.working_paper_template_id && (
                <CategorySelector
                  templateId={formData.working_paper_template_id}
                  selectedCategories={formData.selectedCategories}
                  loadingTemplateDetails={loadingTemplateDetails}
                  selectedTemplate={selectedTemplateWithCategories || selectedTemplate}
                  onCategoriesChange={(categories) =>
                    setFormData({ ...formData, selectedCategories: categories })
                  }
                />
              )}

              {/* Navigation Buttons */}
              <div className="bg-background/80 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 -mx-6 mt-8 flex flex-col-reverse justify-end gap-3 border-t px-6 pt-6 pb-6 backdrop-blur sm:-mx-8 sm:flex-row sm:px-8 sm:pb-8">
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

                <div className="ml-auto flex items-center gap-3">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => router.back()}
                    disabled={isSubmitting}>
                    Cancel
                  </Button>

                  {currentStep < STEPS.length ? (
                    <div>
                      <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
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
