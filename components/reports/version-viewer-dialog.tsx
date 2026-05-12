"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateVersion } from "@/hooks/use-report-queries";
import type { ReportVersionSnapshot } from "@/lib/types/report-types";

interface VersionViewerDialogProps {
  reportId: string;
  version: ReportVersionSnapshot;
  mode: "view" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionViewerDialog({
  reportId,
  version,
  mode,
  open,
  onOpenChange
}: VersionViewerDialogProps) {
  const [title, setTitle] = useState(version.title);
  const [label, setLabel] = useState(version.label ?? "");
  const [summary, setSummary] = useState("");
  const update = useUpdateVersion(reportId);

  const isEdit = mode === "edit";

  const handleSave = () => {
    update.mutate(
      {
        versionNumber: version.version_number,
        patch: {
          title: title.trim() || version.title,
          label: label.trim() || undefined
        },
        summary: summary.trim() || undefined
      },
      {
        onSuccess: () => {
          setSummary("");
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit version v${version.version_number}` : `View version v${version.version_number}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes are recorded in the version edit log."
              : "Read-only snapshot view."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="v-title">Title</Label>
            <Input
              id="v-title"
              value={title}
              readOnly={!isEdit}
              disabled={!isEdit}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="v-label">Label</Label>
            <Input
              id="v-label"
              value={label}
              readOnly={!isEdit}
              disabled={!isEdit}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="(no label)"
            />
          </div>

          <div className="text-muted-foreground text-xs">
            {version.sections.length} section{version.sections.length === 1 ? "" : "s"} captured in
            this snapshot. Section-level editing on prior versions is not yet supported — use the
            current draft for content changes and re-snapshot.
          </div>

          {isEdit && (
            <div className="grid gap-1.5">
              <Label htmlFor="v-summary">Edit summary (optional)</Label>
              <Textarea
                id="v-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="e.g. Renamed for clarity"
                rows={2}
              />
            </div>
          )}

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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>
            {isEdit ? "Cancel" : "Close"}
          </Button>
          {isEdit && (
            <Button onClick={handleSave} disabled={update.isPending}>
              {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
