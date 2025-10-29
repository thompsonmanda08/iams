import { Badge } from "@/components/ui/badge";
import { BudgetLine } from "@/lib/types/audit-types";

interface BudgetLinesListProps {
  budgetLines: BudgetLine[];
}

export const BudgetLinesList = ({ budgetLines }: BudgetLinesListProps) => {
  const displayLines = budgetLines.slice(0, 2);
  const remainingCount = budgetLines.length - 2;

  return (
    <div className="flex flex-wrap gap-2">
      {displayLines.map((line) => (
        <Badge
          key={line.id}
          variant="outline"
          className="bg-primary/5 border-primary/20 text-primary px-2.5 py-1 font-medium">
          {line.name}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="bg-muted border-border px-2.5 py-1 font-medium">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};
