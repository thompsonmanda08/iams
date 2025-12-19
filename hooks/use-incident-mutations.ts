"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  getDepartments,
  getRiskCausesHierarchy
} from "@/app/_actions/config-actions";
import { getKRIs } from "@/app/_actions/risk-module-actions";
import { getUsers } from "@/app/_actions/user-actions";
import { createIncident } from "@/app/_actions/incident-actions";

/**
 * Hook to fetch departments for incident creation
 * Used in: Incident creation forms
 *
 * Usage:
 * const { data: departments, isLoading } = useDepartmentsForIncident();
 */
export function useDepartmentsForIncident() {
  return useQuery({
    queryKey: ["departments-incident"],
    queryFn: async () => {
      const result = await getDepartments({ isActive: true });
      if (!result.success || !result.data?.data) {
        throw new Error(result.message || "Failed to fetch departments");
      }
      return result.data.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Hook to fetch risk causes hierarchy for incident creation
 * Used in: Incident creation forms
 *
 * Usage:
 * const { data: causes, isLoading } = useCausesHierarchyForIncident();
 */
export function useCausesHierarchyForIncident() {
  return useQuery({
    queryKey: ["causes-hierarchy-incident"],
    queryFn: async () => {
      const result = await getRiskCausesHierarchy();
      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to fetch causes");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Hook to fetch users for a specific department
 * Used in: Incident creation forms - responsible person selection
 *
 * Usage:
 * const { data: users, isLoading } = useDepartmentUsersForIncident(departmentId);
 */
export function useDepartmentUsersForIncident(departmentId: string) {
  return useQuery({
    queryKey: ["department-users-incident", departmentId],
    queryFn: async () => {
      if (!departmentId) return [];
      const result = await getUsers({
        departmentId,
        isActive: true
      });
      if (!result.success || !result.data?.data) {
        throw new Error(result.message || "Failed to fetch users");
      }
      return result.data.data;
    },
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Hook to fetch KRIs for a specific department
 * Used in: Incident creation forms - KRI selection
 *
 * Usage:
 * const { data: kris, isLoading } = useIncidentKRIs(departmentId);
 */
export function useIncidentKRIs(departmentId: string) {
  return useQuery({
    queryKey: ["kris-incident", departmentId],
    queryFn: async () => {
      if (!departmentId) return [];
      const result = await getKRIs({
        department_id: departmentId
      });
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch KRIs");
      }
      return result.data?.data || [];
    },
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Hook to create an incident
 * Used in: Incident creation components
 *
 * Usage:
 * const { mutate: createNewIncident, isPending } = useCreateIncidentMutation({
 *   onSuccess: () => {
 *     router.push("/dashboard/risks/incidents");
 *   }
 * });
 *
 * createNewIncident({
 *   department_id: "dept-123",
 *   primary_cause_id: "cause-456",
 *   ...formData
 * });
 */
export function useCreateIncidentMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createIncident(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create incident");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      notify({
        title: "Success",
        description: "Incident created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create incident",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
