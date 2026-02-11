"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createRiskCause, updateRiskCause, getRiskCauses } from "@/app/_actions/config-actions";
import { SelectField } from "@/components/ui/select-field";

type RiskCause = {
  id: string;
  parent_id: string | null;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

type RiskCauseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  cause?: RiskCause | null;
};

export function RiskCauseDialog({ open, onOpenChange, onSuccess, cause }: RiskCauseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableCauses, setAvailableCauses] = useState<RiskCause[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    parent_id: string | null;
    is_active: boolean;
  }>({
    name: "",
    description: "",
    parent_id: null,
    is_active: true
  });

  const isEditMode = !!cause;

  useEffect(() => {
    if (open) {
      fetchAvailableCauses();
    }
  }, [open]);

  const fetchAvailableCauses = async () => {
    try {
      const response = await getRiskCauses();
      if (response.success && response.data?.data) {
        const causes = response.data.data.filter((c: RiskCause) => c.id !== cause?.id);
        setAvailableCauses(causes);
      }
    } catch (error) {
      toast.error("Failed to load available risk causes");
    }
  };

  useEffect(() => {
    if (open && cause) {
      setFormData({
        name: cause.name,
        description: cause.description,
        parent_id: cause.parent_id || null,
        is_active: true
      });
    } else if (!open) {
      setFormData({ name: "", description: "", parent_id: null, is_active: true });
    }
  }, [open, cause]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Risk cause name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = isEditMode
        ? await updateRiskCause(cause.id, formData)
        : await createRiskCause(formData);

      if (result.success) {
        toast.success(`Risk cause ${isEditMode ? "updated" : "created"} successfully`);
        setFormData({ name: "", description: "", parent_id: null, is_active: true });
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? "update" : "create"} risk cause`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const parentRiskCauses = availableCauses
    .filter((p) => !p.parent_id)
    .map((p) => ({
      id: p.id,
      name: p.name
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Risk Cause" : "Create Risk Cause"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update risk cause" : "Add a new risk cause"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Risk Cause Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Root Cause Analysis, Technical Failure"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">Risk Cause Parent (Optional)</Label>
              <SelectField
                value={formData.parent_id || ""}
                onValueChange={(value) => setFormData({ ...formData, parent_id: value || null })}
                placeholder="Select risk cause parent"
                options={parentRiskCauses}
                disabled={isLoading}
                className="w-full"
              />
              <p className="text-muted-foreground text-xs">
                Select a parent if this is a sub-cause
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this risk cause"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
              />
            </div>
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
              {isLoading
                ? `${isEditMode ? "Updating" : "Creating"}...`
                : `${isEditMode ? "Update" : "Create"} Cause`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
