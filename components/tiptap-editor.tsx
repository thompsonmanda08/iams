"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface TipTapEditorProps {
  initialContent?: string; // HTML string
  onSave: (html: string) => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export function TipTapEditor({
  initialContent = "",
  onSave,
  onCancel,
  isSaving = false,
  placeholder = "Write your memo content here...",
  readOnly = false,
  className = ""
}: TipTapEditorProps) {
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [customImageSize, setCustomImageSize] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image',
          draggable: true,
          contenteditable: false
        }
      })
    ],
    content: initialContent || "",
    editable: !readOnly,
    immediatelyRender: false
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  useEffect(() => {
    if (editor && !readOnly && initialContent && !editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, readOnly]);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleAddImageUrl = () => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const resizeImage = (width: string) => {
    if (!editor) return;

    // Get all images in the editor
    const images = editor.view.dom.querySelectorAll('img') as NodeListOf<HTMLImageElement>;

    if (images.length === 0) {
      alert("No image found in the editor");
      return;
    }

    // Resize the last image (most recently added)
    const lastImage = images[images.length - 1];
    lastImage.style.width = width;
    lastImage.style.height = 'auto';
    lastImage.style.display = 'block';
    lastImage.style.margin = '1rem auto';
  };

  const handleApplyCustomSize = () => {
    if (!customImageSize.trim()) {
      alert("Please enter a size value");
      return;
    }

    // Ensure the value ends with % if not already
    const sizeValue = customImageSize.trim().endsWith('%')
      ? customImageSize.trim()
      : customImageSize.trim() + '%';

    resizeImage(sizeValue);
    setCustomImageSize("");
  };

  const handleCustomSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyCustomSize();
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    const html = editor.getHTML();

    if (!html || html === "<p></p>") {
      alert("Please write some content before saving.");
      return;
    }

    setIsSavingLocal(true);
    try {
      await onSave(html);
    } finally {
      setIsSavingLocal(false);
    }
  };

  if (!editor) {
    return <div className="py-8 text-center">Loading editor...</div>;
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="bg-muted/50 flex flex-wrap gap-1 rounded-lg border p-2">
          {/* Text formatting */}
          <Button
            size="sm"
            variant={editor.isActive("bold") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)">
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={editor.isActive("italic") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)">
            <Italic className="h-4 w-4" />
          </Button>

          <div className="bg-border my-1 w-px" />

          {/* Headings */}
          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="bg-border my-1 w-px" />

          {/* Lists */}
          <Button
            size="sm"
            variant={editor.isActive("bulletList") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List">
            <List className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={editor.isActive("orderedList") ? "default" : "outline"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered List">
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="bg-border my-1 w-px" />

          {/* Text alignment */}
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "left" }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "center" }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center">
            <AlignCenter className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={editor.isActive({ textAlign: "right" }) ? "default" : "outline"}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right">
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="bg-border my-1 w-px" />

          {/* Image insertion */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddImage}
            title="Insert Image from File">
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAddImageUrl}
            title="Insert Image from URL">
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs ml-1">URL</span>
          </Button>

          <div className="bg-border my-1 w-px" />

          {/* Image sizing options */}
          <div className="flex gap-1 items-center">
            <span className="text-xs text-muted-foreground px-2">Size:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => resizeImage('100%')}
              title="Full Width">
              <span className="text-xs">Full</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => resizeImage('75%')}
              title="75% Width">
              <span className="text-xs">75%</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => resizeImage('50%')}
              title="50% Width">
              <span className="text-xs">50%</span>
            </Button>
            <div className="bg-border my-1 w-px" />
            <Input
              type="text"
              placeholder="Custom %"
              value={customImageSize}
              onChange={(e) => setCustomImageSize(e.target.value)}
              onKeyDown={handleCustomSizeKeyDown}
              className="h-8 w-24 text-xs"
              title="Enter custom width percentage (e.g., 65 or 65%)"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleApplyCustomSize}
              title="Apply custom size">
              <span className="text-xs">Apply</span>
            </Button>
          </div>
        </div>
      )}

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Editor Content */}
      <div className="bg-background max-h-[500px] min-h-[300px] max-w-none overflow-y-auto rounded-lg border p-4">
        <style>{`
          .tiptap {
            word-break: break-word;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }

          .tiptap p {
            margin: 1em 0;
          }

          .tiptap h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.83em 0;
          }

          .tiptap h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin: 0.83em 0;
          }

          .tiptap ul,
          .tiptap ol {
            margin: 1em 0;
            padding-left: 2em;
          }

          .tiptap li {
            margin: 0.5em 0;
          }

          .tiptap strong {
            font-weight: bold;
          }

          .tiptap-image {
            display: block;
            margin: 1rem auto;
            cursor: grab;
            border: 2px solid transparent;
            border-radius: 4px;
            transition: all 0.2s ease;
            user-select: none;
            height: auto;
          }

          .tiptap-image:hover {
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            border-color: #3b82f6;
          }

          .tiptap-image:active {
            cursor: grabbing;
          }

          .tiptap img {
            height: auto;
            max-width: 300px;
          }

          /* Allow inline margin-left styles for indentation */
          .tiptap p[style*="margin-left"],
          .tiptap ul[style*="margin-left"],
          .tiptap ol[style*="margin-left"] {
            margin-left: unset;
          }

          /* Ensure center-aligned text stays centered */
          .tiptap [style*="text-align: center"] {
            text-align: center !important;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSavingLocal || isSaving}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSavingLocal || isSaving}
            className="gap-2"
            loadingText="Saving..."
            isLoading={isSavingLocal || isSaving}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
