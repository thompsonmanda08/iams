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
import { CheckCircle2, Save, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { notify } from "@/lib/utils";
import type { AuditPlan, WorkpaperFinding } from "@/lib/types/audit-types";
import { updateFinding } from "@/app/_actions/audit-module-actions";
import { QUERY_KEYS } from "@/lib/constants";
import { useTeamMembers } from "@/hooks/use-users-query-data";
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
  onEditComplete,
  isModal = false
}: FrameworkFindingFormProps) {
  const queryClient = useQueryClient();
  const { data: teamMemberResponse } = useTeamMembers({ page_size: 100 });
  const teamMembers = ((teamMemberResponse?.data?.data || []) as User[]) ?? [];

  const framework = (auditPlan?.framework_type || "ISO27001") as FrameworkType;
  const config = getFrameworkFieldConfig(framework);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isFormExpanded, setIsFormExpanded] = useState(isModal);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [responsiblePersonName, setResponsiblePersonName] = useState("");

  // Initialize form from finding
  useEffect(() => {
    if (finding) {
      const initialized = initializeFormDataFromFinding(finding);
      setFormData(initialized);
      // Set responsible person name
      const person = teamMembers.find((m) => m.id === finding.responsible_person);
      setResponsiblePersonName(person?.name || "");
    } else {
      // Initialize with empty form for new finding
      setFormData({
        severity: "MEDIUM",
        status: "OPEN",
        is_conformity: null
      });
    }
  }, [finding, teamMembers]);

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

      const payload = buildFindingPayload(finding, formData, framework);
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
        setIsFormExpanded(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (!finding) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <AlertCircle className="mx-auto mb-3 h-8 w-8" />
            <p>No finding to edit. Create a finding for this category first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show collapsed view when form is not expanded
  if (!isFormExpanded) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base">Finding Details</CardTitle>
              <CardDescription className="mt-1 text-xs">
                {finding.finding_number && `Finding #${finding.finding_number}`}
                {formData.is_conformity !== null && (
                  <span className="ml-2">
                    {formData.is_conformity ? "✓ Conformity" : "✗ Non-Conformity"}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormExpanded(true)}
              className="gap-2">
              <ChevronDown className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 space-y-3 sm:grid-cols-2">
          {formData.is_conformity !== null && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Conformity Status</p>
              <Badge variant={formData.is_conformity ? "default" : "destructive"}>
                {formData.is_conformity ? "Conformity" : "Non-Conformity"}
              </Badge>
            </div>
          )}

          {formData.severity && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Severity</p>
              <Badge>{formData.severity}</Badge>
            </div>
          )}

          {formData.conclusion && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Conclusion</p>
              <p className="line-clamp-2 text-sm">{formData.conclusion}</p>
            </div>
          )}

          {responsiblePersonName && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Responsible Person</p>
              <p className="text-sm">{responsiblePersonName}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Expanded form view
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="pt-6">
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
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFormExpanded(false)}
              className="gap-2">
              <ChevronUp className="h-4 w-4" />
              Collapse
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conformity Assessment - Top Priority */}
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="text-base">Conformity Assessment</CardTitle>
          <CardDescription>
            Indicate whether this {framework} requirement is met
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-6">
              {CONFORMITY_OPTIONS.map((option) => (
                <div key={String(option.value)} className="flex items-center gap-2">
                  <Checkbox
                    id={`conformity-${option.value}`}
                    checked={formData.is_conformity === option.value}
                    onCheckedChange={() =>
                      handleInputChange("is_conformity", option.value)
                    }
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
      </Card>

      {/* Framework-Specific Compliance Fields */}
      {config.complianceFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{framework} Compliance Details</CardTitle>
            <CardDescription>
              Framework-specific compliance information for this finding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.complianceFields.map((field) => (
                <div key={field.name}>
                  <Label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                  </Label>
                  {field.description && (
                    <p className="text-muted-foreground mb-2 text-xs">{field.description}</p>
                  )}

                  {field.type === "textarea" && (
                    <Textarea
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="text-sm"
                    />
                  )}

                  {field.type === "text" && (
                    <Input
                      type="text"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="text-sm"
                    />
                  )}

                  {field.type === "number" && (
                    <Input
                      type="number"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, parseInt(e.target.value))}
                      placeholder={field.placeholder}
                      min="0"
                      max="100"
                      className="text-sm"
                    />
                  )}

                  {fieldErrors[field.name] && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Management Response & Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workings & Test Results</CardTitle>
          <CardDescription>
            Document the audit procedures performed and findings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.workings_and_test_results || ""}
            onChange={(e) => handleInputChange("workings_and_test_results", e.target.value)}
            placeholder="Document your audit procedures and findings..."
            rows={5}
            className="text-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Conclusion</CardTitle>
          <CardDescription>Summarize the audit conclusion for this requirement</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.conclusion || ""}
            onChange={(e) => handleInputChange("conclusion", e.target.value)}
            placeholder="Provide your audit conclusion..."
            rows={4}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Finding Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Finding Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              id="severity"
              label="Severity Level"
              value={formData.severity}
              className="w-full"
              onValueChange={(v) => handleInputChange("severity", v)}
              options={SEVERITY_OPTIONS.map((option) => ({
                id: option.value,
                name: option.label,
                label: option.label
              }))}
              placeholder="Select severity level"
            />

            <SelectField
              id="status"
              label="Status"
              value={formData.status}
              className="w-full"
              onValueChange={(v) => handleInputChange("status", v)}
              options={STATUS_OPTIONS.map((option) => ({
                id: option.value,
                name: option.label,
                label: option.label
              }))}
              placeholder="Select status"
            />
          </div>
        </CardContent>
      </Card>

      {/* Management Response */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Management Response & Action Plan</CardTitle>
          <CardDescription>
            Document management's response and corrective action plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Recommendation</Label>
            <Textarea
              value={formData.recommendation || ""}
              onChange={(e) => handleInputChange("recommendation", e.target.value)}
              placeholder="Provide your recommendation..."
              rows={3}
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Management Response</Label>
            <Textarea
              value={formData.management_response || ""}
              onChange={(e) => handleInputChange("management_response", e.target.value)}
              placeholder="Document management's response..."
              rows={3}
              className="text-sm"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Action Plan</Label>
            <Textarea
              value={formData.action_plan || ""}
              onChange={(e) => handleInputChange("action_plan", e.target.value)}
              placeholder="Detail the corrective action plan and timeline..."
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SearchSelectField
              id="responsible_person"
              label="Responsible Person"
              value={formData.responsible_person}
              onSelect={(value) => {
                handleInputChange("responsible_person", value.id);
                setResponsiblePersonName(value.name);
              }}
              options={teamMembers.map((m) => ({
                id: m.id,
                name: m.name
              }))}
              placeholder="Select responsible person"
            />

            <DatePicker
              label="Due Date"
              value={formData.due_date}
              onChange={(date) => handleInputChange("due_date", date)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Evidence & Attachments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence & Supporting Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-sm font-medium">Evidence Links</Label>
            <Textarea
              value={formData.evidence_links || ""}
              onChange={(e) => handleInputChange("evidence_links", e.target.value)}
              placeholder="Provide links to supporting documentation (semicolon-separated)..."
              rows={3}
              className="text-sm"
            />
            <p className="text-muted-foreground mt-2 text-xs">
              Enter multiple links separated by semicolons (;)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="gap-2">
          <Save className="h-4 w-4" />
          {mutation.isPending ? "Saving..." : "Save Finding"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsFormExpanded(false);
            setFieldErrors({});
          }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
