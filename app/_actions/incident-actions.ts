"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse } from "@/lib/types";
import authenticatedApiClient, {
  handleError,
  successResponse
} from "./api-config";


// Get all incidents with optional filters
export async function getIncidents(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  department_id?: string;
  materiality?: string;
  start_date?: string; 
  end_date?: string; 
}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.page_size) queryParams.append("page_size", String(params.page_size));
    if (params?.status) queryParams.append("status", params.status);
    if (params?.department_id) queryParams.append("department_id", params.department_id);
    if (params?.materiality) queryParams.append("materiality", params.materiality);
    if(params?.start_date) queryParams.append("start_date", String(params.start_date));
    if(params?.end_date) queryParams.append("end_date", String(params.end_date));

    const queryString = queryParams.toString();
    const url = `/api/v1/incidents${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      url,
      method: "GET"
    });
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(error, "GET | GET INCIDENTS", "/api/v1/incidents");
  }
}

// Get incidents by department
export async function getDepartmentIncidents(
  departmentId: string,
  params?: {
    page?: number;
    page_size?: number;
  }
): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.page_size) queryParams.append("page_size", String(params.page_size));
    const queryString = queryParams.toString();
    const url = `/api/v1/departments/${departmentId}/incidents${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      url,
      method: "GET"
    });
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "GET | GET DEPARTMENT INCIDENTS",
      `/api/v1/departments/${departmentId}/incidents`
    );
  }
}

// Get incident statistics
export async function getIncidentStats(params: {
  start_date: string; // Format: YYYY-MM-DD
  end_date: string; // Format: YYYY-MM-DD
}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("start_date", params.start_date);
    queryParams.append("end_date", params.end_date);

    const response = await authenticatedApiClient({
      url: `/api/v1/incidents/stats?${queryParams.toString()}`,
      method: "GET"
    });
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(error, "GET | GET INCIDENT STATS", "/api/v1/incidents/stats");
  }
}

// Get single incident by ID
export async function getIncidentById(incidentId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/incidents/${incidentId}`,
      method: "GET"
    });
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "GET | GET INCIDENT BY ID",
      `/api/v1/incidents/${incidentId}`
    );
  }
}

// Create incident
export async function createIncident(data: any): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/incidents",
      method: "POST",
      data
    });

    revalidatePath("/dashboard/(modules)/risks/incidents");
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(error, "POST | CREATE INCIDENT", "/api/v1/incidents");
  }
}

// Update incident
export async function updateIncident(
  incidentId: string,
  data: {
    title?: string;
    description?: string;
    department_id?: string;
    status?: string;
    materiality?: string;
    [key: string]: any;
  }
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/incidents/${incidentId}`,
      method: "PUT",
      data
    });

    revalidatePath("/dashboard/(modules)/risks/incidents");
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE INCIDENT",
      `/api/v1/incidents/${incidentId}`
    );
  }
}

// Delete incident
export async function deleteIncident(incidentId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/incidents/${incidentId}`,
      method: "DELETE"
    });

    revalidatePath("/dashboard/(modules)/risks/incidents");
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | DELETE INCIDENT",
      `/api/v1/incidents/${incidentId}`
    );
  }
}

// Send incident for review
export async function sendIncidentForReview(
  incidentId: string,
  data: {
    responsible_person_id: string;
    reviewer_id: string;
    due_date: string;
    instructions?: string;
    comment?: string;
    file_urls?: string[];
  }
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/incidents/${incidentId}/send-for-review`,
      method: "POST",
      data
    });

    revalidatePath("/dashboard/(modules)/risks/incidents");
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "POST | SEND INCIDENT FOR REVIEW",
      `/api/v1/incidents/${incidentId}/send-for-review`
    );
  }
}

// Submit incident findings/logs from responsible person
export async function submitIncidentFindings(
  incidentId: string,
  data: {
    comment: string;
    file_urls: string[];
  }
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/incidents/${incidentId}/logs/responsible`,
      method: "POST",
      data
    });

    revalidatePath("/dashboard/(workflows)/actions/risk");
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "POST | SUBMIT INCIDENT FINDINGS",
      `/api/v1/incidents/${incidentId}/logs/responsible`
    );
  }
}