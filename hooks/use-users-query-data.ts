import { UserQueryParams } from "@/lib/types/account";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRefreshToken, initializeSystemSetup } from "@/app/_actions/auth-actions";
import { getUsers, createNewUser, updateUser } from "@/app/_actions/user-actions";
import { SESSION_CONFIG } from "@/lib/session-config";

// Query Keys
export const USERS_QUERY_KEYS = {
  USERS: "users",
  REFRESH_TOKEN: "refresh-token",
  SYS_SETUP: "system-setup"
} as const;

/**
 * Hook to fetch team members
 */
export const useTeamMembers = (params: UserQueryParams | undefined) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEYS.USERS, params],
    queryFn: async () => await getUsers(params),
    staleTime: 5 * 60 * 1000 // Cache for 10 minutes
  });
};

/**
 * Hook to refresh authentication token
 * Configuration:
 * - When enabled=true: Automatically refreshes token every 25 minutes
 * - When enabled=false: No automatic refresh
 *
 * This prevents token expiry at 30 minutes by refreshing at 25 minutes
 * User must be active (not idle) for auto-refresh to happen
 */
const REFRESH_INTERVAL = SESSION_CONFIG.TOKEN_REFRESH_INTERVAL; // Refresh at 25 minutes (before 30-min expiry)

export const useRefreshToken = (enabled: boolean = false) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN, enabled],
    queryFn: getRefreshToken,
    // ✅ CRITICAL FIX: Increase retries to prevent silent token expiry
    // With only 1 retry, temporary network issues cause permanent failure
    retry: 3,
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
    retry: 0, // ✅ No retries - fail fast
    refetchInterval: false, // ✅ DISABLED: Prevents automatic refetch every 5 minutes
    refetchOnMount: false, // ✅ Don't refetch when component mounts
    refetchOnWindowFocus: false, // ✅ Don't refetch when window gains focus
    refetchOnReconnect: false, // ✅ Don't refetch when network reconnects
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
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      updateUser(userId, data),
    onSuccess: () => {
      // Invalidate all user queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEYS.USERS] });
    }
  });
};
