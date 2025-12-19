"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  createKRI,
  updateKRI,
  deleteKRI,
  addKRIMeasurement
} from "@/app/_actions/risk-module-actions";

/**
 * Hook to create a KRI (Key Risk Indicator)
 * Used in: KRI management components
 *
 * Usage:
 * const { mutate: createKRI, isPending } = useCreateKRIMutation({
 *   onSuccess: () => {
 *     setOpen(false);
 *   }
 * });
 *
 * createKRI({
 *   name: "KRI Name",
 *   description: "Description",
 *   kri_register_id: "register-123",
 *   category_id: "category-456",
 *   ...
 * });
 */
export function useCreateKRIMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createKRI(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create KRI");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kris"] });
      queryClient.invalidateQueries({ queryKey: ["kriMetrics"] });
      notify({
        title: "Success",
        description: "KRI created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create KRI",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update a KRI
 * Used in: KRI management components
 *
 * Usage:
 * const { mutate: updateKRI, isPending } = useUpdateKRIMutation({
 *   onSuccess: () => {
 *     setOpen(false);
 *   }
 * });
 *
 * updateKRI({
 *   id: "kri-123",
 *   data: { name: "Updated Name", ... }
 * });
 */
export function useUpdateKRIMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: any }) => {
      const result = await updateKRI(params.id, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update KRI");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kris"] });
      queryClient.invalidateQueries({ queryKey: ["kriMetrics"] });
      notify({
        title: "Success",
        description: "KRI updated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update KRI",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to delete a KRI
 * Used in: KRI management components
 *
 * Usage:
 * const { mutate: deleteKRI, isPending } = useDeleteKRIMutation({
 *   onSuccess: () => {
 *     setDeleteOpen(false);
 *   }
 * });
 *
 * deleteKRI(kriId);
 */
export function useDeleteKRIMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kriId: string) => {
      const result = await deleteKRI(kriId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete KRI");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kris"] });
      queryClient.invalidateQueries({ queryKey: ["kriMetrics"] });
      notify({
        title: "Success",
        description: "KRI deleted successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete KRI",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to add a KRI measurement
 * Used in: KRI measurement tracking components
 *
 * Usage:
 * const { mutate: addMeasurement, isPending } = useAddKRIMeasurementMutation({
 *   onSuccess: () => {
 *     setMeasurementData({});
 *   }
 * });
 *
 * addMeasurement({
 *   kri_id: "kri-123",
 *   measurement: {
 *     measured_value: 95,
 *     measurement_date: new Date()
 *   }
 * });
 */
export function useAddKRIMeasurementMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { kri_id: string; measurement: any }) => {
      const result = await addKRIMeasurement(params.kri_id, params.measurement);
      if (!result.success) {
        throw new Error(result.message || "Failed to add KRI measurement");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kriMeasurements"] });
      queryClient.invalidateQueries({ queryKey: ["kriMetrics"] });
      notify({
        title: "Success",
        description: "KRI measurement added successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to add KRI measurement",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
