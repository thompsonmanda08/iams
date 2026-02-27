/**
 * Audit Settings Mutations Hook
 *
 * Consolidated mutations for audit settings operations including:
 * - Indicative Targets
 * - Auditable Areas
 * - Strategic Pillars
 * - Strategic Initiatives
 * - Process Activities
 *
 * Each hook provides delete and save mutations with proper error handling,
 * toast notifications, and query invalidation.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import {
  createIndicativeTarget,
  updateIndicativeTarget,
  deleteIndicativeTarget,
  createAuditableArea,
  updateAuditableArea,
  deleteAuditableArea,
  createStrategicPillar,
  updateStrategicPillar,
  deleteStrategicPillar,
  createStrategicInitiative,
  updateStrategicInitiative,
  deleteStrategicInitiative,
  createProcessActivity,
  updateProcessActivity,
  deleteProcessActivity,
  createGeneralWorkPaperConfig,
  updateGeneralWorkPaperConfig,
  deleteGeneralWorkPaperConfig,
  type CreateGeneralWorkPaperConfigPayload,
  type UpdateGeneralWorkPaperConfigPayload
} from "@/app/_actions/audit-settings-actions";

// ============================================================================
// INDICATIVE TARGETS MUTATIONS
// ============================================================================

/**
 * Hook for indicative target mutations (create, update, delete)
 */
