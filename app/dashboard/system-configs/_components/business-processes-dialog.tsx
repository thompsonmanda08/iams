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
import { Loader2 } from "lucide-react";
import {
  createBusinessProcess,
  updateBusinessProcess,
  getBusinessProcesses
} from "@/app/_actions/config-actions";
import { SelectField } from "@/components/ui/select-field";

type BusinessProcess = {
  id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type BusinessProcessesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  process?: BusinessProcess | null;
};

export function BusinessProcessesDialog({
  open,
  onOpenChange,
  onSuccess,
  process
}: BusinessProcessesDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [availableProcesses, setAvailableProcesses] = useState<BusinessProcess[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_id: ""
  });

  const isEditMode = !!process;

  useEffect(() => {
    if (open) {
      fetchBusinessProcesses();
    }
  }, [open]);

  const fetchBusinessProcesses = async () => {
    setLoadingProcesses(true);
    try {
      const response = await getBusinessProcesses();
      if (response.success && response.data?.data) {
        const processes = response.data.data.filter(
          (p: BusinessProcess) => !process || p.id !== process.id
        );
        setAvailableProcesses(processes);
      }
    } catch (error) {
      console.error("Error fetching processes:", error);
      toast.error("Failed to load business processes");
    } finally {
      setLoadingProcesses(false);
    }
  };

  useEffect(() => {
    if (open && process) {
      setFormData({
        name: process.name,
        description: process.description || "",
        parent_id: process.parent_id || ""
      });
    } else if (!open) {
      setFormData({ name: "", description: "", parent_id: "" });
    }
  }, [open, process]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Process name is required");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || "",
        parent_id: formData.parent_id || null
      };

      const result = isEditMode
        ? await updateBusinessProcess(process.id, payload)
        : await createBusinessProcess(payload);

      if (result.success) {
        toast.success(
          result.message || `Business process ${isEditMode ? "updated" : "created"} successfully`
        );
        setFormData({ name: "", description: "", parent_id: "" });
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(
          result.message || `Failed to ${isEditMode ? "update" : "create"} business process`
        );
      }
    } catch (error) {
      console.error("Error saving process:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const parentProcessOptions = availableProcesses
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
            <DialogTitle>
              {isEditMode ? "Edit Business Process" : "Create Business Process"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update business process information"
                : "Add a new business process to your organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Process Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., IT Operations, Security Management"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Process (Optional)</Label>
              <SelectField
                value={formData.parent_id}
                onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                placeholder={loadingProcesses ? "Loading processes..." : "Select parent process"}
                options={parentProcessOptions}
                disabled={isLoading || loadingProcesses}
                className="w-full"
              />
              <p className="text-muted-foreground text-xs">
                Select a parent if this is a sub-process
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this business process..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
                className="resize-none"
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
            <Button type="submit" disabled={isLoading || loadingProcesses}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? `${isEditMode ? "Updating" : "Creating"}...`
                : `${isEditMode ? "Update" : "Create"} Process`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
