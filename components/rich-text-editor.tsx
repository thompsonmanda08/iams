// components/RichTextDialog.tsx
"use client";

import { useState, useEffect, useRef, useId } from "react";

// We'll import EditorJS modules dynamically inside the component
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";

interface RichTextEditorProps {
  initialData?: any;
  isSaving?: boolean;
  className?: string;
  placeholder?: string;
  onCancel?: () => void;
  onSave: (data: any) => Promise<void>;
  classNames?: {
    wrapper?: string;
    editor?: string;
  };
}

export function RichTextEditor({
  className,
  initialData,
  classNames,
  isSaving,
  onCancel,
  placeholder = "Write your description here...",
  onSave,
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const editorId = useId();

  // Initialize editor
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!editorRef.current) {
      // Dynamic import all EditorJS modules
      Promise.all([
        import("@editorjs/editorjs"),
        import("@editorjs/header"),
        import("@editorjs/list"),
        import("@editorjs/paragraph"),
        import("@editorjs/inline-code"),
        import("@editorjs/delimiter"),
      ])
        .then(
          ([
            { default: EditorJS },
            { default: Header },
            { default: List },
            { default: Paragraph },
            { default: InlineCode },
            { default: Delimiter },
          ]) => {
            const editor = new EditorJS({
              holder: editorId,
              tools: {
                header: {
                  class: Header as any,
                  config: {
                    placeholder: "Enter a header",
                    levels: [2, 3, 4],
                    defaultLevel: 2,
                  },
                },
                list: List,
                paragraph: {
                  class: Paragraph as any,
                  inlineToolbar: true,
                },
                inlineCode: {
                  class: InlineCode,
                  shortcut: "CMD+SHIFT+C",
                },
                // Color: {
                //   class: TextColor,
                //   config: {
                //     colorCollections: [
                //       "#FF1300", // Red
                //       "#EC7878", // Light Red
                //       "#9C27B0", // Purple
                //       "#673AB7", // Deep Purple
                //       "#3F51B5", // Indigo
                //       "#007BFF", // Blue
                //       "#03A9F4", // Light Blue
                //       "#00BCD4", // Cyan
                //       "#4CAF50", // Green
                //       "#8BC34A", // Light Green
                //       "#CDDC39", // Lime
                //       "#FFC107", // Amber
                //       "#FF9800", // Orange
                //       "#FF5722", // Deep Orange
                //       "#000000", // Black
                //       "#757575", // Gray
                //     ],
                //     defaultColor: "#000000",
                //     type: "text", // or 'background'
                //   },
                // },
                delimiter: Delimiter,
              },
              data: initialData || { blocks: [] },
              placeholder,
            });
            editorRef.current = editor;
          }
        )
        .catch((error) => {
          console.error("Failed to load EditorJS:", error);
        });
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isMounted, initialData]);

  const handleSave = async () => {
    if (!editorRef.current) return;

    try {
      const savedData = await editorRef.current.save();
      await onSave(savedData);
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  return (
    <div
      className={cn(
        " max-h-[81svh] sm:max-h-[85svh] w-full md:max-h-[90svh] bg-transparent flex flex-col",
        classNames?.wrapper
      )}
    >
      <div className="flex-1 overflow-autos mb-4">
        <div
          id={editorId}
          className={cn(
            "!w-full bg-slate-50/40 rounded-md px-4 py-2 max-h-[58svh] overflow-y-scroll",
            className,
            classNames?.editor
          )}
        />
      </div>
      <div className="flex justify-end items-center gap-2">
        {onCancel && (
          <Button
            disabled={isSaving}
            variant="outline"
            onClick={() => onCancel?.()}
          >
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <span className="flex items-center gap-1 ">
              <Spinner size={"sm"} color="white" /> Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
