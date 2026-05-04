"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { SelectField } from "@/components/ui/select-field";
import { CheckCircle2, Save, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { notify } from "@/lib/utils";
import type { AuditPlan } from "@/lib/types/audit-types";
import { updateFinding } from "@/app/_actions/audit-module-actions";
import { QUERY_KEYS } from "@/lib/constants";
import { useUsers } from "@/hooks/use-users-query-data";
import { User } from "@/lib/types/account";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface FindingFormProps {
  category: any;
  auditPlan: AuditPlan;
  existingFindings: any[];
  onEditComplete?: () => void;
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

export function FindingForm({
  category,
  auditPlan,
  existingFindings,
  onEditComplete
}: FindingFormProps) {
  const queryClient = useQueryClient();
  const { checkPermission, hasPermission } = usePermissions();
  const { data: teamMemberResponse, isLoading: loadingTeamMembers } = useUsers({
    page_size: 100
  });
  const teamMembers = ((teamMemberResponse?.data?.data || []) as User[]) ?? [];

  const [formData, setFormData] = useState({
    workings_and_test_results: "",
    conclusion: "",
    severity: "MEDIUM",
    recommendation: "",
    management_response: "",
    action_plan: "",
    responsible_person: "",
    due_date: null as Date | null,
    // evidence_links: [] as string[],
    evidence_links: "",
    status: "OPEN"
  });

  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [responsiblePersonName, setResponsiblePersonName] = useState("");

  const hasExistingFinding = existingFindings.length > 0;
  const lastFinding = existingFindings[existingFindings.length - 1];

  // Setup mutation for updating finding
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!lastFinding?.id) {
        throw new Error("Finding ID is required for updates");
      }
      // Remove only undefined and null values, keep empty strings
      const cleanedData = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined && value !== null)
      );
      console.log("Finding ID:", lastFinding.id);
      console.log("Cleaned data being sent:", cleanedData);
      const result = await updateFinding(lastFinding.id, cleanedData);
      console.log("Update response:", result);
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
        // Collapse the form and clear editing state
        setIsFormExpanded(false);
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

  // Reset form expansion when category changes
  useEffect(() => {
    setIsFormExpanded(false);
  }, [category?.id]);

  useEffect(() => {
    if (lastFinding) {
      // Handle both old camelCase and new snake_case field names from API
      const evidenceLinks = lastFinding.evidence_links
        ? lastFinding.evidence_links.split(";").filter((link: string) => link.trim())
        : lastFinding.attachments?.map((a: any) => a.url) || [];

      const dueDate = lastFinding.due_date
        ? new Date(lastFinding.due_date)
        : lastFinding.dueDate
          ? new Date(lastFinding.dueDate)
          : null;

      setFormData({
        workings_and_test_results:
          lastFinding.workings_and_test_results || lastFinding.workingsAndTestResults || "",
        conclusion: lastFinding.conclusion || "",
        severity: lastFinding.severity || "MEDIUM",
        recommendation: lastFinding.recommendation || "",
        management_response:
          lastFinding.management_response || lastFinding.managementResponse || "",
        action_plan: lastFinding.action_plan || lastFinding.correctiveAction || "",
        responsible_person: lastFinding.responsible_person || lastFinding.assignedTo || "",
        due_date: dueDate,
        evidence_links: evidenceLinks,
        status: lastFinding.status || "OPEN"
      });
      // Capture the responsible person name for display
      setResponsiblePersonName(lastFinding.responsible_person_name || "");
    }
  }, [lastFinding]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // const handleAddEvidenceLink = () => {
  //   if (newEvidenceLink.trim()) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       evidence_links: [...prev.evidence_links, newEvidenceLink]
  //     }));
  //     setNewEvidenceLink("");
  //   }
  // };

  // const handleRemoveEvidenceLink = (index: number) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     evidence_links: prev.evidence_links.filter((_, i) => i !== index)
  //   }));
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPermission(MODULE_CODES.AUDIT_WPS, "can_edit")) return;

    if (!lastFinding?.id) {
      notify({
        title: "Error",
        description: "No finding to update. Please create a finding first.",
        type: "error"
      });
      return;
    }

    // Format evidence links as semicolon-separated string
    // const evidenceLinks =
    //   formData.evidence_links?.length > 0
    //     ? formData.evidence_links.join(";")
    //     : lastFinding.evidence_links || "";

    // Build complete payload with all required fields from API spec
    const payload: any = {
      finding_number: lastFinding.finding_number || `F-${Date.now()}`,
      category_name: lastFinding.category_name || lastFinding.clauseTitle || "",
      workings_and_test_results: formData.workings_and_test_results || "",
      conclusion: formData.conclusion || "",
      report: true,
      severity: formData.severity,
      recommendation: formData.recommendation || "",
      management_response: formData.management_response || "",
      action_plan: formData.action_plan || "",
      responsible_person: formData.responsible_person || "",
      due_date: formData.due_date ? formData.due_date.toISOString().split("T")[0] : "",
      evidence_links: formData?.evidence_links,
      status: formData.status
    };

    // Log payload for debugging
    console.log("Finding update payload:", payload);

    mutation.mutate(payload);
  };

  // Show collapsed view when there's a finding and form is not expanded
  if (hasExistingFinding && !isFormExpanded) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base">Finding Details</CardTitle>
              <CardDescription className="mt-1 text-xs">
                {lastFinding.finding_number && `Finding #${lastFinding.finding_number}`}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormExpanded(true)}
              className="gap-2">
              <ChevronDown className="h-4 w-4" />
              Edit Finding
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 space-y-4 sm:grid-cols-2">
          {formData.conclusion && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Conclusion</p>
              <p className="line-clamp-2 text-sm">{formData.conclusion}</p>
            </div>
          )}

          {formData.workings_and_test_results && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Workings & Test Results</p>
              <p className="line-clamp-2 text-sm">{formData.workings_and_test_results}</p>
            </div>
          )}

          {formData.recommendation && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Recommendation</p>
              <p className="line-clamp-2 text-sm">{formData.recommendation}</p>
            </div>
          )}

          {formData.severity && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Severity</p>
              <Badge className="mt-1">{formData.severity}</Badge>
            </div>
          )}

          {formData.status && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Status</p>
              <Badge variant="outline" className="mt-1">
                {formData.status}
              </Badge>
            </div>
          )}

          {responsiblePersonName && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Responsible Person</p>
              <p className="text-sm">{responsiblePersonName}</p>
            </div>
          )}

          {formData.due_date && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Due Date</p>
              <Badge variant="outline">{formData.due_date.toLocaleDateString()}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Summary Cards */}
      {hasExistingFinding && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-1 items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Editing Existing Finding
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {lastFinding.finding_number && `Finding #${lastFinding.finding_number} • `}
                    {lastFinding.created_at || lastFinding.createdAt
                      ? `Last modified ${new Date(lastFinding.created_at || lastFinding.createdAt).toLocaleDateString()}`
                      : "Created previously"}
                  </p>
                  {lastFinding.updated_at && (
                    <p className="text-muted-foreground text-xs">
                      Updated: {new Date(lastFinding.updated_at).toLocaleDateString()}
                    </p>
                  )}
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
      )}

      {/* Workings and Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workings and Test Results</CardTitle>
          <CardDescription>
            Document the audit test procedures performed and results obtained
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.workings_and_test_results}
            onChange={(e) => handleInputChange("workings_and_test_results", e.target.value)}
            placeholder="Document your audit procedures and findings..."
            rows={5}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Conclusion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Conclusion</CardTitle>
          <CardDescription>Summarize the audit conclusion for this category</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.conclusion}
            onChange={(e) => handleInputChange("conclusion", e.target.value)}
            placeholder="Provide your audit conclusion..."
            rows={4}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Finding Details */}
      <Card>
        <CardHeader className="flex justify-between gap-4">
          <div>
            <CardTitle className="text-base">Finding Details</CardTitle>
          </div>
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
              className="w-full"
              value={formData.status}
              onValueChange={(v) => handleInputChange("status", v)}
              options={STATUS_OPTIONS.map((option) => ({
                id: option.value,
                name: option.label,
                label: option.label
              }))}
              placeholder="Select status"
            />
          </div>
          <div>
            <Label htmlFor="recommendation" className="text-sm font-medium">
              Recommendation
            </Label>
            <Textarea
              id="recommendation"
              value={formData.recommendation}
              onChange={(e) => handleInputChange("recommendation", e.target.value)}
              placeholder="Provide your audit recommendation..."
              rows={3}
              className="mt-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Management Response and Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Management Response & Action Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="management_response" className="text-sm font-medium">
              Management Response
            </Label>
            <Textarea
              id="management_response"
              value={formData.management_response}
              onChange={(e) => handleInputChange("management_response", e.target.value)}
              placeholder="Enter management's response to this finding..."
              rows={3}
              className="mt-2 text-sm"
            />
          </div>

          <div>
            <Label htmlFor="action_plan" className="text-sm font-medium">
              Corrective Action Plan
            </Label>
            <Textarea
              id="action_plan"
              value={formData.action_plan}
              onChange={(e) => handleInputChange("action_plan", e.target.value)}
              placeholder="Outline the corrective actions to address this finding..."
              rows={3}
              className="mt-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <SearchSelectField
              id="responsible_person"
              label="Responsible Person"
              placeholder="Select a team member"
              value={formData.responsible_person}
              onValueChange={(value) => handleInputChange("responsible_person", value)}
              options={teamMembers.map((member) => ({
                id: member.id,
                name: `${member.first_name ?? ""} ${member.last_name ?? ""} - (${member.role?.name ?? "N/A"})`
              }))}
              isLoading={loadingTeamMembers}
            />
            <DatePicker
              label="Due Date"
              value={(formData.due_date || undefined) as any}
              onValueChange={(date) => handleInputChange("due_date", date)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Evidence Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence</CardTitle>
          <CardDescription>Attach relevant evidence documents or links</CardDescription>
        </CardHeader>
        <CardContent className="">
          {/* <div className="flex gap-2">
            <Input
              value={newEvidenceLink}
              onChange={(e) => setNewEvidenceLink(e.target.value)}
              placeholder="Paste URL or file name..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddEvidenceLink}
              className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {formData.evidence_links.length > 0 && (
            <div className="space-y-2">
              {formData.evidence_links.map((link, index) => (
                <div
                  key={index}
                  className="bg-muted flex items-center justify-between rounded-lg p-2">
                  <p className="truncate text-sm">{link}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEvidenceLink(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )} */}

          <Textarea
            rows={3}
            value={formData.evidence_links}
            onChange={(e) => handleInputChange("evidence_links", e.target.value)}
            placeholder="Provide evidence links or file names or records..."
            className="flex-1"
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="bg-background sticky bottom-0 flex justify-end gap-2 border-t py-4">
        <Button variant="outline" type="button" onClick={() => setIsFormExpanded(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending || !hasExistingFinding}
          isLoading={mutation.isPending}
          loadingText="Saving..."
          className="gap-2">
          <Save className="h-4 w-4" />
          Save Finding
        </Button>
      </div>
    </form>
  );
}
