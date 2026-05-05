"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { notify } from "@/lib/utils";
import { updateRiskResponse } from "@/app/_actions/config-actions";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";


type RiskResponse = {
  id: string;
  name: string;
  description: string;
};

type EditRiskResponseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: RiskResponse;
  onSuccess: () => void;
};

export function EditRiskResponseDialog({
  open,
  onOpenChange,
  response,
  onSuccess
}: EditRiskResponseDialogProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: response.name,
    description: response.description
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_edit")) return;

    if (!formData.name.trim()) {
      notify({ description: "Response name is required", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateRiskResponse(response.id, formData);
      if (result.success) {
        notify({ description: "Risk response updated successfully", type: "success" });
        onOpenChange(false);
        onSuccess();
      } else {
        notify({ description: result.message || "Failed to update risk response", type: "error" });
      }
    } catch (error) {
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Risk Response</DialogTitle>
            <DialogDescription>Update risk response strategy</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Input
              label="Response Name"
              required
              id="name"
              placeholder="e.g., Enhance, Exploit"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />

            <Textarea
              label="Description"
              id="description"
              placeholder="Describe this response strategy"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Response"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
