"use server";

import { APIResponse } from "@/lib/types";
import authenticatedApiClient, {
  axios,
  handleBadRequest,
  handleError,
  successResponse,
  unauthorizedResponse
} from "./api-config";
import {
  createAuthSession,
  createUserSession,
  deleteSession,
  updateAuthSession,
  verifySession
} from "@/lib/session";
import { revalidatePath } from "next/cache";
import { ChangePassword } from "@/lib/types/stores";

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
}: ChangePassword): Promise<APIResponse> {
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
  first_name,
  last_name,
  branch_id,
  department_id,
  role_id
}: {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  branch_id: string;
  department_id: string;
  role_id: string;
}): Promise<APIResponse> {
  const url = `/api/v1/auth/register`;

  try {
    const response = await authenticatedApiClient({
      url: url,
      data: {
        username,
        email,
        password,
        first_name: first_name,
        last_name: last_name,
        branch_id: branch_id,
        department_id: department_id,
        role_id: role_id
      },
      method: "POST"
    });
    revalidatePath("/dashboard/system-configs/users");

    return successResponse(response?.data, "User registered successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

export async function logUserOut(reason: string): Promise<boolean> {
  const isLoggedIn = await verifySession();
  if (isLoggedIn) {
    const res = await authenticatedApiClient({
      url: "/api/v1/auth/logout",
      method: "POST",
      data: { reason }
    });
    return true;
  }
  return false;
}

/**
 * Create initial system setup
 */
export async function InitializeSystemSetup(): Promise<APIResponse> {
  const url = `/api/v1/auth/setup`;

  try {
    const response = await authenticatedApiClient({ url });

    await createUserSession(response?.data);

    return successResponse(response?.data, response?.data?.message);
  } catch (error: Error | any) {
    return handleError(error, "POST | REFRESH TOKEN", url);
  }
}
/**
 * Refresh user Token
 */
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `api/v1/auth/refresh-token`;

  try {
    const res = await authenticatedApiClient({ url });

    const response = res.data;

    const accessToken = response?.token;

    await createAuthSession(accessToken);

    return successResponse({ accessToken }, res.data?.message);
  } catch (error: Error | any) {
    return handleError(error, "POST | REFRESH TOKEN", url);
  }
}

export async function lockScreenOnUserIdle(state: boolean): Promise<boolean> {
  const { isAuthenticated } = await verifySession();

  if (isAuthenticated) {
    await updateAuthSession({ screenLocked: state });

    return isAuthenticated;
  }

  return isAuthenticated;
}
