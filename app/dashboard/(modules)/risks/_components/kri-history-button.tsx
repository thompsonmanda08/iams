"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/ui/permission-button";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import { KRIHistory } from "../kri/kri-history";
import type { KRI } from "@/app/_actions/risk-module-actions";
import { KRIMeasureDialog } from "./kri-measure-dialog";

interface KRIHistoryButtonProps {
  kri: KRI; // Pass the full KRI object instead
}

export function KRIHistoryButton({ kri }: KRIHistoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-x-2">
      <PermissionButton
        moduleCode={MODULE_CODES.KRI_DASHBOARD}
        action="can_edit"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}>
        Update Measure
      </PermissionButton>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        View History
      </Button>
      <KRIHistory kri={kri as any} open={isOpen} onClose={() => setIsOpen(false)} />

      <KRIMeasureDialog kri_id={kri.id} isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
