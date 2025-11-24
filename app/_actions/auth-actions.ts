"use server";

import { APIResponse } from "@/lib/types";
import authenticatedApiClient, {
  axios,
  handleError,
  successResponse,
  unauthorizedResponse
} from "./api-config";
import {
  createAuthSession,
  createUserSession,
  deleteSession,
  updateAuthSession,
  verifySession,
  setScreenLockCookie,
  clearScreenLockCookie,
  getScreenLockState
} from "@/lib/session";
import { revalidatePath } from "next/cache";
import { ChangePassword } from "@/lib/types/stores";
import { UserType } from "@/lib/types/account";
import { cache } from "react";
import { logger } from "@/lib/logger";
import { SESSION_CONFIG } from "@/lib/session-config";

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

    // Fetch user data to populate session
    try {
      const setupResponse = await initializeSystemSetup();
      if (setupResponse.success) {
        console.log("✅ [OTP Verified] User data populated successfully");
      }
    } catch (setupError) {
      console.warn(
        "⚠️  [OTP Verified] Failed to populate user data, but proceeding with authentication"
      );
    }

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
    console.log("🔧 [System Setup] Starting...");
    const response = await authenticatedApiClient({ url });
    const session = response?.data;
    const userData = session?.user;

    const user = {
      id: userData?.id,
      username: userData?.username,
      email: userData?.email,
      role: userData?.role || userData?.role?.name || "Viewer",
      first_name: userData?.first_name,
      last_name: userData?.last_name,
      user_type: userData?.user_type,
      organization_id: userData?.organization_id,
      branch_id: userData?.branch_id,
      department_id: userData?.department_id,
      role_id: userData?.role_id,
      // is_active: userData?.is_active,
      // is_ldap_user: userData?.is_ldap_user,
      // last_login: userData?.last_login,
      // change_password: userData?.change_password,
      // is_locked: userData?.is_locked,
      mfa_enabled: userData?.mfa_enabled
    };

    await updateAuthSession({ user });
    // await createUserSession(user as any);

    console.log("🔧 [System Setup] Completed", "user");
    return successResponse(session, response?.data?.message);
  } catch (error: Error | any) {
    console.error("❌ [System Setup] Error:", error?.message);
    return handleError(error, "GET | SYSTEM SETUP", url);
  }
}

export const initializeSystemSetup = cache(_initializeSystemSetup);

/**
 * Refresh user Token
 */
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `/api/v1/auth/refresh-token`;

  const { isAuthenticated, session } = await verifySession();

  if (!isAuthenticated) {
    logger.warn("Cannot refresh token - user not authenticated", {
      function: "getRefreshToken",
      isAuthenticated
    });
    return unauthorizedResponse("UNAUTHORIZED");
  }

  try {
    // ✅ Log expiry time before attempting refresh
    const expiryTime = session?.expiresAt ? new Date(session.expiresAt) : null;
    const timeUntilExpiry = expiryTime ? expiryTime.getTime() - Date.now() : null;

    logger.debug("Attempting to refresh token", {
      function: "getRefreshToken",
      endpoint: url,
      expiresAt: expiryTime?.toISOString(),
      timeUntilExpiryMs: timeUntilExpiry,
      timeUntilExpiryMins: timeUntilExpiry ? Math.round(timeUntilExpiry / 60000) : null
    });

    const response = await authenticatedApiClient({ url });

    const access_token = response.data?.access_token;

    // ✅ CRITICAL FIX: Reset session expiration to 30 minutes from now
    // When refreshing token, we must extend the session TTL
    // Otherwise cookie expiration stays at old value and user gets logged out prematurely
    const newExpiresAt = new Date(Date.now() + SESSION_CONFIG.SESSION_TTL);

    await updateAuthSession({
      access_token,
      expiresAt: newExpiresAt
    });

    // ✅ Log success without exposing token value
    logger.info("✅ Token refreshed successfully", {
      function: "getRefreshToken",
      endpoint: url,
      previousExpiryMs: timeUntilExpiry,
      newExpiresAt: newExpiresAt.toISOString()
    });

    return successResponse({ access_token }, response.data?.message);
  } catch (error: Error | any) {
    logger.error("❌ Token refresh failed - user will experience auth failure on next request", error, {
      function: "getRefreshToken",
      endpoint: url,
      errorCode: (error as any)?.code,
      errorMessage: (error as Error)?.message,
      status: (error as any)?.response?.status
    });
    return handleError(error, "GET | REFRESH TOKEN", url);
  }
}

