"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2, MonitorCog } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { deleteEffectivenessLevel, getEffectivenessLevels } from "@/app/_actions/config-actions";
import { Badge } from "@/components/ui/badge";
import { ControlEffectivenessDialog } from "./control-effectiveness-dialog";

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

  useEffect(() => {
    fetchControls();
  }, []);

  const fetchControls = async () => {
    setIsLoading(true);
    try {
      const response = await getEffectivenessLevels();
      if (response.success && response.data?.data) {
        setControls(response.data.data);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      {!controls.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-4">
              <MonitorCog className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              No Control Effectiveness Yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
              Get started by creating your first control effectiveness level to evaluate and manage
              control measures.
            </p>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Control Effectiveness
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {controls.map((control) => {
            return (
              <Card key={control.id} className="group transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{control.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {control.value}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {control.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(control)}
                      className="flex-1">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(control)}
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
    </div>
  );
}
