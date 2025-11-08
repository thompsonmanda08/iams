"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { deleteRiskAppetiteStatus, getRiskAppetiteStatuses } from "@/app/_actions/config-actions";
import { RiskAppetiteStatusDialog } from "./risk-appetite-dialog";
import { Badge } from "@/components/ui/badge";

type RiskAppetiteStatus = {
  id: string;
  name: string;
  value: number;
  description: string;
  condition: string;
  created_at: string;
  updated_at: string;
};

export function RiskAppetiteStatusList() {
  const [causes, setCauses] = useState<RiskAppetiteStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    open: boolean;
    appetite: RiskAppetiteStatus | null;
  }>({ open: false, appetite: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    appetiteId: string | null;
    appetiteName: string | null;
  }>({ open: false, appetiteId: null, appetiteName: null });

  useEffect(() => {
    fetchAppetites();
  }, []);

  const fetchAppetites = async () => {
    setIsLoading(true);
    try {
      const response = await getRiskAppetiteStatuses();
      if (response.success && response.data?.data) {
        setCauses(response.data.data);
      } else {
        setCauses([]);
      }
    } catch (error) {
      console.error("Error fetching risk appetite status:", error);
      toast.error("Failed to load risk appetite status");
      setCauses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (appetite: RiskAppetiteStatus) => {
    setDeleteDialog({
      open: true,
      appetiteId: appetite.id,
      appetiteName: appetite.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.appetiteId) return;

    try {
      const response = await deleteRiskAppetiteStatus(deleteDialog.appetiteId);
      if (response.success) {
        toast.success("Risk Appetite Atatus deleted successfully");
        await fetchAppetites();
        setDeleteDialog({ open: false, appetiteId: null, appetiteName: null });
      } else {
        toast.error(response.message || "Failed to delete risk appetite status");
      }
    } catch (error) {
      console.error("Error deleting risk appetite status:", error);
      toast.error("Failed to delete risk appetite status");
    }
  };

  const handleCreateClick = () => {
    setDialog({ open: true, appetite: null });
  };

  const handleEditClick = (appetite: RiskAppetiteStatus) => {
    setDialog({ open: true, appetite });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Risk Appetite Status</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Define and manage risk appetite status for comprehensive risk management
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create a Risk Appetite Status
        </Button>
      </div>

      {!causes.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-4">
              <TrendingUp className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              No Risk Appetite Status Yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
              Get started by creating your first risk appetite Status to identify and manage
              potential risks.
            </p>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Risk Appetite Status
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {causes.map((appetite) => {
            return (
              <Card key={appetite.id} className="group transition-all">
                <CardHeader>
                  <div className="flex justify-between items-center gap-2">
                    <CardTitle>{appetite.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {`${appetite.condition} ${appetite.value}`}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {appetite.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(appetite)}
                      className="flex-1">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(appetite)}
                      className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <RiskAppetiteStatusDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open, appetite: null })}
        appetite={dialog?.appetite as any}
        onSuccess={fetchAppetites}
      />

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, appetiteId: null, appetiteName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Risk Appetite Status"
        description={`Are you sure you want to delete "${deleteDialog.appetiteName}"? This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}
