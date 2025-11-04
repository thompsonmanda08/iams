import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BudgetForm from "./budget-form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BudgetEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string;
  mode?: "budget" | "line";
  onSuccess?: () => void;
}

export const BudgetEditModal = ({
  open,
  onOpenChange,
  budgetId,
  mode = "budget",
  onSuccess
}: BudgetEditModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] min-w-3xl p-0">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold">
            {mode === "budget" ? "Edit Budget" : "Edit Budget Line"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
          <BudgetForm budgetId={budgetId} mode={mode} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
