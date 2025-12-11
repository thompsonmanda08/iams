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
  getWorkpaperTemplateCategories,
  getTemplateCategories,
  getTemplateCategory,
  createTemplateCategory,
  updateTemplateCategory,
  deleteTemplateCategory,
  getWorkingPaperTemplate,
  getAuditPlan,
  deleteAuditPlan,
  submitAuditPlanForApproval,
  updateAuditPlan,
  getAnnualAuditPlans,
  getAnnualAuditPlan,
  updateAnnualAuditPlan,
  submitAnnualAuditPlanForApproval,
  approveAnnualAuditPlan,
  rejectAnnualAuditPlan,
  createAnnualAuditPlanItem,
  getAnnualAuditPlanItems,
  getAnnualAuditPlanItem,
  updateAnnualAuditPlanItem,
  generateAuditPlanFromItem,
  deleteAnnualAuditPlanItem
} from "@/app/_actions/audit-module-actions";
import type { WorkpaperInput, TemplateCategory, AuditPlan } from "@/lib/types/audit-types";
import { useToast } from "./use-toast";
import { Pagination } from "@/lib/types";
import { notify } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { QUERY_KEYS } from "@/lib/constants";

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
  TEMPLATE_CATEGORY: "templateCategory",
  ANNUAL_AUDIT_PLANS: "annualAuditPlans",
  ANNUAL_AUDIT_PLAN: "annualAuditPlan"
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
 * Hook to fetch audit plans or plan by ID
 */
export const useAuditPlans = (params: Partial<Pagination> & { planId?: string }) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.AUDIT_PLANS, params?.planId],
    queryFn: async () => {
      const response = params?.planId
        ? await getAuditPlan(params?.planId)
        : await getAuditPlans(params);

      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

export const useSubmitAuditPlanForApproval = ({
  auditPlan,
  setAuditPlanData
}: {
  auditPlan: AuditPlan;
  setAuditPlanData: Dispatch<SetStateAction<AuditPlan>>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await submitAuditPlanForApproval(auditPlan.id);
      return result;
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
        notify({
          title: "Success",
          description: "Audit plan submitted for approval",
          type: "success"
        });
        // Update local state - set status to SUBMITTED
        setAuditPlanData((prev) => ({ ...prev, status: "SUBMITTED" }));
      } else {
        notify({
          title: "Error",
          description: response.message || "Failed to submit audit plan for approval",
          type: "error"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit audit plan for approval",
        type: "error"
      });
    }
  });
};

/**
 * Hook to delete an audit plan
 */
export const useDeleteAuditPlan = ({
  planId,
  setDeleteDialogOpen
}: {
  planId: string;
  setDeleteDialogOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteAuditPlan(planId);
      return result;
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
        notify({
          title: "Success",
          description: "Audit plan deleted successfully",
          type: "success"
        });
        setDeleteDialogOpen(false);
        window.location.href = "/dashboard/audit/plans";
        // Optionally navigate away or trigger parent callback
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete audit plan",
        type: "error"
      });
    }
  });
};

/**
 * Hook to fetch workpaper templates
 * Supports filtering by framework_type (e.g., 'ISO27001', 'COSO', 'COBIT', 'NIST')
 */
export const useWorkpaperTemplates = (params?: {
  page?: number;
  page_size?: number;
  framework_type?: string;
}) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.WORKPAPER_TEMPLATES, params],
    queryFn: async () => {
      const response = await getWorkingPaperTemplates(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};
/**
 * Hook to fetch workpaper templates categories
 */
export const useWorkpaperTemplateCategories = (templateId: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.WORKPAPER_TEMPLATES, templateId],
    queryFn: async () => {
      const response = await getWorkpaperTemplateCategories(templateId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!templateId
  });
};

/**
 * Hook to fetch workpaper template
 */
export const useWorkpaperTemplate = (templateId: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.WORKPAPER_TEMPLATES, templateId],
    queryFn: async () => {
      const response = await getWorkingPaperTemplate(templateId);
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

/**
 * Hook to update an existing audit plan
 */
export const useUpdateAuditPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: Record<string, any> }) => {
      const response = await updateAuditPlan(params.id, params.data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific audit plan query
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.AUDIT_PLANS, variables.id]
      });
      // Also invalidate the list of audit plans
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.AUDIT_PLANS]
      });
      notify({
        title: "Success",
        description: "Audit plan updated successfully"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update audit plan",
        type: "error"
      });
    }
  });
};

// ============================================================================
// ANNUAL AUDIT PLAN HOOKS
// ============================================================================

/**
 * Hook to fetch all annual audit plans with optional filters
 */
export const useAnnualAuditPlans = (params?: {
  year?: number;
  status?: string;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS, params],
    queryFn: async () => {
      const response = await getAnnualAuditPlans(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

/**
 * Hook to fetch a single annual audit plan by ID or year
 */
export const useAnnualAuditPlan = (filter?: { register_id?: string; year?: number }) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLAN, filter],
    queryFn: async () => {
      if (!filter?.register_id && !filter?.year) {
        throw new Error("Either register_id or year is required");
      }
      const response = await getAnnualAuditPlan(filter);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },

    enabled: !!(filter?.register_id || filter?.year),
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Hook to update annual audit plan
 */
export const useUpdateAnnualAuditPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { registerId: string; data: Record<string, any> }) => {
      const response = await updateAnnualAuditPlan(params.registerId, params.data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLAN, { register_id: variables.registerId }]
      });
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS]
      });
      notify({
        title: "Success",
        description: "Annual audit plan updated successfully",
        type: "success"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update annual audit plan",
        type: "error"
      });
    }
  });
};

