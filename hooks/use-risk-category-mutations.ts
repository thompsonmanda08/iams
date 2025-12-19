"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  createRiskCategory,
  updateRiskCategory,
  deleteRiskCategory
} from "@/app/_actions/config-actions";

/**
 * Hook to create a risk category
 * Used in: app/dashboard/system-configs/_components/risk-categories-config.tsx
 *
 * Usage:
 * const { mutate: createCategory, isPending } = useCreateRiskCategoryMutation({
 *   onSuccess: () => {
 *     setFormData(INIT_DATA);
 *   }
 * });
 *
 * createCategory({
 *   name: "Category Name",
 *   description: "...",
 *   ...
 * });
 */
export function useCreateRiskCategoryMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createRiskCategory(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create risk category");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskCategories"] });
      notify({
        title: "Success",
        description: "Risk category created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create risk category",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update a risk category
 * Used in: app/dashboard/system-configs/_components/risk-categories-config.tsx
 *
 * Usage:
 * const { mutate: updateCategory, isPending } = useUpdateRiskCategoryMutation({
 *   onSuccess: () => {
 *     setFormData(INIT_DATA);
 *   }
 * });
 *
 * updateCategory({
 *   id: "category-123",
 *   data: { name: "...", ... }
 * });
 */
export function useUpdateRiskCategoryMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: any }) => {
      const result = await updateRiskCategory(params.id, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update risk category");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskCategories"] });
      notify({
        title: "Success",
        description: "Risk category updated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update risk category",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to delete a risk category
 * Used in: app/dashboard/system-configs/_components/risk-categories-config.tsx
 *
 * Usage:
 * const { mutate: deleteCategory, isPending } = useDeleteRiskCategoryMutation({
 *   onSuccess: () => {
 *     setDeleteOpen(false);
 *   }
 * });
 *
 * deleteCategory(categoryId);
 */
export function useDeleteRiskCategoryMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const result = await deleteRiskCategory(categoryId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete risk category");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskCategories"] });
      notify({
        title: "Success",
        description: "Risk category deleted successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete risk category",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
