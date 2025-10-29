import { useState } from "react";
import { Link } from "react-router-dom";
import { mockBudgets } from "@/data/mockBudgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { BudgetStatusBadge } from "@/components/BudgetStatusBadge";
import { BudgetLinesList } from "@/components/BudgetLinesList";
import { Pencil, Trash2, Plus, Search, Wallet, TrendingUp, DollarSign } from "lucide-react";

const BudgetList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");

  const filteredBudgets = mockBudgets.filter((budget) =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBudgets = mockBudgets.length;
  const totalAmount = mockBudgets.reduce((sum, b) => sum + b.amount, 0);
  const approvedBudgets = mockBudgets.filter((b) => b.status === "APPROVED").length;

  const formatCurrency = (amount: number) => {
    return `ZMW ${amount.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
  };

  return (
    <div className="from-background via-background to-muted/30 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-muted-foreground animate-fade-in mb-6 flex items-center space-x-2 text-sm">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Budgets</span>
        </nav>

        {/* Header */}
        <div className="animate-slide-up mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-2 text-4xl font-bold">Budget Management</h1>
            <p className="text-muted-foreground">
              Track and manage all your organizational budgets
            </p>
          </div>
          <Link to="/budget/new">
            <Button size="lg" className="gap-2 shadow-lg transition-all hover:shadow-xl">
              <Plus className="h-5 w-5" />
              Create Budget
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-l-primary animate-slide-in border-l-4 p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Total Budgets</p>
                <p className="text-foreground text-3xl font-bold">{totalBudgets}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-3">
                <Wallet className="text-primary h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="border-l-accent animate-slide-in border-l-4 p-6 transition-all duration-300 [animation-delay:100ms] hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Total Allocated</p>
                <p className="text-foreground text-3xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="bg-accent/10 rounded-xl p-3">
                <DollarSign className="text-accent h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="border-l-success animate-slide-in border-l-4 p-6 transition-all duration-300 [animation-delay:200ms] hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Approved</p>
                <p className="text-foreground text-3xl font-bold">{approvedBudgets}</p>
              </div>
              <div className="bg-success/10 rounded-xl p-3">
                <TrendingUp className="text-success h-8 w-8" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="animate-fade-in shadow-xl [animation-delay:300ms]">
          <div className="from-card to-muted/20 border-b bg-gradient-to-r p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium">Show</span>
                  <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                    <SelectTrigger className="h-9 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground font-medium">entries</span>
                </div>
              </div>

              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  type="text"
                  placeholder="Search budgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-80 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-foreground font-bold">Budget Name</TableHead>
                  <TableHead className="text-foreground font-bold">Amount</TableHead>
                  <TableHead className="text-foreground font-bold">Budget Lines</TableHead>
                  <TableHead className="text-foreground font-bold">Status</TableHead>
                  <TableHead className="text-foreground font-bold">Start Date</TableHead>
                  <TableHead className="text-foreground font-bold">End Date</TableHead>
                  <TableHead className="text-foreground text-center font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget, index) => (
                  <TableRow
                    key={budget.id}
                    className="hover:bg-muted/30 group transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}>
                    <TableCell>
                      <Link
                        to={`/budget/${budget.id}/${budget.budgetLines[0]?.id}/details`}
                        className="text-primary hover:text-primary/80 flex items-center gap-2 font-semibold transition-colors">
                        {budget.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-lg font-bold">
                      {formatCurrency(budget.amount)}
                    </TableCell>
                    <TableCell>
                      <BudgetLinesList budgetLines={budget.budgetLines} />
                    </TableCell>
                    <TableCell>
                      <BudgetStatusBadge status={budget.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(budget.startDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(budget.endDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link to={`/budget/edit?id=${budget.id}`}>
                          <Button size="sm" variant="default" className="h-8 gap-1.5">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Link>
                        <Button size="sm" variant="destructive" className="h-8 gap-1.5">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBudgets.length === 0 && (
            <div className="p-12 text-center">
              <Wallet className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">No budgets found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first budget"}
              </p>
              {!searchTerm && (
                <Link to="/budget/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Budget
                  </Button>
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BudgetList;
