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
import { WorkpaperTemplateDefinition, TemplateCategory } from "@/lib/types/audit-types";
import { useWorkpaperTemplateCategories } from "@/hooks/use-audit-query-data";
import { notify } from "@/lib/utils";
import { useHeadsOfDepartments, useUsers } from "@/hooks/use-users-query-data";
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
import { FRAMEWORK_TYPES } from "@/app/dashboard/system-configs/audit-settings/_components/iso-workpaper-form";

/**
 * Audit Plan Form Data Type
 * Represents the structure of the form data used in the audit plan creation flow
 */
type AuditPlanFormData = {
  year: number;
  title: string;
  description: string;
  ref_no: string;
  department_id: string;
  audit_area: string;
  audit_scope: string;
  audit_criteria: string;
  audit_objective: string;
  management_standard: string;
  audit_team_leader: string;
  audit_team_member: string[];
  client_representative: string;
  audit_language: string;
  start_date: Date | null;
  end_date: Date | null;
  audit_plan_date: Date | null;
  opening_meeting_datetime: Date | null;
  closing_meeting_datetime: Date | null;
  working_paper_template_id: string;
  selected_audit_universe_id: string;
  audit_universe_item_ids: string[];
  budget_id: string;
  budget_item_ids: string[];
  selectedCategories: string[];
};

