"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Plus, Edit, MapPin, Trash2 } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState } from "@/lib/types";
import {
  createTown,
  deleteTown,
  getProvincesByCountry,
  getTownsByProvince,
  updateTown
} from "@/app/_actions/backoffice-actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { CustomPagination } from "@/components/ui/pagination";
import { PermissionButton } from "@/components/ui/permission-button";
import { MODULE_CODES } from "@/lib/constants/module-codes";

interface Country {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

interface Province {
  id: string;
  name: string;
  country_id: string;
  is_active: boolean;
}

interface Town {
  id: string;
  name: string;
  code?: string;
  province_id: string;
  province_name?: string;
  is_active: boolean;
}

interface TownsTabProps {
  countries: Country[];
}

export function TownsTab({ countries }: TownsTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [editingTown, setEditingTown] = useState<Town | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const page_size = parseInt(searchParams.get("page_size") || "10", 10);

  // Fetch provinces when country is selected
  const { data: provincesResponse, isLoading: loadingProvinces } = useQuery({
    queryKey: [QUERY_KEYS.PROVINCES, selectedCountry],
    queryFn: () => getProvincesByCountry(selectedCountry),
    enabled: !!selectedCountry
  });

  const provinces: Province[] = provincesResponse?.success ? provincesResponse.data?.data : [];

  // Fetch towns when province is selected
  const { data: townsResponse, isLoading: loadingTowns } = useQuery({
    queryKey: [QUERY_KEYS.TOWNS, selectedProvince, page, page_size],
    queryFn: () => getTownsByProvince(selectedProvince, { page, page_size }),
    enabled: !!selectedProvince
  });

  const towns: Town[] = townsResponse?.success ? townsResponse.data?.data : [];
  const pagination = (townsResponse?.pagination as {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  }) || {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  // Reset province when country changes
  useEffect(() => {
    setSelectedProvince("");
  }, [selectedCountry]);

  const getProvinceName = (provinceId: string) => {
    const province = provinces?.find((p) => p.id === provinceId);
    return province ? province.name : "Unknown";
  };

  const activeCountries = useMemo(() => countries?.filter((c) => c.is_active), [countries]);

  const activeProvinces = useMemo(() => provinces?.filter((p) => p.is_active), [provinces]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteTown(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      notify({ description: "Town deleted successfully", type: "success" });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOWNS] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to delete town", type: "error" });
    }
  });

  const handleDelete = (id: string) => {
    if (!confirm("Delete this town?")) return;
    deleteMutation.mutate(id);
  };

