import { getBranches, getDepartments } from "@/app/_actions/config-actions";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useDepartments = () =>
  useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: getDepartments,
    staleTime: Infinity
  });

export const useBranches = () =>
  useQuery({
    queryKey: [QUERY_KEYS.BRANCHES],
    queryFn: getBranches,
    staleTime: Infinity
  });