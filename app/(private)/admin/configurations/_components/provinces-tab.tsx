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
import { Plus, Edit, MapPin } from "lucide-react";
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
import {
  createProvince,
  getProvincesByCountry
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
  country_name?: string;
  is_active: boolean;
}

interface ProvincesTabProps {
  countries: Country[];
}

export function ProvincesTab({ countries }: ProvincesTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const page_size = parseInt(searchParams.get("page_size") || "10", 10);

  // Fetch provinces when country is selected
  const {
    data: provincesResponse,
    isLoading
  } = useQuery({
    queryKey: [QUERY_KEYS.PROVINCES, selectedCountry, page, page_size],
    queryFn: () => getProvincesByCountry(selectedCountry, { page, page_size }),
    enabled: !!selectedCountry
  });

  const provinces: Province[] = provincesResponse?.success ? provincesResponse.data : [];
  const pagination = (provincesResponse?.pagination as {
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

  const getCountryName = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId);
    return country ? country.name : "Unknown";
  };

  const activeCountries = useMemo(
    () => countries.filter((c) => c.is_active),
    [countries]
  );

  const handlePageChange = ({ page: newPage, page_size: newPageSize }: { page: number; page_size?: number }) => {
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
            <h3 className="text-lg font-semibold">Provinces / States</h3>
            <p className="text-muted-foreground text-sm">
              Manage provinces and states within each country
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (!selectedCountry) {
                toast.warning("Please select a country first");
                return;
              }
              setEditingProvince(null);
              setOpenModal(true);
            }}
            disabled={!selectedCountry}>
            <Plus className="mr-2 h-4 w-4" />
            Add Province
          </Button>
        </div>

        <div className="w-full max-w-sm">
          <SelectField
            label="Select Country"
            placeholder="Choose a country"
            options={activeCountries.map((c) => ({ id: c.id, name: c.name }))}
            value={selectedCountry}
            onValueChange={setSelectedCountry}
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
                Please select a country from the dropdown above to view and manage its provinces.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                          You haven&apos;t created any provinces for {getCountryName(selectedCountry)}{" "}
                          yet. Get started by creating your first province.
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
                      <span className="font-medium">{province.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {getCountryName(province.country_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          province.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-secondary text-secondary-foreground"
                        )}>
                        {province.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toast.warning("Update functionality coming soon");
                        }}
                        className="h-8 gap-1.5">
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && provinces.length > 0 && (
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

      <CreateProvinceDialog
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedCountry={selectedCountry}
        countries={activeCountries}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROVINCES] });
          router.refresh();
        }}
      />
    </Card>
  );
}

const PROVINCE_INITIAL_STATE = {
  name: "",
  country_id: ""
};

interface CreateProvinceDialogProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCountry: string;
  countries: Country[];
  onSuccess: () => void;
}

function CreateProvinceDialog({
  openModal,
  setOpenModal,
  selectedCountry,
  countries,
  onSuccess
}: CreateProvinceDialogProps) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [formData, setFormData] = useState({
    ...PROVINCE_INITIAL_STATE,
    country_id: selectedCountry
  });

  // Update country_id when selectedCountry changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, country_id: selectedCountry }));
  }, [selectedCountry]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await createProvince({
        name: data.name,
        country_id: data.country_id
      });

      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Province created successfully");
      setOpenModal(false);
      setFormData({ ...PROVINCE_INITIAL_STATE, country_id: selectedCountry });
      onSuccess();
    },
    onError: (error: Error) => {
      setError({ status: true, message: error.message });
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.country_id) {
      setError({ status: true, message: "Name and country are required" });
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
          setFormData({ ...PROVINCE_INITIAL_STATE, country_id: selectedCountry });
          setError({ status: false, message: "" });
        }
      }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Province</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField
            label="Country"
            placeholder="Select a country"
            options={countries.map((c) => ({ id: c.id, name: c.name }))}
            value={formData.country_id}
            onValueChange={(country_id) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, country_id }));
            }}
          />
          <Input
            label="Province / State Name"
            placeholder="e.g. California, Copperbelt, Ontario"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
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
              disabled={saveMutation.isPending || !formData.name || !formData.country_id}
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
