"use server";

import { APIResponse } from "@/lib/types";
import {
  axios,
  handleBadRequest,
  handleError,
  successResponse,
  unauthorizedResponse
} from "./api-config";
import { createAuthSession, deleteSession, verifySession } from "@/lib/session";

export async function loginUser({
  username,
  password
}: {
  username: string;
  password: string;
}): Promise<APIResponse> {
  const url = `/api/v1/auth/login`;

  try {
    const response = await axios.post(url, { username, password });

    // Set authentication cookie
    await createAuthSession(response.data.access_token);
    return successResponse(response?.data, "Login successful");
  } catch (error: Error | any) {    
    return handleError(error, "POST", url);
  }
}

/**
 * NOTE: This endpoint may need backend implementation.
 * API docs show POST /api/v1/auth/change-password which requires authentication
 * and expects { old_password, new_password }.
 *
 * For public password reset with token, backend needs to implement a separate endpoint.
 * Current implementation assumes token-based reset endpoint exists.
 */
export async function resetPassword({
  newPassword,
  token
}: {
  newPassword: string;
  token: string;
}): Promise<APIResponse> {
  const url = `/api/v1/auth/password-reset`;

  try {
    const response = await axios.post(url, { newPassword, token });

    return successResponse(response?.data, "Password reset successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Change password for authenticated user
 * Endpoint: POST /api/v1/auth/change-password
 * Status: ✅ Documented in API
 */
export async function changePassword({
  oldPassword,
  newPassword
}: {
  oldPassword: string;
  newPassword: string;
}): Promise<APIResponse> {
  const url = `/api/v1/auth/change-password`;

  try {
    const response = await axios.post(url, {
      old_password: oldPassword,
      new_password: newPassword
    });

    return successResponse(response?.data, "Password changed successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Register new user
 * Endpoint: POST /api/v1/auth/register
 * Status: ✅ Documented in API
 */
export async function registerUser({
  username,
  email,
  password,
  firstName,
  lastName,
  branchId,
  departmentId,
  roleId
}: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  branchId: string;
  departmentId: string;
  roleId: string;
}): Promise<APIResponse> {
  const url = `/api/v1/auth/register`;

  try {
    const response = await axios.post(url, {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      branch_id: branchId,
      department_id: departmentId,
      role_id: roleId
    });

    return successResponse(response?.data, "User registered successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

export async function logUserOut() {
  const isLoggedIn = await verifySession();
  if (isLoggedIn) {
    deleteSession();
    return true;
  }
  return false;
}