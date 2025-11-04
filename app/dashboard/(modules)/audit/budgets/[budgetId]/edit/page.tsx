import PageHeader from "@/components/page-header";
import BudgetForm from "../../_components/budget-form";

const BudgetsUpdatePage = async ({ params }: { params: Promise<{ budgetId: string }> }) => {
  const { budgetId } = await params;
  console.log("PARAM", budgetId);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="[Budget Name]"
              description="ISO 27001 compliance monitoring and audit tracking"
              icon="Wallet"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <BudgetForm budgetId={budgetId} mode="budget" />
      </div>
    </div>
  );
};

export default BudgetsUpdatePage;
