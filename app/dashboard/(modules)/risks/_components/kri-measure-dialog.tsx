import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { addKRIMeasurement } from "@/app/_actions/risk-module-actions";

export function KRIMeasureDialog({
  kri_id,
  isOpen,
  onClose
}: {
  kri_id: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [measure, setMeasure] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await addKRIMeasurement(kri_id, {
        measured_value: measure
      });
      if (response.success) {
        toast.success(response.message || "Measure added successfully");
        setMeasure(0);
        onClose();
      } else {
        toast.error(response.message || "Failed to add measure");
      }
    } catch (error) {
      toast.error("Failed to add measure");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update KRI Measure</DialogTitle>
          <DialogDescription>
            Please enter the new measure for the Key Risk Indicator (KRI).
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Input
            placeholder="Enter measure"
            type="number"
            value={measure}
            onChange={(e) => setMeasure(Number(e.target.value))}
            disabled={isSaving}
          />
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="destructive" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !measure}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
