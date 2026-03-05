"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useUpdateGeneralFindingReassessment } from "@/hooks/use-finding-actions-queries";
import { usePermissions } from "@/hooks/use-permissions";
import { EvidenceUploadCell } from "@/components/audit/evidence-upload-cell";

interface UpdateGeneralFindingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  findingId: string;
  generalFindingData: any;
}

export function UpdateGeneralFindingDialog({
  open,
  onOpenChange,
  findingId,
  generalFindingData
}: UpdateGeneralFindingDialogProps) {
  const [columns, setColumns] = useState<{ key: string; value: any }[]>([]);
  const [keys, setKeys] = useState<{ key: string; value: any }[]>([]);
  const [auditObservation, setAuditObservation] = useState("");
  const [auditComments, setAuditComments] = useState("");
  const [evidence, setEvidence] = useState("");

  const updateMutation = useUpdateGeneralFindingReassessment();
  const { checkPermission } = usePermissions();

  // Pre-populate form when dialog opens or data changes
  useEffect(() => {
    if (generalFindingData && open) {
      setColumns(
        (generalFindingData.columns ?? []).map((col: any) => ({
          key: col.key,
          value: col.value ?? ""
        }))
      );
      setKeys(
        (generalFindingData.keys ?? []).map((k: any) => ({
          key: k.key,
          value: k.value ?? ""
        }))
      );
      setAuditObservation(generalFindingData.audit_observation ?? "");
      setAuditComments(generalFindingData.audit_comments ?? "");
      setEvidence(generalFindingData.evidence ?? "");
    }
  }, [generalFindingData, open]);

  const handleColumnChange = (index: number, value: string) => {
    setColumns((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const handleKeyChange = (index: number, value: any) => {
    setKeys((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const isBooleanKey = (value: any): boolean => {
    return typeof value === "boolean" || value === "true" || value === "false";
  };

  const handleSubmit = () => {
    if (!checkPermission("AUDIT_PLANS", "can_create")) return;

    updateMutation.mutate(
      {
        findingId,
        data: {
          columns,
          keys,
          audit_observation: auditObservation,
          audit_comments: auditComments,
          evidence: evidence || undefined
        }
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Finding</DialogTitle>
          <DialogDescription>
            Update the general workpaper finding details based on submitted evidence
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Dynamic Columns */}
          {columns.length > 0 && (
            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                Finding Details
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {columns.map((col, index) => (
                  <div key={col.key} className="space-y-1">
                    <Label htmlFor={`col-${col.key}`} className="text-xs capitalize">
                      {col.key.replace(/_/g, " ")}
                    </Label>
                    <Input
                      id={`col-${col.key}`}
                      value={col.value}
                      onChange={(e) => handleColumnChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Keys (Audit Tests) */}
          {keys.length > 0 && (
            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                Audit Tests
              </Label>
              <div className="rounded-md border bg-amber-50/50 p-3 dark:bg-amber-950/20">
                <div className="grid grid-cols-2 gap-3">
                  {keys.map((k, index) =>
                    isBooleanKey(k.value) ? (
                      <div key={k.key} className="flex items-center gap-2">
                        <Checkbox
                          id={`key-${k.key}`}
                          checked={k.value === true || k.value === "true"}
                          onCheckedChange={(checked) =>
                            handleKeyChange(index, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`key-${k.key}`}
                          className="cursor-pointer text-sm font-normal capitalize">
                          {k.key.replace(/_/g, " ")}
                        </Label>
                      </div>
                    ) : (
                      <div key={k.key} className="space-y-1">
                        <Label htmlFor={`key-${k.key}`} className="text-xs capitalize">
                          {k.key.replace(/_/g, " ")}
                        </Label>
                        <Input
                          id={`key-${k.key}`}
                          value={k.value ?? ""}
                          onChange={(e) => handleKeyChange(index, e.target.value)}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Audit Observation */}
          <div className="space-y-2">
            <Label htmlFor="audit_observation">Audit Observation</Label>
            <Textarea
              id="audit_observation"
              placeholder="Update audit observation..."
              value={auditObservation}
              onChange={(e) => setAuditObservation(e.target.value)}
              rows={3}
            />
          </div>

          {/* Audit Comments */}
          <div className="space-y-2">
            <Label htmlFor="audit_comments">Audit Comments</Label>
            <Textarea
              id="audit_comments"
              placeholder="Update audit comments..."
              value={auditComments}
              onChange={(e) => setAuditComments(e.target.value)}
              rows={3}
            />
          </div>

          {/* Evidence */}
          <div className="space-y-2">
            <Label>Evidence</Label>
            <EvidenceUploadCell
              value={evidence}
              onChange={(url) => setEvidence(url)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Finding
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
