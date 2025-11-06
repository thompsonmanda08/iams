"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateRiskResponseDialog } from "./create-risk-response-dialog";
import { EditRiskResponseDialog } from "./edit-risk-response-dialog";
import { deleteRiskResponse, getRiskResponses } from "@/app/_actions/config-actions";

type RiskResponse = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export function RiskResponsesList() {
  const [responses, setResponses] = useState<RiskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    response: RiskResponse | null;
  }>({ open: false, response: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    responseId: string | null;
    responseName: string | null;
  }>({ open: false, responseId: null, responseName: null });

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const response = await getRiskResponses();
      if (response.success && response.data?.data) {
        setResponses(response.data?.data);
      }
    } catch (error) {
      toast.error("Failed to load risk responses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (response: RiskResponse) => {
    setDeleteDialog({
      open: true,
      responseId: response.id,
      responseName: response.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.responseId) return;

    try {
      const response = await deleteRiskResponse(deleteDialog.responseId);
      if (response.success) {
        toast.success("Risk response deleted successfully");
        await fetchResponses();
        setDeleteDialog({ open: false, responseId: null, responseName: null });
      } else {
        toast.error(response.message || "Failed to delete risk response");
      }
    } catch (error) {
      toast.error("Failed to delete risk response");
    }
  };

  const handleEditClick = (response: RiskResponse) => {
    setEditDialog({ open: true, response });
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
          <h2 className="text-foreground text-2xl font-semibold">Risk Responses</h2>
          <p className="text-muted-foreground text-sm">
            Define response strategies for risk management
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Risk Strategy Response
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {responses.map((response) => (
          <Card key={response.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2">{response.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {response.description || "No description"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(response)}
                  className="flex-1">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(response)}
                  className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {responses.length === 0 && (
          <Card className="border-dashed md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-muted mb-4 rounded-full p-4">
                <Shield className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                No risk responses configured
              </h3>
              <p className="text-muted-foreground mb-6 text-center text-sm">
                Get started by creating your first response strategies to organize and classify
                risks.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Response
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateRiskResponseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchResponses}
      />

      {editDialog.response && (
        <EditRiskResponseDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, response: null })}
          response={editDialog.response}
          onSuccess={fetchResponses}
        />
      )}

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, responseId: null, responseName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Risk Response"
        description={`Are you sure you want to delete "${deleteDialog.responseName}"?`}
        type="delete"
      />
    </div>
  );
}
