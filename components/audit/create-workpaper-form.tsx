"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  CheckCircle2,
  MinusCircle,
  XCircle,
  Save,
  Loader2,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { TemplateSelector } from "./template-selector";
import { EvidenceUpload } from "./evidence-upload";
import { CreateFindingModal } from "./create-finding-modal";
import { useCreateWorkpaper } from "@/hooks/use-audit-query-data";
import { useTeamMembers } from "@/hooks/use-audit-query-data";
import useWorkpaperDraftStore from "@/store/useWorkpaperDraftStore";
import type {
  ClauseTemplate,
  TestResult,
  EvidenceInput,
  WorkpaperInput,
  TeamMember
} from "@/lib/types/audit-types";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { SelectField } from "../ui/select-field";

interface CreateWorkpaperFormProps {
  auditId?: string; // Now optional - can be attached to audit plan later
  auditTitle?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<WorkpaperInput>;
}

export function CreateWorkpaperForm({
  auditId,
  auditTitle,
  onSuccess,
  onCancel,
  initialData
}: CreateWorkpaperFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateWorkpaper();
  const { data: teamMembers, isLoading: loadingTeam } = useTeamMembers();

  // Draft store
  const { getDraft, saveDraft, deleteDraft } = useWorkpaperDraftStore();

  // Get current user (mock - replace with actual auth)
  const currentUser = teamMembers?.[0]?.name || "Current User";

  // Selected template
  const [selectedTemplate, setSelectedTemplate] = useState<ClauseTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    clause: string;
    clauseTitle: string;
    objectives: string;
    testProcedures: string;
    testResults: string;
    testResult?: TestResult;
    conclusion: string;
    evidence: EvidenceInput[];
    preparedBy: string;
    reviewedBy: string;
  }>({
    clause: initialData?.clause || "",
    clauseTitle: initialData?.clauseTitle || "",
    objectives: initialData?.objectives || "",
    testProcedures: initialData?.testProcedures || "",
    testResults: initialData?.testResults || "",
    testResult: initialData?.testResult,
    conclusion: initialData?.conclusion || "",
    evidence: initialData?.evidence || [],
    preparedBy: initialData?.preparedBy || currentUser,
    reviewedBy: initialData?.reviewedBy || ""
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCreateFinding, setShowCreateFinding] = useState(false);
  const [createdWorkpaperId, setCreatedWorkpaperId] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    if (!auditId) return; // Skip draft loading if no auditId
    const draft = getDraft(auditId);
    if (draft && !initialData) {
      setFormData({
        clause: draft.clause || "",
        clauseTitle: draft.clauseTitle || "",
        objectives: draft.objectives || "",
        testProcedures: draft.testProcedures || "",
        testResults: draft.testResults || "",
        testResult: draft.testResult,
        conclusion: draft.conclusion || "",
        evidence: draft.evidence || [],
        preparedBy: draft.preparedBy || currentUser,
        reviewedBy: draft.reviewedBy || ""
      });
      setLastSaved(draft.lastSaved || null);
      toast({
        title: "Draft Restored",
        description: "Your previous work has been restored."
      });
    }
  }, [auditId, getDraft, initialData, currentUser, toast]);

  // Auto-save draft with debounce
  const debouncedFormData = useDebounce(formData, 30000); // 30 seconds

  useEffect(() => {
    if (hasUnsavedChanges && debouncedFormData && auditId) {
      saveDraft(auditId, debouncedFormData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  }, [debouncedFormData, hasUnsavedChanges, auditId, saveDraft]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: ClauseTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        clause: template.clause,
        clauseTitle: template.clauseTitle,
        objectives: template.objective,
        testProcedures: template.testProcedure
      }));
      setHasUnsavedChanges(true);
    }
  }, []);

  // Update form field
  const updateField = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Validation
  const validateForm = (): string | null => {
    if (!formData.clause) return "Clause code is required";
    if (!formData.clauseTitle) return "Clause title is required";
    if (!formData.objectives) return "Objective is required";
    if (!formData.testProcedures) return "Test procedure is required";
    if (!formData.preparedBy) return "Prepared by is required";
    return null;
  };

  // Handle save draft manually
  const handleSaveDraft = () => {
    if (!auditId) {
      toast({
        title: "Cannot Save Draft",
        description: "Drafts can only be saved when attached to an audit plan.",
        variant: "destructive"
      });
      return;
    }
    saveDraft(auditId, formData);
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    toast({
      title: "Draft Saved",
      description: "Your work has been saved as a draft."
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive"
      });
      return;
    }

    const workpaperData: WorkpaperInput = {
      auditId, // Optional - can be attached later
      clause: formData.clause,
      clauseTitle: formData.clauseTitle,
      objectives: formData.objectives,
      testProcedures: formData.testProcedures,
      testResults: formData.testResults || undefined,
      testResult: formData.testResult || undefined,
      conclusion: formData.conclusion || undefined,
      evidence: formData.evidence.length > 0 ? formData.evidence : undefined,
      preparedBy: formData.preparedBy,
      preparedDate: new Date(),
      reviewedBy: formData.reviewedBy || undefined
    };

    try {
      const result = await createMutation.mutateAsync(workpaperData);
      // Clear draft on success (only if auditId exists)
      if (auditId) {
        deleteDraft(auditId);
      }

      // If non-conformity, prompt to create finding
      if (
        formData.testResult === "non-conformity" ||
        formData.testResult === "partial-conformity"
      ) {
        setCreatedWorkpaperId(result.id);
        setShowCreateFinding(true);
        // Don't close the modal yet - wait for finding creation
      } else {
        router.refresh();
        onSuccess?.();
      }
    } catch (error) {
      // Error is handled by mutation hook
    }
  };

  // Handle finding creation complete
  const handleFindingCreated = () => {
    setShowCreateFinding(false);
    router.refresh();
    onSuccess?.();
  };

  // Handle skip finding creation
  const handleSkipFinding = () => {
    setShowCreateFinding(false);
    router.refresh();
    onSuccess?.();
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Do you want to save as draft before leaving?"
      );
      if (confirmLeave) {
        handleSaveDraft();
      }
    }
    onCancel?.();
  };

  // Get test result display
  const getTestResultIcon = (result: TestResult) => {
    switch (result) {
      case "conformity":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "partial-conformity":
        return <MinusCircle className="h-4 w-4 text-yellow-600" />;
      case "non-conformity":
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getTestResultLabel = (result: TestResult) => {
    switch (result) {
      case "conformity":
        return "Conformity";
      case "partial-conformity":
        return "Partial Conformity";
      case "non-conformity":
        return "Non-Conformity";
    }
  };

  const teamMemberOptions = useMemo(() => {
    return teamMembers && teamMembers.length > 0
      ? teamMembers?.map((m: TeamMember, i: number) => ({
          id: m.id || `${i}-${m.name}-${m.role}`,
          name: `${m.name} - ${m.role}`
        }))
      : [];
  }, [teamMembers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create Workpaper</h2>
          {auditTitle && (
            <p className="text-muted-foreground mt-1 text-sm">For Audit: {auditTitle}</p>
          )}
        </div>
        {lastSaved && (
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Save className="h-3 w-3" />
            Draft saved at {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Template Selector */}
      <TemplateSelector
        onTemplateSelect={handleTemplateSelect}
        selectedTemplate={selectedTemplate}
      />

      {/* Workpaper Details */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Workpaper Details</h3>

            {/* Clause Display */}
            {formData.clause && formData.clauseTitle && (
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {formData.clause}
                </Badge>
                <span className="text-sm font-medium">{formData.clauseTitle}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Objective */}
          <div className="space-y-2">
            <Label htmlFor="objectives">
              Objective <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="objectives"
              placeholder="What is the objective of auditing this clause?"
              rows={5}
              className="resize-none"
              value={formData.objectives}
              onChange={(e) => updateField("objectives", e.target.value)}
            />
            <p className="text-muted-foreground text-xs">{formData.objectives.length} characters</p>
          </div>

          {/* Test Procedure */}
          <div className="space-y-2">
            <Label htmlFor="testProcedures">
              Test Procedure <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="testProcedures"
              placeholder="Describe the testing procedure..."
              rows={7}
              className="resize-none"
              value={formData.testProcedures}
              onChange={(e) => updateField("testProcedures", e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              {formData.testProcedures.length} characters
            </p>
          </div>
        </div>
      </Card>

      {/* Evidence Upload */}
      <Card className="p-6">
        <EvidenceUpload
          evidence={formData.evidence}
          onEvidenceChange={(evidence) => updateField("evidence", evidence)}
        />
      </Card>

      {/* Test Results & Conclusion */}
      <Card className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Test Results</h3>

          {/* Test Results Textarea */}
          <div className="space-y-2">
            <Textarea
              id="testResults"
              label="Test Results (Optional)"
              placeholder="Document the results of testing (can be filled during audit execution)..."
              rows={5}
              className="resize-none"
              value={formData.testResults}
              onChange={(e) => updateField("testResults", e.target.value)}
            />
          </div>

          {/* Test Result Selection */}
          <div className="space-y-3">
            <Label>Test Result (Optional)</Label>
            <RadioGroup
              value={formData.testResult}
              onValueChange={(value) => updateField("testResult", value as TestResult)}>
              <div className="grid grid-cols-3 gap-3">
                {(["conformity", "partial-conformity", "non-conformity"] as TestResult[]).map(
                  (result) => (
                    <div key={result} className="flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value={result} id={result} />
                      <Label
                        htmlFor={result}
                        className="flex flex-1 cursor-pointer items-center gap-2 font-normal">
                        {getTestResultIcon(result)}
                        {getTestResultLabel(result)}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </RadioGroup>
          </div>

          {/* Conclusion */}
          <div className="space-y-2">
            <Textarea
              id="conclusion"
              label="Conclusion (Optional)"
              placeholder="Summarize findings and conclusion..."
              rows={5}
              className="resize-none"
              value={formData.conclusion}
              onChange={(e) => updateField("conclusion", e.target.value)}
            />
          </div>

          {/* Non-Conformity Notice */}
          {(formData.testResult === "non-conformity" ||
            formData.testResult === "partial-conformity") && (
            <Card className="border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    {formData.testResult === "non-conformity"
                      ? "Non-Conformity Detected"
                      : "Partial Conformity Detected"}
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    After creating this workpaper, you'll be prompted to create a finding to track
                    this issue.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* Assignment */}
      <Card className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Assignment</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex w-full flex-col gap-2 space-y-2 md:flex-row">
              {/* Prepared By */}
              <SelectField
                id="preparedBy"
                label="Prepared By"
                placeholder="Select user..."
                required
                classNames={{
                  wrapper: "w-full max-w-max!"
                }}
                value={formData.preparedBy}
                onValueChange={(v) => updateField("preparedBy", v)}
                options={teamMemberOptions}
              />
              {/* Reviewed By */}
              <SelectField
                label="Reviewed By (Optional)"
                placeholder="Select a clause"
                className="w-full"
                classNames={{
                  wrapper: "w-full max-w-none!"
                }}
                value={formData.reviewedBy}
                onValueChange={(v) => updateField("reviewedBy", v)}
                options={teamMemberOptions}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Validation Message */}
      {(() => {
        const error = validateForm();
        return error ? (
          <Card className="bg-destructive/10 border-destructive p-4">
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </Card>
        ) : null;
      })()}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={handleSaveDraft} disabled={!hasUnsavedChanges}>
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleCancel} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending || !!validateForm()}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Workpaper"
            )}
          </Button>
        </div>
      </div>

      {/* Create Finding Modal */}
      {showCreateFinding && createdWorkpaperId && auditId && (
        <CreateFindingModal
          open={showCreateFinding}
          onOpenChange={(open) => {
            if (!open) handleSkipFinding();
          }}
          auditPlanId={auditId}
          preSelectedClause={formData.clause}
          workpaperId={createdWorkpaperId}
          preFilledData={{
            description: formData.conclusion || formData.testResults || "",
            testResult: formData.testResult,
            evidence: formData.evidence
          }}
          onSuccess={handleFindingCreated}
        />
      )}
    </div>
  );
}
