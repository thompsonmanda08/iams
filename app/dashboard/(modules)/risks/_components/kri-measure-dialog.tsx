import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { cn, notify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { addKRIMeasurement } from "@/app/_actions/risk-module-actions";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils/date-format";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

export function KRIMeasureDialog({
  kri_id,
  isOpen,
  onClose
}: {
  kri_id: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    measurement_date: undefined as Date | undefined,
    measured_value: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();
  const { checkPermission, hasPermission } = usePermissions();

  const handleSave = async () => {
    if (!checkPermission(MODULE_CODES.KRI_DASHBOARD, "can_create")) return;
    setIsSaving(true);
    try {
      const response = await addKRIMeasurement(kri_id, {
        measured_value: formData.measured_value,
        measurement_date: formData.measurement_date
      });
      if (response.success) {
        notify({ description: response.message || "Measure added successfully", type: "success" });
        onClose();
        setFormData({ measured_value: 0, measurement_date: undefined });
        queryClient.invalidateQueries(["kri-measurements", kri_id] as any);
      } else {
        notify({ description: response.message || "Failed to add measure", type: "error" });
      }
    } catch (error) {
      notify({ description: "Failed to add measure", type: "error" });
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
        <div className="mt-4 space-y-4">
          <Input
            label="Measure"
            required
            placeholder="Enter measure"
            type="number"
            value={formData.measured_value}
            onChange={(e) => setFormData({ ...formData, measured_value: e.target.valueAsNumber })}
            disabled={isSaving}
          />

          <div className="space-y-1">
            <Label htmlFor="date-of-measure">
              Date of measure<span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-of-measure"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.measurement_date && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.measurement_date ? (
                    formatDate(formData.measurement_date)
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.measurement_date}
                  onSelect={(date) => setFormData({ ...formData, measurement_date: date })}
                  fromDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="destructive" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.measured_value || !formData.measurement_date}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
