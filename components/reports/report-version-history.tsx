"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Download, Eye, FileText, History, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { usePublishVersion, useSetActiveVersion } from "@/hooks/use-report-queries";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import type { ReportVersionSnapshot } from "@/lib/types/report-types";
import { VersionViewerDialog } from "./version-viewer-dialog";

interface ReportVersionHistoryProps {
  reportId: string;
  versions: ReportVersionSnapshot[];
  activeVersionNumber?: number;
}

export function ReportVersionHistory({
  reportId,
  versions,
  activeVersionNumber,
}: ReportVersionHistoryProps) {
  const [openVersion, setOpenVersion] = useState<{
    version: ReportVersionSnapshot;
  } | null>(null);
  const publish = usePublishVersion(reportId);
  const setActive = useSetActiveVersion(reportId);
  const { hasPermission } = usePermissions();
  const canEditReport = hasPermission(MODULE_CODES.AUDIT_REPORTS, "can_edit");

  const sorted = useMemo(
    () => [...versions].sort((a, b) => b.version_number - a.version_number),
    [versions]
  );

  if (sorted.length === 0) {
    return (
      <Card className="bg-canvas/50 border-2 border-dashed">
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <History className="text-muted-foreground mb-3 h-10 w-10" strokeWidth={1.5} />
          <h3 className="text-foreground mb-1 text-lg font-semibold">No versions yet</h3>
          <p className="text-muted-foreground max-w-md text-sm">
            Take a snapshot from the editor to start tracking versions.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <ul className="divide-border bg-card divide-y rounded-lg border">
        {sorted.map((v) => (
          <li key={v.version_number} className="flex items-center gap-4 px-4 py-3">
            <Badge variant="outline" className="font-mono">
              v{v.version_number}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-foreground truncate font-medium">{v.title}</span>
                {v.label && (
                  <span className="text-muted-foreground truncate text-sm">— {v.label}</span>
                )}
                {v.version_number === activeVersionNumber && (
                  <Badge variant="default" className="bg-blue-600 text-xs hover:bg-blue-700">
                    Active
                  </Badge>
                )}
                <StatusBadge status={v.status} />
                {v.edit_log.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {v.edit_log.length} edit{v.edit_log.length === 1 ? "" : "s"}
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                Snapshotted {format(new Date(v.snapshotted_at), "PPp")} by {v.snapshotted_by.name}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon"
                variant="ghost"
                title="View"
                onClick={() => setOpenVersion({ version: v })}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title={
                  !canEditReport
                    ? "You do not have permission to edit this resource"
                    : v.version_number === activeVersionNumber
                      ? "Active"
                      : "Set as active"
                }
                disabled={
                  !canEditReport ||
                  setActive.isPending ||
                  v.version_number === activeVersionNumber
                }
                onClick={() => setActive.mutate(v.version_number)}
              >
                <CheckCircle2
                  className={
                    v.version_number === activeVersionNumber
                      ? "h-4 w-4 text-blue-600"
                      : "h-4 w-4 text-gray-400"
                  }
                />
              </Button>
              {v.pdf_url && (
                <Button asChild size="icon" variant="ghost" title="Download PDF">
                  <a href={v.pdf_url} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {v.status === "PUBLISHED" && !v.pdf_url && (
                <Button
                  size="icon"
                  variant="ghost"
                  title={
                    canEditReport
                      ? "Retry PDF generation"
                      : "You do not have permission to edit this resource"
                  }
                  disabled={!canEditReport || publish.isPending}
                  onClick={() =>
                    publish.mutate({ versionNumber: v.version_number, generatePdf: true })
                  }
                >
                  <FileText className="h-4 w-4" />
                </Button>
              )}
              {v.status === "DRAFT" && (
                <Button
                  size="icon"
                  variant="ghost"
                  title={
                    canEditReport
                      ? "Submit for Approval"
                      : "You do not have permission to edit this resource"
                  }
                  disabled={!canEditReport || publish.isPending}
                  onClick={() => publish.mutate({ versionNumber: v.version_number })}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {openVersion && (
        <VersionViewerDialog
          version={openVersion.version}
          open={openVersion !== null}
          onOpenChange={(open) => {
            if (!open) setOpenVersion(null);
          }}
        />
      )}
    </>
  );
}
