"use client";
import { use, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import BackButton from "@/components/back-button";
import RiskAcceptanceForm, { FormData } from "@/components/forms/risk-acceptance-form";
import { notify } from "@/lib/utils";
import { createRiskAcceptance, updateRiskAcceptance } from "@/app/_actions/risk-module-actions";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

export default function RiskAcceptancePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { checkPermission, hasPermission } = usePermissions();
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [existingFormData, setExistingFormData] = useState<Partial<FormData> | null>(null);
  const { id } = use(params);

  const handleCreate = async (data: FormData) => {
    if (!checkPermission(MODULE_CODES.RISK_ACCEPTANCES, "can_create")) return;
    try {
      const response = await createRiskAcceptance(id, data);
      if (response.success) {
        notify({ description: response.message || "Risk Acceptance Form created successfully!", type: "success" });
        setExistingFormData(data);
        setFormMode("edit");
        queryClient.invalidateQueries({ queryKey: ["actions"] });
        queryClient.invalidateQueries({ queryKey: ["risk-acceptances"] });
        router.push("/dashboard/risks/risk-acceptances");
      } else {
        notify({ description: response.message || "Failed to create Risk Acceptance Form", type: "error" });
      }
    } catch (error) {
      console.error("Error creating risk acceptance:", error);
      notify({ description: "Failed to create Risk Acceptance Form", type: "error" });
    }
  };

  const handleUpdate = async (data: FormData) => {
    if (!checkPermission(MODULE_CODES.RISK_ACCEPTANCES, "can_edit")) return;
    try {
      const response = await updateRiskAcceptance(id, data);

      if (response.success) {
        notify({ description: response.message || "Risk Acceptance Form updated successfully!", type: "success" });
        setExistingFormData(data);
        queryClient.invalidateQueries({ queryKey: ["actions"] });
        queryClient.invalidateQueries({ queryKey: ["risk-acceptances"] });
      } else {
        notify({ description: response.message || "Failed to update Risk Acceptance Form", type: "error" });
      }
    } catch (error) {
      console.error("Error updating risk acceptance:", error);
      notify({ description: "Failed to update Risk Acceptance Form", type: "error" });
    }
  };

  return (
    <main className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Acceptance</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Complete all sections for risk acceptance approval
            </p>
          </div>
          <BackButton title="Back to Risk Details" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {formMode === "create" ? (
          <RiskAcceptanceForm mode="create" onSubmit={handleCreate} />
        ) : (
          <RiskAcceptanceForm
            mode="edit"
            initialData={(existingFormData as any) || undefined}
            onSubmit={handleUpdate}
          />
        )}
      </div>
    </main>
  );
}
