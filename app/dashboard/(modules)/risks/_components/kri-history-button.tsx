"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Update Measure
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        View History
      </Button>
      {isOpen && <KRIHistory kri={kri} onClose={() => setIsOpen(false)} />}

      <KRIMeasureDialog kri_id={kri.id} isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
