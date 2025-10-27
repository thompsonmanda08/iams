"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KRIConfigureForm } from "@/components/forms/kri-configuration-form";
import { createKRI, KRIFrequency } from "@/app/_actions/risk-module-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type KRIFormData = {
  name: string;
  description: string;
  kri_register_id: string;
  category_id: string;
  department_id: string;
  target_value: string;
  trigger_value: string;
  limit_value: string;
  monitoring_frequency: KRIFrequency | "";
  owner_id: string;
  commentary: string;
  mitigant_plan: string;
};

interface KRIConfigureDialogProps {
  registerId: string;
}

export function KRIConfigureDialog({ registerId }: KRIConfigureDialogProps) {
  const router = useRouter();
  const [configureOpen, setConfigureOpen] = useState(false);

  const handleKRISubmit = async (data: KRIFormData) => {
    try {
      const response = await createKRI(data);

      if (response.success && response.data) {
        toast.success(response.message || "KRI created successfully");
        setConfigureOpen(false);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to create KRI");
      }
    } catch (error) {
      console.error("Failed to create KRI:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setConfigureOpen(true)}>
        <AlertCircle className="mr-2 h-4 w-4" />
        Configure KRIs
      </Button>
      <KRIConfigureForm
        open={configureOpen}
        onOpenChange={setConfigureOpen}
        registerId={registerId}
        onSubmit={handleKRISubmit}
      />
    </>
  );
}