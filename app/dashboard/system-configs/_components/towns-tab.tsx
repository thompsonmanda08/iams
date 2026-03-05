"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Trash2, MapPin, Pencil } from "lucide-react";
import { cn, notify } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState, Pagination } from "@/lib/types";
import { createTown, updateTown, deleteTown } from "@/app/_actions/config-actions";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { CustomPagination } from "@/components/ui/pagination";
import { usePermissions } from "@/hooks/use-permissions";

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

interface TownsTabProps {
  initialTowns: Town[];
  provinces: Province[];
  pagination: Pagination;
}

export function TownsTab({ initialTowns, provinces, pagination }: TownsTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();
  const [towns, setTowns] = useState<Town[]>(initialTowns);
  const [openModal, setOpenModal] = useState(false);
  const [editingTown, setEditingTown] = useState<Town | null>(null);

  const getProvinceName = (provinceId: string) => {
    const province = provinces.find((p) => p.id === provinceId);
    return province ? province.name : "Unknown";
  };

  const deleteTownMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteTown(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      notify({ description: "Town deleted successfully", type: "success" });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to delete town", type: "error" });
    }
  });

  const handleDeleteTown = async (id: string) => {
    if (!checkPermission("BRANCH_MGMT", "can_delete")) return;
    if (true) {
      return notify({ description: "This action currently is disabled", type: "warning" });
    }
    deleteTownMutation.mutate(id);
  };

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "towns");

    if (page !== undefined) {
      params.set("page", String(page));
    }

    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`);
  };

  const customPaginationData = {
    page: pagination?.page,
    page_size: pagination?.page_size,
    total_pages: pagination?.total_pages,
    totalCount: pagination?.total,
    has_prev: pagination?.has_prev,
    has_next: pagination?.has_next
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Towns</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingTown(null);
            setOpenModal(true);
          }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Town
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Province</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {towns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPin />
                    </EmptyMedia>
                    <EmptyTitle>No Towns Yet</EmptyTitle>
                    <EmptyDescription>
                      You haven&apos;t created any towns yet. Get started by creating your first
                      town.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingTown(null);
                          setOpenModal(true);
                        }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Town
                      </Button>
                    </div>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            towns.map((town) => (
              <TableRow key={town.id}>
                <TableCell>
                  <span className="font-medium">{town.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {getProvinceName(town.province_id)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      town.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                    {town.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        if (true) {
                          return notify({ description: "This action currently is disabled", type: "warning" });
                        }
                        setEditingTown(town);
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
                        handleDeleteTown(town.id);
                        e.stopPropagation();
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5"
                      disabled={deleteTownMutation.isPending}>
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

      {/* Pagination */}
      {pagination && (
        <CustomPagination
          pagination={customPaginationData}
          updatePagination={updatePagination}
          allowSetPageSize={true}
          showDetails={true}
          className="mt-4 border-t"
        />
      )}

      <CreateOrUpdateTownDialog
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={editingTown}
        setInitialData={setEditingTown}
        provinces={provinces}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
        }}
      />
    </Card>
  );
}

const TOWN_INITIAL_STATE = {
  name: "",
  province_id: "",
  is_active: true
};

interface CreateOrUpdateTownDialogProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  initialData: Town | null;
  setInitialData: React.Dispatch<React.SetStateAction<Town | null>>;
  provinces: Province[];
  onSuccess: () => void;
}

function CreateOrUpdateTownDialog({
  openModal,
  setOpenModal,
  initialData,
  setInitialData,
  provinces,
  onSuccess
}: CreateOrUpdateTownDialogProps) {
  const { checkPermission } = usePermissions();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [formData, setFormData] = useState(initialData || TOWN_INITIAL_STATE);

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
        ? await updateTown({
            id: initialData.id,
            name: data.name,
            provinceId: data.province_id,
            isActive: data.is_active
          })
        : await createTown({
            name: data.name,
            provinceId: data.province_id,
            isActive: data.is_active
          });

      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      notify({ description: `Town ${initialData ? "updated" : "created"} successfully`, type: "success" });
      setOpenModal(false);
      setInitialData(null);
      setFormData(TOWN_INITIAL_STATE);
      onSuccess();
    },
    onError: (error: Error) => {
      setError({ status: true, message: error.message });
      notify({ description: error.message, type: "error" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (initialData) {
      if (!checkPermission("BRANCH_MGMT", "can_edit")) return;
    } else {
      if (!checkPermission("BRANCH_MGMT", "can_create")) return;
    }

    if (!formData.province_id) {
      setError({ status: true, message: "Please select a province" });
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
          setFormData(TOWN_INITIAL_STATE);
          setError({ status: false, message: "" });
          setInitialData(null);
        }
      }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Town" : "Create New Town"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Town Name"
            placeholder="e.g. Ndola, Kitwe"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
          />
          <SelectField
            label="Province"
            placeholder="Select a province"
            options={provinceOptions}
            value={formData.province_id}
            onValueChange={(province_id) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, province_id }));
            }}
          />
          {error.status && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" size="sm" variant="outline" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={saveMutation.isPending || !formData.name || !formData.province_id}
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
