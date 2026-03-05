"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, AlertCircle, Save, Target, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GeneralEvidenceGrid } from "@/components/audit/general-evidence-grid";
import type { AuditPlan } from "@/lib/types/audit-types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUpdateWorkpaperMetadata } from "@/hooks/use-general-findings-mutations";

interface GeneralAuditWorkpaperTabProps {
  auditPlan: AuditPlan;
  workpaper?: any;
}

export function GeneralAuditWorkpaperTab({ auditPlan, workpaper }: GeneralAuditWorkpaperTabProps) {
  const config = workpaper?.config?.[0] ?? null;
  const findings = workpaper?.general_findings ?? [];
  const workingPaperId = workpaper?.id;

  const updateMetadataMutation = useUpdateWorkpaperMetadata();

  const [metadata, setMetadata] = useState({
    audit_process: workpaper?.metadata?.audit_process || auditPlan.title || "",
    objective: workpaper?.metadata?.objective || auditPlan.audit_objective || "",
    prepared_by: workpaper?.metadata?.prepared_by || auditPlan.audit_team_leader || "",
    date: workpaper?.metadata?.date || auditPlan.start_date || "",
    reviewed_by: workpaper?.metadata?.reviewed_by || "",
    work_done: workpaper?.metadata?.work_done || "",
    conclusion: workpaper?.metadata?.conclusion || ""
  });

  function handleSaveMetadata() {
    if (!workingPaperId) return;
    updateMetadataMutation.mutate({
      workingPaperId,
      metadata
    });
  }

  const isDisabled = auditPlan.status?.toUpperCase() !== "APPROVED";

  // ── No workpaper ─────────────────────────────────────────────────────────

  if (!workpaper || !workingPaperId) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed p-6">
        <AlertCircle className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">No working paper found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            This audit plan does not have a working paper. Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // ── No config defined ──────────────────────────────────────────────────

  if (!config || (!config.columns?.length && !config.keys?.length)) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed p-6">
        <AlertCircle className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">No work paper config defined</p>
          <p className="text-muted-foreground mt-1 text-sm">
            The template linked to this audit has no column configuration. A system administrator
            must define the columns and keys for this template before work can begin.
          </p>
        </div>
      </div>
    );
  }

  // ── Audit plan not approved — show empty state ───────────────────────

  if (isDisabled) {
    return (
      <div className="space-y-4">
        {/* Column + key legend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Info className="h-4 w-4" />
              Evidence Grid Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pb-3">
            {(config.columns ?? []).map((col: any) => (
              <Tooltip key={col.key}>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-help font-mono text-xs">
                    {col.name}
                  </Badge>
                </TooltipTrigger>
                {col.description && (
                  <TooltipContent side="top" className="max-w-52 text-xs">
                    {col.description}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
            <span className="text-muted-foreground self-center text-xs">→ Audit Tests:</span>
            {(config.keys ?? []).map((k: any) => (
              <Tooltip key={k.key}>
                <TooltipTrigger asChild>
                  <Badge className="cursor-help bg-amber-100 font-mono text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {k.name}
                  </Badge>
                </TooltipTrigger>
                {k.description && (
                  <TooltipContent side="top" className="max-w-52 text-xs">
                    {k.description}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
            <span className="text-muted-foreground self-center text-xs">
              → Observations · Comments · Evidence
            </span>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-8 py-16">
            <div className="relative mb-4">
              <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
              <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
                <Lock className="text-primary h-16 w-16" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-foreground mb-2 text-2xl font-semibold">Workpaper Locked</h3>
            <p className="text-muted-foreground mb-2 max-w-md text-center">
              The audit plan must be <span className="font-medium">approved</span> before you can
              begin filling in the workpaper. The current status is{" "}
              <Badge variant="outline" className="text-xs">
                {auditPlan.status}
              </Badge>
              .
            </p>
            <p className="text-muted-foreground text-center text-sm">
              Submit the audit plan for approval to unlock the evidence grid and workpaper details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Full render ────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        {/* Column + key legend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Info className="h-4 w-4" />
              Evidence Grid Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pb-3">
            {(config.columns ?? []).map((col: any) => (
              <Tooltip key={col.key}>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-help font-mono text-xs">
                    {col.name}
                  </Badge>
                </TooltipTrigger>
                {col.description && (
                  <TooltipContent side="top" className="max-w-52 text-xs">
                    {col.description}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
            <span className="text-muted-foreground self-center text-xs">→ Audit Tests:</span>
            {(config.keys ?? []).map((k: any) => (
              <Tooltip key={k.key}>
                <TooltipTrigger asChild>
                  <Badge className="cursor-help bg-amber-100 font-mono text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {k.name}
                  </Badge>
                </TooltipTrigger>
                {k.description && (
                  <TooltipContent side="top" className="max-w-52 text-xs">
                    {k.description}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
            <span className="text-muted-foreground self-center text-xs">
              → Observations · Comments · Evidence
            </span>
          </CardContent>
        </Card>

        {/* Evidence grid */}
        <GeneralEvidenceGrid
          config={config}
          findings={findings}
          workingPaperId={workingPaperId}
          auditPlanId={auditPlan.id}
          disabled={false}
          auditPlanStatus={auditPlan.status}
        />

        {/* Work Done & Conclusion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Target className="h-5 w-5" />
              Workpaper Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Audit Process"
                value={metadata.audit_process}
                onChange={(e) => setMetadata({ ...metadata, audit_process: e.target.value })}
                placeholder="Audit process name..."
              />
              <Input
                label="Prepared By"
                value={metadata.prepared_by}
                onChange={(e) => setMetadata({ ...metadata, prepared_by: e.target.value })}
                placeholder="Prepared by..."
              />
              <Input
                label="Date"
                type="date"
                value={metadata.date}
                onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
              />
              <Input
                label="Reviewed By"
                value={metadata.reviewed_by}
                onChange={(e) => setMetadata({ ...metadata, reviewed_by: e.target.value })}
                placeholder="Reviewed by..."
              />
            </div> */}

            <Textarea
              label="Objective"
              placeholder="Describe the audit objective..."
              rows={3}
              className="resize-none text-sm"
              value={metadata.objective}
              onChange={(e) => setMetadata({ ...metadata, objective: e.target.value })}
            />

            <Textarea
              label="Work Done"
              placeholder="Describe the audit work performed, procedures executed, and evidence examined..."
              rows={4}
              className="resize-none text-sm"
              value={metadata.work_done}
              onChange={(e) => setMetadata({ ...metadata, work_done: e.target.value })}
            />

            <Textarea
              label="Conclusion"
              placeholder="Summarize the overall findings, audit opinion, and key takeaways..."
              rows={4}
              className="resize-none text-sm"
              value={metadata.conclusion}
              onChange={(e) => setMetadata({ ...metadata, conclusion: e.target.value })}
            />
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <Button onClick={handleSaveMetadata} isLoading={updateMetadataMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