  const handlePageChange = ({
    page: newPage,
    page_size: newPageSize
  }: {
    page: number;
    page_size?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    if (newPageSize) {
      params.set("page_size", String(newPageSize));
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Card className="p-4">
      <div className="mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Towns / Cities</h3>
            <p className="text-muted-foreground text-sm">
              Manage towns and cities within each province
            </p>
          </div>
          <PermissionButton
            moduleCode={MODULE_CODES.BRANCH_MGMT}
            action="can_create"
            size="sm"
            onClick={() => setOpenModal(true)}
            disabled={!selectedCountry || !selectedProvince}>
            <Plus className="mr-2 h-4 w-4" />
            Add Town
          </PermissionButton>
        </div>

        <div className="flex max-w-lg gap-4">
          <SelectField
            label="Country"
            placeholder="Choose a country"
            options={activeCountries?.map((c) => ({ id: c.id, name: c.name }))}
            value={selectedCountry}
            onValueChange={setSelectedCountry}
          />
          <SelectField
            label="Province / State"
            placeholder={selectedCountry ? "Choose a province" : "Select country first"}
            options={activeProvinces?.map((p) => ({ id: p.id, name: p.name }))}
            value={selectedProvince}
            onValueChange={setSelectedProvince}
            disabled={!selectedCountry || loadingProvinces}
            isLoading={loadingProvinces}
          />
        </div>
      </div>

      {!selectedCountry ? (
        <div className="grid place-items-center p-12 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MapPin />
              </EmptyMedia>
              <EmptyTitle>Select a Country</EmptyTitle>
              <EmptyDescription>
                Please select a country from the dropdown above to get started.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : !selectedProvince ? (
        <div className="grid place-items-center p-12 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MapPin />
              </EmptyMedia>
              <EmptyTitle>Select a Province</EmptyTitle>
              <EmptyDescription>
                Please select a province from the dropdown above to view and manage its towns.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : loadingTowns ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {towns?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <MapPin />
                        </EmptyMedia>
                        <EmptyTitle>No Towns Yet</EmptyTitle>
                        <EmptyDescription>
                          You haven&apos;t created any towns for {getProvinceName(selectedProvince)}{" "}
                          yet. Get started by creating your first town.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <div className="flex gap-2">
                          <PermissionButton
                            moduleCode={MODULE_CODES.BRANCH_MGMT}
                            action="can_create"
                            size="sm"
                            onClick={() => setOpenModal(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Town
                          </PermissionButton>
                        </div>
                      </EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                towns?.map((town) => (
                  <TableRow key={town.id}>
                    <TableCell>
                      <span className="font-medium">{town.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground font-mono text-sm">
                        {town.code || "-"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          town.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-secondary text-secondary-foreground"
                        )}>
                        {town.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <PermissionButton
                          moduleCode={MODULE_CODES.BRANCH_MGMT}
                          action="can_edit"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTown(town);
                            setOpenModal(true);
                          }}
                          className="h-8 gap-1.5">
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </PermissionButton>
                        <PermissionButton
                          moduleCode={MODULE_CODES.BRANCH_MGMT}
                          action="can_delete"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(town.id)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </PermissionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && towns?.length > 0 && (
            <div className="mt-4">
              <CustomPagination
                pagination={{
                  page: pagination.page,
                  page_size: pagination.page_size,
                  total_pages: pagination.total_pages,
                  totalCount: pagination.total,
                  has_prev: pagination.has_prev,
                  has_next: pagination.has_next
                }}
                updatePagination={handlePageChange}
                allowSetPageSize={true}
                showDetails={true}
              />
            </div>
          )}
        </>
      )}

      <CreateTownDialog
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedProvince={selectedProvince}
        initialData={editingTown}
        setInitialData={setEditingTown}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOWNS] });
          router.refresh();
        }}
      />
    </Card>
  );
}

const TOWN_INITIAL_STATE = {
  name: "",
  province_id: "",
  code: ""
};

interface CreateTownDialogProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProvince: string;
  initialData: Town | null;
  setInitialData: React.Dispatch<React.SetStateAction<Town | null>>;
  onSuccess: () => void;
}

function CreateTownDialog({
  openModal,
  setOpenModal,
  selectedProvince,
  initialData,
  setInitialData,
  onSuccess
}: CreateTownDialogProps) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [formData, setFormData] = useState({
    ...TOWN_INITIAL_STATE,
    province_id: selectedProvince
  });

  useEffect(() => {
    if (openModal) {
      setFormData(
        initialData
          ? {
              name: initialData.name,
              province_id: initialData.province_id,
              code: (initialData as Town & { code?: string }).code || ""
            }
          : { ...TOWN_INITIAL_STATE, province_id: selectedProvince }
      );
      setError({ status: false, message: "" });
    }
  }, [openModal, initialData, selectedProvince]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = initialData
        ? await updateTown({
            id: initialData.id,
            name: data.name,
            province_id: data.province_id,
            code: data.code
          })
        : await createTown({
            name: data.name,
            province_id: data.province_id,
            code: data.code
          });

      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      notify({
        description: `Town ${initialData ? "updated" : "created"} successfully`,
        type: "success"
      });
      setOpenModal(false);
      setInitialData(null);
      setFormData({ ...TOWN_INITIAL_STATE, province_id: selectedProvince });
      onSuccess();
    },
    onError: (error: Error) => {
      setError({ status: true, message: error.message });
      notify({ description: error.message, type: "error" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.province_id) {
      setError({ status: true, message: "Name and province are required" });
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <Dialog
      open={openModal}
      modal={false}
      onOpenChange={(open) => {
        setOpenModal(open);
        if (!open) {
          setFormData({ ...TOWN_INITIAL_STATE, province_id: selectedProvince });
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
            label="Town / City Name"
            placeholder="e.g. Lusaka, Kitwe, Ndola"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
          />
          <Input
            label="Town Code"
            placeholder="e.g. LSK, CNC, NDL"
            value={formData.code}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, code: e.target.value }));
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
