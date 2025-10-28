import { getBranches, getDepartments } from "@/app/_actions/config-actions";
import { QUERY_KEYS } from "@/lib/constants";
import { Pagination } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export const useDepartments = (
  params?: Pagination & {
    parentId?: string;
    isActive?: boolean;
  }
) =>
  useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS, params],
    queryFn: () => getDepartments(params),
    staleTime: Infinity
  });

export const useBranches = (
  params?: Pagination & {
    provinceId?: string;
    townId?: string;
    isActive?: boolean;
  }
) =>
  useQuery({
    queryKey: [QUERY_KEYS.BRANCHES, params],
    queryFn: () => getBranches(params),
    staleTime: Infinity
  });