type FieldErrors = Partial<Record<keyof AuditPlanFormData, string>>;

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

  // Form state
  const [formData, setFormData] = useState<AuditPlanFormData>({
    year: new Date().getFullYear(), // DEFAULT BUT NOT REQUIRED
    title: "",
    description: "",
    ref_no: "",
    department_id: "",
    audit_area: "",
    audit_scope: "",
    audit_criteria: "",
    audit_objective: "",
    management_standard: FRAMEWORK_TYPES[0].id,
    audit_team_leader: "",
    audit_team_member: [],
    client_representative: "",
    audit_language: "English",
    start_date: null,
    end_date: null,
    audit_plan_date: null,
    opening_meeting_datetime: null,
    closing_meeting_datetime: null,
    working_paper_template_id: "",
    selected_audit_universe_id: "",
    audit_universe_item_ids: [],
    budget_id: "",
    budget_item_ids: [],
    selectedCategories: []
  });

  const { data: teamMemberResponse } = useUsers({
    page_size: 100,
    departmentId: formData.department_id
  });
  const teamMembers = ((teamMemberResponse?.data?.data || []) as User[]) ?? [];

  const { data: headsOfDepartmentResponse } = useHeadsOfDepartments({
    page_size: 100,
    department_id: formData.department_id
  });

  const headsOfDepartment: User[] = ((headsOfDepartmentResponse?.data || []) as User[]) ?? [];

  const { data: departmentsResponse, isLoading: loadingDepartments } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });
  const departmentsData = departmentsResponse?.data?.data || [];

  // Store the complete template object with categories from template selector
  const [selectedTemplateWithCategories, setSelectedTemplateWithCategories] =
    useState<WorkpaperTemplateDefinition | null>(null);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Fetch universes dynamically for the dropdown
  const { data: universesResponse, isLoading: loadingUniverses } = useUniverses({
    is_active: true
  });
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

  const { data: universeItemsResponse, isLoading: loadingUniverseItems } = useUniverseItems(
    universeIdForItems,
    {
      department_id: formData.department_id
    }
  );

  // Extract universe items data - hook returns data.data structure
  const universeItemsData = Array.isArray(universeItemsResponse)
    ? universeItemsResponse
    : Array.isArray(universeItemsResponse?.data)
      ? universeItemsResponse.data
      : [];

  // Fetch budgets
  const { data: budgetsResponse, isLoading: loadingBudgets } = useBudgets({
    is_active: true,
    department_id: formData.department_id
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

  // Extract categories from the API response
  const templateCategoriesFromAPI: TemplateCategory[] = Array.isArray(
    fullTemplateResponse?.data?.data
  )
    ? fullTemplateResponse.data.data
    : Array.isArray(fullTemplateResponse?.data)
      ? fullTemplateResponse.data
      : [];

  // Use selectedTemplateWithCategories if available (set when user selects template), otherwise use fetched data
  const selectedTemplate: WorkpaperTemplateDefinition = selectedTemplateWithCategories
    ? {
        ...selectedTemplateWithCategories,
        categories:
          templateCategoriesFromAPI.length > 0
            ? templateCategoriesFromAPI
            : selectedTemplateWithCategories.categories
      }
    : ({} as WorkpaperTemplateDefinition);

  const validateStep1 = (): boolean => {
    const errors: FieldErrors = {};
    let hasErrors = false;

    if (!formData.title) {
      errors.title = "Audit plan title is required";
      hasErrors = true;
    }
    if (!formData.ref_no) {
      errors.ref_no = "Reference number is required";
      hasErrors = true;
    }
    if (!formData.department_id) {
      errors.department_id = "Department is required";
      hasErrors = true;
    }
    if (!formData.audit_area) {
      errors.audit_area = "Audit area is required";
      hasErrors = true;
    }
    if (!formData.audit_scope) {
      errors.audit_scope = "Audit scope is required";
      hasErrors = true;
    }
    if (!formData.audit_criteria) {
      errors.audit_criteria = "Audit criteria is required";
      hasErrors = true;
    }
    if (!formData.audit_objective) {
      errors.audit_objective = "Audit objective is required";
      hasErrors = true;
    }
    if (!formData.start_date) {
      errors.start_date = "Start date is required";
      hasErrors = true;
    }
    if (!formData.end_date) {
      errors.end_date = "End date is required";
      hasErrors = true;
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.start_date = "Start date must be before end date";
      hasErrors = true;
    }
    if (!formData.audit_team_leader) {
      errors.audit_team_leader = "Audit team leader is required";
      hasErrors = true;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  const validateStep2 = (): boolean => {
    const errors: FieldErrors = {};
    let hasErrors = false;

    if (!formData.working_paper_template_id) {
      errors.working_paper_template_id = "Please select a working paper template";
      hasErrors = true;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  const handleNext = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!validateStep1()) {
        notify({
          description: "Please fill in all required fields",
          type: "error"
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!validateStep2()) {
        notify({
          description: "Please select a template",
          type: "error"
        });
        return;
      }
    }

    // Clear errors on successful validation
    setFieldErrors({});
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
        label: `KRI:${universeItem.kri_name} - (${universeItem.auditable_area_name})`
      })),
    [universeItemsData]
  );

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
                        id="title"
                        label="Audit Plan Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Annual Audit Plan 2025"
                        required
                        isInvalid={!!fieldErrors.title}
                        errorText={fieldErrors.title}
                      />
                      <SelectField
                        id="management_standard"
                        label="Management Standard"
                        className="w-full"
                        value={formData.management_standard}
                        onValueChange={(value) =>
                          setFormData({ ...formData, management_standard: value })
                        }
                        options={FRAMEWORK_TYPES}
                        placeholder="e.g., ISO 27001"
                        required
                      />
                    </div>

                    <Textarea
                      id="description"
                      label="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Comprehensive audit plan for fiscal year..."
                      rows={2}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <SearchSelectField
                        id="department_id"
                        label="Department / Functional Unit"
                        required
                        placeholder="--Select a Department / Functional Unit--"
                        className="w-full max-w-none"
                        value={formData.department_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, department_id: value })
                        }
                        options={(departmentsData as any) || []}
                        isLoading={loadingDepartments}
                        isInvalid={!!fieldErrors.department_id}
                        errorText={fieldErrors.department_id}
                      />

                      <Input
                        id="ref_no"
                        label="Reference Number"
                        value={formData.ref_no}
                        onChange={(e) => setFormData({ ...formData, ref_no: e.target.value })}
                        placeholder="e.g., AP-2025-001"
                        required
                        isInvalid={!!fieldErrors.ref_no}
                        errorText={fieldErrors.ref_no}
                      />
                    </div>

                    <Textarea
                      id="audit_area"
                      label="Audit Area"
                      rows={2}
                      value={formData.audit_area}
                      onChange={(e) => setFormData({ ...formData, audit_area: e.target.value })}
                      placeholder="e.g., ISMS based on ISO 27001:2022"
                      required
                      isInvalid={!!fieldErrors.audit_area}
                      errorText={fieldErrors.audit_area}
                    />

                    <Textarea
                      id="audit_scope"
                      label="Audit Scope"
                      value={formData.audit_scope}
                      onChange={(e) => setFormData({ ...formData, audit_scope: e.target.value })}
                      placeholder="All information security controls across the organization..."
                      rows={3}
                      required
                      isInvalid={!!fieldErrors.audit_scope}
                      errorText={fieldErrors.audit_scope}
                    />

                    <Input
                      id="audit_criteria"
                      label="Audit Criteria"
                      value={formData.audit_criteria}
                      onChange={(e) => setFormData({ ...formData, audit_criteria: e.target.value })}
                      placeholder="e.g., ISO 27001:2022 requirements"
                      required
                      isInvalid={!!fieldErrors.audit_criteria}
                      errorText={fieldErrors.audit_criteria}
                    />

                    <Textarea
                      label="Audit Objective"
                      id="audit_objective"
                      value={formData.audit_objective}
                      onChange={(e) =>
                        setFormData({ ...formData, audit_objective: e.target.value })
                      }
                      placeholder="Assess compliance with ISO 27001:2022 and effectiveness of ISMS..."
                      rows={4}
                      required
                      isInvalid={!!fieldErrors.audit_objective}
                      errorText={fieldErrors.audit_objective}
                    />
                  </div>

                  <div className="space-y-4 rounded-xl border-t border-slate-400/5 bg-slate-50 p-4 dark:bg-slate-900/30">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
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
                        isInvalid={!!fieldErrors.start_date}
                        errorText={fieldErrors.start_date}
                      />

                      <DatePicker
                        label="Audit End Date"
                        required
                        value={(formData.end_date ?? undefined) as any}
                        onValueChange={(date) =>
                          setFormData({ ...formData, end_date: date || null })
                        }
                        isInvalid={!!fieldErrors.end_date}
                        errorText={fieldErrors.end_date}
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
                          isInvalid={!!fieldErrors.audit_team_leader}
                          errorText={fieldErrors.audit_team_leader}
                        />
                      </div>

                      <SearchSelectField
                        id="client_representative"
                        label="Client Representative"
                        value={formData.client_representative}
                        onValueChange={(v) => {
                          setFormData({ ...formData, client_representative: v });
                        }}
                        placeholder="e.g., John Doe, CISO"
                        options={headsOfDepartment.map((member) => ({
                          id: member.id,
                          name: `${member.first_name} ${member.last_name}  - (${member.role.name})`
                        }))}
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
                <div className="space-y-4">
                  {fieldErrors.working_paper_template_id && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Error</AlertTitle>
                      <AlertDescription>{fieldErrors.working_paper_template_id}</AlertDescription>
                    </Alert>
                  )}
                  <TemplateSelectorSimple
                    value={formData.working_paper_template_id}
                    onChange={handleTemplateChange}
                    loadingTemplateDetails={loadingTemplateDetails}
                    frameworkType={formData.management_standard}
                  />
                </div>
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
