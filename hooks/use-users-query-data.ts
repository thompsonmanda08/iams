import { UserQueryParams } from "@/lib/types/account";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRefreshToken, initializeSystemSetup } from "@/app/_actions/auth-actions";
import {
  getUsers,
  createNewUser,
  updateUser,
  getHeadsOfDepartments,
  getUserById
} from "@/app/_actions/user-actions";
import { SESSION_CONFIG } from "@/lib/session-config";

// Query Keys
export const USERS_QUERY_KEYS = {
  USERS: "users",
  REFRESH_TOKEN: "refresh-token",
  SYS_SETUP: "system-setup",
  HEADS_OF_DEPARTMENTS: "heads-of-departments"
} as const;

/**
 * Hook to fetch team members
 */
export const useUsers = (params?: {
  page?: number;
  page_size?: number;
  department_id?: string;
  user_id?: string;
}) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEYS.USERS, params?.user_id, params],
    queryFn: params?.user_id
      ? async () => await getUserById(String(params?.user_id))
      : async () => await getUsers(params),
    staleTime: 5 * 60 * 1000 // Cache for 10 minutes
  });
};
/**
 * Hook to fetch team members
 */
export const useHeadsOfDepartments = (
  params: { page?: number; page_size?: number; department_id?: string } | undefined
) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEYS.HEADS_OF_DEPARTMENTS, params],
    queryFn: async () => await getHeadsOfDepartments(params),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

/**
 * Hook to refresh authentication token
 * Configuration:
 * - When enabled=true: Automatically refreshes at half of session_timeout (capped at TOKEN_REFRESH_INTERVAL)
 * - When enabled=false: No automatic refresh
 * - sessionTimeoutMs: backend session_timeout converted to ms (session_timeout * 60 * 1000)
 *
 * This ensures the refresh fires well before expiry regardless of the configured timeout.
 */
export const useRefreshToken = (enabled: boolean = false, sessionTimeoutMs?: number) => {
  const interval = sessionTimeoutMs
    ? Math.min(sessionTimeoutMs / 2, SESSION_CONFIG.TOKEN_REFRESH_INTERVAL)
    : SESSION_CONFIG.TOKEN_REFRESH_INTERVAL;

  return useQuery({
    // Stable queryKey: do NOT include `enabled` or `interval` — toggling these
    // (e.g. on every lock/unlock) would create a new query and restart the
    // refetchInterval from zero, so refresh would never fire if the user
    // locks/unlocks frequently within the interval window.
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN],
    queryFn: getRefreshToken,
    // ✅ CRITICAL FIX: Smart retry logic
    // Don't retry on 403 token expiration - these should fail fast
    // Retry temporary network issues (timeouts, connection errors) but not auth failures
    retry: (failureCount, error: any) => {
      // Check if it's a 403 token expiration error
      if (error?.response?.status === 403 || error?.status === 403) {
        // Don't retry - user session is invalid
        return false;
      }
      // Retry temporary network errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 8000);
    },
    // Fire one refresh on mount so the cookie is extended immediately when
    // the IdleTimerContainer first mounts — otherwise the first refresh waits
    // a full `interval` (up to 30 min), which can exceed a short backend
    // session_timeout and let the cookie expire before any refresh fires.
    refetchOnMount: true,
    refetchInterval: enabled ? interval : false,
    // Keep refreshing even while the tab is backgrounded — otherwise a user
    // working in another window for >session_timeout silently loses session.
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider stale to enable refetch
    enabled
  });
};

/**
 * Hook to fetch system setup (user data and permissions).
 *
 * Pass `initialData` when the parent layout already pre-fetched the setup
 * payload server-side — React Query treats it as fresh until staleTime elapses,
 * which prevents the sidebar from flashing on page reload.
 */
export const useSystemSetup = (
  enabled: boolean = false,
  options?: { initialData?: any }
) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.SYS_SETUP, enabled],
    queryFn: async () => {
      const response = await initializeSystemSetup();
      if (!response.success) {
        throw new Error("System setup failed");
      }

      return response.data;
    },
    retry: 2,
    refetchInterval: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 30 * 60 * 1000,
    enabled,
    initialData: options?.initialData,
    initialDataUpdatedAt: options?.initialData ? Date.now() : undefined
  });

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewUser,
    onSuccess: () => {
      // Invalidate all user queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEYS.USERS] });
    }
  });
};

/**
 * Hook to update an existing user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => updateUser(userId, data),
    onSuccess: () => {
      // Invalidate all user queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEYS.USERS] });
    }
  });
};
