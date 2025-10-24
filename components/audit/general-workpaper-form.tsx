"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Save, Loader2, AlertCircle, FileText, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { EvidenceGrid } from "./evidence-grid";
import { CreateFindingModal } from "./create-finding-modal";
import { useTeamMembers } from "@/hooks/use-audit-query-data";
import type { GeneralWorkpaperInput, EvidenceRow, TeamMember } from "@/lib/types/audit-types";
import { useToast } from "@/hooks/use-toast";
import { TICK_MARKS, DEFAULT_REVENUE_TICK_MARKS } from "@/lib/data/tick-marks";
import { SelectField } from "../ui/select-field";

interface GeneralWorkpaperFormProps {
  auditId: string;
  auditTitle?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<GeneralWorkpaperInput>;
}

export function GeneralWorkpaperForm({
  auditId,
  auditTitle,
  onSuccess,
  onCancel,
  initialData
}: GeneralWorkpaperFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: teamMembers, isLoading: loadingTeam } = useTeamMembers();

  const teamMemberOptions = useMemo(() => {
    return teamMembers && teamMembers.length > 0
      ? teamMembers?.map((m: TeamMember, i: number) => ({
          id: m.id || `${i}-${m.name}-${m.role}`,
          name: `${m.name} - ${m.role}`
        }))
      : [];
  }, [teamMembers]);

  // Get current user (mock - replace with actual auth)
  const currentUser = teamMembers?.[0]?.name || "Current User";

  const [isSaving, setIsSaving] = useState(false);
  const [showCreateFinding, setShowCreateFinding] = useState(false);
  const [createdWorkpaperId, setCreatedWorkpaperId] = useState<string | null>(null);
  const [selectedRowForFinding, setSelectedRowForFinding] = useState<EvidenceRow | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    processUnderReview: string;
    preparedBy: string;
    preparedDate: Date;
    reviewedBy: string;
    reviewedDate?: Date;
    workDone: string;
    mattersArising: string;
    conclusion: string;
    evidenceRows: EvidenceRow[];
    selectedTickMarks: string[];
  }>({
    processUnderReview: initialData?.processUnderReview || "",
    preparedBy: initialData?.preparedBy || currentUser,
    preparedDate: initialData?.preparedDate || new Date(),
    reviewedBy: initialData?.reviewedBy || "",
    reviewedDate: initialData?.reviewedDate,
    workDone: initialData?.workDone || "",
    mattersArising: initialData?.mattersArising || "",
    conclusion: initialData?.conclusion || "",
    evidenceRows: initialData?.evidenceRows || [],
    selectedTickMarks: initialData?.selectedTickMarks || DEFAULT_REVENUE_TICK_MARKS
  });

  // Update form field
  const updateField = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validation
  const validateForm = (): string | null => {
    if (!formData.processUnderReview) return "Process under review is required";
    if (!formData.preparedBy) return "Prepared by is required";
    if (!formData.workDone) return "Work done description is required";
    if (formData.evidenceRows.length === 0) return "At least one evidence row is required";
    return null;
  };

  // Handle save draft manually
  const handleSaveDraft = () => {
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

    setIsSaving(true);

    const workpaperData: GeneralWorkpaperInput = {
      auditId,
      processUnderReview: formData.processUnderReview,
      preparedBy: formData.preparedBy,
      preparedDate: formData.preparedDate,
      reviewedBy: formData.reviewedBy || undefined,
      reviewedDate: formData.reviewedDate,
      workDone: formData.workDone,
      mattersArising: formData.mattersArising || undefined,
      conclusion: formData.conclusion || undefined,
      evidenceRows: formData.evidenceRows,
      selectedTickMarks: formData.selectedTickMarks
    };

    try {
      // TODO: Replace with actual API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock workpaper ID
      const mockWorkpaperId = `GWP-${Date.now()}`;
      setCreatedWorkpaperId(mockWorkpaperId);

      toast({
        title: "Success",
        description: "General workpaper created successfully"
      });

      // Check if there are any rows with observations that might need findings
      const rowsWithObservations = formData.evidenceRows.filter(
        (row) => row.auditObservation && row.auditObservation.trim().length > 0
      );

      if (rowsWithObservations.length > 0 && formData.mattersArising) {
        // Prompt to create finding if there are matters arising
        setShowCreateFinding(true);
        // Don't close yet
      } else {
        router.refresh();
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create general workpaper",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle create finding from specific row
  const handleCreateFindingFromRow = (row: EvidenceRow) => {
    if (!createdWorkpaperId) {
      toast({
        title: "Error",
        description: "Please save the workpaper first",
        variant: "destructive"
      });
      return;
    }
    setSelectedRowForFinding(row);
    setShowCreateFinding(true);
  };

  // Handle finding creation complete
  const handleFindingCreated = () => {
    setShowCreateFinding(false);
    setSelectedRowForFinding(null);
    router.refresh();
    onSuccess?.();
  };

  // Handle skip finding creation
  const handleSkipFinding = () => {
    setShowCreateFinding(false);
    setSelectedRowForFinding(null);
    router.refresh();
    onSuccess?.();
  };

  // Handle cancel
  const handleCancel = () => {
    const confirmLeave = window.confirm(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    );
    if (confirmLeave) {
      onCancel?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">General Work Paper (B.1.1.2)</h2>
          {auditTitle && (
            <p className="text-muted-foreground mt-1 text-sm">For Audit: {auditTitle}</p>
          )}
        </div>
      </div>

      {/* Company Header */}
      <Card className="bg-slate-50 p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold">INFRATEL INTERNAL AUDIT</h3>
          <p className="text-muted-foreground mt-1 text-sm">General Work Paper</p>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          {/* Process Under Review */}
          <div className="space-y-2">
            <Label htmlFor="process">
              Process Under Review <span className="text-destructive">*</span>
            </Label>
            <Input
              id="process"
              placeholder="e.g., Revenue Recognition Process"
              value={formData.processUnderReview}
              onChange={(e) => updateField("processUnderReview", e.target.value)}
            />
          </div>

          <Separator />

          {/* Assignment Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Prepared By */}
            <div className="space-y-2">
              {/* Prepared By */}
              <SelectField
                // id="preparedBy"
                label="Prepared By"
                placeholder="Select a user"
                required
                className="w-full"
                classNames={{
                  wrapper: "w-full "
                }}
                value={formData.preparedBy}
                onValueChange={(v) => updateField("preparedBy", v)}
                options={teamMemberOptions}
              />
            </div>

            {/* Preparation Date */}
            <div className="space-y-2">
              <Label htmlFor="preparedDate">
                Preparation Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="preparedDate"
                type="date"
                value={formData.preparedDate.toISOString().split("T")[0]}
                onChange={(e) => updateField("preparedDate", new Date(e.target.value))}
              />
            </div>

            {/* Reviewed By */}
            <div className="space-y-2">
              <SelectField
                label="Reviewed By (Optional)"
                placeholder="Select a user"
                className="w-full"
                classNames={{
                  wrapper: "w-full "
                }}
                value={formData.reviewedBy}
                onValueChange={(v) => updateField("reviewedBy", v)}
                options={teamMemberOptions}
              />
            </div>

            {/* Review Date */}
            <div className="space-y-2">
              <Label htmlFor="reviewedDate">Review Date (Optional)</Label>
              <Input
                id="reviewedDate"
                type="date"
                value={
                  formData.reviewedDate ? formData.reviewedDate.toISOString().split("T")[0] : ""
                }
                onChange={(e) =>
                  updateField("reviewedDate", e.target.value ? new Date(e.target.value) : undefined)
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Work Documentation */}
      <Card className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Work Documentation</h3>

          {/* Work Done */}
          <div className="space-y-2">
            <Label htmlFor="workDone">
              Work Done <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="workDone"
              placeholder="Describe the audit work performed, procedures executed, and evidence examined..."
              rows={4}
              className="resize-none font-mono text-sm"
              value={formData.workDone}
              onChange={(e) => updateField("workDone", e.target.value)}
            />
            <p className="text-muted-foreground text-xs">{formData.workDone.length} characters</p>
          </div>

          {/* Matters Arising */}
          <div className="space-y-2">
            <Label htmlFor="mattersArising">Matters Arising (Optional)</Label>
            <Textarea
              id="mattersArising"
              placeholder="Document any issues, concerns, or follow-up items identified during the audit work..."
              rows={4}
              className="resize-none font-mono text-sm"
              value={formData.mattersArising}
              onChange={(e) => updateField("mattersArising", e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              {formData.mattersArising.length} characters
            </p>

            {/* Matters Arising Notice */}
            {formData.mattersArising && formData.mattersArising.trim().length > 0 && (
              <Card className="mt-2 border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    After creating this workpaper, you can create findings to track these matters.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Conclusion */}
          <div className="space-y-2">
            <Textarea
              id="conclusion"
              label="Conclusion (Optional)"
              placeholder="Summarize the overall findings, audit opinion, and key takeaways..."
              rows={4}
              className="resize-none font-mono text-sm"
              value={formData.conclusion}
              onChange={(e) => updateField("conclusion", e.target.value)}
            />
            <p className="text-muted-foreground text-xs">{formData.conclusion.length} characters</p>
          </div>
        </div>
      </Card>

      {/* Evidence & Testing Grid */}
      <Card className="p-6">
        <EvidenceGrid
          rows={formData.evidenceRows}
          onRowsChange={(rows) => updateField("evidenceRows", rows)}
          selectedTickMarks={formData.selectedTickMarks}
          onTickMarksChange={(marks) => updateField("selectedTickMarks", marks)}
          availableTickMarks={TICK_MARKS}
        />
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
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || !!validateForm()}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create General Workpaper"
            )}
          </Button>
        </div>
      </div>

      {/* Create Finding Modal */}
      {showCreateFinding && createdWorkpaperId && (
        <CreateFindingModal
          open={showCreateFinding}
          onOpenChange={(open) => {
            if (!open) handleSkipFinding();
          }}
          auditPlanId={auditId}
          workpaperId={createdWorkpaperId}
          evidenceRowId={selectedRowForFinding?.id}
          preFilledData={{
            description: selectedRowForFinding
              ? `Issue found in evidence row: ${selectedRowForFinding.description}\nObservation: ${selectedRowForFinding.auditObservation || ""}\nComment: ${selectedRowForFinding.auditComment || ""}`
              : formData.mattersArising || ""
          }}
          onSuccess={handleFindingCreated}
        />
      )}
    </div>
  );
}
