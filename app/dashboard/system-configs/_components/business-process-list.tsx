"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Loader2, GitBranch, Cable } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { deleteBusinessProcess, getBusinessProcesses } from "@/app/_actions/config-actions";
import { BusinessProcessesDialog } from "./business-processes-dialog";

type BusinessProcess = {
  id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export function BusinessProcessList() {
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    open: boolean;
    process: BusinessProcess | null;
  }>({ open: false, process: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    processId: string | null;
    processName: string | null;
  }>({ open: false, processId: null, processName: null });

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    setIsLoading(true);
    try {
      const response = await getBusinessProcesses();
      if (response.success && response.data?.data) {
        setProcesses(response.data.data);
      } else {
        setProcesses([]);
      }
    } catch (error) {
      console.error("Error fetching business processes:", error);
      toast.error("Failed to load business processes");
      setProcesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (process: BusinessProcess) => {
    setDeleteDialog({
      open: true,
      processId: process.id,
      processName: process.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.processId) return;

    try {
      const response = await deleteBusinessProcess(deleteDialog.processId);
      if (response.success) {
        toast.success("Business process deleted successfully");
        await fetchProcesses();
        setDeleteDialog({ open: false, processId: null, processName: null });
      } else {
        toast.error(response.message || "Failed to delete business process");
      }
    } catch (error) {
      console.error("Error deleting process:", error);
      toast.error("Failed to delete business process");
    }
  };

  const handleCreateClick = () => {
    setDialog({ open: true, process: null });
  };

  const handleEditClick = (process: BusinessProcess) => {
    setDialog({ open: true, process });
  };

  // Get parent process name
  const getParentProcessName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = processes.find((p) => p.id === parentId);
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
          <h2 className="text-foreground text-2xl font-bold">Business Processes</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Define and manage your organization's business processes
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create a Business Process
        </Button>
      </div>

      {processes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-4">
              <GitBranch className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              No Business Processes Yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
              Get started by creating your first business process to track workflows and operations.
            </p>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Process
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {processes.map((process) => {
            const parentName = getParentProcessName(process.parent_id);

            return (
              <Card key={process.id} className="group transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 flex gap-4">
                      <CardTitle >{process.name}</CardTitle>
                      {parentName && (
                        <Badge variant="success" className="gap-1 text-xs">
                          <Cable className="h-3 w-3" />
                          {parentName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {process.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(process)}
                      className="flex-1">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(process)}
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

      <BusinessProcessesDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open, process: null })}
        process={dialog?.process}
        onSuccess={fetchProcesses}
      />

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, processId: null, processName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Business Process"
        description={`Are you sure you want to delete "${deleteDialog.processName}"? This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}
