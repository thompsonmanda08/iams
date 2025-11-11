"use client";
import { useState } from "react";
import BackButton from "@/components/back-button";
import BudgetForm from "../_components/budget-form";
import PageHeader from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NewBudgetsPage = () => {
  const [selectedTab, setSelectedTab] = useState("budget");
  const [createdBudgetId, setCreatedBudgetId] = useState<string | null>(null);

  const handleBudgetCreated = (budgetId: string) => {
    setCreatedBudgetId(budgetId);
    // Switch to Budget Line tab after successful budget creation
    setSelectedTab("line");
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Create New Budget"
              description="Set up a new budget with budget lines"
              icon="Wallet"
            />
            <BackButton title="Back to Budgets" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto space-y-6 px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="budget">New Budget</TabsTrigger>
            <TabsTrigger value="line">
              Budget Line {createdBudgetId && "✓"}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="budget">
            <BudgetForm mode="budget" onBudgetCreated={handleBudgetCreated} />
          </TabsContent>
          <TabsContent value="line">
            <BudgetForm mode="line" budgetId={createdBudgetId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewBudgetsPage;
