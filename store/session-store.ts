import { useQuery } from "@tanstack/react-query";
import { getServerSession } from "@/app/_actions/auth-actions";
import { useSystemSetup } from "@/hooks/use-users-query-data";

const REVALIDATE_AFTER = 5 * 60 * 1000; // 5 minutes

export const useSession = () => {
  const { data: sessionRes, isLoading: loadingSession } = useQuery({
    queryKey: ["profile-session"],
    queryFn: getServerSession,
    staleTime: REVALIDATE_AFTER
  });

  const isAuthenticated = !!sessionRes?.session?.accessToken;

  const { data: sessionResponse, isLoading: loadingSetup } = useSystemSetup(isAuthenticated);

  const isLoading = loadingSession || loadingSetup;

  return {
    isLoading,
    isAuthenticated,
    user: sessionResponse?.data || null,
    session: sessionRes?.session || null
  };
};
