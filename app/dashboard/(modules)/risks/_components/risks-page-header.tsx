"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiStepRiskForm } from "@/components/forms/multi-step-risk-form";
import { useRouter } from "next/navigation";

interface RisksPageHeaderProps {
  registerId: string;
  registerName?: string;
}

export function RisksPageHeader({ registerId, registerName }: RisksPageHeaderProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <div className="bg-card border-b">
        <div className="container mx-auto py-6 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Actions
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Register</h1>
            {registerName && <p className="text-muted-foreground mt-2">{registerName}</p>}
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Risk
          </Button>
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
