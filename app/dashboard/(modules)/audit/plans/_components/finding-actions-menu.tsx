"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { handleClearFinding, handleUpdateFindingStatus } from "@/app/_actions/finding-actions";
import { notify } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface FindingActionsMenuProps {
  findingId: string;
  currentStatus: string;
  onEdit: () => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" }
];

export function FindingActionsMenu({
  findingId,
  currentStatus,
  onEdit,
  onRefresh
}: FindingActionsMenuProps) {
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Check if finding is editable
  const isEditable = ["OPEN", "IN_PROGRESS", "DRAFT"].includes(currentStatus);

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await handleUpdateFindingStatus(findingId, newStatus);
    },
    onSuccess: (response, newStatus) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKPAPER_FINDINGS] });
      notify({
        title: "Success",
        description: `Finding status updated to ${newStatus}`,
        type: "success"
      });
      onRefresh();
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update finding status",
        type: "error"
      });
    }
  });

  // Clear finding mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      await handleClearFinding(findingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKPAPER_FINDINGS] });
      notify({
        title: "Success",
        description: "Finding cleared successfully",
        type: "success"
      });
      setClearDialogOpen(false);
      onRefresh();
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to clear finding",
        type: "error"
      });
    }
  });

  const handleClear = async () => {
    clearMutation.mutate();
  };

  const handleStatusChange = (newStatus: string) => {
    if (!checkPermission(MODULE_CODES.AUDIT_WPS, "can_edit")) return;
    statusMutation.mutate(newStatus);
  };

  return (
    <>
      {isEditable && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!checkPermission(MODULE_CODES.AUDIT_WPS, "can_edit")) return;
              onEdit();
            }}
            className="gap-2"
            disabled={clearMutation.isPending || statusMutation.isPending}
            title="">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>

          <SelectField
            id="finding-status"
            value={currentStatus}
            onValueChange={handleStatusChange}
            options={STATUS_OPTIONS.map((option) => ({
              id: option.value,
              name: option.label,
              label: option.label
            }))}
            placeholder="Select status"
            isLoading={statusMutation.isPending}
            disabled={statusMutation.isPending || clearMutation.isPending}
            title=""
          />
        </div>
      )}

      {/* Clear button and confirmation modal - Hidden for now */}
      {/* <ConfirmationModal
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        type="delete"
        title="Clear Finding"
        description="Are you sure you want to clear all finding details? This will reset all fields to empty/default values."
        confirmText="Clear"
        cancelText="Cancel"
        isLoading={clearMutation.isPending}
        onConfirm={handleClear}
      /> */}
    </>
  );
}
