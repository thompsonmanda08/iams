"use client";
import { useState } from "react";
import { CheckCircle2, Receipt } from "lucide-react";
import BackButton from "@/components/back-button";
import BudgetForm from "../_components/budget-form";
import PageHeader from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreatedLine {
  id?: string;
  name: string;
  category: string;
  allocated_amount: number;
  currency: string;
}

const formatAmount = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const NewBudgetsPage = () => {
  const [selectedTab, setSelectedTab] = useState("budget");
  const [createdBudgetId, setCreatedBudgetId] = useState<string | null>(null);
  const [createdLines, setCreatedLines] = useState<CreatedLine[]>([]);

  const handleBudgetCreated = (budgetId: string) => {
    setCreatedBudgetId(budgetId);
    setSelectedTab("line");
  };

  const handleLineCreated = (line: any) => {
    if (!line) return;
    setCreatedLines((prev) => [
      {
        id: line.id,
        name: line.name,
        category: line.category,
        allocated_amount: Number(line.allocated_amount) || 0,
        currency: line.currency || "ZMW"
      },
      ...prev
    ]);
  };

  const totalAllocated = createdLines.reduce((sum, l) => sum + l.allocated_amount, 0);

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
            <BackButton title="Back to Budgets" href="/dashboard/audit/budgets" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="budget">New Budget</TabsTrigger>
            <TabsTrigger value="line" className="gap-2">
              Budget Line
              {createdBudgetId && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="budget">
            <BudgetForm mode="budget" onBudgetCreated={handleBudgetCreated} />
          </TabsContent>
          <TabsContent value="line" className="space-y-6">
            <BudgetForm
              mode="line"
              budgetId={createdBudgetId || undefined}
              onLineCreated={handleLineCreated}
            />

            {createdLines.length > 0 && (
              <Card className="bg-card overflow-hidden p-0">
                <div className="border-border flex items-center justify-between border-b px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-foreground text-base font-semibold">
                        Created Budget Lines
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {createdLines.length} line{createdLines.length === 1 ? "" : "s"} added
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Total allocated</p>
                    <p className="text-foreground text-sm font-semibold">
                      {createdLines[0]?.currency} {formatAmount(totalAllocated)}
                    </p>
                  </div>
                </div>

                <ul className="divide-border divide-y">
                  {createdLines.map((line, idx) => (
                    <li
                      key={line.id ?? idx}
                      className="hover:bg-muted/40 flex items-center justify-between gap-4 px-6 py-3 transition">
                      <div className="flex min-w-0 items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-sm font-medium">
                            {line.name}
                          </p>
                          <Badge variant="outline" className="mt-1 text-[10px] uppercase">
                            {line.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
                        {line.currency} {formatAmount(line.allocated_amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewBudgetsPage;
