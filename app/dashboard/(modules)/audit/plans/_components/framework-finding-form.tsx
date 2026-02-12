"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { SelectField } from "@/components/ui/select-field";
import { CheckCircle2, Save, ChevronDown, ChevronUp, AlertCircle, Plus } from "lucide-react";
import { notify } from "@/lib/utils";
import type {
  AuditPlan,
  WorkpaperFinding,
  FindingEvidence,
  FindingEvidenceType
} from "@/lib/types/audit-types";
import { updateFinding } from "@/app/_actions/audit-module-actions";
import { QUERY_KEYS } from "@/lib/constants";
import { useUsers } from "@/hooks/use-users-query-data";
import { User } from "@/lib/types/account";
import {
  getFrameworkFieldConfig,
  FrameworkType,
  type FindingField
} from "@/lib/config/finding-framework-fields";
import {
  initializeFormDataFromFinding,
  buildFindingPayload,
  validateFrameworkRequiredFields
} from "@/lib/utils/finding-form-utils";
import {
  useFindingEvidence,
  useCreateEvidenceMutation,
  useUpdateEvidenceMutation,
  useDeleteEvidenceMutation
} from "@/hooks/use-evidence-queries";
import { EvidenceForm } from "./evidence-form";
import { EvidenceList } from "./evidence-list";
import { Spinner } from "@/components/ui/spinner";
import { usePermissions } from "@/hooks/use-permissions";

interface FrameworkFindingFormProps {
  category: any;
  auditPlan: AuditPlan;
  finding: WorkpaperFinding | null;
  onEditComplete?: () => void;
  isModal?: boolean; // When true, form is expanded by default
}

const SEVERITY_OPTIONS = [
  { value: "LOW", label: "Low", color: "bg-blue-100 text-blue-800" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "CRITICAL", label: "Critical", color: "bg-red-100 text-red-800" }
];

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" }
];

const CONFORMITY_OPTIONS = [
  { value: true, label: "Conformity" },
  { value: false, label: "Non-Conformity" }
];

