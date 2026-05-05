"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { getTopLevelClauses, getChildClauses } from "@/lib/config/iso27001-clauses";
import type { FindingSeverity, TestResult, EvidenceInput } from "@/lib/types/audit-types";
import { useSaveFindingMutation } from "@/hooks/use-finding-mutations";
import { SelectField } from "../ui/select-field";

interface CreateFindingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditPlanId: string;
  preSelectedClause?: string;
  workpaperId?: string;
  evidenceRowId?: string;
  preFilledData?: {
    description?: string;
    testResult?: TestResult;
    evidence?: EvidenceInput[];
  };
  onSuccess?: () => void;
}

export function CreateOrUpdateFindingModal({
  open,
  onOpenChange,
  auditPlanId,
  preSelectedClause,
  workpaperId,
  evidenceRowId,
  preFilledData,
  onSuccess: onSuccessCallback
}: CreateFindingModalProps) {
  const saveFindingMutation = useSaveFindingMutation({
    onSuccess: () => {
      onOpenChange(false);
      resetForm();
      onSuccessCallback?.();
    }
  });

  // Auto-set severity based on test result
  const getDefaultSeverity = (): FindingSeverity => {
    if (preFilledData?.testResult === "non-conformity") return "high";
    if (preFilledData?.testResult === "partial-conformity") return "medium";
    return "medium";
  };

  const [severity, setSeverity] = useState<FindingSeverity>(getDefaultSeverity());
  const [clause, setClause] = useState(preSelectedClause || "");
  const [description, setDescription] = useState(preFilledData?.description || "");
  const [recommendation, setRecommendation] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  // New fields for report inclusion
  const [includeInReport, setIncludeInReport] = useState(true); // Default to true for new findings
  const [findingNumber, setFindingNumber] = useState("");
  const [workingsAndTestResults, setWorkingsAndTestResults] = useState("");
  const [conclusion, setConclusion] = useState("");

  const allClauses = [
    ...getTopLevelClauses(),
    ...getTopLevelClauses().flatMap((clause) => getChildClauses(clause.id))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!description || !recommendation || !clause) {
      return;
    }

    saveFindingMutation.mutate({
      auditPlanId,
      workingPaperId: workpaperId || "",
      finding: {
        clause,
        clauseTitle: clause,
        description,
        severity,
        recommendation,
        action_plan: correctiveAction || undefined,
        responsible_person: assignedTo || undefined,
        due_date: dueDate ? new Date(dueDate) : undefined,
        evidence_links: evidenceRowId ? [evidenceRowId] : [],
        workings_and_test_results: workingsAndTestResults || undefined,
        conclusion: conclusion || undefined,
        status: "OPEN",
        management_response: ""
      }
    });
  };

  const resetForm = () => {
    setSeverity("medium");
    setClause("");
    setDescription("");
    setRecommendation("");
    setCorrectiveAction("");
    setAssignedTo("");
    setDueDate("");
    setIncludeInReport(true);
    setFindingNumber("");
    setWorkingsAndTestResults("");
    setConclusion("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workpaperId ? "Create Finding from Workpaper" : "Create New Finding"}
          </DialogTitle>
          {workpaperId && (
            <p className="text-muted-foreground mt-2 text-sm">
              This finding will be linked to the workpaper for complete audit trail.
              {evidenceRowId && " It references a specific evidence row."}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex w-full flex-col gap-2 space-y-2 md:flex-row">
            {/* Severity */}

            <SelectField
              label="Severity"
              required
              classNames={{
                wrapper: "w-full max-w-max!"
              }}
              value={severity}
              onValueChange={(value) => setSeverity(value as FindingSeverity)}
              options={[
                { id: "critical", name: "Critical" },
                { id: "high", name: "High" },
                { id: "medium", name: "Medium" },
                { id: "low", name: "Low" }
              ]}
            />
            {/* Clause Selection */}
            <SelectField
              label="ISO 27001 Clause"
              placeholder="Select a clause"
              className="w-full"
              classNames={{
                wrapper: "w-full max-w-none!"
              }}
              required
              value={clause}
              onValueChange={(value) => setClause(value)}
              options={allClauses.map((clause) => ({
                id: clause.number,
                name: `${clause.number} - ${clause.title}`
              }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Textarea
              id="description"
              label="Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed description of the finding"
              rows={4}
              className="resize-none"
            />
            <Textarea
              id="recommendation"
              label="Recommendation"
              required
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Provide recommendations to address the finding"
              rows={3}
              className="resize-none"
            />
            <Textarea
              id="correctiveAction"
              label="Corrective Action Plan"
              required
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Outline the planned corrective actions"
              rows={3}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* Report Inclusion and Additional Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Report Details</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInReport"
                  checked={includeInReport}
                  onCheckedChange={(checked) => setIncludeInReport(checked as boolean)}
                />
                <Label
                  htmlFor="includeInReport"
                  className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Include in Final Report
                </Label>
              </div>
            </div>

            {includeInReport && (
              <div className="border-primary/20 space-y-4 border-l-2 pl-4">
                {/* Finding Number */}
                <div className="space-y-2">
                  <Label htmlFor="findingNumber">Finding Number</Label>
                  <Input
                    id="findingNumber"
                    value={findingNumber}
                    onChange={(e) => setFindingNumber(e.target.value)}
                    placeholder="e.g., F-001, 2025-001"
                  />
                  <p className="text-muted-foreground text-xs">Auto-generated if left blank</p>
                </div>

                {/* Workings and Test Results */}
                <Textarea
                  id="workingsAndTestResults"
                  label="Workings and Test Results"
                  value={workingsAndTestResults}
                  onChange={(e) => setWorkingsAndTestResults(e.target.value)}
                  placeholder="Document detailed test workings and results for the report..."
                  rows={4}
                  className="resize-none"
                />

                {/* Conclusion */}
                <Textarea
                  id="conclusion"
                  label="Conclusion"
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  placeholder="Summarize the conclusion for the final report..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Assigned To */}
          <Input
            id="assignedTo"
            label="Assigned To"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="e.g., John Doe"
          />

          {/* Due Date */}
          <Input
            id="dueDate"
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saveFindingMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveFindingMutation.isPending}
              isLoading={saveFindingMutation.isPending}>
              Create Finding
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
