"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X, Edit } from "lucide-react";

export type ConfirmationType = "delete" | "close" | "edit" | "default";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
}

const typeConfig = {
  delete: {
    icon: Trash2,
    title: "Confirm Deletion",
    description: "Are you sure you want to delete this? This action cannot be undone.",
    confirmText: "Delete",
    variant: "destructive" as const,
    iconColor: "text-destructive"
  },
  close: {
    icon: X,
    title: "Confirm Close",
    description: "Are you sure you want to close? Any unsaved changes will be lost.",
    confirmText: "Close",
    variant: "destructive" as const,
    iconColor: "text-destructive"
  },
  edit: {
    icon: Edit,
    title: "Confirm Edit",
    description: "Are you sure you want to make these changes?",
    confirmText: "Confirm",
    variant: "default" as const,
    iconColor: "text-primary"
  },
  default: {
    icon: AlertTriangle,
    title: "Confirm Action",
    description: "Are you sure you want to proceed?",
    confirmText: "Confirm",
    variant: "default" as const,
    iconColor: "text-muted-foreground"
  }
};

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  type = "default",
  isLoading = false
}: ConfirmationModalProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`bg-muted rounded-full p-2 ${config.iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <DialogTitle>{title || config.title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {description || config.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={config.variant}
            onClick={handleConfirm}
            disabled={isLoading}>
            {isLoading ? "Processing..." : confirmText || config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
