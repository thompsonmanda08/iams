"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse } from "@/lib/types";
import authenticatedApiClient, { handleError, successResponse } from "./api-config";
import { User } from "@/lib/types/account";

export async function getUsers(params?: {
  branchId?: string;
  departmentId?: string;
  roleId?: string;
  isActive?: boolean;
  isLdapUser?: boolean;
  search?: string;
  role?: string;
  page?: number;
  page_size?: number;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.branchId) queryParams.append("branch_id", params.branchId);
  if (params?.departmentId) queryParams.append("department_id", params.departmentId);
  if (params?.roleId) queryParams.append("role_id", params.roleId);
  if (params?.isActive !== undefined) queryParams.append("is_active", String(params.isActive));
  if (params?.isLdapUser !== undefined)
    queryParams.append("is_ldap_user", String(params.isLdapUser));
  if (params?.search) queryParams.append("search", params.search);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.page_size) queryParams.append("page_size", String(params.page_size));

  const url = `/api/v1/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient({ url: url, method: "GET" });
    return successResponse(response.data.data, "Users fetched successfully");
  } catch (error) {
    return handleError(error, "GET", url);
  }
}

export async function getUserById(id: string): Promise<APIResponse> {
  const url = `/api/v1/users/${id}`;

  try {
    const response = await authenticatedApiClient({ url: url, method: "GET" });
    return successResponse(response.data.data?.data || response.data, "User fetched successfully");
  } catch (error) {
    return handleError(error, "GET", url);
  }
}

export async function updateUser(id: string, data: Partial<User>): Promise<APIResponse> {
  const url = `/api/v1/users/${id}`;

  try {
    const response = await authenticatedApiClient({ url: url, data: data, method: "PUT" });
    revalidatePath("/dashboard/system-configs/users");
    return successResponse(response.data.data || response.data, "User updated successfully");
  } catch (error) {
    return handleError(error, "PUT", url);
  }
}

export async function deleteUser(id: string): Promise<APIResponse> {
  const url = `/api/v1/users/${id}`;

  try {
    const response = await authenticatedApiClient({ url: url, method: "DELETE" });
    revalidatePath("/dashboard/system-configs/users");
    return successResponse(response.data.data, "User deleted successfully");
  } catch (error) {
    return handleError(error, "DELETE", url);
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(id: string, isActive: boolean): Promise<APIResponse> {
  return updateUser(id, { is_active: isActive });
}

/**
 * Toggle user MFA
 */
export async function toggleUserMFA(id: string, enabled: boolean): Promise<APIResponse> {
  return updateUser(id, { mfa_enabled: enabled });
}
