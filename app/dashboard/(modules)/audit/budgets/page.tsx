import { Button } from "@/components/ui/button";
import { Wallet, Plus } from "lucide-react";
import Link from "next/link";
import BudgetList from "./_components/budget-list";
import PageHeader from "@/components/page-header";

const BudgetsPage = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <BudgetList />
      </div>
    </div>
  );
};

export default BudgetsPage;
