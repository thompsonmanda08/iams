"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RiskFormDialog } from "@/components/forms/risk-form-dialog";

type CreateRiskDialogProps = {
  registerId: string;
};

export default function CreateRiskDialog({ registerId }: CreateRiskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Risk
      </Button>

      <RiskFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        registerId={registerId}
      />
    </>
  );
}
