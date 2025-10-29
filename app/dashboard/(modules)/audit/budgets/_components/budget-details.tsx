import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockBudgets, mockBudgetItems } from "@/data/mockBudgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { BudgetStatusBadge } from "@/components/BudgetStatusBadge";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Wallet,
  DollarSign,
  Calendar,
  FileText,
  Package
} from "lucide-react";
import { BudgetItem } from "@/types/budget";
import { useToast } from "@/hooks/use-toast";

const BudgetDetails = () => {
  const { id, lineID } = useParams();
  const { toast } = useToast();
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const budget = mockBudgets.find((b) => b.id === id);
  const budgetLine = budget?.budgetLines.find((line) => line.id === lineID);
  const items = mockBudgetItems.filter((item) => item.budgetLineId === lineID);

  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemDate, setItemDate] = useState("");

  if (!budget || !budgetLine) {
    return (
      <div className="from-background via-background to-muted/30 flex min-h-screen items-center justify-center bg-gradient-to-br">
        <Card className="max-w-md p-8 text-center">
          <Wallet className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
          <h2 className="mb-4 text-2xl font-bold">Budget Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The budget or budget line you're looking for doesn't exist.
          </p>
          <Link to="/budget">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Budgets
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

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

  const totalItems = items.reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = budgetLine.amount - totalItems;

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemAmount(item.amount.toString());
    setItemDescription(item.description);
    setItemDate(item.date);
    setShowItemForm(true);
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: editingItem ? "Item Updated" : "Item Created",
      description: `Budget item has been ${editingItem ? "updated" : "created"} successfully.`
    });
    setShowItemForm(false);
    resetForm();
  };

  const resetForm = () => {
    setItemName("");
    setItemAmount("");
    setItemDescription("");
    setItemDate("");
    setEditingItem(null);
  };

  const handleCancelForm = () => {
    setShowItemForm(false);
    resetForm();
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
          <Link to="/budget" className="hover:text-primary transition-colors">
            Budgets
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{budget.name}</span>
        </nav>

        {/* Header */}
        <div className="animate-slide-up mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/budget">
              <Button variant="outline" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-foreground mb-2 text-4xl font-bold">Budget Details</h1>
              <p className="text-muted-foreground">Manage budget items and track allocations</p>
            </div>
          </div>
          {!showItemForm && (
            <Button onClick={() => setShowItemForm(true)} className="gap-2 shadow-lg" size="lg">
              <Plus className="h-5 w-5" />
              Add Item
            </Button>
          )}
        </div>

        {/* Budget Overview Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="animate-fade-in p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <Wallet className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground text-xl font-bold">Budget Information</h2>
                <p className="text-muted-foreground text-sm">Overview of the main budget</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <span className="text-muted-foreground text-sm font-medium">Budget Name</span>
                <span className="text-lg font-bold">{budget.name}</span>
              </div>
              <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <span className="text-muted-foreground text-sm font-medium">Total Amount</span>
                <span className="text-primary text-lg font-bold">
                  {formatCurrency(budget.amount)}
                </span>
              </div>
              <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <span className="text-muted-foreground text-sm font-medium">Status</span>
                <BudgetStatusBadge status={budget.status} />
              </div>
              <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <span className="text-muted-foreground text-sm font-medium">Period</span>
                <span className="text-sm font-semibold">
                  {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="animate-fade-in p-6 shadow-xl [animation-delay:100ms]">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <div className="bg-accent/10 rounded-lg p-2.5">
                <DollarSign className="text-accent h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground text-xl font-bold">
                  Budget Line: {budgetLine.name}
                </h2>
                <p className="text-muted-foreground text-sm">Departmental allocation details</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <span className="text-muted-foreground text-sm font-medium">Allocated Amount</span>
                <span className="text-accent text-lg font-bold">
                  {formatCurrency(budgetLine.amount)}
                </span>
              </div>
              <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <span className="text-muted-foreground text-sm font-medium">Items Total</span>
                <span className="text-lg font-bold">{formatCurrency(totalItems)}</span>
              </div>
              <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <span className="text-muted-foreground text-sm font-medium">Remaining</span>
                <span className="text-success text-lg font-bold">
                  {formatCurrency(remainingBudget)}
                </span>
              </div>
              <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                <span className="text-muted-foreground text-sm font-medium">Items Count</span>
                <span className="text-lg font-bold">{items.length}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Add/Edit Item Form */}
        {showItemForm && (
          <Card className="animate-slide-up border-primary/20 mb-8 border-2 p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <Package className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground text-2xl font-bold">
                  {editingItem ? "Edit Budget Item" : "Add New Budget Item"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {editingItem ? "Update item details" : "Create a new budget item"}
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmitItem}>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="itemName"
                    className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="text-muted-foreground h-4 w-4" />
                    Item Name
                  </Label>
                  <Input
                    id="itemName"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Office Equipment"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="itemAmount"
                    className="flex items-center gap-2 text-sm font-semibold">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    Amount
                  </Label>
                  <Input
                    id="itemAmount"
                    type="number"
                    value={itemAmount}
                    onChange={(e) => setItemAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-11"
                    required
                  />
                </div>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="itemDate"
                    className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    Date
                  </Label>
                  <Input
                    id="itemDate"
                    type="date"
                    value={itemDate}
                    onChange={(e) => setItemDate(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemDescription" className="text-sm font-semibold">
                    Description
                  </Label>
                  <Input
                    id="itemDescription"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Brief description"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleCancelForm}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Budget Items Table */}
        <Card className="animate-fade-in shadow-xl [animation-delay:200ms]">
          <div className="from-card to-muted/20 border-b bg-gradient-to-r p-6">
            <div className="flex items-center gap-3">
              <div className="bg-success/10 rounded-lg p-2.5">
                <Package className="text-success h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground text-2xl font-bold">Budget Items</h2>
                <p className="text-muted-foreground text-sm">Detailed list of all budget items</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-foreground font-bold">Item Name</TableHead>
                  <TableHead className="text-foreground font-bold">Amount</TableHead>
                  <TableHead className="text-foreground font-bold">Description</TableHead>
                  <TableHead className="text-foreground font-bold">Date</TableHead>
                  <TableHead className="text-foreground text-center font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
                      <h3 className="text-foreground mb-2 text-lg font-semibold">No items yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Add your first budget item to get started
                      </p>
                      <Button onClick={() => setShowItemForm(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Item
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/30 group transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}>
                      <TableCell className="font-semibold">{item.name}</TableCell>
                      <TableCell className="text-primary text-lg font-bold">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.description}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleEditItem(item)}
                            className="h-8 gap-1.5">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 gap-1.5">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BudgetDetails;
