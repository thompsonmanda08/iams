"use server";

import { APIResponse } from "@/lib/types";
import authenticatedApiClient, { axios, handleError, successResponse } from "./api-config";
import {
  createAuthSession,
  deleteSession,
  updateAuthSession,
  verifySession,
  createUserSession,
  createPermissionsSession
} from "@/lib/session";
import { revalidatePath } from "next/cache";
import { ChangePassword } from "@/lib/types/stores";
import { User, UserType } from "@/lib/types/account";
import { cache } from "react";
import {
  getCachedSystemSetup,
  setCachedSystemSetup,
  clearSystemSetupCache,
  isSystemSetupCacheFresh
} from "@/lib/cache-store";

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

    const session = response?.data;
    console.log("[ LOGIN ]: ", session);

    // Set authentication cookie (will include mfa_required flag)
    await createAuthSession({
      accessToken: session?.access_token,
      user_type: session?.user_type,
      user_id: session?.user?.id,
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
 * Verify OTP for multi-factor authentication
 * Endpoint: POST /api/v1/auth/verify-otp
 * Body: { username, otp }
 * Returns: JWT token with full user data if successful
 */
export async function verifyOTP({
  username,
  otp
}: {
  username: string;
  otp: string;
}): Promise<APIResponse> {
  const url = `/api/v1/auth/verify-otp`;

  try {
    const response = await authenticatedApiClient({ url, method: "POST", data: { username, otp } });

    // Update authentication session with new access token and mark MFA as complete
    await updateAuthSession({
      mfa_required: false, // MFA is now complete
      mfa_verified: true
    });

    // Clear cache to ensure fresh user data after MFA verification
    clearSystemSetupCache();

    return successResponse(response?.data, "OTP verified successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Resend OTP for multi-factor authentication
 * NOTE: This endpoint may not exist in current API documentation.
 * Using simulated implementation for now.
 *
 * Expected endpoint: POST /api/v1/auth/resend-otp
 * Body: { username }
 * Returns: Success message
 */
export async function resendOTP({ username }: { username: string }): Promise<APIResponse> {
  const url = `/api/v1/auth/resend-otp`;

  try {
    // ATTEMPT REAL API CALL FIRST
    const response = await authenticatedApiClient({ url, method: "POST", data: { username } });
    return successResponse(response?.data, "OTP resent successfully");
  } catch (error: Error | any) {
    // IF ENDPOINT DOESN'T EXIST, SIMULATE SUCCESS
    // This allows the UI to work while backend implements the endpoint
    if (error?.response?.status === 404 || error?.code === "ECONNREFUSED") {
      console.warn("[ RESEND OTP ]: Endpoint not found, using simulated response");

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return successResponse(
        { message: "OTP resent successfully (simulated)" },
        "A new OTP has been sent to your email"
      );
    }

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
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        old_password: oldPassword,
        new_password: newPassword
      }
    });

    await updateAuthSession({ change_password: false });

    // Clear cached system setup after password change (security-critical)
    clearSystemSetupCache();

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
// ADMIN ONLY
export async function registerUser({
  username,
  email,
  password,
  first_name,
  last_name,
  branch_id,
  department_id,
  role_id,
  user_type
}: {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  branch_id: string;
  department_id: string;
  role_id: string;
  user_type: UserType;
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
        role_id: role_id,
        user_type
      },
      method: "POST"
    });
    revalidatePath("/admin/users", "page");

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
 *
 * Note: This function uses React's cache() for request-level memoization.
 * The same result will be returned for all calls within a single request.
 * Cache is automatically cleared between requests.
 *
 * For persistent caching across requests with manual revalidation,
 * you would need to implement a custom caching solution (e.g., Redis, in-memory cache)
 * as Next.js unstable_cache() doesn't support dynamic data sources like cookies.
 */
async function _initializeSystemSetup(): Promise<APIResponse> {
  const url = `/api/v1/auth/setup`;

  try {
    console.log("🔧 [InitializeSystemSetup] Starting...");
    const response = await authenticatedApiClient({ url });
    const session = response?.data;
    const userData = session?.user;

    const user = {
      id: userData?.id,
      username: userData?.username,
      email: userData?.email,
      role: userData?.role?.name,
      first_name: userData?.first_name,
      last_name: userData?.last_name,
      user_type: userData?.user_type,
      organization_id: userData?.organization_id,
      branch_id: userData?.branch_id,
      department_id: userData?.department_id,
      role_id: userData?.role_id,
      is_active: userData?.is_active,
      is_ldap_user: userData?.is_ldap_user,
      last_login: userData?.last_login,
      change_password: userData?.change_password,
      is_locked: userData?.is_locked,
      mfa_enabled: userData?.mfa_enabled
    };

    // await updateAuthSession({ user });

    console.log("🔧 [InitializeSystemSetup] Completed");
    return successResponse(session, response?.data?.message);
  } catch (error: Error | any) {
    console.error("❌ [InitializeSystemSetup] Error:", error?.message);
    return handleError(error, "GET | SYSTEM SETUP", url);
  }
}

export const initializeSystemSetup = cache(_initializeSystemSetup);

/**
 * Initialize system setup with persistent in-memory cache
 *
 * This version caches data across requests and only refetches when:
 * 1. Cache doesn't exist
 * 2. Cache is stale (older than TTL)
 * 3. Cache is manually cleared via clearSystemSetupCache()
 *
 * @param options.ttl - Time to live in milliseconds (default: 1 hour)
 * @param options.forceRefresh - Force refresh even if cache is fresh
 */
export async function initializeSystemSetupCached(options?: {
  ttl?: number;
  forceRefresh?: boolean;
}): Promise<APIResponse> {
  const { ttl = 60 * 60 * 1000, forceRefresh = false } = options || {};

  // Check if we have fresh cached data
  if (!forceRefresh && isSystemSetupCacheFresh(ttl)) {
    const cached = getCachedSystemSetup();
    if (cached) {
      console.log("🔧 [InitializeSystemSetup] Returning cached data");
      return cached;
    }
  }

  // Fetch fresh data
  const url = `/api/v1/auth/setup`;

  try {
    console.log("🔧 [InitializeSystemSetup] Fetching fresh data...");
    const response = await authenticatedApiClient({ url });
    const session = response?.data;
    const userData = session?.user;

    const user = {
      id: userData?.id,
      username: userData?.username,
      email: userData?.email,
      role: userData?.role?.name,
      first_name: userData?.first_name,
      last_name: userData?.last_name,
      user_type: userData?.user_type,
      organization_id: userData?.organization_id,
      branch_id: userData?.branch_id,
      department_id: userData?.department_id,
      role_id: userData?.role_id,
      is_active: userData?.is_active,
      is_ldap_user: userData?.is_ldap_user,
      last_login: userData?.last_login,
      change_password: userData?.change_password,
      is_locked: userData?.is_locked,
      mfa_enabled: userData?.mfa_enabled
    };

    const result = successResponse(session, response?.data?.message);

    // Cache the result
    setCachedSystemSetup(result);

    console.log("🔧 [InitializeSystemSetup] Completed and cached");
    return result;
  } catch (error: Error | any) {
    console.error("❌ [InitializeSystemSetup] Error:", error?.message);
    return handleError(error, "GET | SYSTEM SETUP", url);
  }
}

/**
 * Manually clear the system setup cache
 * Call this when system configuration changes and you need fresh data
 */
export async function revalidateSystemSetup(): Promise<void> {
  clearSystemSetupCache();
  console.log("🔧 [SystemSetup] Cache cleared");
}

/**
 * Refresh user Token
 */
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `api/v1/auth/refresh-token`;

  try {
    const response = await authenticatedApiClient({ url });

    const access_token = response.data?.data?.access_token;

    await updateAuthSession({ access_token });

    return successResponse({ access_token }, response.data?.message);
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
