"use client";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils/date-format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2, TrendingUp } from "lucide-react";
import { notify } from "@/lib/utils";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { deleteRiskAppetiteStatus, getRiskAppetiteStatuses } from "@/app/_actions/config-actions";
import { RiskAppetiteStatusDialog } from "./risk-appetite-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomPagination } from "@/components/ui/pagination";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import { PermissionButton } from "@/components/ui/permission-button";

type RiskAppetiteStatus = {
  id: string;
  name: string;
  value: number;
  description: string;
  condition: string;
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

export function RiskAppetiteStatusList() {
  const { checkPermission, hasPermission } = usePermissions();
  const [appetites, setAppetites] = useState<RiskAppetiteStatus[]>([]);
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
    fetchAppetites();
  }, [pagination.page, pagination.page_size]);

  const fetchAppetites = async () => {
    setIsLoading(true);
    try {
      const response = await getRiskAppetiteStatuses({
        page: pagination.page,
        page_size: pagination.page_size
      });
      if (response.success && response.data?.data) {
        setAppetites(response.data.data);
        // Update pagination from API response
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
        setAppetites([]);
      }
    } catch (error) {
      console.error("Error fetching risk appetite status:", error);
      notify({ description: "Failed to load risk appetite status", type: "error" });
      setAppetites([]);
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

  const handleDeleteClick = (appetite: RiskAppetiteStatus) => {
    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_delete")) return;
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
        notify({ description: "Risk Appetite Status deleted successfully", type: "success" });
        await fetchAppetites();
        setDeleteDialog({ open: false, appetiteId: null, appetiteName: null });
      } else {
        notify({ description: response.message || "Failed to delete risk appetite status", type: "error" });
      }
    } catch (error) {
      console.error("Error deleting risk appetite status:", error);
      notify({ description: "Failed to delete risk appetite status", type: "error" });
    }
  };

  const handleCreateClick = () => {
    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_create")) return;
    setDialog({ open: true, appetite: null });
  };

  const handleEditClick = (appetite: RiskAppetiteStatus) => {
    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_edit")) return;
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
    <Card className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Risk Appetite Status</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Define and manage risk appetite status for comprehensive risk management
          </p>
        </div>
        <PermissionButton
          moduleCode={MODULE_CODES.RISK_MODULE_CONFIGS}
          action="can_create"
          onClick={handleCreateClick}
          className="gap-2">
          <Plus className="h-4 w-4" />
          Create a Risk Appetite Status
        </PermissionButton>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              <TableHead>Status Name</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appetites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
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
                    <PermissionButton
                      moduleCode={MODULE_CODES.RISK_MODULE_CONFIGS}
                      action="can_create"
                      onClick={handleCreateClick}
                      className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Risk Appetite Status
                    </PermissionButton>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              appetites.map((appetite) => (
                <TableRow key={appetite.id}>
                  <TableCell>
                    <p className="text-foreground font-medium">{appetite.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {appetite.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{appetite.value}</span>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {appetite.description || "No description provided"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(appetite.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(appetite.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <PermissionButton
                        moduleCode={MODULE_CODES.RISK_MODULE_CONFIGS}
                        action="can_edit"
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(appetite)}
                        className="h-8 gap-1.5">
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </PermissionButton>
                      <PermissionButton
                        moduleCode={MODULE_CODES.RISK_MODULE_CONFIGS}
                        action="can_delete"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(appetite)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </PermissionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {appetites.length > 0 && (
          <CustomPagination
            pagination={pagination}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </div>

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
    </Card>
  );
}
