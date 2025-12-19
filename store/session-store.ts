import { useQuery } from "@tanstack/react-query";
import { getServerSession } from "@/app/_actions/auth-actions";

const REVALIDATE_AFTER = 5 * 60 * 1000; // 5 minutes

export const useSession = () => {
  const { data: sessionRes } = useQuery({
    queryKey: ["profile"],
    queryFn: getServerSession,
    staleTime: REVALIDATE_AFTER
  });

  return {
    session: sessionRes?.session || null,
    isAuthenticated: !!sessionRes?.session?.accessToken || false
  };
};
