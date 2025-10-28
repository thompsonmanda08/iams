/**
 * Audit Module TanStack Query Hooks
 *
 * This file contains all React Query hooks for the audit module,
 * including hooks for clause templates, workpapers, and team members.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkpapers,
  getWorkpaper,
  createWorkpaper,
  updateWorkpaper,
  getAuditPlans,
  getWorkingPaperTemplates,
  getWorkingPaperTemplateWithCategories,
  getTemplateCategories,
  getTemplateCategory,
  createTemplateCategory,
  updateTemplateCategory,
  deleteTemplateCategory
} from "@/app/_actions/audit-module-actions";
import type {
  ClauseTemplateInput,
  WorkpaperInput,
  TemplateCategory
} from "@/lib/types/audit-types";
import { useToast } from "./use-toast";
import { getUsers } from "@/app/_actions/user-actions";
import { User, UserQueryParams } from "@/lib/types/account";

// Query Keys
export const AUDIT_QUERY_KEYS = {
  CLAUSE_TEMPLATES: "clauseTemplates",
  CLAUSE_TEMPLATE: "clauseTemplate",
  WORKPAPERS: "workpapers",
  WORKPAPER: "workpaper",
  TEAM_MEMBERS: "teamMembers",
  AUDIT_PLANS: "auditPlans",
  WORKPAPER_TEMPLATES: "workpaperTemplates",
  TEMPLATE_CATEGORIES: "templateCategories",
  TEMPLATE_CATEGORY: "templateCategory"
} as const;

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
    staleTime: 2 * 60 * 1000 // Cache for 2 minutes
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
    staleTime: 2 * 60 * 1000
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
        description: "Workpaper created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workpaper",
        variant: "destructive"
      });
    }
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
        description: "Workpaper updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update workpaper",
        variant: "destructive"
      });
    }
  });
};

// ============================================================================
// OTHER HOOKS
// ============================================================================

/**
 * Hook to fetch team members
 */
export const useTeamMembers = (params: UserQueryParams | undefined) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.TEAM_MEMBERS, params],
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
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};
/**
 * Hook to fetch workpaper templates
 */
export const useWorkpaperTemplates = () => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.WORKPAPER_TEMPLATES],
    queryFn: async () => {
      const response = await getWorkingPaperTemplates();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};
/**
 * Hook to fetch workpaper templates with categories
 */
export const useWorkpaperTemplatesWithCategories = (templateId: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.WORKPAPER_TEMPLATES, templateId],
    queryFn: async () => {
      const response = await getWorkingPaperTemplateWithCategories(templateId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!templateId
  });
};

// ============================================================================
// TEMPLATE CATEGORY HOOKS
// ============================================================================

/**
 * Hook to fetch all categories for a specific template
 */
export const useTemplateCategories = (templateId: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.TEMPLATE_CATEGORIES, templateId],
    queryFn: async () => {
      const response = await getTemplateCategories(templateId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

/**
 * Hook to fetch a single template category by ID
 */
export const useTemplateCategory = (categoryId: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.TEMPLATE_CATEGORY, categoryId],
    queryFn: async () => {
      const response = await getTemplateCategory(categoryId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Hook to create a new template category
 */
export const useCreateTemplateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TemplateCategory) => {
      const response = await createTemplateCategory(data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.TEMPLATE_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.WORKPAPER_TEMPLATES] });
      toast({
        title: "Success",
        description: "Template category created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template category",
        variant: "destructive"
      });
    }
  });
};

/**
 * Hook to update an existing template category
 */
export const useUpdateTemplateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      categoryId,
      data
    }: {
      categoryId: string;
      data: Partial<TemplateCategory>;
    }) => {
      const response = await updateTemplateCategory(categoryId, data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.TEMPLATE_CATEGORIES] });
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.TEMPLATE_CATEGORY, variables.categoryId]
      });
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.WORKPAPER_TEMPLATES] });
      toast({
        title: "Success",
        description: "Template category updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template category",
        variant: "destructive"
      });
    }
  });
};

/**
 * Hook to delete a template category
 */
export const useDeleteTemplateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await deleteTemplateCategory(categoryId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.TEMPLATE_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEYS.WORKPAPER_TEMPLATES] });
      toast({
        title: "Success",
        description: "Template category deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template category",
        variant: "destructive"
      });
    }
  });
};
