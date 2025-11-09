"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Cable } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { deleteRiskCause, getRiskCauses } from "@/app/_actions/config-actions";
import { RiskCauseDialog } from "./risk-causes-dialog";

type RiskCause = {
  id: string;
  parent_id: string | null;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export function RiskCausesList() {
  const [causes, setCauses] = useState<RiskCause[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    open: boolean;
    cause: RiskCause | null;
  }>({ open: false, cause: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    causeId: string | null;
    causeName: string | null;
  }>({ open: false, causeId: null, causeName: null });

  useEffect(() => {
    fetchCauses();
  }, []);

  const fetchCauses = async () => {
    setIsLoading(true);
    try {
      const response = await getRiskCauses();
      if (response.success && response.data?.data) {
        setCauses(response.data.data);
      } else {
        setCauses([]);
      }
    } catch (error) {
      console.error("Error fetching risk causes:", error);
      toast.error("Failed to load risk causes");
      setCauses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (cause: RiskCause) => {
    setDeleteDialog({
      open: true,
      causeId: cause.id,
      causeName: cause.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.causeId) return;

    try {
      const response = await deleteRiskCause(deleteDialog.causeId);
      if (response.success) {
        toast.success("Risk cause deleted successfully");
        await fetchCauses();
        setDeleteDialog({ open: false, causeId: null, causeName: null });
      } else {
        toast.error(response.message || "Failed to delete risk cause");
      }
    } catch (error) {
      console.error("Error deleting risk cause:", error);
      toast.error("Failed to delete risk cause");
    }
  };

  const handleCreateClick = () => {
    setDialog({ open: true, cause: null });
  };

  const handleEditClick = (cause: RiskCause) => {
    setDialog({ open: true, cause });
  };

  // Get parent cause name
  const getParentCauseName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = causes.find((c) => c.id === parentId);
    return parent ? parent.name : "Unknown Parent";
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
          <h2 className="text-foreground text-2xl font-bold">Risk Causes</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Define and manage risk causes for comprehensive risk management
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create a Risk Cause
        </Button>
      </div>

      {causes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-4">
              <AlertCircle className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">No Risk Causes Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
              Get started by creating your first risk cause to identify and manage potential risks.
            </p>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Risk Cause
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {causes.map((cause) => {
            const parentName = getParentCauseName(cause.parent_id);
            return (
              <Card key={cause.id} className="group transition-all">
                <CardHeader>
                  <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <CardTitle>{cause.name}</CardTitle>
                    {parentName && (
                      <Badge variant="success" className="gap-1 text-xs">
                        <Cable className="h-3 w-3" />
                        {parentName}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {cause.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(cause)}
                      className="flex-1">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(cause)}
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

      <RiskCauseDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open, cause: null })}
        cause={dialog?.cause}
        onSuccess={fetchCauses}
      />

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, causeId: null, causeName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Risk Cause"
        description={`Are you sure you want to delete "${deleteDialog.causeName}"? This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}
