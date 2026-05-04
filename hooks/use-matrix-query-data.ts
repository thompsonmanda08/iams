import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMatrixScales,
  getMatrixRatingsById,
  createScale,
  updateScale,
  deleteScale,
  createRating,
  updateRating,
  deleteRating
} from "@/app/_actions/config-actions";
import { getHeatMap } from "@/app/_actions/risk-module-actions";
import { QUERY_KEYS } from "@/lib/constants";

// ── Queries ──────────────────────────────────────────────────────────────────

export const useMatrixScales = (
  matrixId: string,
  scaleType: "LIKELIHOOD" | "IMPACT",
  initialData?: any[]
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.MATRIX_SCALES, matrixId, scaleType],
    queryFn: async () => {
      const response = await getMatrixScales(matrixId, scaleType);
      if (!response.success) return [];
      const raw = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      return raw
        .filter((s: any) => s.scale_type === scaleType)
        .sort((a: any, b: any) => a.level - b.level);
    },
    enabled: !!matrixId,
    staleTime: 5 * 60 * 1000,
    initialData: initialData?.length ? initialData : undefined
  });
};

export const useMatrixRatings = (matrixId: string, initialData?: any[]) => {
  return useQuery({
    queryKey: [QUERY_KEYS.MATRIX_RATINGS, matrixId],
    queryFn: async () => {
      const response = await getMatrixRatingsById(matrixId);
      if (!response.success) return [];
      return (response.data ?? []).sort((a: any, b: any) => a.min_score - b.min_score);
    },
    enabled: !!matrixId,
    staleTime: 5 * 60 * 1000,
    initialData: initialData?.length ? initialData : undefined
  });
};

// ── Scale mutations ──────────────────────────────────────────────────────────

export const useCreateScale = (matrixId: string, scaleType: "LIKELIHOOD" | "IMPACT") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      level: number;
    }) =>
      createScale(matrixId, {
        scale_type: scaleType,
        level: data.level,
        name: data.name,
        description: data.description,
        matrix_id: matrixId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATRIX_SCALES, matrixId, scaleType]
      });
    }
  });
};

export const useUpdateScale = (matrixId: string, scaleType: "LIKELIHOOD" | "IMPACT") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: Partial<{ name: string; description: string; level: number; matrix_id: string }>;
    }) => updateScale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATRIX_SCALES, matrixId, scaleType]
      });
    }
  });
};

export const useDeleteScale = (matrixId: string, scaleType: "LIKELIHOOD" | "IMPACT") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteScale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATRIX_SCALES, matrixId, scaleType]
      });
    }
  });
};

type ReindexScale = {
  id: string;
  level: number;
  name: string;
  description: string;
  matrix_id?: string;
};

export const useReindexScalesAfterDelete = (
  matrixId: string,
  scaleType: "LIKELIHOOD" | "IMPACT"
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      deletedLevel,
      scales
    }: {
      deletedLevel: number;
      scales: ReindexScale[];
    }) => {
      const toShift = scales.filter((s) => s.level > deletedLevel);
      if (toShift.length === 0) return { success: true, failed: [] as string[] };

      const results = await Promise.allSettled(
        toShift.map((s) =>
          updateScale(s.id, {
            name: s.name,
            description: s.description,
            level: s.level - 1
          })
        )
      );

      const failed = results
        .map((r, i) =>
          r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
            ? toShift[i].id
            : null
        )
        .filter((x): x is string => x !== null);

      return { success: failed.length === 0, failed };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATRIX_SCALES, matrixId, scaleType]
      });
    }
  });
};

// ── Rating mutations ─────────────────────────────────────────────────────────

export const useCreateRating = (matrixId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      min_score: number;
      max_score: number;
      color_hex: string;
      description: string;
    }) =>
      createRating(matrixId, { ...data, matrix_id: matrixId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATRIX_RATINGS, matrixId] });
    }
  });
};

export const useUpdateRating = (matrixId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: Partial<{
        name: string;
        min_score: number;
        max_score: number;
        color_hex: string;
        description: string;
      }>;
    }) => updateRating(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATRIX_RATINGS, matrixId] });
    }
  });
};

export const useDeleteRating = (matrixId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRating(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATRIX_RATINGS, matrixId] });
    }
  });
};

// ── Heatmap query ────────────────────────────────────────────────────────────

export const useHeatMap = (
  matrixId?: string,
  type: "inherent" | "residual" = "inherent",
  initialData?: any
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.HEATMAP, matrixId, type],
    queryFn: async () => {
      const response = await getHeatMap({ matrix_id: matrixId, type });
      if (!response.success) return null;
      return response.data ?? null;
    },
    staleTime: 2 * 60 * 1000,
    initialData: initialData || undefined,
    retry: false
  });
};
