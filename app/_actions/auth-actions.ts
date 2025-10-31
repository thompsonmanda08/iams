"use server";

import { APIResponse } from "@/lib/types";
import authenticatedApiClient, {
  axios,
  handleBadRequest,
  handleError,
  successResponse,
  unauthorizedResponse
} from "./api-config";
import { createAuthSession, deleteSession, updateAuthSession, verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { ChangePassword } from "@/lib/types/stores";
import { se } from "date-fns/locale";

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

    console.log("[ LOGIN ]: ", response.data);
    const session = response?.data;

    // Set authentication cookie
    await createAuthSession({
      accessToken: session?.access_token,
      user_type: session?.user_type,
      change_password: session?.change_password,
      mfa_required: session?.mfa_required,
      organization_id: session?.organization_id
    });
    return successResponse(session, session?.message);
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

    await updateAuthSession({ change_password: false });

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

export async function logUserOut(reason: string): Promise<APIResponse> {
  const { isAuthenticated } = await verifySession();
  if (isAuthenticated) {
    try {
      const response = await authenticatedApiClient({
        url: "/api/v1/auth/logout"
        // method: "POST",
        // data: { reason }
      });
      console.log("[ LOGOUT ]: ", reason);

      // Check if backend logout succeeded (optional - proceed anyway)
      if (!response.status || response.status !== 200) {
        console.warn("Backend logout failed, proceeding with local session cleanup", {
          status: response.status,
          statusText: response.statusText
        });
      }

      // Delete server-side session (cookies) - this is the critical part
      const result = await deleteSession();

      if (!result.success) {
        return {
          success: false,
          message: "Failed to clear session",
          data: null,
          status: 500,
          statusText: "INTERNAL SERVER ERROR"
        };
      }

      // Return only serializable data
      return {
        success: true,
        message: "Logout successful",
        data: null,
        status: 200,
        statusText: "OK"
      };
    } catch (error: any) {
      console.error("Logout error:", error);

      // Still try to delete the session even if backend logout fails
      await deleteSession().catch(() => {
        console.warn("Failed to delete session during error handling");
      });

      // Return serializable error response
      return {
        success: false,
        message: error?.message || "Logout failed",
        data: null,
        status: 500,
        statusText: "INTERNAL SERVER ERROR"
      };
    }
  }
  return {
    success: false,
    message: "User not authenticated",
    data: null,
    status: 401,
    statusText: "UNAUTHORIZED"
  };
}

/**
 * Create initial system setup
 */
export async function InitializeSystemSetup(): Promise<APIResponse> {
  const url = `/api/v1/auth/setup`;

  try {
    const response = await authenticatedApiClient({ url });
    const session = response?.data;
    const user = session?.user;

    await updateAuthSession({ user, permissions: session?.permissions });

    return successResponse({ user }, response?.data?.message);
  } catch (error: Error | any) {
    return handleError(error, "GET | SYSTEM SETUP", url);
  }
}
/**
 * Refresh user Token
 */
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `api/v1/auth/refresh-token`;

  const { session, isAuthenticated } = await verifySession();

  if (!session || !isAuthenticated) {
    return unauthorizedResponse("UNAUTHENTICATED");
  }

  try {
    const response = await authenticatedApiClient({ url });

    const tokenData = response.data?.data;

    await updateAuthSession({
      accessToken: tokenData?.access_token,
      user: { ...session?.user }
      
    });

    return successResponse(tokenData, response.data?.message);
  } catch (error: Error | any) {
    return handleError(error, "GET | REFRESH TOKEN", url);
  }
}

export async function lockScreenOnUserIdle(state: boolean): Promise<boolean> {
  const { isAuthenticated } = await verifySession();

  if (isAuthenticated) {
    // When unlocking (state = false), refresh the token to extend the session
    if (!state) {
      try {
        const refreshResponse = await getRefreshToken();
        if (refreshResponse.success) {
          await updateAuthSession({ screen_locked: state });
          return true;
        }
      } catch (error) {
        console.error("Failed to refresh token on unlock:", error);
        // Continue with updating screen lock state even if refresh fails
      }
    }

    await updateAuthSession({ screen_locked: state });
    return isAuthenticated;
  }

  return isAuthenticated;
}
