import { Badge } from "@/components/ui/badge";
import { BudgetStatus } from "@/lib/types/audit-types";
import { Clock, CheckCircle2, FileSearch } from "lucide-react";

interface BudgetStatusBadgeProps {
  status: BudgetStatus;
}

export const BudgetStatusBadge = ({ status }: BudgetStatusBadgeProps) => {
  const config = {
    BUDGET_CREATION: {
      variant: "secondary" as const,
      label: "DRAFT",
      icon: Clock
    },
    UNDER_REVIEW: {
      variant: "warning" as const,
      label: "UNDER REVIEW",
      icon: FileSearch
    },
    APPROVED: {
      variant: "success" as const,
      label: "APPROVED",
      icon: CheckCircle2
    },
    DRAFT: {
      variant: "secondary" as const,
      label: "DRAFT",
      icon: Clock
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
