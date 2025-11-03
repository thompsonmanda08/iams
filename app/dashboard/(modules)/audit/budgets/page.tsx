import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import BudgetList from "./_components/budget-list";
import PageHeader from "@/components/page-header";
import { getBudgetLines, getBudgets } from "@/app/_actions/audit-module-actions";

const BudgetsPage = async () => {
  const budgetsResponse = await getBudgets();
  const budgets = budgetsResponse?.data?.data || [];
  const budgetLinesMap: Record<string, any[]> = {};

  await Promise.all(
    budgets.map(async (budget: any) => {
      try {
        const linesResponse = await getBudgetLines(budget.id);
        const linesData = linesResponse?.data?.data?.data || linesResponse?.data?.data || [];
        budgetLinesMap[budget.id] = Array.isArray(linesData) ? linesData : [];
      } catch (error) {
        console.error(`Error fetching budget lines for ${budget.id}:`, error);
        budgetLinesMap[budget.id] = [];
      }
    })
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Budget Management"
              description="Track and manage all your organizational budgets"
              icon="Wallet"
            />
            <div className="flex gap-2">
              <Link href="/dashboard/audit/budgets/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Budget
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <BudgetList budgets={budgets} budgetLinesMap={budgetLinesMap} />
      </div>
    </div>
  );
};

export default BudgetsPage;
