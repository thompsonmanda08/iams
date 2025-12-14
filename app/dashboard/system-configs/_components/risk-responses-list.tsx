"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateRiskResponseDialog } from "./create-risk-response-dialog";
import { EditRiskResponseDialog } from "./edit-risk-response-dialog";
import { deleteRiskResponse, getRiskResponses } from "@/app/_actions/config-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomPagination } from "@/components/ui/pagination";

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

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    totalCount: 0,
    total_pages: 0
  });

  useEffect(() => {
    fetchResponses();
  }, [pagination.page, pagination.page_size]);

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const response = await getRiskResponses();
      if (response.success && response.data?.data) {
        setResponses(response.data?.data);
        setPagination((prev) => ({
          ...prev,
          totalCount: response.data?.data.length,
          total_pages: Math.ceil(response.data?.data.length / prev.page_size)
        }));
      }
    } catch (error) {
      toast.error("Failed to load risk responses");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePagination = (updates: Partial<typeof pagination>) => {
    setPagination((prev) => ({ ...prev, ...updates }));
  };

  const getPaginatedData = () => {
    const startIndex = (pagination.page - 1) * pagination.page_size;
    const endIndex = startIndex + pagination.page_size;
    return responses.slice(startIndex, endIndex);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
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
    <Card className="p-4">
      <div className="mb-6 flex items-center justify-between">
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

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              <TableHead>Response Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted mb-4 rounded-full p-4">
                      <Shield className="text-muted-foreground h-8 w-8" />
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      No risk responses configured
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center text-sm">
                      Get started by creating your first response strategies to organize and
                      classify risks.
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Response
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              getPaginatedData().map((response) => (
                <TableRow key={response.id}>
                  <TableCell>
                    <p className="text-foreground font-medium">{response.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {response.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(response.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(response.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(response)}
                        className="h-8 gap-1.5">
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(response)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {responses.length > 0 && (
          <CustomPagination
            pagination={pagination}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
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
    </Card>
  );
}
