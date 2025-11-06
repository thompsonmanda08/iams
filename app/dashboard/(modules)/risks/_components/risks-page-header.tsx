"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiStepRiskForm } from "@/components/forms/multi-step-risk-form";
import BackButton from "@/components/back-button";

interface RisksPageHeaderProps {
  registerId: string;
  registerName?: string;
}

export function RisksPageHeader({ registerId, registerName }: RisksPageHeaderProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <div className="bg-card border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Register</h1>
            {registerName && <p className="text-muted-foreground mt-2">{registerName}</p>}
          </div>
          <div className="flex gap-4">
            <BackButton title="Back to registers" />
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Risk
            </Button>
          </div>
        </div>
      </div>

      <MultiStepRiskForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        registerId={registerId}
      />
    </>
  );
}
