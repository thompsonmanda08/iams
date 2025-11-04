import PageHeader from "@/components/page-header";
import { getBudgetById, getBudgetLines } from "@/app/_actions/audit-module-actions";
import BudgetDetails from "../_components/budget-details";

const BudgetsPage = async ({ params }: { params: Promise<{ budgetId: string }> }) => {
  const { budgetId } = await params;

  const budgetsResponse = await getBudgetById(budgetId);
  const linesResponse = await getBudgetLines(budgetId);

  const budget = budgetsResponse?.data?.data;
  const budgetLines = linesResponse?.data?.data?.data || linesResponse?.data?.data || [];

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Budget Details"
              description="Manage budget items and track allocations"
              icon="ListCheck"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <BudgetDetails budget={budget} budgetLines={budgetLines} />
      </div>
    </div>
  );
};

export default BudgetsPage;
