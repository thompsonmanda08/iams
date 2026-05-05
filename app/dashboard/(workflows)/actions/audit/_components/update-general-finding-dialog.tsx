"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2 } from "lucide-react";
import { useUpdateGeneralFindingReassessment } from "@/hooks/use-finding-actions-queries";
import { usePermissions } from "@/hooks/use-permissions";
import { EvidenceUploadCell } from "@/components/audit/evidence-upload-cell";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface UpdateGeneralFindingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  findingId: string;
  generalFindingData: any;
  workpaperConfig?: { columns?: any[]; keys?: any[] } | null;
}

export function UpdateGeneralFindingDialog({
  open,
  onOpenChange,
  findingId,
  generalFindingData,
  workpaperConfig
}: UpdateGeneralFindingDialogProps) {
  const [columns, setColumns] = useState<{ key: string; value: any }[]>([]);
  const [keys, setKeys] = useState<{ key: string; value: any }[]>([]);
  const [auditObservation, setAuditObservation] = useState("");
  const [auditComments, setAuditComments] = useState("");
  const [evidence, setEvidence] = useState("");
  const [isMarkedComplete, setIsMarkedComplete] = useState(false);

  const updateMutation = useUpdateGeneralFindingReassessment();
  const { checkPermission, hasPermission } = usePermissions();

  const colConfigMap = useMemo(() => {
    const cols = workpaperConfig?.columns ?? [];
    return Object.fromEntries(
      cols.map((c: any) => [c.key, { name: c.name, description: c.description }])
    );
  }, [workpaperConfig]);

  const keyConfigMap = useMemo(() => {
    const ks = workpaperConfig?.keys ?? [];
    return Object.fromEntries(
      ks.map((k: any) => [k.key, { name: k.name, description: k.description }])
    );
  }, [workpaperConfig]);

  // Pre-populate form when dialog opens or data changes.
  // Each column/key in the API response is a single-property object like {"po_no": "ZMB74903"},
  // so we flatten with Object.entries to get {key, value} pairs for the form state.
  useEffect(() => {
    if (generalFindingData && open) {
      setColumns(
        (generalFindingData.columns ?? []).flatMap((col: any) => {
          if (!col || typeof col !== "object") return [];
          return Object.entries(col)
            .filter(([k]) => k !== "description")
            .map(([key, value]) => ({ key, value: value ?? "" }));
        })
      );
      setKeys(
        (generalFindingData.keys ?? []).flatMap((k: any) => {
          if (!k || typeof k !== "object") return [];
          return Object.entries(k)
            .filter(([key]) => key !== "description")
            .map(([key, value]) => ({ key, value: value ?? "" }));
        })
      );
      setAuditObservation(generalFindingData.audit_observation ?? "");
      setAuditComments(generalFindingData.audit_comments ?? "");
      setEvidence(generalFindingData.evidence ?? "");
      setIsMarkedComplete(false);
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
    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_create")) return;

    updateMutation.mutate(
      {
        findingId,
        data: {
          columns: columns.map((col) => ({ [col.key]: col.value })),
          keys: keys.map((k) => ({ [k.key]: k.value })),
          audit_observation: auditObservation,
          audit_comments: auditComments,
          evidence: evidence || undefined,
          is_marked_complete: isMarkedComplete
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
        className="max-h-[90vh] max-w-3xl! overflow-y-auto">
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
              <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Finding Details
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {columns.map((col, index) => {
                  const cfg = colConfigMap[col.key];
                  const label = cfg?.name || col.key.replace(/_/g, " ");
                  const description = cfg?.description;
                  return (
                    <div key={col.key} className="space-y-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label
                              htmlFor={`col-${col.key}`}
                              className="inline-flex cursor-default items-center gap-1 text-xs capitalize">
                              {label}
                              {description && (
                                <Info className="text-muted-foreground h-3 w-3 shrink-0" />
                              )}
                            </Label>
                          </TooltipTrigger>
                          {description && (
                            <TooltipContent side="top">
                              <p className="max-w-xs text-xs">{description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      <Input
                        id={`col-${col.key}`}
                        value={col.value}
                        onChange={(e) => handleColumnChange(index, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Keys (Audit Tests) */}
          {keys.length > 0 && (
            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Audit Tests
              </Label>
              <div className="rounded-md border bg-amber-50/50 p-3 dark:bg-amber-950/20">
                <div className="grid grid-cols-2 gap-3">
                  {keys.map((k, index) => {
                    const cfg = keyConfigMap[k.key];
                    const label = cfg?.name || k.key.replace(/_/g, " ");
                    const description = cfg?.description;
                    return isBooleanKey(k.value) ? (
                      <div key={k.key} className="flex items-center gap-2">
                        <Checkbox
                          id={`key-${k.key}`}
                          checked={k.value === true || k.value === "true"}
                          onCheckedChange={(checked) => handleKeyChange(index, !!checked)}
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label
                                htmlFor={`key-${k.key}`}
                                className="inline-flex cursor-pointer items-center gap-1 text-sm font-normal capitalize">
                                {label}
                                {description && (
                                  <Info className="text-muted-foreground h-3 w-3 shrink-0" />
                                )}
                              </Label>
                            </TooltipTrigger>
                            {description && (
                              <TooltipContent side="top">
                                <p className="max-w-xs text-xs">{description}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : (
                      <div key={k.key} className="space-y-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label
                                htmlFor={`key-${k.key}`}
                                className="inline-flex cursor-default items-center gap-1 text-xs capitalize">
                                {label}
                                {description && (
                                  <Info className="text-muted-foreground h-3 w-3 shrink-0" />
                                )}
                              </Label>
                            </TooltipTrigger>
                            {description && (
                              <TooltipContent side="top">
                                <p className="max-w-xs text-xs">{description}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        <Input
                          id={`key-${k.key}`}
                          value={k.value ?? ""}
                          onChange={(e) => handleKeyChange(index, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Audit Observation */}
          <Textarea
            label="Audit Observation"
            id="audit_observation"
            placeholder="Update audit observation..."
            value={auditObservation}
            onChange={(e) => setAuditObservation(e.target.value)}
            rows={3}
          />

          {/* Audit Comments */}
          <Textarea
            label="Audit Comments"
            id="audit_comments"
            placeholder="Update audit comments..."
            value={auditComments}
            onChange={(e) => setAuditComments(e.target.value)}
            rows={3}
          />

          {/* Evidence */}
          <div className="space-y-2">
            <Label>Evidence</Label>
            <EvidenceUploadCell value={evidence} onChange={(url) => setEvidence(url)} />
          </div>

          {/* Mark as Complete */}
          <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50/50 p-3 dark:border-green-900 dark:bg-green-950/20">
            <Checkbox
              id="is_marked_complete"
              checked={isMarkedComplete}
              onCheckedChange={(checked) => setIsMarkedComplete(!!checked)}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label
                htmlFor="is_marked_complete"
                className="cursor-pointer text-sm font-medium capitalize">
                Mark action as Complete
              </Label>
              <p className="text-muted-foreground text-xs">
                Check this to notify the system that the remediation action has been fully
                addressed.
              </p>
            </div>
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
            <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Finding
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
