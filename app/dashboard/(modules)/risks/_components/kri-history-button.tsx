"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KRIHistory } from "../kri/kri-history";

interface KRIHistoryButtonProps {
  kriId: string;
}

export function KRIHistoryButton({ kriId }: KRIHistoryButtonProps) {
  const [selectedKRI, setSelectedKRI] = useState<string | null>(null);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setSelectedKRI(kriId)}
      >
        View History
      </Button>
      <KRIHistory 
        kriId={selectedKRI} 
        onClose={() => setSelectedKRI(null)} 
      />
    </>
  );
}