"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ReportVersionSnapshot } from "@/lib/types/report-types";

interface VersionViewerDialogProps {
  version: ReportVersionSnapshot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionViewerDialog({
  version,
  open,
  onOpenChange
}: VersionViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>View version v{version.version_number}</DialogTitle>
          <DialogDescription>Read-only snapshot view.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-xs">Title</Label>
            <p className="font-medium">{version.title}</p>
          </div>
          {version.label && (
            <div className="grid gap-1.5">
              <Label className="text-muted-foreground text-xs">Label</Label>
              <p className="font-medium">{version.label}</p>
            </div>
          )}
          <div className="text-muted-foreground text-xs">
            {version.sections.length} section{version.sections.length === 1 ? "" : "s"} captured in
            this snapshot. To edit this version, set it as active from the history list and use the
            editor.
          </div>

          {version.edit_log.length > 0 && (
            <div className="bg-muted/40 rounded-md p-3">
              <div className="text-foreground mb-2 text-xs font-semibold">Edit log</div>
              <ul className="space-y-1 text-xs">
                {version.edit_log.map((e, i) => (
                  <li key={i} className="text-muted-foreground">
                    {new Date(e.edited_at).toLocaleString()} — {e.edited_by.name}
                    {e.summary ? ` · ${e.summary}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
