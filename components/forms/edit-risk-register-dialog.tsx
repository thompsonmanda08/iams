"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getDepartments } from "@/app/_actions/config-actions";
import { updateRiskRegister } from "@/app/_actions/risk-module-actions";
import { RiskRegister } from "@/lib/types/risk-types";
import { SearchSelectField } from "../ui/search-select-field";

type Department = {
  id: string;
  name: string;
  code: string;
};

type EditRiskRegisterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  register: RiskRegister;
};

export default function EditRiskRegisterDialog({
  open,
  onOpenChange,
  register
}: EditRiskRegisterDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(
    register.start_date ? new Date(register.start_date) : undefined
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    register.due_date ? new Date(register.due_date) : undefined
  );
  const [formData, setFormData] = useState({
    department_id: register.department.id,
    name: register.name,
    status: register.status
  });

  useEffect(() => {
    if (open) {
      loadDepartments();
    }
  }, [open]);

  // Load functions
  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await getDepartments({ isActive: true });
      if (response.success && response.data?.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      toast.error("Error loading departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates are selected
    if (!startDate || !dueDate) {
      toast.error("Please select both start date and due date");
      return;
    }

    // Validate dates
    if (startDate > dueDate) {
      toast.error("Due date must be after start date");
      return;
    }

    setIsLoading(true);

    try {
      const response = await updateRiskRegister(register.id, {
        department_id: formData.department_id,
        name: formData.name,
        status: formData.status,
        start_date: format(startDate, "yyyy-MM-dd"),
        due_date: format(dueDate, "yyyy-MM-dd")
      });

      if (response.success) {
        toast.success("Risk register updated successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to update risk register");
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
            <DialogTitle>Edit Risk Register</DialogTitle>
            <DialogDescription>Update the risk register information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <SearchSelectField
                label="Department"
                required
                placeholder="Select department"
                options={departments}
                value={formData.department_id}
                onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                isLoading={loadingDepartments}
                isDisabled={isLoading || loadingDepartments}
                classNames={{ wrapper: "max-w-full" }}
              />
              <Input
                label="Name "
                id="name"
                placeholder="Enter risk register name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "OPEN" | "CLOSED" })
                }
                disabled={isLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>OPEN</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="CLOSED">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-500" />
                      <span>CLOSE</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                      disabled={isLoading}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                      disabled={isLoading || !startDate}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      disabled={(date) => {
                        if (isLoading) return true;
                        if (!startDate) return true;
                        return date < startDate;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
            <Button
              type="submit"
              disabled={
                isLoading || !formData.department_id || !formData.status || !startDate || !dueDate
              }>
              {isLoading ? "Updating..." : "Update Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
