import { Badge } from "@/components/ui/badge";
import { BudgetStatus } from "@/types/budget";
import { Clock, CheckCircle2, FileSearch } from "lucide-react";

interface BudgetStatusBadgeProps {
  status: BudgetStatus;
}

export const BudgetStatusBadge = ({ status }: BudgetStatusBadgeProps) => {
  const config = {
    BUDGET_CREATION: {
      variant: "secondary" as const,
      label: "Draft",
      icon: Clock
    },
    UNDER_REVIEW: {
      variant: "warning" as const,
      label: "Under Review",
      icon: FileSearch
    },
    APPROVED: {
      variant: "success" as const,
      label: "Approved",
      icon: CheckCircle2
    }
  };

  const { variant, label, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1.5 px-3 py-1 font-medium">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
};
