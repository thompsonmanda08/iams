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
import { createRiskResponse, updateRiskResponse } from "@/app/_actions/config-actions";
import { SelectField } from "@/components/ui/select-field";

type RiskResponse = {
  id: string;
  parent_id: string;
  name: string;
  description: string;
};

type RiskCauseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  response?: RiskResponse | null;
};

export function RiskCauseDialog({ open, onOpenChange, onSuccess, response }: RiskCauseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_id: ""
  });

  const isEditMode = !!response;
  useEffect(() => {
    if (open && response) {
      setFormData({
        name: response.name,
        description: response.description,
        parent_id: response.parent_id
      });
    } else if (!open) {
      setFormData({ name: "", description: "", parent_id: "" });
    }
  }, [open, response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Response name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = isEditMode
        ? await updateRiskResponse(response.id, formData)
        : await createRiskResponse(formData);

      if (result.success) {
        toast.success(`Risk cause ${isEditMode ? "updated" : "created"} successfully`);
        setFormData({ name: "", description: "", parent_id: "" });
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

  const options = [
    { id: "extetret", name: "Risk" },
    { id: "extetretxcx", name: "Audit" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
                placeholder="e.g., Enhance, Exploit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause">Risk Cause Parent (Optional)</Label>
              <SelectField
                value={formData.parent_id}
                onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                placeholder="Select risk cause"
                options={options}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this response strategy"
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
