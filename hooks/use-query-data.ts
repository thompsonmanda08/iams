import { getBranches, getDepartments, getRoles } from "@/app/_actions/config-actions";
import { QUERY_KEYS } from "@/lib/constants";
import { Pagination } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export const useDepartments = (params?: {
  parent_id?: string;
  is_active?: boolean;
  page_size?: number;
  page?: number;
}) =>
  useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS, params],
    queryFn: () => getDepartments(params),
    staleTime: Infinity
  });

export const useBranches = (
  params?: Partial<Pagination> & {
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

export const useRoles = (
  params?: Partial<Pagination> & {
    departmentId?: string;
    is_Active?: boolean;
  }
) =>
  useQuery({
    queryKey: [QUERY_KEYS.ROLES, params],
    queryFn: () => getRoles(params as any),
    staleTime: 5 * 60 * 1000
  });
