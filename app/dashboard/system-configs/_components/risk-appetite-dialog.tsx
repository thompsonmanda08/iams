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
import { createRiskCause, updateRiskCause} from "@/app/_actions/config-actions";


type RiskAppetiteStatus = {
  id: string;
  name: string;
  description: string;
  value: number;
  created_at: string;
  updated_at: string;
};

type RiskAppetiteStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  appetite?: RiskAppetiteStatus | null;
};

export function RiskAppetiteStatusDialog({
  open,
  onOpenChange,
  onSuccess,
  appetite
}: RiskAppetiteStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    value: number;
  }>({
    name: "",
    description: "",
    value: 1
  });

  const isEditMode = !!appetite;

  useEffect(() => {
    if (open && appetite) {
      setFormData({
        name: appetite.name,
        description: appetite.description,
        value: appetite.value
      });
    } else if (!open) {
      setFormData({ name: "", description: "", value: 1 });
    }
  }, [open, appetite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Risk appetite status name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = isEditMode
        ? await updateRiskCause(appetite.id, formData)
        : await createRiskCause(formData);

      if (result.success) {
        toast.success(`Risk appetite status ${isEditMode ? "updated" : "created"} successfully`);
        setFormData({ name: "", description: "", value: 1 });
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? "update" : "create"} risk appetite status`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Risk Appetite Status" : "Create Risk Appetite Status"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update risk appetite status" : "Add a new risk appetite status"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Risk Appetite Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Above, Within, Below"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">
                Risk Appetite Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                min="1"
                max="10"
                placeholder="e.g., 1, 2, 3..."
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 1 })}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this risk appetite status"
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
                : `${isEditMode ? "Update" : "Create"} Appetite`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
