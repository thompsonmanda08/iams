"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import { createSmtpConfig, updateSmtpConfig } from "@/app/_actions/smtp-actions";

/**
 * Hook to create SMTP configuration
 * Used in: app/dashboard/system-configs/mail-settings/_components/mailing-settings-form.tsx
 *
 * Usage:
 * const { mutate: createConfig, isPending } = useCreateSmtpConfigMutation({
 *   onSuccess: () => {
 *     setFormData(INIT_DATA);
 *   }
 * });
 *
 * createConfig({
 *   host: "smtp.example.com",
 *   port: 587,
 *   ...
 * });
 */
export function useCreateSmtpConfigMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createSmtpConfig(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create SMTP configuration");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtpConfig"] });
      notify({
        title: "Success",
        description: "SMTP configuration created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create SMTP configuration",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update SMTP configuration
 * Used in: app/dashboard/system-configs/mail-settings/_components/mailing-settings-form.tsx
 *
 * Usage:
 * const { mutate: updateConfig, isPending } = useUpdateSmtpConfigMutation({
 *   onSuccess: () => {
 *     setFormData(INIT_DATA);
 *   }
 * });
 *
 * updateConfig({
 *   id: "config-123",
 *   data: { host: "smtp.example.com", ... }
 * });
 */
export function useUpdateSmtpConfigMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: any }) => {
      const result = await updateSmtpConfig(params.id, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update SMTP configuration");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtpConfig"] });
      notify({
        title: "Success",
        description: "SMTP configuration updated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update SMTP configuration",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
