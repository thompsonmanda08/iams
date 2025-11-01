import { UserQueryParams } from "@/lib/types/account";
import { useQuery } from "@tanstack/react-query";
import { getRefreshToken, initializeSystemSetup } from "@/app/_actions/auth-actions";
import { getUsers } from "@/app/_actions/user-actions";

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
 * Hook to manually refresh authentication token
 * IMPORTANT: Auto-refetch disabled to prevent screen flickering
 * Only refetch manually when user takes action (e.g., unlock screen)
 */
export const useRefreshToken = (enabled: boolean = false) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN, enabled],
    queryFn: getRefreshToken,
    retry: 1, // Reduced retries
    retryDelay: 1000,
    refetchOnMount: false,
    refetchInterval: false, // ✅ DISABLED: Prevents automatic refetch every 3 minutes
    staleTime: Infinity, // ✅ Never auto-refetch, only manual
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