export const useIndicativeTargetsMutations = () => {
  const queryClient = useQueryClient();

  const deleteIndicativeTargetMutation = useMutation({
    mutationFn: (payload: string | { id: string; onSuccess?: () => void }) => {
      const id = typeof payload === 'string' ? payload : payload.id;
      return deleteIndicativeTarget(id);
    },
    onSuccess: (response, payload) => {
      const onSuccess = typeof payload === 'object' ? payload.onSuccess : undefined;
      if (response.success) {
        toast.success("Indicative Target deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INDICATIVE_TARGETS] });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to delete item");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete item");
      console.error("Error deleting item:", error);
    }
  });

  const saveIndicativeTargetMutation = useMutation({
    mutationFn: (payload: any) => {
      const data = payload.data || payload;
      return data.id
        ? updateIndicativeTarget(data)
        : createIndicativeTarget(data);
    },
    onSuccess: (response, payload) => {
      const onSuccess = payload?.onSuccess;
      const onError = payload?.onError;
      if (response.success) {
        toast.success(`Indicative Target ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INDICATIVE_TARGETS] });
        onSuccess?.();
      } else {
        onError?.(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error: any) => {
      console.error("Error saving item:", error);
    }
  });

  return {
    deleteIndicativeTargetMutation,
    saveIndicativeTargetMutation
  };
};

// ============================================================================
// AUDITABLE AREAS MUTATIONS
// ============================================================================

/**
 * Hook for auditable area mutations (create, update, delete)
 */
export const useAuditableAreasMutations = () => {
  const queryClient = useQueryClient();

  const deleteAuditableAreaMutation = useMutation({
    mutationFn: (payload: string | { id: string; onSuccess?: () => void }) => {
      const id = typeof payload === 'string' ? payload : payload.id;
      return deleteAuditableArea(id);
    },
    onSuccess: (response, payload) => {
      const onSuccess = typeof payload === 'object' ? payload.onSuccess : undefined;
      if (response.success) {
        toast.success("Auditable Area deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDITABLE_AREAS] });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to delete item");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete item");
      console.error("Error deleting item:", error);
    }
  });

  const saveAuditableAreaMutation = useMutation({
    mutationFn: (payload: any) => {
      const data = payload.data || payload;
      return data.id
        ? updateAuditableArea(data)
        : createAuditableArea(data);
    },
    onSuccess: (response, payload) => {
      const onSuccess = payload?.onSuccess;
      const onError = payload?.onError;
      if (response.success) {
        toast.success(`Auditable Area ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDITABLE_AREAS] });
        onSuccess?.();
      } else {
        onError?.(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error: any) => {
      console.error("Error saving item:", error);
    }
  });

  return {
    deleteAuditableAreaMutation,
    saveAuditableAreaMutation
  };
};

// ============================================================================
// STRATEGIC PILLARS MUTATIONS
// ============================================================================

/**
 * Hook for strategic pillar mutations (create, update, delete)
 */
export const useStrategicPillarsMutations = () => {
  const queryClient = useQueryClient();

  const deleteStrategicPillarMutation = useMutation({
    mutationFn: (payload: string | { id: string; onSuccess?: () => void }) => {
      const id = typeof payload === 'string' ? payload : payload.id;
      return deleteStrategicPillar(id);
    },
    onSuccess: (response, payload) => {
      const onSuccess = typeof payload === 'object' ? payload.onSuccess : undefined;
      if (response.success) {
        toast.success("Strategic Pillar deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_PILLARS] });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to delete pillar");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete pillar");
      console.error("Error deleting pillar:", error);
    }
  });

  const saveStrategicPillarMutation = useMutation({
    mutationFn: (payload: any) => {
      const data = payload.data || payload;
      return data.id
        ? updateStrategicPillar(data)
        : createStrategicPillar(data);
    },
    onSuccess: (response, payload) => {
      const onSuccess = payload?.onSuccess;
      const onError = payload?.onError;
      if (response.success) {
        toast.success(`Strategic Pillar ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_PILLARS] });
        onSuccess?.();
      } else {
        onError?.(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error: any) => {
      console.error("Error saving pillar:", error);
    }
  });

  return {
    deleteStrategicPillarMutation,
    saveStrategicPillarMutation
  };
};

// ============================================================================
// STRATEGIC INITIATIVES MUTATIONS
// ============================================================================

/**
 * Hook for strategic initiative mutations (create, update, delete)
 */
export const useStrategicInitiativesMutations = () => {
  const queryClient = useQueryClient();

  const deleteStrategicInitiativeMutation = useMutation({
    mutationFn: (payload: string | { id: string; onSuccess?: () => void }) => {
      const id = typeof payload === 'string' ? payload : payload.id;
      return deleteStrategicInitiative(id);
    },
    onSuccess: (response, payload) => {
      const onSuccess = typeof payload === 'object' ? payload.onSuccess : undefined;
      if (response.success) {
        toast.success("Strategic Initiative deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES] });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to delete initiative");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete initiative");
      console.error("Error deleting initiative:", error);
    }
  });

  const saveStrategicInitiativeMutation = useMutation({
    mutationFn: (payload: any) => {
      const data = payload.data || payload;
      return data.id
        ? updateStrategicInitiative(data)
        : createStrategicInitiative(data);
    },
    onSuccess: (response, payload) => {
      const onSuccess = payload?.onSuccess;
      const onError = payload?.onError;
      if (response.success) {
        toast.success(`Strategic Initiative ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES] });
        onSuccess?.();
      } else {
        onError?.(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error: any) => {
      console.error("Error saving initiative:", error);
    }
  });

  return {
    deleteStrategicInitiativeMutation,
    saveStrategicInitiativeMutation
  };
};

// ============================================================================
// PROCESS ACTIVITIES MUTATIONS
// ============================================================================

/**
 * Hook for process activity mutations (create, update, delete)
 */
export const useProcessActivitiesMutations = () => {
  const queryClient = useQueryClient();

  const deleteProcessActivityMutation = useMutation({
    mutationFn: (payload: string | { id: string; onSuccess?: () => void }) => {
      const id = typeof payload === 'string' ? payload : payload.id;
      return deleteProcessActivity(id);
    },
    onSuccess: (response, payload) => {
      const onSuccess = typeof payload === 'object' ? payload.onSuccess : undefined;
      if (response.success) {
        toast.success("Process Activity deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS_ACTIVITIES] });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to delete item");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete item");
      console.error("Error deleting item:", error);
    }
  });

  const saveProcessActivityMutation = useMutation({
    mutationFn: (payload: any) => {
      const data = payload.data || payload;
      return data.id
        ? updateProcessActivity(data)
        : createProcessActivity(data);
    },
    onSuccess: (response, payload) => {
      const onSuccess = payload?.onSuccess;
      const onError = payload?.onError;
      if (response.success) {
        toast.success(`Process Activity ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS_ACTIVITIES] });
        onSuccess?.();
      } else {
        onError?.(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error: any) => {
      console.error("Error saving item:", error);
    }
  });

  return {
    deleteProcessActivityMutation,
    saveProcessActivityMutation
  };
};

// ============================================================================
// GENERAL WORK PAPER CONFIGS MUTATIONS
// ============================================================================

/**
 * Hook for general work paper config mutations (create, update, delete)
 */
export const useGeneralWorkPaperConfigMutations = () => {
  const queryClient = useQueryClient();

  const createConfigMutation = useMutation({
    mutationFn: (payload: CreateGeneralWorkPaperConfigPayload & { onSuccess?: () => void }) => {
      const { onSuccess: _cb, ...data } = payload;
      return createGeneralWorkPaperConfig(data);
    },
    onSuccess: (response, payload) => {
      if (response.success) {
        toast.success("Work paper config created successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GENERAL_WORK_PAPER_CONFIGS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKPAPER_TEMPLATES] });
        payload.onSuccess?.();
      } else {
        toast.error(response.message || "Failed to create config");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create work paper config");
      console.error("Error creating work paper config:", error);
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: (payload: { id: string } & UpdateGeneralWorkPaperConfigPayload & { onSuccess?: () => void }) => {
      const { id, onSuccess: _cb, ...data } = payload;
      return updateGeneralWorkPaperConfig(id, data);
    },
    onSuccess: (response, payload) => {
      if (response.success) {
        toast.success("Work paper config updated successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GENERAL_WORK_PAPER_CONFIGS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKPAPER_TEMPLATES] });
        payload.onSuccess?.();
      } else {
        toast.error(response.message || "Failed to update config");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update work paper config");
      console.error("Error updating work paper config:", error);
    }
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (payload: string | { id: string; onSuccess?: () => void }) => {
      const id = typeof payload === "string" ? payload : payload.id;
      return deleteGeneralWorkPaperConfig(id);
    },
    onSuccess: (response, payload) => {
      const onSuccess = typeof payload === "object" ? payload.onSuccess : undefined;
      if (response.success) {
        toast.success("Work paper config deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GENERAL_WORK_PAPER_CONFIGS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKPAPER_TEMPLATES] });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to delete config");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete work paper config");
      console.error("Error deleting work paper config:", error);
    }
  });

  return {
    createConfigMutation,
    updateConfigMutation,
    deleteConfigMutation
  };
};
