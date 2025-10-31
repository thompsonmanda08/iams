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
import { Building2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getBranches } from "@/app/_actions/config-actions";
import { updateRiskRegister } from "@/app/_actions/risk-module-actions";
import { RiskRegister } from "@/lib/types/risk-types";

type Branch = {
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
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(
    register.start_date ? new Date(register.start_date) : undefined
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    register.due_date ? new Date(register.due_date) : undefined
  );
  const [formData, setFormData] = useState({
    branch_id: register.branch.id,
    name: register.name,
    status: register.status
  });

  useEffect(() => {
    if (open) {
      loadBranches();
    }
  }, [open]);

  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await getBranches({ isActive: true });
      if (response.success && response.data?.data) {
        setBranches(response.data?.data);
      } else {
        toast.error("Failed to load branches");
      }
    } catch (error) {
      toast.error("Error loading branches");
    } finally {
      setLoadingBranches(false);
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
        branch_id: formData.branch_id,
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
              <Label htmlFor="branch">
                Branch <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                disabled={isLoading || loadingBranches}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch">
                    {loadingBranches
                      ? "Loading branches..."
                      : formData.branch_id
                        ? branches.find((b) => b.id === formData.branch_id)?.name
                        : "Select branch"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {branches.length === 0 ? (
                    <div className="text-muted-foreground p-2 text-sm">No branches available</div>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="text-muted-foreground h-4 w-4" />
                          <span>{branch.name}</span>
                          <span className="text-muted-foreground text-xs">({branch.code})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
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
                isLoading || !formData.branch_id || !formData.status || !startDate || !dueDate
              }>
              {isLoading ? "Updating..." : "Update Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
