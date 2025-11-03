"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KRIHistory } from "../kri/kri-history";
import type { KRI } from "@/app/_actions/risk-module-actions";

interface KRIHistoryButtonProps {
  kri: KRI; // Pass the full KRI object instead
}

export function KRIHistoryButton({ kri }: KRIHistoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        View History
      </Button>
      {isOpen && <KRIHistory kri={kri} onClose={() => setIsOpen(false)} />}
    </>
  );
}
