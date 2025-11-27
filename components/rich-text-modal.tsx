// components/RichTextDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./rich-text-editor";

interface RichTextDialogProps {
  initialData?: any;
  open: boolean;
  triggerSize?: "sm" | "default" | "lg" | "icon";
  showTrigger?: boolean;
  isSaving?: boolean;
  triggerText?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  classNames?: {
    trigger?: string;
  };
}

export function RichTextDialog({
  title = "Product Description",
  description,
  showTrigger,
  triggerText,
  triggerSize,
  initialData,
  classNames,
  isSaving,
  open,
  onOpenChange,
  placeholder = "Write your description here...",
  onSave
}: RichTextDialogProps) {
  const handleSave = async (data: any) => {
    await onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button
            size={triggerSize}
            disabled={isSaving}
            className={cn("w-full font-semibold md:max-w-sm", classNames?.trigger)}>
            {triggerText}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[81svh] w-full max-w-xl flex-col pb-4 sm:max-h-[85svh] sm:max-w-3xl md:max-h-[90svh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <RichTextEditor
            initialData={initialData}
            className="min-h-96"
            onSave={handleSave}
            isSaving={isSaving}
            placeholder={placeholder}
            onCancel={() => onOpenChange(false)}
            classNames={{
              wrapper: "max-h-[70vh]",
              editor: "min-h-96"
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export alias for backward compatibility
export { RichTextDialog as RichTextModal };
