"use client";
import { use, useState } from "react";
import BackButton from "@/components/back-button";
import RiskAcceptanceForm, { FormData } from "@/components/forms/risk-acceptance-form";
import { toast } from "sonner";
import { createRiskAcceptance, updateRiskAcceptance } from "@/app/_actions/risk-module-actions";

export default function RiskAcceptancePage({ params }: { params: Promise<{ id: string }> }) {
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [existingFormData, setExistingFormData] = useState<Partial<FormData> | null>(null);
  const { id } = use(params);

  const handleCreate = async (data: FormData) => {
    try {
      const response = await createRiskAcceptance(id, data);
      if (response.success) {
        toast.success(response.message || "Risk Acceptance Form created successfully!");
        setExistingFormData(data);
        setFormMode("edit");
      } else {
        toast.error(response.message || "Failed to create Risk Acceptance Form");
      }
    } catch (error) {
      console.error("Error creating risk acceptance:", error);
      toast.error("Failed to create Risk Acceptance Form");
    }
  };

  const handleUpdate = async (data: FormData) => {
    try {
      const response = await updateRiskAcceptance(id, data);

      if (response.success) {
        toast.success(response.message || "Risk Acceptance Form updated successfully!");
        setExistingFormData(data);
      } else {
        toast.error(response.message || "Failed to update Risk Acceptance Form");
      }
    } catch (error) {
      console.error("Error updating risk acceptance:", error);
      toast.error("Failed to update Risk Acceptance Form");
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
          <BackButton title="Back to Actions" />
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
