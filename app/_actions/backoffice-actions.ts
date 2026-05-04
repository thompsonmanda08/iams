"use server";

import authenticatedApiClient, { handleError, successResponse } from "./api-config";
import { APIResponse, Company } from "@/lib/types";

// ==================== COUNTRIES ====================

export async function getCountries(params?: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("limit", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/api/v1/backoffice/countries${queryParams.toString() ? `?${queryParams}` : ""}`;

    const response = await authenticatedApiClient({
      url,
      method: "GET"
    });

    return {
      ...successResponse(response.data.data, "Countries fetched successfully"),
      pagination: response.data.pagination
    };
  } catch (error) {
    return handleError(error, "GET | GET COUNTRIES", "/api/v1/backoffice/countries");
  }
}

export async function createCountry(data: {
  name: string;
  code: string;
  region?: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/countries",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Country created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE COUNTRY", "/api/v1/backoffice/countries");
  }
}

export async function updateCountry(data: {
  id: string;
  name?: string;
  code?: string;
  region?: string;
  is_active?: boolean;
}): Promise<APIResponse> {
  try {
    const { id, ...payload } = data;
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/countries/update?id=${id}`,
      method: "PUT",
      data: {
        ...payload,
        is_active: payload.is_active ?? true
      }
    });

    return successResponse(response.data.data, "Country updated successfully");
  } catch (error) {
    return handleError(
      error,
      "PUT | UPDATE COUNTRY",
      `/api/v1/backoffice/countries/update?id=${data.id}`
    );
  }
}

// ==================== PROVINCES ====================

export async function getProvincesByCountry(
  countryId: string,
  params?: {
    page?: number;
    page_size?: number;
  }
): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("country_id", countryId);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("limit", params.page_size.toString());

    const response = await authenticatedApiClient({
      url: `/api/v1/provinces?${queryParams.toString()}`,
      method: "GET"
    });

    return {
      ...successResponse(response.data.data, "Provinces fetched successfully"),
      pagination: response.data.pagination
    };
  } catch (error) {
    return handleError(error, "GET | GET PROVINCES", "/api/v1/provinces");
  }
}

export async function createProvince(data: {
  name: string;
  country_id: string;
  code: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/provinces",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Province created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE PROVINCE", "/api/v1/provinces");
  }
}

// ==================== TOWNS ====================

export async function getTownsByProvince(
  provinceId: string,
  params?: {
    page?: number;
    page_size?: number;
  }
): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("province_id", provinceId);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("limit", params.page_size.toString());

    const response = await authenticatedApiClient({
      url: `/api/v1/towns?${queryParams.toString()}`,
      method: "GET"
    });

    return {
      ...successResponse(response.data.data, "Towns fetched successfully"),
      pagination: response.data.pagination
    };
  } catch (error) {
    return handleError(error, "GET | GET TOWNS", "/api/v1/towns");
  }
}

export async function createTown(data: {
  name: string;
  province_id: string;
  code: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/towns",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Town created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE TOWN", "/api/v1/towns");
  }
}

// ==================== ORGANIZATIONS ====================

export async function getOrganizations(params?: {
  page?: number;
  page_size?: number;
  search?: string;
  status?: "active" | "inactive";
}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());

    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const url = `/api/v1/backoffice/organizations${queryParams.toString() ? `?${queryParams}` : ""}`;

    const response = await authenticatedApiClient({
      url,
      method: "GET"
    });

    return successResponse(response.data.data, "Organizations fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET ORGANIZATIONS", "/api/v1/backoffice/organizations");
  }
}

export async function createOrganization(data: Company): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/organizations",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Organization created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE ORGANIZATION", "/api/v1/backoffice/organizations");
  }
}

export async function updateOrganization(data: Company): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/organizations/${data.id}`,
      method: "PUT",
      data: {
        ...data,
        is_active: data.is_active ?? true
      }
    });

    return successResponse(response.data.data, "Organization updated successfully");
  } catch (error) {
    return handleError(error, "PUT | UPDATE ORGANIZATION", "/api/v1/backoffice/organizations");
  }
}

// ==================== COMPANY LOCATIONS ====================

export async function getCompanyLocations(companyId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/company-locations?company_id=${companyId}`,
      method: "GET"
    });

    return successResponse(response.data.data, "Company locations fetched successfully");
  } catch (error) {
    return handleError(
      error,
      "GET | GET COMPANY LOCATIONS",
      "/api/v1/backoffice/company-locations"
    );
  }
}

export async function createCompanyLocation(data: {
  company_id: string;
  country_id: string;
  province_id?: string | null;
  town_id?: string | null;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/company-locations",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Company location created successfully");
  } catch (error) {
    return handleError(
      error,
      "POST | CREATE COMPANY LOCATION",
      "/api/v1/backoffice/company-locations"
    );
  }
}

export async function deleteCompanyLocation(locationId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/company-locations/${locationId}`,
      method: "DELETE"
    });

    return successResponse(null, "Company location deleted successfully");
  } catch (error) {
    return handleError(
      error,
      "DELETE | DELETE COMPANY LOCATION",
      "/api/v1/backoffice/company-locations"
    );
  }
}

// ==================== DASHBOARD STATS ====================

export async function getBackofficeStats(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/dashboard",
      method: "GET"
    });

    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "GET | GET BACKOFFICE STATS", "/api/v1/backoffice/dashboard");
  }
}
