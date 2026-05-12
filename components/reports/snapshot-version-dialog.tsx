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
import { useSnapshotVersion } from "@/hooks/use-report-queries";

interface SnapshotVersionDialogProps {
  reportId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function SnapshotVersionDialog({
  reportId,
  open,
  onOpenChange,
  onSaved
}: SnapshotVersionDialogProps) {
  const [label, setLabel] = useState("");
  const snapshot = useSnapshotVersion(reportId);

  const handleConfirm = () => {
    snapshot.mutate(label.trim() || undefined, {
      onSuccess: () => {
        setLabel("");
        onOpenChange(false);
        onSaved?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as new version</DialogTitle>
          <DialogDescription>
            Captures the current draft as an immutable-feeling version snapshot. You can keep
            editing the draft afterward.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="version-label">Label (optional)</Label>
          <Input
            id="version-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Pre-management review"
            maxLength={120}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={snapshot.isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={snapshot.isPending}>
            {snapshot.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
