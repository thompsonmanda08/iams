"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import { createBudget, createBudgetLine } from "@/app/_actions/audit-module-actions";

/**
 * Hook to create a new budget
 * Used in: budget-form.tsx
 *
 * Usage:
 * const { mutate: createNewBudget, isPending } = useCreateBudgetMutation({
 *   onSuccess: (budgetId) => {
 *     setBudgetData(INIT_BUDGET_DATA);
 *     onBudgetCreated?.(budgetId);
 *   }
 * });
 *
 * createNewBudget({
 *   department_id: "dept-123",
 *   title: "2025 Budget",
 *   ...
 * });
 */
export function useCreateBudgetMutation(options?: {
  onSuccess?: (budgetId: string) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createBudget(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create budget");
      }
      return result;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      notify({
        title: "Success",
        description: response.message || "Budget created successfully",
        type: "success"
      });
      const budgetId = response.data?.id;
      if (budgetId) {
        options?.onSuccess?.(budgetId);
      }
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create budget",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to create a budget line item
 * Used in: budget-form.tsx
 *
 * Usage:
 * const { mutate: createLine, isPending } = useCreateBudgetLineMutation({
 *   onSuccess: () => {
 *     setLineData(INIT_LINE_DATA);
 *   }
 * });
 *
 * createLine({
 *   budgetId: "budget-123",
 *   data: { name: "Personnel", ... }
 * });
 */
export function useCreateBudgetLineMutation(options?: {
  onSuccess?: (line: any) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { budgetId: string; data: any }) => {
      const result = await createBudgetLine(params.budgetId, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create budget line");
      }
      return result;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      notify({
        title: "Success",
        description: response.message || "Budget line created successfully",
        type: "success"
      });
      options?.onSuccess?.(response.data);
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create budget line",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
