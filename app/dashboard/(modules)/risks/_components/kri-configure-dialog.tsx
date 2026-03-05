"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KRIConfigureForm } from "@/components/forms/kri-configuration-form";
import { createKRI, KRIFrequency } from "@/app/_actions/risk-module-actions";
import { notify } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";

type KRIFormData = {
  name: string;
  description: string;
  kri_register_id: string;
  category_id: string;
  department_id: string;
  target_value: string;
  from_trigger_value: string;
  from_trigger_condition: string;
  to_trigger_value: string;
  to_trigger_condition: string;
  limit_value: string;
  measurement_type: string;
  currency_code: string;
  monitoring_frequency: KRIFrequency | "";
  owner_id: string;
  status_evaluation_method: string;
  use_moving_average: boolean;
  moving_average_days: number;
  invert_direction: boolean;
  auto_generate_risks: boolean;
  commentary: string;
  mitigant_plan: string;
};

interface KRIConfigureDialogProps {
  registerId: string;
}

export function KRIConfigureDialog({ registerId }: KRIConfigureDialogProps) {
  const router = useRouter();
  const { checkPermission } = usePermissions();
  const [configureOpen, setConfigureOpen] = useState(false);

  const handleKRISubmit = async (data: KRIFormData) => {
    try {
      const response = await createKRI(data);

      if (response.success && response.data) {
        notify({ description: response.message || "KRI created successfully", type: "success" });
        setConfigureOpen(false);
        router.refresh();
      } else {
        notify({ description: response.message || "Failed to create KRI", type: "error" });
      }
    } catch (error) {
      console.error("Failed to create KRI:", error);
      notify({ description: "An unexpected error occurred", type: "error" });
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => {
        if (!checkPermission("KRI_DASHBOARD", "can_configure")) return;
        setConfigureOpen(true);
      }}>
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
