"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, AlertCircle, Calendar, User, ClipboardList } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EvidenceGrid } from "@/components/audit/evidence-grid";
import { getGeneralWorkPaperConfigsByTemplateId } from "@/app/_actions/audit-settings-actions";
import type { AuditPlan, EvidenceRow, TickMark } from "@/lib/types/audit-types";
import { format } from "date-fns";

interface GeneralAuditWorkpaperTabProps {
  auditPlan: AuditPlan;
}

// Map a config key to a TickMark shape consumed by EvidenceGrid
function keyToTickMark(key: { key: string; name: string; description?: string }): TickMark {
  return {
    code: key.key,
    description: key.description || key.name,
    category: key.name
  };
}

export function GeneralAuditWorkpaperTab({ auditPlan }: GeneralAuditWorkpaperTabProps) {
  const templateId = auditPlan.working_paper_template_id;

  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [selectedTickMarks, setSelectedTickMarks] = useState<string[]>([]);

  useEffect(() => {
    if (!templateId) {
      setLoading(false);
      return;
    }

    getGeneralWorkPaperConfigsByTemplateId(templateId).then((res) => {
      if (res.success) {
        const raw = Array.isArray(res.data) ? res.data[0] : res.data;
        setConfig(raw ?? null);
        if (raw?.keys?.length) {
          setSelectedTickMarks(raw.keys.map((k: any) => k.key));
        }
      }
      setLoading(false);
    });
  }, [templateId]);

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  // ── No template ID ─────────────────────────────────────────────────────────

  if (!templateId) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed p-6">
        <AlertCircle className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">No work paper template assigned</p>
          <p className="text-muted-foreground mt-1 text-sm">
            This audit plan does not have a work paper template. Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // ── No config defined ──────────────────────────────────────────────────────

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

  const tickMarks: TickMark[] = (config.keys ?? []).map(keyToTickMark);

  // ── Full render ────────────────────────────────────────────────────────────

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
                  auditPlan.start_date
                    ? format(new Date(auditPlan.start_date), "dd MMM yyyy")
                    : "—"
                }
              />
              <InfoField
                icon={<Calendar className="h-4 w-4" />}
                label="End Date"
                value={
                  auditPlan.end_date
                    ? format(new Date(auditPlan.end_date), "dd MMM yyyy")
                    : "—"
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
            <span className="text-muted-foreground self-center text-xs">→ Obs · Comments · Evidence</span>
          </CardContent>
        </Card>

        {/* Evidence grid */}
        <Card className="p-4">
          <EvidenceGrid
            rows={rows}
            onRowsChange={setRows}
            selectedTickMarks={selectedTickMarks}
            onTickMarksChange={setSelectedTickMarks}
            availableTickMarks={tickMarks}
          />
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
