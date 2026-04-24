"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/utils";
import { createReportGuide } from "@/app/_actions/config-actions";
import { SelectField } from "@/components/ui/select-field";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

interface CreateReportGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateReportGuideDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateReportGuideDialogProps) {
  const { checkPermission } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    report_type: "RISK_REPORT"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_create")) return;

    if (!formData.name.trim()) {
      notify({ description: "Please enter a guide name", type: "error" });
      return;
    }

    if (!formData.report_type) {
      notify({ description: "Please select a report type", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await createReportGuide({
        name: formData.name,
        description: formData.description,
        report_type: formData.report_type
      });

      if (response.success) {
        notify({ description: "Report guide created successfully", type: "success" });
        setFormData({ name: "", description: "", report_type: "RISK_REPORT" });
        onOpenChange(false);
        onSuccess();
      } else {
        notify({ description: response.message || "Failed to create report guide", type: "error" });
      }
    } catch (error: any) {
      notify({ description: error?.message || "Failed to create report guide", type: "error" });
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
        <DialogHeader>
          <DialogTitle>Create Report Guide</DialogTitle>
          <DialogDescription>Add a new report guide for risk or audit reports</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Guide Name"
            required
            id="name"
            placeholder="e.g., Standard Risk Assessment Guide"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
          />

          <SelectField
            className="w-full"
            label="Report Type"
            placeholder="Choose a report type"
            options={[
              { id: "RISK_REPORT", name: "Risk Report" },
              { id: "AUDIT_REPORT", name: "Audit Report" }
            ]}
            required
            value={formData.report_type}
            onValueChange={(value) => setFormData({ ...formData, report_type: value })}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and guidelines for this report guide..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={4}
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
              {isLoading ? "Creating..." : "Create Guide"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
