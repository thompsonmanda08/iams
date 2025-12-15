"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2, MonitorCog } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { deleteEffectivenessLevel, getEffectivenessLevels } from "@/app/_actions/config-actions";
import { Badge } from "@/components/ui/badge";
import { ControlEffectivenessDialog } from "./control-effectiveness-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomPagination } from "@/components/ui/pagination";

type ControlEffectiveness = {
  id: string;
  name: string;
  value: number;
  description: string;
  created_at: string;
  updated_at: string;
};

export function ControlEffectivenessList() {
  const [controls, setControls] = useState<ControlEffectiveness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    open: boolean;
    control: ControlEffectiveness | null;
  }>({ open: false, control: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    controlId: string | null;
    controlName: string | null;
  }>({ open: false, controlId: null, controlName: null });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    totalCount: 0,
    total_pages: 0
  });

  useEffect(() => {
    fetchControls();
  }, [pagination.page, pagination.page_size]);

  const fetchControls = async () => {
    setIsLoading(true);
    try {
      const response = await getEffectivenessLevels();
      if (response.success && response.data?.data) {
        setControls(response.data.data);
        setPagination((prev) => ({
          ...prev,
          totalCount: response.data.data.length,
          total_pages: Math.ceil(response.data.data.length / prev.page_size)
        }));
      } else {
        setControls([]);
      }
    } catch (error) {
      console.error("Error fetching control effectiveness:", error);
      toast.error("Failed to load control effectiveness");
      setControls([]);
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
    return controls.slice(startIndex, endIndex);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleDeleteClick = (control: ControlEffectiveness) => {
    setDeleteDialog({
      open: true,
      controlId: control.id,
      controlName: control.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.controlId) return;

    try {
      const response = await deleteEffectivenessLevel(deleteDialog.controlId);
      if (response.success) {
        toast.success("Control effectiveness deleted successfully");
        await fetchControls();
        setDeleteDialog({ open: false, controlId: null, controlName: null });
      } else {
        toast.error(response.message || "Failed to delete control effectiveness");
      }
    } catch (error) {
      console.error("Error deleting control effectiveness:", error);
      toast.error("Failed to delete control effectiveness");
    }
  };

  const handleCreateClick = () => {
    setDialog({ open: true, control: null });
  };

  const handleEditClick = (control: ControlEffectiveness) => {
    setDialog({ open: true, control });
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
          <h2 className="text-foreground text-2xl font-bold">Control Effectiveness</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Define and manage control effectiveness levels for comprehensive risk management
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Control Effectiveness
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              <TableHead>Effectiveness Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {controls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted mb-4 rounded-full p-4">
                      <MonitorCog className="text-muted-foreground h-8 w-8" />
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      No Control Effectiveness Yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
                      Get started by creating your first control effectiveness level to evaluate and
                      manage control measures.
                    </p>
                    <Button onClick={handleCreateClick} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Control Effectiveness
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              getPaginatedData().map((control) => (
                <TableRow key={control.id}>
                  <TableCell>
                    <p className="text-foreground font-medium">{control.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {control.value}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {control.description || "No description provided"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(control.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(control.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(control)}
                        className="h-8 gap-1.5">
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(control)}
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
        {controls.length > 0 && (
          <CustomPagination
            pagination={pagination}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </div>

      <ControlEffectivenessDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open, control: null })}
        control={dialog?.control}
        onSuccess={fetchControls}
      />

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, controlId: null, controlName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Control Effectiveness"
        description={`Are you sure you want to delete "${deleteDialog.controlName}"? This action cannot be undone.`}
        type="delete"
      />
    </Card>
  );
}
