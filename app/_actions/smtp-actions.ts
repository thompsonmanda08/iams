"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse } from "@/lib/types";
import authenticatedApiClient, {
  handleError,
  successResponse
} from "./api-config";

// CREATE SMTP CONFIG
export async function createSmtpConfig(data: any): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/organizations/smtp-configs",
      method: "POST",
      data
    });

    revalidatePath("/dashboard/system-configs/mail-settings");
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE SMTP CONFIG",
      "/api/v1/organizations/smtp-configs"
    );
  }
}

// GET SMTP CONFIG
export async function getSmtpConfig(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/organizations/smtp-configs",
      method: "GET",
    });
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "GET | GET SMTP CONFIG",
      "/api/v1/organizations/smtp-configs"
    );
  }
}


// UPDATE SMTP CONFIG
export async function updateSmtpConfig(id: string, data: any): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/organizations/smtp-configs/${id}`,
      method: "PUT",
      data
    });

    revalidatePath("/dashboard/system-configs/mail-settings");
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE SMTP CONFIG",
      `/api/v1/organizations/smtp-configs/${id}`
    );
  }
}

// DELETE SMTP CONFIG
export async function deleteSmtpConfig(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/organizations/smtp-configs/${id}`,
      method: "DELETE",
    });

    revalidatePath("/dashboard/system-configs/mail-settings");
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | REMOVE SMTP CONFIG",
      `/api/v1/organizations/smtp-configs/${id}`
    );
  }
}

