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
  deleteProcessActivity
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
    mutationFn: (id: string) => deleteIndicativeTarget(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Indicative Target deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INDICATIVE_TARGETS] });
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
    mutationFn: (data: any) => {
      return data.id
        ? updateIndicativeTarget(data)
        : createIndicativeTarget(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Indicative Target ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INDICATIVE_TARGETS] });
      } else {
        toast.error(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error) => {
      toast.error("An error occurred");
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
    mutationFn: (id: string) => deleteAuditableArea(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Auditable Area deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDITABLE_AREAS] });
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
    mutationFn: (data: any) => {
      return data.id
        ? updateAuditableArea(data)
        : createAuditableArea(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Auditable Area ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDITABLE_AREAS] });
      } else {
        toast.error(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error) => {
      toast.error("An error occurred");
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
    mutationFn: (id: string) => deleteStrategicPillar(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Strategic Pillar deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_PILLARS] });
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
    mutationFn: (data: any) => {
      return data.id
        ? updateStrategicPillar(data)
        : createStrategicPillar(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Strategic Pillar ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_PILLARS] });
      } else {
        toast.error(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error) => {
      toast.error("An error occurred");
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
    mutationFn: (id: string) => deleteStrategicInitiative(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Strategic Initiative deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES] });
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
    mutationFn: (data: any) => {
      return data.id
        ? updateStrategicInitiative(data)
        : createStrategicInitiative(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Strategic Initiative ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES] });
      } else {
        toast.error(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error) => {
      toast.error("An error occurred");
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
    mutationFn: (id: string) => deleteProcessActivity(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Process Activity deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS_ACTIVITIES] });
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
    mutationFn: (data: any) => {
      return data.id
        ? updateProcessActivity(data)
        : createProcessActivity(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Process Activity ${response.data?.id ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROCESS_ACTIVITIES] });
      } else {
        toast.error(response.message);
        throw new Error(response.message);
      }
    },
    onError: (error) => {
      toast.error("An error occurred");
      console.error("Error saving item:", error);
    }
  });

  return {
    deleteProcessActivityMutation,
    saveProcessActivityMutation
  };
};
