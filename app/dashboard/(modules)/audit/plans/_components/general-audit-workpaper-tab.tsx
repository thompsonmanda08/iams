"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, AlertCircle, Calendar, User, ClipboardList, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GeneralEvidenceGrid } from "@/components/audit/general-evidence-grid";
import type { AuditPlan } from "@/lib/types/audit-types";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GeneralAuditWorkpaperTabProps {
  auditPlan: AuditPlan;
  workpaper?: any;
}

export function GeneralAuditWorkpaperTab({ auditPlan, workpaper }: GeneralAuditWorkpaperTabProps) {
  const config = workpaper?.config?.[0] ?? null;
  const findings = workpaper?.general_findings ?? [];
  const workingPaperId = workpaper?.id;

  const [metadata, setMetadata] = useState({
    workDone: workpaper?.metadata?.work_done || "",
    conclusion: workpaper?.metadata?.conclusion || ""
  });

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

  // ── Full render ────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Audit header info block */}
        <Card className="bg-muted/20">
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoField
                icon={<ClipboardList className="h-4 w-4" />}
                label="Audit Process"
                value={auditPlan.title}
              />
              <InfoField
                icon={<User className="h-4 w-4" />}
                label="Audit Team Leader"
                value={auditPlan.audit_team_leader || "—"}
              />
              <InfoField
                icon={<Calendar className="h-4 w-4" />}
                label="Start Date"
                value={
                  auditPlan.start_date ? format(new Date(auditPlan.start_date), "dd MMM yyyy") : "—"
                }
              />
              <InfoField
                icon={<Calendar className="h-4 w-4" />}
                label="End Date"
                value={
                  auditPlan.end_date ? format(new Date(auditPlan.end_date), "dd MMM yyyy") : "—"
                }
              />
            </div>
          </CardContent>
        </Card>

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
          disabled={auditPlan.status !== "DRAFT"}
        />

        {/* Work done & Conclusion */}
        {/* TODO: Add work done & conclusion with a mutation to PATCH the workpaper */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Work Done & Conclusion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Work Done */}
            <Textarea
              id="workDone"
              label="Work Done"
              placeholder="Describe the audit work performed, procedures executed, and evidence examined..."
              rows={4}
              className="resize-none font-mono text-sm"
              value={metadata.workDone}
              onChange={(e) => setMetadata({...metadata, workDone: e.target.value})}
            />

            {/* Conclusion */}
            <Textarea
              id="conclusion"
              label="Conclusion"
              placeholder="Summarize the overall findings, audit opinion, and key takeaways..."
              rows={4}
              className="resize-none font-mono text-sm"
              value={metadata.conclusion}
              onChange={(e) => setMetadata({...metadata, conclusion: e.target.value})}
            />
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <Button
            // variant="outline"
            // onClick={handleSaveDraft}
            // isLoading={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// ─── Small helper ─────────────────────────────────────────────────────────────

function InfoField({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