export function FrameworkFindingForm({
  category,
  auditPlan,
  finding,
  onEditComplete
}: FrameworkFindingFormProps) {
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();
  const { data: teamMemberResponse } = useUsers({ page_size: 100 });
  const teamMembers = ((teamMemberResponse?.data?.data || []) as User[]) ?? [];

  const framework = (auditPlan?.framework_type || "ISO27001") as FrameworkType;
  const config = getFrameworkFieldConfig(framework);

  const [formData, setFormData] = useState<Record<string, any>>({});
  // const [isFormExpanded, setIsFormExpanded] = useState(isModal);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [responsiblePersonName, setResponsiblePersonName] = useState("");

  // Evidence management state
  const { data: evidenceResponse, isLoading: isLoadingEvidence } = useFindingEvidence(finding?.id);
  const createEvidenceMutation = useCreateEvidenceMutation();
  const updateEvidenceMutation = useUpdateEvidenceMutation();
  const deleteEvidenceMutation = useDeleteEvidenceMutation();

  const existingEvidence = evidenceResponse?.evidence || [];
  const evidenceStats = {
    total_count: evidenceResponse?.total_count || 0,
    verified_count: evidenceResponse?.verified_count || 0,
    unverified_count: evidenceResponse?.unverified_count || 0
  };

  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<FindingEvidence | null>(null);
  const [unsavedEvidence, setUnsavedEvidence] = useState<FindingEvidence[]>([]);

  // Initialize form from finding
  useEffect(() => {
    if (finding) {
      const initialized = initializeFormDataFromFinding(finding);
      setFormData(initialized);
      // Set responsible person name
      const person = teamMembers.find((m) => m.id === finding.responsible_person);
      setResponsiblePersonName(
        `${person?.first_name} ${person?.last_name} - [${person?.role}]` || ""
      );
    } else {
      // Initialize with empty form for new finding
      setFormData({
        severity: "MEDIUM",
        status: "OPEN",
        is_conformity: null
      });
    }
  }, [finding?.id, finding?.responsible_person]);

  // Setup mutation for updating finding
  const mutation = useMutation({
    mutationFn: async () => {
      if (!finding?.id) {
        throw new Error("Finding ID is required for updates");
      }

      // Validate required fields
      const validation = validateFrameworkRequiredFields(formData, framework);
      if (!validation.valid) {
        setFieldErrors(validation.errors);
        throw new Error("Please fill in all required fields");
      }

      const payload = buildFindingPayload(formData);
      const result = await updateFinding(finding.id, payload);
      return result;
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKPAPER_FINDINGS] });
        notify({
          title: "Success",
          description: "Finding updated successfully.",
          type: "success"
        });
        setFieldErrors({});
        onEditComplete?.();
      } else {
        notify({
          title: "Error",
          description: response.message || "Failed to update finding.",
          type: "error"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "An error occurred while updating the finding.",
        type: "error"
      });
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleAddEvidence = async (evidenceData: {
    evidence_type: FindingEvidenceType;
    title: string;
    description?: string;
    external_link?: string;
    collection_date?: string;
    notes?: string;
    file?: File;
  }) => {
    if (!finding?.id) return;

    try {
      await createEvidenceMutation.mutateAsync({
        finding_id: finding.id,
        ...evidenceData
      });
      setShowEvidenceForm(false);
    } catch (error) {
      console.error("Error adding evidence:", error);
    }
  };

  const handleUpdateEvidence = async (evidenceData: {
    evidence_type: FindingEvidenceType;
    title: string;
    description?: string;
    external_link?: string;
    collection_date?: string;
    notes?: string;
    file?: File;
  }) => {
    if (!editingEvidence) return;

    try {
      await updateEvidenceMutation.mutateAsync({
        evidence_id: editingEvidence.id,
        finding_id: editingEvidence.finding_id,
        ...evidenceData
      });
      setEditingEvidence(null);
      setShowEvidenceForm(false);
    } catch (error) {
      console.error("Error updating evidence:", error);
    }
  };

  const handleDeleteEvidence = async (evidence: FindingEvidence) => {
    if (!window.confirm("Are you sure you want to delete this evidence?")) return;

    try {
      await deleteEvidenceMutation.mutateAsync({
        evidence_id: evidence.id,
        finding_id: evidence.finding_id
      });
    } catch (error) {
      console.error("Error deleting evidence:", error);
    }
  };

  const handleEditEvidence = (evidence: FindingEvidence) => {
    setEditingEvidence(evidence);
    setShowEvidenceForm(true);
  };

  const handleCancelEvidenceForm = () => {
    setShowEvidenceForm(false);
    setEditingEvidence(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPermission("AUDIT_WPS", "can_edit")) return;

    // Check if there's unsaved evidence form
    if (showEvidenceForm) {
      notify({
        title: "Unsaved Evidence",
        description: "Please save or cancel the evidence form before saving the finding.",
        type: "warning"
      });
      return;
    }

    mutation.mutate();
  };

  if (!finding) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-muted-foreground text-center text-sm">
            <AlertCircle className="mx-auto mb-3 h-8 w-8" />
            <p>No finding to edit. Create a finding for this category first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expanded form view
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Editing Finding - {framework}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {finding.finding_number && `Finding #${finding.finding_number}`}
                  {finding.category?.name && ` • ${finding.category.name}`}
                </p>

                {/* Framework-Specific Fields (Read-Only Display) */}
                {config.complianceFields.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-blue-200 pt-3 dark:border-blue-900">
                    {config.complianceFields
                      .filter(
                        (f) =>
                          !["compliance_status", "compliance_percentage"].includes(f.name) &&
                          formData[f.name]
                      )
                      .map((field) => (
                        <div key={field.name} className="flex items-start gap-2">
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            {field.label}:
                          </span>
                          <span className="text-xs text-blue-900 dark:text-blue-100">
                            {String(formData[field.name])}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conformity Assessment - Top Priority */}
      {/* <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="text-base">Conformity Assessment</CardTitle>
          <CardDescription>Indicate whether this {framework} requirement is met</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-6">
              {CONFORMITY_OPTIONS.map((option) => (
                <div key={String(option.value)} className="flex items-center gap-2">
                  <Checkbox
                    id={`conformity-${option.value}`}
                    checked={formData.is_conformity === option.value}
                    onCheckedChange={() => handleInputChange("is_conformity", option.value)}
                  />
                  <Label
                    htmlFor={`conformity-${option.value}`}
                    className="cursor-pointer font-medium">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Framework-Specific Compliance Fields - Only Editable Ones (compliance_status, compliance_percentage) */}
      {config.complianceFields.some((f) =>
        ["compliance_status", "compliance_percentage"].includes(f.name)
      ) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Assessment</CardTitle>
            <CardDescription>Compliance status and assessment for this finding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.complianceFields
                .filter((f) => ["compliance_status", "compliance_percentage"].includes(f.name))
                .map((field) => (
                  <div key={field.name}>
                    {field.type === "textarea" && (
                      <Textarea
                        label={field.label}
                        required={field.required}
                        descriptionText={field.description}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        errorText={fieldErrors[field.name]}
                        rows={2}
                        className="text-sm"
                      />
                    )}

                    {field.type === "text" && (
                      <Input
                        label={field.label}
                        required={field.required}
                        descriptionText={field.description}
                        type="text"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        errorText={fieldErrors[field.name]}
                        className="text-sm"
                      />
                    )}
                    {field.type === "select" && (
                      <SelectField
                        label={field.label}
                        required={field.required}
                        descriptionText={field.description}
                        type="text"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        errorText={fieldErrors[field.name]}
                        className="w-full text-sm"
                        options={field.options || []}
                      />
                    )}

                    {field.type === "number" && formData?.compliance_status == "Partial" && (
                      <Input
                        label={field.label}
                        required={field.required}
                        descriptionText={field.description}
                        type="number"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, parseInt(e.target.value))}
                        placeholder={field.placeholder}
                        errorText={fieldErrors[field.name]}
                        min="0"
                        max="100"
                        step={1}
                        className="text-sm"
                      />
                    )}

                    {field.type === "checkbox" && field.options && (
                      <div>
                        <Label className="text-sm font-medium">{field.label}</Label>
                        {field.description && (
                          <p className="text-muted-foreground mb-3 text-xs">{field.description}</p>
                        )}
                        <div className="flex gap-4">
                          {field.options.map((option) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`${field.name}-${option.id}`}
                                checked={formData[field.name] === option.id}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange(field.name, option.id);
                                  } else {
                                    handleInputChange(field.name, null);
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`${field.name}-${option.id}`}
                                className="cursor-pointer text-sm font-normal">
                                {option.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {fieldErrors[field.name] && (
                          <p className="mt-2 text-xs text-red-500">{fieldErrors[field.name]}</p>
                        )}
                      </div>
                    )}

                    {field.type === "date" && (
                      <DatePicker
                        label={field.label}
                        value={formData[field.name]}
                        onChange={(date) => handleInputChange(field.name, date)}
                      />
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finding Details - Severity & Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Finding Details</CardTitle>
          <CardDescription>Impact level and recommended actions for this finding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Severity Level */}
            <div>
              <SelectField
                label="Severity Level"
                required={true}
                descriptionText="Impact level of this finding"
                type="text"
                value={formData.severity || ""}
                onValueChange={(value) => handleInputChange("severity", value)}
                placeholder="Select severity..."
                errorText={fieldErrors["severity"]}
                className="w-full max-w-none text-sm"
                classNames={{
                  wrapper: "max-w-none"
                }}
                options={[
                  { id: "LOW", name: "Low" },
                  { id: "MEDIUM", name: "Medium" },
                  { id: "HIGH", name: "High" },
                  { id: "CRITICAL", name: "Critical" }
                ]}
              />
            </div>

            {/* Recommendation */}
            <div>
              <Textarea
                label="Recommendation"
                required={true}
                descriptionText="What should be done to address this finding?"
                value={formData.recommendation || ""}
                onChange={(e) => handleInputChange("recommendation", e.target.value)}
                placeholder="Enter recommended actions to address this finding..."
                errorText={fieldErrors["recommendation"]}
                rows={3}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Evidence & Support Documentation</CardTitle>
              <CardDescription className="text-xs">
                Attach evidence and documentation to support this finding
              </CardDescription>
            </div>
            {!showEvidenceForm && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingEvidence(null);
                  setShowEvidenceForm(true);
                }}
                disabled={isLoadingEvidence || createEvidenceMutation.isPending}
                className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Evidence Form */}
          {isLoadingEvidence ? (
            <div className="text-muted-foreground flex items-center gap-2 py-4 text-center text-sm">
              <Spinner className="size-6" />
              Loading evidence...
            </div>
          ) : showEvidenceForm ? (
            <EvidenceForm
              finding_id={finding.id}
              evidence={editingEvidence}
              onSubmit={editingEvidence ? handleUpdateEvidence : handleAddEvidence}
              onCancel={handleCancelEvidenceForm}
              isLoading={createEvidenceMutation.isPending || updateEvidenceMutation.isPending}
            />
          ) : !showEvidenceForm &&
            Array.isArray(existingEvidence) &&
            existingEvidence.length > 0 ? (
            <div>
              <h4 className="mb-3 text-sm font-semibold">Attached Evidence</h4>
              <EvidenceList
                evidence={existingEvidence || []}
                stats={evidenceStats}
                onEdit={handleEditEvidence}
                onDelete={handleDeleteEvidence}
                isLoading={deleteEvidenceMutation.isPending}
              />
            </div>
          ) : (
            <div className="text-muted-foreground py-4 text-center text-xs">
              No evidence attached yet. Click "Add" button to attach files or links.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons - Sticky at bottom */}
      <div className="bg-card/30 sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-2 border-t px-6 py-4 pb-8 backdrop-blur-md">
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setFieldErrors({});
          }}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          isLoading={mutation.isPending}
          className="gap-2">
          <Save className="h-4 w-4" />
          Save Finding
        </Button>
      </div>
    </form>
  );
}
