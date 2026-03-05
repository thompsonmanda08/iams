"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Loader2, GitBranch, Cable } from "lucide-react";
import { notify } from "@/lib/utils";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { deleteBusinessProcess, getBusinessProcesses } from "@/app/_actions/config-actions";
import { BusinessProcessesDialog } from "./business-processes-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomPagination } from "@/components/ui/pagination";

type BusinessProcess = {
  id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type PaginationState = {
  page: number;
  page_size: number;
  total_pages: number;
  total: number;
  has_prev: boolean;
  has_next: boolean;
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

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total_pages: 0,
    total: 0,
    has_prev: false,
    has_next: false
  });

  useEffect(() => {
    fetchProcesses();
  }, [pagination.page, pagination.page_size]);

  const fetchProcesses = async () => {
    setIsLoading(true);
    try {
      const response = await getBusinessProcesses({
        page: pagination.page,
        page_size: pagination.page_size
      });

      if (response.success && response.data?.data) {
        setProcesses(response.data.data);
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: response.data.pagination.page || prev.page,
            page_size: response.data.pagination.page_size || prev.page_size,
            total: response.data.pagination.total || 0,
            total_pages: response.data.pagination.total_pages || 0,
            has_prev: response.data.pagination.has_prev || false,
            has_next: response.data.pagination.has_next || false
          }));
        }
      } else {
        setProcesses([]);
      }
    } catch (error) {
      console.error("Error fetching business processes:", error);
      notify({ description: "Failed to load business processes", type: "error" });
      setProcesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePagination = (updates: { page?: number; page_size?: number }) => {
    setPagination((prev) => ({
      ...prev,
      page: updates.page || prev.page,
      page_size: updates.page_size || prev.page_size
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
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
        notify({ description: "Business process deleted successfully", type: "success" });
        await fetchProcesses();
        setDeleteDialog({ open: false, processId: null, processName: null });
      } else {
        notify({ description: response.message || "Failed to delete business process", type: "error" });
      }
    } catch (error) {
      console.error("Error deleting process:", error);
      notify({ description: "Failed to delete business process", type: "error" });
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
    <Card className="p-4">
      <div className="mb-6 flex items-center justify-between">
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

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              <TableHead>Process Name</TableHead>
              <TableHead>Parent Process</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!processes.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted mb-4 rounded-full p-4">
                      <GitBranch className="text-muted-foreground h-8 w-8" />
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      No Business Processes Yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
                      Get started by creating your first business process to track workflows and
                      operations.
                    </p>
                    <Button onClick={handleCreateClick} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Process
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              processes.map((process) => {
                const parentName = getParentProcessName(process.parent_id);
                return (
                  <TableRow key={process.id}>
                    <TableCell>
                      <p className="text-foreground font-medium">{process.name}</p>
                    </TableCell>
                    <TableCell>
                      {parentName ? (
                        <Badge variant="success" className="gap-1 text-xs">
                          <Cable className="h-3 w-3" />
                          {parentName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 text-sm text-gray-500">
                        {process.description || "No description provided"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(process.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(process.updated_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(process)}
                          className="h-8 gap-1.5">
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(process)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {processes.length > 0 && (
          <CustomPagination
            pagination={pagination}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </div>

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
    </Card>
  );
}