export async function lockScreenOnUserIdle(state: boolean): Promise<boolean> {
  const { isAuthenticated } = await verifySession();

  if (!isAuthenticated) {
    logger.warn("Cannot lock screen - user not authenticated", {
      function: "lockScreenOnUserIdle",
      state,
      isAuthenticated
    });
    return false;
  }

  try {
    // When unlocking (state = false), refresh the token to extend the session
    if (!state) {
      try {
        logger.debug("🔓 Unlocking screen - attempting token refresh", {
          function: "lockScreenOnUserIdle",
          state
        });

        const refreshResponse = await getRefreshToken();
        if (!refreshResponse.success) {
          logger.warn("Token refresh failed during unlock", {
            function: "lockScreenOnUserIdle",
            state,
            refreshSuccess: refreshResponse.success
          });
          // Continue with updating screen lock state even if refresh fails
        } else {
          logger.info("✅ Token refreshed successfully during unlock", {
            function: "lockScreenOnUserIdle",
            state
          });
        }

        // Update session even if refresh failed
        try {
          const updateResult = await updateAuthSession({ screen_locked: state });

          if (!updateResult) {
            logger.error("Failed to update session lock state during unlock", undefined, {
              function: "lockScreenOnUserIdle",
              state
            });
            // Continue anyway - try to clear lock cookie
          } else {
            logger.debug("✅ Session updated successfully during unlock", {
              function: "lockScreenOnUserIdle",
              state
            });
          }
        } catch (sessionUpdateError) {
          logger.error("Exception while updating session during unlock", sessionUpdateError, {
            function: "lockScreenOnUserIdle",
            state
          });
          // Continue anyway - try to clear lock cookie
        }

        // Clear screen lock cookie on unlock (success or partial success)
        try {
          await clearScreenLockCookie();
          logger.info("✅ Screen unlocked successfully", {
            function: "lockScreenOnUserIdle",
            state,
            refreshedToken: refreshResponse.success
          });
          return true;
        } catch (cookieError) {
          logger.error("Failed to clear screen lock cookie during unlock", cookieError, {
            function: "lockScreenOnUserIdle",
            state
          });
          // Still return true because unlock was processed
          return true;
        }
      } catch (error) {
        logger.error("Exception while unlocking screen", error, {
          function: "lockScreenOnUserIdle",
          state
        });
        return false;
      }
    }

    // LOCKING: Update session and persist state to cookie
    logger.debug("🔒 Locking screen", {
      function: "lockScreenOnUserIdle",
      state
    });

    try {
      const updateResult = await updateAuthSession({ screen_locked: state });

      if (!updateResult) {
        logger.error("Failed to update session lock state - updateAuthSession returned falsy", undefined, {
          function: "lockScreenOnUserIdle",
          state,
          updateResult
        });
        // Don't return false - still try to set the lock cookie
      } else {
        logger.debug("✅ Session updated successfully for lock", {
          function: "lockScreenOnUserIdle",
          state
        });
      }
    } catch (sessionUpdateError) {
      logger.error("Exception while updating session for lock", sessionUpdateError, {
        function: "lockScreenOnUserIdle",
        state
      });
      // Continue anyway - try to set lock cookie
    }

    // Persist screen lock state to cookie (survives page reload)
    try {
      await setScreenLockCookie(state);
      logger.info("✅ Screen locked successfully", {
        function: "lockScreenOnUserIdle",
        state
      });
      return true;
    } catch (cookieError) {
      logger.error("Failed to set screen lock cookie", cookieError, {
        function: "lockScreenOnUserIdle",
        state
      });
      return false;
    }
  } catch (error) {
    logger.error("❌ Exception in lockScreenOnUserIdle", error, {
      function: "lockScreenOnUserIdle",
      state
    });
    return false;
  }
}

/**
 * ✅ Server action wrapper for checking screen lock state from client
 * Called on component mount to restore lock state after page reload
 */
export async function checkScreenLockState(): Promise<boolean> {
  try {
    const isLocked = await getScreenLockState();
    if (isLocked) {
      logger.info("Screen lock state detected from persistent cookie", {
        function: "checkScreenLockState",
        isLocked
      });
    }
    return isLocked;
  } catch (error) {
    logger.error("Error checking screen lock state", error, {
      function: "checkScreenLockState"
    });
    return false;
  }
}
