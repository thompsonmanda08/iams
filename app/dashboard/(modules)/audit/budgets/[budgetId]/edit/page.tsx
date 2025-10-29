"use client";
import BudgetForm from "../../_components/budget-form";

const BudgetsUpdatePage = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <BudgetForm />
      </div>
    </div>
  );
};

export default BudgetsUpdatePage;
