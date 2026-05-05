"use client";

import { useState } from "react";
import { Clock, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/ui/permission-button";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import { KRIHistory } from "../kri/kri-history";
import type { KRI } from "@/app/_actions/risk-module-actions";
import { KRIMeasureDialog } from "./kri-measure-dialog";

interface KRIHistoryButtonProps {
  kri: KRI;
}

export function KRIHistoryButton({ kri }: KRIHistoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <PermissionButton
        moduleCode={MODULE_CODES.KRI_DASHBOARD}
        action="can_edit"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full gap-2 sm:w-auto">
        <PencilLine className="h-4 w-4" />
        Update Measure
      </PermissionButton>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full gap-2 sm:w-auto">
        <Clock className="h-4 w-4" />
        View History
      </Button>

      <KRIHistory kri={kri as any} open={isOpen} onClose={() => setIsOpen(false)} />
      <KRIMeasureDialog kri_id={kri.id} isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
