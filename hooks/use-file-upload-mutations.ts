"use client";

import { useMutation } from "@tanstack/react-query";
import { notify } from "@/lib/utils";

/**
 * Generic file upload mutation hook
 * Used in: Components that need to upload files
 *          app/dashboard/(modules)/risks/_components/action-findings-dialog.tsx
 *          app/dashboard/(workflows)/actions/audit/_components/submit-evidence-dialog.tsx
 *
 * Usage:
 * const { mutate: uploadFile, isPending } = useFileUploadMutation({
 *   onSuccess: (uploadedUrl: string) => {
 *     setFileUrl(uploadedUrl);
 *   }
 * });
 *
 * uploadFile(file);
 *
 * Note: The actual upload endpoint should be configured in your API
 * For now, this creates a data URL or handles FormData upload
 */
export function useFileUploadMutation(options?: {
  onSuccess?: (fileUrl: string) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: async (file: File) => {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      try {
        // TODO: Replace with actual file upload endpoint
        // For now, create a data URL as a placeholder
        const reader = new FileReader();

        return new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === "string") {
              resolve(result);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => {
            reject(new Error("Failed to read file"));
          };
          reader.readAsDataURL(file);
        });

        // Actual API call (when ready):
        // const response = await fetch("/api/upload", {
        //   method: "POST",
        //   body: formData
        // });
        // const result = await response.json();
        // if (!result.success) throw new Error(result.message);
        // return result.fileUrl;
      } catch (error) {
        throw error instanceof Error ? error : new Error("File upload failed");
      }
    },
    onSuccess: (fileUrl: string) => {
      notify({
        title: "Success",
        description: "File uploaded successfully",
        type: "success"
      });
      options?.onSuccess?.(fileUrl);
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "File upload failed",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * File upload mutation with validation
 * Used in: Components with strict file validation requirements
 *          app/dashboard/(modules)/risks/_components/action-findings-dialog.tsx
 *          app/dashboard/(workflows)/actions/audit/_components/submit-evidence-dialog.tsx
 *
 * Usage:
 * const { mutate: uploadFile, isPending } = useFileUploadWithValidationMutation({
 *   validationRules: {
 *     maxSize: 5 * 1024 * 1024, // 5MB
 *     allowedTypes: ["application/pdf", "image/jpeg"]
 *   },
 *   onSuccess: (uploadedUrl: string) => {
 *     setFileUrl(uploadedUrl);
 *   }
 * });
 *
 * uploadFile(file);
 */
export function useFileUploadWithValidationMutation(options?: {
  validationRules?: {
    maxSize?: number; // in bytes, default 10MB
    allowedTypes?: string[]; // MIME types
    allowedExtensions?: string[]; // file extensions
  };
  onSuccess?: (fileUrl: string) => void;
  onError?: (error: Error) => void;
}) {
  const defaultMaxSize = 10 * 1024 * 1024; // 10MB
  const maxSize = options?.validationRules?.maxSize || defaultMaxSize;
  const allowedTypes = options?.validationRules?.allowedTypes;
  const allowedExtensions = options?.validationRules?.allowedExtensions;

  return useMutation({
    mutationFn: async (file: File) => {
      // Validate file size
      if (file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024));
        throw new Error(`File size must not exceed ${sizeMB}MB`);
      }

      // Validate MIME type
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        throw new Error(
          `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`
        );
      }

      // Validate file extension
      if (allowedExtensions) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
          throw new Error(
            `File extension not allowed. Allowed: ${allowedExtensions.join(", ")}`
          );
        }
      }

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);

        // TODO: Replace with actual file upload endpoint
        // For now, create a data URL as a placeholder
        const reader = new FileReader();

        return new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === "string") {
              resolve(result);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => {
            reject(new Error("Failed to read file"));
          };
          reader.readAsDataURL(file);
        });

        // Actual API call (when ready):
        // const response = await fetch("/api/upload", {
        //   method: "POST",
        //   body: formData
        // });
        // const result = await response.json();
        // if (!result.success) throw new Error(result.message);
        // return result.fileUrl;
      } catch (error) {
        throw error instanceof Error ? error : new Error("File upload failed");
      }
    },
    onSuccess: (fileUrl: string) => {
      notify({
        title: "Success",
        description: "File uploaded and validated successfully",
        type: "success"
      });
      options?.onSuccess?.(fileUrl);
    },
    onError: (error: Error) => {
      notify({
        title: "Validation Error",
        description: error.message || "File validation failed",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
