"use client";

import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiStepRiskForm } from "@/components/forms/multi-step-risk-form";
import BackButton from "@/components/back-button";
import PageHeader from "@/components/page-header";

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
          <PageHeader
            title={registerName ? registerName : "Risk Register"}
            description="Manage and monitor organizational risks"
            Icon={ShieldAlert}
          />

          <div className="flex gap-2">
            <BackButton title="Back to registers" />
            <Button size={"sm"} onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
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
