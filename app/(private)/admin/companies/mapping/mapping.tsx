"use client";
import { useState, useEffect } from "react";
import { Plus, X, MapPin, Trash2, Building2 } from "lucide-react";
import { Company, Country, Province, Town } from "@/lib/types";
import { notify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrganizations,
  getCountries,
  getProvincesByCountry,
  getTownsByProvince,
  getCompanyLocations,
  createCompanyLocation,
  deleteCompanyLocation
} from "@/app/_actions/backoffice-actions";
import { Spinner } from "@/components/ui/spinner";
import { SelectField } from "@/components/ui/select-field";
import { Card, CardContent } from "@/components/ui/card";

// Custom hook for debouncing a value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface LocationWithDetails {
  id: string;
  company_id: string;
  country_id: string;
  province_id: string | null;
  town_id: string | null;
  created_at: string;
  country_name?: string;
  province_name?: string;
  town_name?: string;
}

export default function CompanyMapping() {
  const queryClient = useQueryClient();
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [locationToDeleteId, setLocationToDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    country_id: "",
    province_id: "",
    town_id: ""
  });

  // Fetch companies
  const { data: companiesResponse, isLoading: loadingCompanies } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => getOrganizations(),
    staleTime: 5 * 60 * 1000
  });

  const companies = companiesResponse?.success ? companiesResponse.data?.data || [] : [];

  // Fetch countries
  const { data: countriesResponse, isLoading: loadingCountries } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountries(),
    staleTime: 5 * 60 * 1000
  });

  const countries = countriesResponse?.success ? countriesResponse.data?.data || [] : [];

  // Fetch provinces for selected country
  const { data: provincesResponse } = useQuery({
    queryKey: ["provinces", formData.country_id],
    queryFn: () => getProvincesByCountry(formData.country_id),
    enabled: !!formData.country_id,
    staleTime: 5 * 60 * 1000
  });

  const provinces = provincesResponse?.success ? provincesResponse.data : [];

  // Fetch towns for selected province
  const { data: townsResponse } = useQuery({
    queryKey: ["towns", formData.province_id],
    queryFn: () => getTownsByProvince(formData.province_id!),
    enabled: !!formData.province_id,
    staleTime: 5 * 60 * 1000
  });

  const towns = townsResponse?.success ? townsResponse.data : [];

  // Fetch company locations
  const { data: locationsResponse, isLoading: loadingLocations } = useQuery({
    queryKey: ["company-locations", selectedCompany],
    queryFn: () => getCompanyLocations(selectedCompany),
    enabled: !!selectedCompany,
    staleTime: 1 * 60 * 1000 // 1 minute
  });

  const locations: LocationWithDetails[] = locationsResponse?.success ? locationsResponse.data : [];

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: createCompanyLocation,
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["company-locations", selectedCompany] });
        notify({
          title: "Success",
          description: "Location added successfully.",
          type: "success"
        });
        closeModal();
      } else {
        notify({
          title: "Error",
          description: response.message || "Failed to add location.",
          type: "error"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to add location.",
        type: "error"
      });
    }
  });

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCompanyLocation,
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["company-locations", selectedCompany] });
        notify({
          title: "Success",
          description: "Location deleted successfully.",
          type: "success"
        });
        setShowConfirmDeleteDialog(false);
      } else {
        notify({
          title: "Error",
          description: response.message || "Failed to delete location.",
          type: "error"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete location.",
        type: "error"
      });
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    createMutation.mutate({
      company_id: selectedCompany,
      country_id: formData.country_id,
      province_id: formData.province_id || null,
      town_id: formData.town_id || null
    });
  }

  function handleDeleteClick(locationId: string) {
    setLocationToDeleteId(locationId);
    setShowConfirmDeleteDialog(true);
  }

  function confirmDelete() {
    if (locationToDeleteId) {
      deleteMutation.mutate(locationToDeleteId);
    }
  }

  const debouncedSearchTerm = useDebounce(rawSearchTerm, 500);

  function openModal() {
    if (!selectedCompany) {
      notify({
        title: "Warning",
        description: "Please select a company first",
        type: "warning"
      });
      return;
    }
    setFormData({ country_id: "", province_id: "", town_id: "" });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormData({ country_id: "", province_id: "", town_id: "" });
  }

  const selectedCompanyData = companies.find((c: Company) => c.id === selectedCompany);

  const filteredLocations = locations.filter((location) => {
    const search = debouncedSearchTerm.toLowerCase();
    return (
      location.country_name?.toLowerCase().includes(search) ||
      location.province_name?.toLowerCase().includes(search) ||
      location.town_name?.toLowerCase().includes(search)
    );
  });

  if (loadingCompanies || loadingCountries) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-4 p-4">
        <div className="flex w-full items-center">
          <SelectField
            label="Select Company"
            value={selectedCompany}
            placeholder="Choose a company..."
            onValueChange={setSelectedCompany}
            options={companies}
            className="min-w-60"
          />
        </div>
      </Card>

      {selectedCompany ? (
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-800">
                Locations for {selectedCompanyData?.name}
              </h3>
              <p className="text-sm text-slate-600">
                Manage country, province, and town associations
              </p>
            </div>
            <Button size={"sm"} onClick={openModal}>
              <Plus size={20} />
              Add Location
            </Button>
          </div>

          <div className="relative mb-4">
            <Input
              placeholder="Search by country, province, or town..."
              value={rawSearchTerm}
              onChange={(e) => setRawSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {loadingLocations ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner />
            </div>
          ) : locations.length === 0 ? (
            <div className="grid place-items-center p-12 text-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MapPin />
                  </EmptyMedia>
                  <EmptyTitle>No locations mapped yet</EmptyTitle>
                  <EmptyDescription>
                    You haven&apos;t created any location yet. Get started by creating your first
                    location.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={openModal}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add a location
                    </Button>
                  </div>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLocations.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No locations found matching your search.
                </div>
              ) : (
                filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-800">{location.country_name}</p>
                        <p className="text-sm text-slate-600">
                          {location.province_name && `${location.province_name}`}
                          {location.town_name && ` / ${location.town_name}`}
                          {!location.province_name && !location.town_name && "Country only"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(location.id)}
                      disabled={deleteMutation.isPending}
                      className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      ) : (
        <Card className="bg-canvas/50 border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-8 py-8">
            <div className="relative mb-4">
              <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
              <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
                <Building2 className="text-primary h-16 w-16" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-foreground mb-2 text-2xl font-semibold">No Company Selected</h3>
            <p className="text-muted-foreground mb-8 max-w-md text-center">
              Choose a company to get started with mapping out locations.
            </p>

            <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
              <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                <div className="text-primary mb-1 font-mono">COMPANY</div>
                <div className="text-muted-foreground">Entities & Organizations</div>
              </div>
              <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                <div className="text-primary mb-1 font-mono">LOCATIONS</div>
                <div className="text-muted-foreground">Countries, States & Cities</div>
              </div>
              <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                <div className="text-primary mb-1 font-mono">MAP</div>
                <div className="text-muted-foreground">Execute Mapping</div>
              </div>
            </div>

            <div>
              <SelectField
                // label="Select Company"
                value={selectedCompany}
                placeholder="Choose a company..."
                onValueChange={setSelectedCompany}
                options={companies}
                classNames={{
                  input: "text-primary-foreground!  dark:text-white! font-medium"
                }}
                className="bg-primary text-primary-foreground placeholder:text-primary-foreground min-w-60"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Location Mapping</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                required
                value={formData.country_id}
                onValueChange={(value) =>
                  setFormData({ country_id: value, province_id: "", town_id: "" })
                }>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country: Country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.country_id && (
              <div className="space-y-2">
                <Label htmlFor="province">Province (Optional)</Label>
                <Select
                  value={formData.province_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, province_id: value, town_id: "" })
                  }>
                  <SelectTrigger id="province">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {provinces.map((province: Province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.province_id && (
              <div className="space-y-2">
                <Label htmlFor="town">Town (Optional)</Label>
                <Select
                  value={formData.town_id}
                  onValueChange={(value) => setFormData({ ...formData, town_id: value })}>
                  <SelectTrigger id="town">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {towns.map((town: Town) => (
                      <SelectItem key={town.id} value={town.id}>
                        {town.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Mapping"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-700">
            Are you sure you want to delete this location mapping? This action cannot be undone.
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
