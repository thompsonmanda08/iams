"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState } from "@/lib/types";
import { createProvince, updateProvince, deleteProvince } from "@/app/_actions/config-actions";
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
import { useRouter, useSearchParams } from "next/navigation";

interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
interface Province {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

interface ProvincesTabProps {
  initialProvinces: Province[];
  pagination: Pagination;
}

export function ProvincesTab({ initialProvinces, pagination }: ProvincesTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [provinces, setProvinces] = useState<Province[]>(initialProvinces);
  const [openModal, setOpenModal] = useState(false);
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);

  const deleteProvinceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteProvince(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Province deleted successfully");
      // Refetch provinces
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete province");
    }
  });

  const handleDeleteProvince = async (id: string) => {
    if (true) {
      return toast.warning("This action currently is disabled");
    }
    deleteProvinceMutation.mutate(id);
  };

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "provinces");

    if (page !== undefined) {
      params.set("page", String(page));
    }

    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      params.set("page", "1");
    }
  };

  const customPaginationData = {
    page: pagination.page,
    page_size: pagination.page_size,
    total_pages: pagination.total_pages,
    totalCount: pagination.total,
    has_prev: pagination.has_prev,
    has_next: pagination.has_next
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Provinces</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingProvince(null);
            setOpenModal(true);
          }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Province
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {provinces.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPin />
                    </EmptyMedia>
                    <EmptyTitle>No Provinces Yet</EmptyTitle>
                    <EmptyDescription>
                      You haven&apos;t created any provinces yet. Get started by creating your first
                      province.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingProvince(null);
                          setOpenModal(true);
                        }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Province
                      </Button>
                    </div>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            provinces.map((province) => (
              <TableRow key={province.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">{province.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{province.code}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      province.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    )}>
                    {province.is_active ? "Active" : "Inactive"}
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
                        setEditingProvince(province);
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
                        handleDeleteProvince(province.id);
                        e.stopPropagation();
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5"
                      disabled={deleteProvinceMutation.isPending}>
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
      {provinces.length > 0 && (
        <CustomPagination
          pagination={customPaginationData}
          updatePagination={updatePagination}
          allowSetPageSize={true}
          showDetails={true}
          className="mt-4 border-t"
        />
      )}

      <CreateOrUpdateProvinceDialog
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={editingProvince}
        setInitialData={setEditingProvince}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRANCHES] });
        }}
      />
    </Card>
  );
}

const PROVINCE_INITIAL_STATE = {
  name: "",
  code: "",
  is_active: true
};

interface CreateOrUpdateProvinceDialogProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  initialData: Province | null;
  setInitialData: React.Dispatch<React.SetStateAction<Province | null>>;
  onSuccess: () => void;
}

function CreateOrUpdateProvinceDialog({
  openModal,
  setOpenModal,
  initialData,
  setInitialData,
  onSuccess
}: CreateOrUpdateProvinceDialogProps) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [formData, setFormData] = useState(initialData || PROVINCE_INITIAL_STATE);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = initialData
        ? await updateProvince({ ...data, id: initialData.id, isActive: data.is_active })
        : await createProvince({ ...data, isActive: data.is_active });

      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      toast.success(`Province ${initialData ? "updated" : "created"} successfully`);
      setOpenModal(false);
      setInitialData(null);
      setFormData(PROVINCE_INITIAL_STATE);
      onSuccess();
    },
    onError: (error: Error) => {
      setError({ status: true, message: error.message });
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog
      open={openModal}
      onOpenChange={(open) => {
        setOpenModal(open);
        if (!open) {
          setFormData(PROVINCE_INITIAL_STATE);
          setError({ status: false, message: "" });
          setInitialData(null);
        }
      }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Province" : "Create New Province"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Province Name"
            placeholder="e.g. Lusaka, Copperbelt"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
          />
          <Input
            label="Province Code"
            placeholder="e.g. LSK, CPB"
            value={formData.code}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, code: e.target.value.toUpperCase() }));
            }}
            required
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
              disabled={saveMutation.isPending || !formData.name || !formData.code}
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
