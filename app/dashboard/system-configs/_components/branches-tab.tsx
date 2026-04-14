"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Trash2, MapPin, Pencil, TriangleAlert } from "lucide-react";
import { cn, notify } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { ErrorState } from "@/lib/types";
import { createBranch, updateBranch, deleteBranch } from "@/app/_actions/config-actions";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { CustomPagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import CustomAlert from "@/components/ui/custom-alert";
import { usePermissions } from "@/hooks/use-permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";

interface Province {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  towns?: Town[];
}

interface Town {
  id: string;
  name: string;
  province_id: string;
  is_active: boolean;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  town: Town["name"];
  province: Province["name"];
  town_id: string;
  province_id: string;
  address?: string;
  is_active?: boolean;
}

interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface BranchesTabProps {
  initialBranches: Branch[];
  provinces: Province[]; // EACH PROVINCE HAS TOWNS
  towns: Town[];
  pagination: Pagination;
}

export function BranchesTab({ initialBranches, provinces, towns, pagination }: BranchesTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [openModal, setOpenModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  // GET TOWNS FROM SELECTED PROVINCE

  const deleteBranchMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteBranch(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      notify({ description: "Branch deleted successfully", type: "success" });
      setOpenModal(false);
      setDeleteDialogOpen(false);
      setOpenModal(false);
      setBranchToDelete(null);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to delete branch", type: "error" });
    }
  });

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "branches");

    if (page !== undefined) {
      params.set("page", String(page));
    }

    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    setBranches(initialBranches);
  }, [initialBranches]);

  const customPaginationData = {
    page: pagination.page,
    page_size: pagination.page_size,
    total_pages: pagination.total_pages,
    totalCount: pagination.total,
    has_prev: pagination.has_prev,
    has_next: pagination.has_next
  };

  const handleDeleteConfirm = async () => {
    if (!branchToDelete?.id) return;
    deleteBranchMutation.mutate(branchToDelete?.id);
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Branches</h3>
        <Button
          size="sm"
          onClick={() => {
            if (!checkPermission("BRANCH_MGMT", "can_create")) return;
            setEditingBranch(null);
            setOpenModal(true);
          }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Province</TableHead>
            <TableHead>Town</TableHead>
            <TableHead>Physical Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPin />
                    </EmptyMedia>
                    <EmptyTitle>No Branches Yet</EmptyTitle>
                    <EmptyDescription>
                      You haven&apos;t created any branches yet. Get started by creating your first
                      branch.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingBranch(null);
                          setOpenModal(true);
                        }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Branch
                      </Button>
                    </div>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">{branch.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{branch.code}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{branch.province || "--"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{branch.town || "--"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">{branch.address || "N/A"}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={branch.is_active ? "ACTIVE" : "INACTIVE"} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        if (!checkPermission("BRANCH_MGMT", "can_edit")) return;
                        setEditingBranch(branch);
                        setOpenModal(true);
                        e.stopPropagation();
                      }}
                      className="h-8 gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        if (!checkPermission("BRANCH_MGMT", "can_delete")) return;
                        setBranchToDelete(branch);
                        setDeleteDialogOpen(true);
                        e.stopPropagation();
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5"
                      disabled={deleteBranchMutation.isPending}>
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

      {branches.length > 0 && (
        <CustomPagination
          pagination={customPaginationData}
          updatePagination={updatePagination}
          allowSetPageSize={true}
          showDetails={true}
          className="mt-4 border-t"
        />
      )}

      <CreateOrUpdateBranchDialog
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={editingBranch}
        setInitialData={setEditingBranch}
        provinces={provinces}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
        }}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${branchToDelete?.name || "Branch"}`}
        description="Are you sure you want to delete this department? This action cannot be undone and may affect related data."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteBranchMutation.isPending}
      />
    </Card>
  );
}

const BRANCH_INITIAL_STATE = {
  name: "",
  code: "",
  province_id: "",
  town_id: "",
  address: "",
  is_active: true
};

interface CreateOrUpdateBranchDialogProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  initialData: Branch | null;
  setInitialData: React.Dispatch<React.SetStateAction<Branch | null>>;
  provinces: Province[];
  onSuccess: () => void;
}

function CreateOrUpdateBranchDialog({
  openModal,
  setOpenModal,
  initialData,
  setInitialData,
  provinces, // The selected province will have towns
  onSuccess
}: CreateOrUpdateBranchDialogProps) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [formData, setFormData] = useState(BRANCH_INITIAL_STATE);

  const towns = useMemo(() => {
    return (
      provinces
        .find((p) => p.id === formData?.province_id)
        ?.towns?.map((t) => ({ id: t.id, name: t.name })) || []
    );
  }, [formData?.province_id, provinces]);

  // PRE-POPULATE FORM DATA - Fixed to respond to prop changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        province_id: initialData.province_id || "",
        town_id: initialData.town_id || "",
        address: initialData.address || "",
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      });
    } else {
      setFormData(BRANCH_INITIAL_STATE);
    }
    setError({ status: false, message: "" });
  }, [initialData, openModal]);

  // Reset form when modal closes
  useEffect(() => {
    if (!openModal) {
      // Small delay to allow animation to complete
      const timer = setTimeout(() => {
        setFormData(BRANCH_INITIAL_STATE);
        setError({ status: false, message: "" });
        setInitialData(null);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [openModal, setInitialData]);

  const provinceOptions = useMemo(
    () =>
      provinces
        .filter((p) => p.is_active)
        .map((province) => ({
          id: province.id,
          name: province.name
        })),
    [provinces]
  );

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = initialData
        ? await updateBranch({
            id: initialData.id,
            name: data.name,
            code: data.code,
            townId: data.town_id,
            provinceId: data.province_id,
            address: data.address,
            isActive: data.is_active
          })
        : await createBranch({
            name: data.name,
            code: data.code,
            townId: data.town_id,
            provinceId: data.province_id,
            address: data.address
            // isActive: data.is_active
          });

      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      notify({ description: `Branch ${initialData ? "updated" : "created"} successfully`, type: "success" });
      setOpenModal(false);
      setInitialData(null);
      setFormData(BRANCH_INITIAL_STATE);
      onSuccess();
    },
    onError: (error: Error) => {
      setError({ status: true, message: error.message });
      notify({ description: error.message, type: "error" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.province_id) {
      setError({ status: true, message: "Please select a province" });
      return;
    }

    if (!formData.town_id) {
      setError({ status: true, message: "Please select a town" });
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <Dialog
      open={openModal}
      onOpenChange={(open) => {
        setOpenModal(open);
        if (!open) {
          setFormData(BRANCH_INITIAL_STATE);
          setError({ status: false, message: "" });
          setInitialData(null);
        }
      }}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Branch" : "Create New Branch"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Branch Name"
            placeholder="e.g. Headquarters, Ndola Branch"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
          />
          <Input
            label="Branch Code"
            placeholder="e.g. HQ, NDL"
            value={formData.code}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, code: e.target.value.toUpperCase() }));
            }}
            required
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Province"
              placeholder="Select a province"
              className="w-full"
              options={provinceOptions}
              value={formData.province_id}
              onValueChange={(province_id) => {
                setError({ status: false, message: "" });
                // Reset town when province changes
                setFormData((c) => ({ ...c, province_id, town_id: "" }));
              }}
            />
            <SelectField
              label="Town"
              placeholder="Select a town"
              className="w-full"
              options={towns}
              value={formData.town_id}
              onValueChange={(town_id) => {
                setError({ status: false, message: "" });
                setFormData((c) => ({ ...c, town_id }));
              }}
              disabled={!formData.province_id}
            />
          </div>
          <Input
            label="Physical Address"
            placeholder="e.g. 7th Floor, 4th Street Ibex Hill"
            value={formData.address}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, address: e.target.value }));
            }}
          />
          {initialData && (
            <div className="flex items-center space-x-2 rounded-lg border bg-slate-50/5 p-4 py-2 transition-colors hover:bg-slate-50">
              <Checkbox
                id="is_active_branch"
                checked={Boolean(formData.is_active)}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: Boolean(checked) }))
                }
                className="text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-offset-2"
              />
              <Label
                htmlFor="is_active_branch"
                className="flex w-full flex-1 cursor-pointer flex-col items-start gap-0 text-sm font-medium select-none">
                Active
                <span className="text-muted-foreground block text-xs font-normal">
                  Set the active status of this branch.
                </span>
              </Label>
            </div>
          )}
          {error.status && (
            <CustomAlert type="error" message={error.message} Icon={TriangleAlert} />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={saveMutation.isPending}
                onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={
                saveMutation.isPending ||
                !formData.name ||
                !formData.code ||
                !formData.province_id ||
                !formData.town_id
              }
              isLoading={saveMutation.isPending}
              loadingText="Saving...">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
