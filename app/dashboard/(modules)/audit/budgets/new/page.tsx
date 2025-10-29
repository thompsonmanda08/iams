"use client";
import { FileText } from "lucide-react";
import BudgetForm from "../_components/budget-form";
import PageHeader from "@/components/page-header";

const NewBudgetsPage = async () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="[Budget Name]"
              description="ISO 27001 compliance monitoring and audit tracking"
              Icon={FileText}
            />
            {/* <div className="flex gap-2">
              <Link href="/dashboard/audit/budgets/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Budget
                </Button>
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <BudgetForm />
      </div>
    </div>
  );
};

export default NewBudgetsPage;
