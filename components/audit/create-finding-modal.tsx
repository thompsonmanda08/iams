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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getTopLevelClauses, getChildClauses } from "@/lib/data/iso27001-clauses";
import type { FindingSeverity, TestResult, EvidenceInput } from "@/lib/types/audit-types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { createFinding } from "@/app/_actions/audit-module-actions";
import { useRouter } from "next/navigation";
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

export function CreateFindingModal({
  open,
  onOpenChange,
  auditPlanId,
  preSelectedClause,
  workpaperId,
  evidenceRowId,
  preFilledData,
  onSuccess: onSuccessCallback
}: CreateFindingModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const allClauses = [
    ...getTopLevelClauses(),
    ...getTopLevelClauses().flatMap((clause) => getChildClauses(clause.id))
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !recommendation || !clause) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createFinding({
        auditId: auditPlanId,
        clause,
        description,
        severity,
        recommendation,
        correctiveAction: correctiveAction || undefined,
        assignedTo: assignedTo || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        workpaperId: workpaperId || undefined,
        evidenceRowId: evidenceRowId || undefined,
        sourceType: workpaperId ? "workpaper" : "manual"
      });

      if (result.success) {
        toast({
          title: "Finding created",
          description: workpaperId
            ? "Finding created and linked to workpaper successfully"
            : "The finding has been created successfully"
        });

        onOpenChange(false);
        resetForm();
        router.refresh();
        onSuccessCallback?.();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create finding",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSeverity("medium");
    setClause("");
    setDescription("");
    setRecommendation("");
    setCorrectiveAction("");
    setAssignedTo("");
    setDueDate("");
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
              value={severity}
              onValueChange={(value) => setClause(value as FindingSeverity)}
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

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g., John Doe"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Finding
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
