"use client";

import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiStepRiskForm } from "@/components/forms/multi-step-risk-form";
import BackButton from "@/components/back-button";
import PageHeader from "@/components/page-header";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface RisksPageHeaderProps {
  registerId: string;
  registerName?: string;
}

export function RisksPageHeader({ registerId, registerName }: RisksPageHeaderProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { checkPermission, hasPermission } = usePermissions();

  const handleCreateClick = () => {
    if (!checkPermission(MODULE_CODES.RISK_REGISTERS, "can_create")) return;
    setCreateDialogOpen(true);
  };

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
            <Button size={"sm"} onClick={handleCreateClick}>
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
