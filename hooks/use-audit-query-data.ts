/**
 * Audit Module TanStack Query Hooks
 *
 * This file contains all React Query hooks for the audit module,
 * including hooks for clause templates, workpapers, and team members.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClauseTemplates,
  getClauseTemplate,
  createClauseTemplate,
  updateClauseTemplate,
  deleteClauseTemplate,
  getWorkpapers,
  getWorkpaper,
  createWorkpaper,
  updateWorkpaper,
  getTeamMembers,
  getAuditPlans
} from "@/app/_actions/audit-module-actions";
import type { ClauseTemplateInput, WorkpaperInput } from "@/lib/types/audit-types";
import { useToast } from "./use-toast";

// Query Keys
export const AUDIT_QUERY_KEYS = {
  CLAUSE_TEMPLATES: "clauseTemplates",
  CLAUSE_TEMPLATE: "clauseTemplate",
  WORKPAPERS: "workpapers",
  WORKPAPER: "workpaper",
  TEAM_MEMBERS: "teamMembers",
  AUDIT_PLANS: "auditPlans"
} as const;

// ============================================================================
// CLAUSE TEMPLATE HOOKS
// ============================================================================

/**
 * Hook to fetch all clause templates
 */
export const useClauseTemplates = (category?: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.CLAUSE_TEMPLATES, category],
    queryFn: async () => {
      const response = await getClauseTemplates(category);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Hook to fetch a single clause template by ID
 */
export const useClauseTemplate = (id: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.CLAUSE_TEMPLATE, id],
    queryFn: async () => {
      const response = await getClauseTemplate(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new clause template
 */
export const useCreateClauseTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: ClauseTemplateInput) => {
      const response = await createClauseTemplate(input);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.CLAUSE_TEMPLATES] });
      toast({
        title: "Success",
        description: "Clause template created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create clause template",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to update an existing clause template
 */
export const useUpdateClauseTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClauseTemplateInput> }) => {
      const response = await updateClauseTemplate(id, data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.CLAUSE_TEMPLATES] });
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.CLAUSE_TEMPLATE, variables.id] });
      toast({
        title: "Success",
        description: "Clause template updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update clause template",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to delete a clause template
 */
export const useDeleteClauseTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteClauseTemplate(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.CLAUSE_TEMPLATES] });
      toast({
        title: "Success",
        description: "Clause template deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete clause template",
        variant: "destructive",
      });
    },
  });
};

// ============================================================================
// WORKPAPER HOOKS
// ============================================================================

/**
 * Hook to fetch all workpapers, optionally filtered by audit ID
 */
export const useWorkpapers = (auditId?: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.WORKPAPERS, auditId],
    queryFn: async () => {
      const response = await getWorkpapers(auditId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

/**
 * Hook to fetch a single workpaper by ID
 */
export const useWorkpaper = (id: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.WORKPAPER, id],
    queryFn: async () => {
      const response = await getWorkpaper(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to create a new workpaper
 */
export const useCreateWorkpaper = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: WorkpaperInput) => {
      const response = await createWorkpaper(input);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.WORKPAPERS] });
      toast({
        title: "Success",
        description: "Workpaper created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workpaper",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to update an existing workpaper
 */
export const useUpdateWorkpaper = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkpaperInput> }) => {
      const response = await updateWorkpaper(id, data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.WORKPAPERS] });
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.WORKPAPER, variables.id] });
      toast({
        title: "Success",
        description: "Workpaper updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update workpaper",
        variant: "destructive",
      });
    },
  });
};

// ============================================================================
// OTHER HOOKS
// ============================================================================

/**
 * Hook to fetch team members
 */
export const useTeamMembers = () => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.TEAM_MEMBERS],
    queryFn: async () => {
      const response = await getTeamMembers();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

/**
 * Hook to fetch audit plans
 */
export const useAuditPlans = () => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.AUDIT_PLANS],
    queryFn: async () => {
      const response = await getAuditPlans();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
