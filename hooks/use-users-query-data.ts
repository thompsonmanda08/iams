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
 * - When enabled=true: Automatically refreshes token every 30 minutes
 * - When enabled=false: No automatic refresh
 *
 * This prevents token expiry at 60 minutes by refreshing at 30 minutes
 * User must be active (not idle) for auto-refresh to happen
 */
const REFRESH_INTERVAL = SESSION_CONFIG.TOKEN_REFRESH_INTERVAL; // Refresh every 30 minutes (before 60-min expiry)

export const useRefreshToken = (enabled: boolean = false) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN, enabled],
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
    refetchOnMount: false,
    // ✅ Auto-refresh every 25 minutes when enabled
    // This is BEFORE the 30-minute session expiry
    refetchInterval: enabled ? REFRESH_INTERVAL : false,
    staleTime: 0, // Always consider stale to enable refetch
    enabled
  });

/**
 * Hook to fetch system setup (user data and permissions)
 * IMPORTANT: This hook is disabled by default as it's handled server-side
 * Only enable if you need to manually trigger a refresh
 */
export const useSystemSetup = (enabled: boolean = false) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.SYS_SETUP, enabled], // Add enabled to key to prevent cache collision
    queryFn: initializeSystemSetup,
    retry: 2, // ✅ No retries - fail fast
    refetchInterval: false, // ✅ DISABLED: Prevents automatic refetch every 5 minutes
    refetchOnMount: false, // ✅ Don't refetch when component mounts
    refetchOnWindowFocus: false, // ✅ Don't refetch when window gains focus
    refetchOnReconnect: true, // ✅ Refetch when network reconnects
    staleTime: Infinity, // ✅ Never go stale
    enabled // ✅ Disabled by default
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
