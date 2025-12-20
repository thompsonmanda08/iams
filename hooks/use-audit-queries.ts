"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { getAuditMemo, getMemoTemplate } from "@/app/_actions/audit-module-actions";

/**
 * Hook to fetch audit memo for a specific audit plan
 */
export function useAuditMemo(auditPlanId: string, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.AUDIT_MEMOS, auditPlanId],
    queryFn: async () => {
      const result = await getAuditMemo(auditPlanId);
      return result.success ? result.data : null;
    },
    enabled: !!auditPlanId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook to fetch memo template for a specific audit plan
 * This is a manual fetch hook - you need to call refetch() to load the template
 */
export function useMemoTemplate(auditPlanId: string, options = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.AUDIT_MEMOS, auditPlanId, "template"],
    queryFn: async () => {
      const result = await getMemoTemplate(auditPlanId);
      return result.success ? result.data : null;
    },
    enabled: false, // Manual fetch only - call refetch() to trigger
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}
