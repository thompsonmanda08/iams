"use client";

import { useState, useMemo } from "react";
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
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState } from "@/lib/types";
import { createBranch, updateBranch, deleteBranch } from "@/app/_actions/config-actions";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";

interface Province {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
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
  town_id: string;
  province_id: string;
  address?: string;
  is_active: boolean;
}

interface BranchesTabProps {
  initialBranches: Branch[];
  provinces: Province[];
  towns: Town[];
}

export function BranchesTab({ initialBranches, provinces, towns }: BranchesTabProps) {
  const queryClient = useQueryClient();
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [openModal, setOpenModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const getProvinceName = (provinceId: string) => {
    const province = provinces.find((p) => p.id === provinceId);
    return province ? province.name : "Unknown";
  };

  const getTownName = (townId: string) => {
    const town = towns.find((t) => t.id === townId);
    return town ? town.name : "Unknown";
  };

  const deleteBranchMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteBranch(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Branch deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete branch");
    }
  });

  const handleDeleteBranch = async (id: string) => {
    // if (!confirm("Are you sure you want to delete this branch?")) return;
    if (true) {
      return toast.warning("This action currently is disabled");
    }
    deleteBranchMutation.mutate(id);
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Branches</h3>
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
                  <span className="text-sm">{getProvinceName(branch.province_id)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getTownName(branch.town_id)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">{branch.address || "N/A"}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      branch.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                    {branch.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        if (true) {
                          return toast.warning("This action currently is disabled");
                        }
                        setEditingBranch(branch);
                        setOpenModal(true);
                        e.stopPropagation();
                      }}
                      className="h-8 gap-1.5">
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        handleDeleteBranch(branch.id);
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

      <CreateOrUpdateBranchDialog
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={editingBranch}
        setInitialData={setEditingBranch}
        provinces={provinces}
        towns={towns}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
        }}
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
  towns: Town[];
  onSuccess: () => void;
}

function CreateOrUpdateBranchDialog({
  openModal,
  setOpenModal,
  initialData,
  setInitialData,
  provinces,
  towns,
  onSuccess
}: CreateOrUpdateBranchDialogProps) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [formData, setFormData] = useState(initialData || BRANCH_INITIAL_STATE);

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

  // Filter towns by selected province
  const townOptions = useMemo(
    () =>
      towns
        .filter((t) => t.is_active && t.province_id === formData.province_id)
        .map((town) => ({
          id: town.id,
          name: town.name
        })),
    [towns, formData.province_id]
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
            address: data.address,
            isActive: data.is_active
          });

      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      toast.success(`Branch ${initialData ? "updated" : "created"} successfully`);
      setOpenModal(false);
      setInitialData(null);
      setFormData(BRANCH_INITIAL_STATE);
      onSuccess();
    },
    onError: (error: Error) => {
      setError({ status: true, message: error.message });
      toast.error(error.message);
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
      <DialogContent className="sm:max-w-md">
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
              options={townOptions}
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
          {error.status && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
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