/**
 * Hook to submit annual audit plan for approval
 */
export const useSubmitAnnualAuditPlanForApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { registerId: string; comments?: string }) => {
      const response = await submitAnnualAuditPlanForApproval(params.registerId, params.comments);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLAN, { register_id: variables.registerId }]
      });
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS]
      });
      notify({
        title: "Success",
        description: "Annual audit plan submitted for approval successfully",
        type: "success"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit annual audit plan for approval",
        type: "error"
      });
    }
  });
};

/**
 * Hook to approve annual audit plan
 */
export const useApproveAnnualAuditPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { registerId: string; comments?: string }) => {
      const response = await approveAnnualAuditPlan(params.registerId, params.comments);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLAN, { register_id: variables.registerId }]
      });
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS]
      });
      notify({
        title: "Success",
        description: "Annual audit plan approved successfully",
        type: "success"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to approve annual audit plan",
        type: "error"
      });
    }
  });
};

/**
 * Hook to reject annual audit plan
 */
export const useRejectAnnualAuditPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { registerId: string; reason: string }) => {
      const response = await rejectAnnualAuditPlan(params.registerId, params.reason);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLAN, { register_id: variables.registerId }]
      });
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS]
      });
      notify({
        title: "Success",
        description: "Annual audit plan rejected successfully",
        type: "success"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to reject annual audit plan",
        type: "error"
      });
    }
  });
};

// ============================================================================
// ANNUAL AUDIT PLAN ITEM HOOKS
// ============================================================================

/**
 * Hook to fetch all annual audit plan items for a register
 */
export const useAnnualAuditPlanItems = (
  registerId: string,
  filters?: {
    page?: number;
    page_size?: number;
  }
) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS, registerId, "items", filters],
    queryFn: async () => {
      const response = await getAnnualAuditPlanItems(registerId, filters);
      return response.data;
    },
    enabled: !!registerId,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

/**
 * Hook to fetch a single annual audit plan item
 */
export const useAnnualAuditPlanItem = (registerId: string, itemId: string) => {
  return useQuery({
    queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS, registerId, "item", itemId],
    queryFn: async () => {
      const response = await getAnnualAuditPlanItem(registerId, itemId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!(registerId && itemId),
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Hook to create annual audit plan item
 */
export const useCreateAnnualAuditPlanItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      registerId: string;
      data: {
        department_id: string;
        universe_item_ids: string[];
        engagement_date: string;
        responsible_person: string;
        [key: string]: any;
      };
    }) => {
      const response = await createAnnualAuditPlanItem(params.registerId, params.data);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS, variables.registerId, "items"]
      });
      notify({
        title: "Success",
        description: "Annual audit plan item created successfully",
        type: "success"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create annual audit plan item",
        type: "error"
      });
    }
  });
};

/**
 * Hook to update annual audit plan item
 */
export const useUpdateAnnualAuditPlanItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      registerId: string;
      itemId: string;
      data: {
        department_id?: string;
        universe_item_ids?: string[];
        engagement_date?: string;
        responsible_person?: string;
        [key: string]: any;
      };
    }) => {
      const response = await updateAnnualAuditPlanItem(
        params.registerId,
        params.itemId,
        params.data
      );
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS, variables.registerId, "items"]
      });
      queryClient.invalidateQueries({
        queryKey: [
          AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS,
          variables.registerId,
          "item",
          variables.itemId
        ]
      });
      notify({
        title: "Success",
        description: "Annual audit plan item updated successfully",
        type: "success"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update annual audit plan item",
        type: "error"
      });
    }
  });
};

/**
 * Hook to generate audit plan from annual audit plan item
 */
export const useGenerateAuditPlanFromItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      registerId: string;
      itemId: string;
      data: {
        title: string;
        description?: string;
        ref_no: string;
        end_date: string;
        audit_plan_date: string;
        audit_area: string;
        audit_scope: string;
        audit_criteria: string;
        audit_objective: string;
        management_standard: string;
        audit_team_members?: string[];
        client_representative: string;
        budget_item_ids?: string[];
        [key: string]: any;
      };
    }) => {
      const response = await generateAuditPlanFromItem(
        params.registerId,
        params.itemId,
        params.data
      );
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS, variables.registerId, "items"]
      });
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.AUDIT_PLANS]
      });
      notify({
        title: "Success",
        description: "Audit plan generated successfully from annual plan item",
        type: "success"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to generate audit plan from item",
        type: "error"
      });
    }
  });
};

/**
 * Hook to delete annual audit plan item
 */
export const useDeleteAnnualAuditPlanItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { registerId: string; itemId: string }) => {
      const response = await deleteAnnualAuditPlanItem(params.registerId, params.itemId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS, variables.registerId, "items"]
      });
      notify({
        title: "Success",
        description: "Annual audit plan item deleted successfully",
        type: "success"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete annual audit plan item",
        type: "error"
      });
    }
  });
};
