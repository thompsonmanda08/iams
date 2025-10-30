"use client";
import { useState, useEffect } from "react";
import { Plus, X, MapPin, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Company, Country, Province, Town, Option } from "@/lib/types";
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
import {
  mockCompanies,
  mockCountries,
  mockProvinces,
  mockTowns,
  initialLocations,
  LocationWithDetails
} from "./_data";

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

export default function CompanyMapping() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [allLocations, setAllLocations] = useState<LocationWithDetails[]>(initialLocations);
  const [locations, setLocations] = useState<LocationWithDetails[]>([]);
  const [countries] = useState<Country[]>(mockCountries);
  const [provinces] = useState<Province[]>(mockProvinces);
  const [towns] = useState<Town[]>(mockTowns);

  const [rawSearchTerm, setRawSearchTerm] = useState(""); // Raw input value
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [locationToDeleteId, setLocationToDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    country_id: "",
    province_id: "",
    town_id: ""
  });

  useEffect(() => {
    if (selectedCompany) {
      const companyLocations = allLocations.filter((loc) => loc.company_id === selectedCompany);
      setLocations(companyLocations);
    } else {
      setLocations([]);
    }
    setRawSearchTerm(""); // Reset search on company change
  }, [selectedCompany, allLocations]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newLocation: LocationWithDetails = {
      id: uuidv4(),
      company_id: selectedCompany,
      country_id: formData.country_id,
      province_id: formData.province_id || null,
      town_id: formData.town_id || null,
      created_at: new Date().toISOString(),
      country_name: countries.find((c) => c.id === formData.country_id)?.name,
      province_name: provinces.find((p) => p.id === formData.province_id)?.name,
      town_name: towns.find((t) => t.id === formData.town_id)?.name
    };

    setAllLocations((prev) => [newLocation, ...prev]);
    closeModal();
    notify({
      title: "Success",
      description: "Location added successfully.",
      type: "success"
    });
  }

  function handleDeleteClick(locationId: string) {
    setLocationToDeleteId(locationId);
    setShowConfirmDeleteDialog(true);
  }

  function confirmDelete() {
    setAllLocations((prev) => prev.filter((loc) => loc.id !== locationToDeleteId));
    setShowConfirmDeleteDialog(false);
    notify({
      title: "Success",
      description: "Location deleted successfully.",
      type: "success"
    });
  }

  const debouncedSearchTerm = useDebounce(rawSearchTerm, 500); // Debounce search term by 500ms

  function openModal() {
    if (!selectedCompany) {
      alert("Please select a company first");
      return;
    }
    setFormData({ country_id: "", province_id: "", town_id: "" }); // Reset form data when opening modal
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormData({ country_id: "", province_id: "", town_id: "" });
  }

  const filteredProvinces = provinces.filter((p) => p.country_id === formData.country_id);
  const filteredTowns = towns.filter((t) => t.province_id === formData.province_id);

  const selectedCompanyData = companies.find((c) => c.id === selectedCompany);

  const filteredLocations = locations.filter((location) => {
    const search = debouncedSearchTerm.toLowerCase(); // Use debounced term for filtering
    return (
      location.country_name?.toLowerCase().includes(search) ||
      location.province_name?.toLowerCase().includes(search) ||
      location.town_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-slate-800">Company Location Mapping</h2>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <div className="w-full">
          <Label htmlFor="company-select">Select Company</Label>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger id="company-select">
              <SelectValue placeholder="Choose a company..." />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCompany && (
        <div className="rounded-lg bg-white p-6 shadow-md">
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

          {locations.length === 0 ? ( // Still check original locations length for the empty state
            <div className="grid place-items-center p-12 text-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MapPin />
                  </EmptyMedia>
                  <EmptyTitle>No locations mapped yet</EmptyTitle>
                  <EmptyDescription>
                    You haven&apos;t created any location yet. Get started by creating your first
                    town.
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
              {filteredLocations.map((location) => (
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
                    className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
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
                  {countries.map((country) => (
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
                    {filteredProvinces.map((province) => (
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
                    {filteredTowns.map((town) => (
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
              <Button type="submit">Add Mapping</Button>
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
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
