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
    queryFn: async () => {
      const response = await getUsers(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 10 minutes
  });
};

export const useRefreshToken = (enabled: boolean) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN, enabled],
    queryFn: getRefreshToken,
    retry: 3,
    retryDelay: 3000,
    refetchOnMount: false,
    refetchInterval: 1000 * 60 * 3, // 3minutes
    staleTime: 60 * 1000 * 3,
    enabled
  });
export const useSystemSetup = () =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.SYS_SETUP],
    queryFn: initializeSystemSetup,
    retry: 3,
    retryDelay: 3000,
    refetchInterval: 1000 * 60 * 5, // 3minutes
    staleTime: 60 * 1000 * 5
  });
