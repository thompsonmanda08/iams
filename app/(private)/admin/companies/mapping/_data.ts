import { Company, CompanyLocation, Country, Province, Town } from "@/lib/types";

// TODO: DELETE THIS ENTIRE FILE when backend endpoints are ready
// This file contains mock data for company location mapping
// Replace with real API calls in ../page.tsx using:
// - getOrganizations() from @/app/_actions/backoffice-actions
// - getCountries() from @/app/_actions/backoffice-actions
// - getProvinces() from @/app/_actions/config-actions
// - getTowns() from @/app/_actions/config-actions
// - getCompanyLocations() from @/app/_actions/backoffice-actions

export interface LocationWithDetails extends CompanyLocation {
  country_name?: string;
  province_name?: string;
  town_name?: string;
}

export const mockCompanies: Company[] = [
  {
    id: "comp-1",
    name: "Tech Solutions Inc.",
    status: "active",
    created_at: new Date().toISOString(),
    logo_url: null,
    email: null,
    phone: null
  },
  {
    id: "comp-2",
    name: "Global Logistics",
    status: "active",
    created_at: new Date().toISOString(),
    logo_url: null,
    email: null,
    phone: null
  },
  {
    id: "comp-3",
    name: "Innovate Creations",
    status: "active",
    created_at: new Date().toISOString(),
    logo_url: null,
    email: null,
    phone: null
  }
];

export const mockCountries: Country[] = [
  {
    id: "country-1",
    name: "Zambia",
    code: ""
  },
  {
    id: "country-2",
    name: "South Africa",
    code: ""
  }
];

export const mockProvinces: Province[] = [
  { id: "prov-1", name: "Lusaka", country_id: "country-1" },
  { id: "prov-2", name: "Copperbelt", country_id: "country-1" },
  { id: "prov-3", name: "Gauteng", country_id: "country-2" }
];

export const mockTowns: Town[] = [
  { id: "town-1", name: "Lusaka City", province_id: "prov-1" },
  { id: "town-2", name: "Ndola", province_id: "prov-2" },
  { id: "town-3", name: "Kitwe", province_id: "prov-2" },
  { id: "town-4", name: "Johannesburg", province_id: "prov-3" }
];

export const initialLocations: LocationWithDetails[] = [
  {
    id: "loc-1",
    company_id: "comp-1",
    country_id: "country-1",
    province_id: "prov-1",
    town_id: "town-1",
    created_at: new Date().toISOString(),
    country_name: "Zambia",
    province_name: "Lusaka",
    town_name: "Lusaka City"
  },
  {
    id: "loc-2",
    company_id: "comp-1",
    country_id: "country-1",
    province_id: "prov-2",
    town_id: null,
    created_at: new Date().toISOString(),
    country_name: "Zambia",
    province_name: "Copperbelt"
  },
  {
    id: "loc-3",
    company_id: "comp-2",
    country_id: "country-2",
    province_id: "prov-3",
    town_id: "town-4",
    created_at: new Date().toISOString(),
    country_name: "South Africa",
    province_name: "Gauteng",
    town_name: "Johannesburg"
  }
];
