"use client";

import { useState } from "react";
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
import { Plus, Edit, Globe } from "lucide-react";
import { cn, notify } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState } from "@/lib/types";
import { createCountry, updateCountry, getCountries } from "@/app/_actions/backoffice-actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { CustomPagination } from "@/components/ui/pagination";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";

interface Country {
  id: string;
  name: string;
  iso2_code: string;
  region?: string;
  is_active: boolean;
}

interface CountriesTabProps {
  initialCountries: Country[];
  initialPagination?: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export function CountriesTab({ initialCountries, initialPagination }: CountriesTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const page_size = parseInt(searchParams.get("page_size") || "10", 10);

  // Use React Query with server-side data as initial data
  const { data: countriesResponse } = useQuery({
    queryKey: [QUERY_KEYS.COUNTRIES, page, page_size],
    queryFn: async () => {
      return getCountries({ page, page_size });
    },
    initialData: {
      success: true,
      data: initialCountries,
      pagination: initialPagination,
      message: ""
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const countries = countriesResponse?.success ? countriesResponse.data : [];
  const pagination = countriesResponse?.pagination ||
    initialPagination || {
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 0,
      has_next: false,
      has_prev: false
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Countries</h3>
          <p className="text-muted-foreground text-sm">
            Manage countries where your organization operates globally
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingCountry(null);
            setOpenModal(true);
          }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Country
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {countries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Globe />
                    </EmptyMedia>
                    <EmptyTitle>No Countries Yet</EmptyTitle>
                    <EmptyDescription>
                      You haven&apos;t created any countries yet. Get started by creating your first
                      country.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingCountry(null);
                          setOpenModal(true);
                        }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Country
                      </Button>
                    </div>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            countries.map((country: Country) => (
              <TableRow key={country.id}>
                <TableCell>
                  <span className="font-medium">{country.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground font-mono text-sm">
                    {country.iso2_code}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">{country.region || "N/A"}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      country.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-secondary text-secondary-foreground"
                    )}>
                    {country.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCountry(country);
                      setOpenModal(true);
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
      {pagination && countries.length > 0 && (
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

      <CreateOrUpdateCountryDialog
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={editingCountry}
        setInitialData={setEditingCountry}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COUNTRIES] });
          router.refresh();
        }}
      />
    </Card>
  );
}

const COUNTRY_INITIAL_STATE = {
  name: "",
  iso2_code: "",
  region: ""
};

interface CreateOrUpdateCountryDialogProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  initialData: Country | null;
  setInitialData: React.Dispatch<React.SetStateAction<Country | null>>;
  onSuccess: () => void;
}

function CreateOrUpdateCountryDialog({
  openModal,
  setOpenModal,
  initialData,
  setInitialData,
  onSuccess
}: CreateOrUpdateCountryDialogProps) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [formData, setFormData] = useState(
    initialData
      ? {
          name: initialData.name,
          iso2_code: initialData.iso2_code || "",
          region: initialData.region || ""
        }
      : COUNTRY_INITIAL_STATE
  );

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = initialData
        ? await updateCountry({
            id: initialData.id,
            name: data.name,
            code: data.iso2_code,
            region: data.region || undefined
          })
        : await createCountry({
            name: data.name,
            code: data.iso2_code,
            region: data.region || undefined
          });

      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      notify({
        description: `Country ${initialData ? "updated" : "created"} successfully`,
        type: "success"
      });
      setOpenModal(false);
      setInitialData(null);
      setFormData(COUNTRY_INITIAL_STATE);
      // Invalidate all country-related queries to trigger refetch
      onSuccess();
    },
    onError: (error: Error) => {
      setError({ status: true, message: error.message });
      notify({ description: error.message, type: "error" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.iso2_code) {
      setError({ status: true, message: "Name and ISO2 code are required" });
      return;
    }

    if (formData.iso2_code.length !== 2) {
      setError({ status: true, message: "ISO2 code must be exactly 2 characters" });
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
          setFormData(COUNTRY_INITIAL_STATE);
          setError({ status: false, message: "" });
          setInitialData(null);
        }
      }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Country" : "Create New Country"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Country Name"
            placeholder="e.g. United States, Canada, Zambia"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
          />
          <Input
            label="Country Code"
            placeholder="e.g. US, CA, ZM"
            value={formData.iso2_code}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, iso2_code: e.target.value.toUpperCase() }));
            }}
            maxLength={2}
            descriptionText="Country code has to be valid"
            required
          />
          <Input
            label="Region (Optional)"
            placeholder="e.g. North America, Southern Africa"
            value={formData.region}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, region: e.target.value }));
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
              disabled={saveMutation.isPending || !formData.name || !formData.iso2_code}
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
