"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  PencilLine,
  Download,
  Copy,
  Trash2,
  Send,
  ChevronDown,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectTrigger
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TipTapEditor } from "@/components/tiptap-editor";
import { useAuditMemo, useMemoTemplate } from "@/hooks/use-audit-queries";
import {
  useMemoCreateOrUpdateMutation,
  useSendMemoMutation,
  useDeleteMemoMutation
} from "@/hooks/use-audit-mutations";
import {
  copyHtmlToClipboard,
  downloadHtmlAsFile,
  generateMemoPdf,
  generateMemoDocx
} from "@/lib/utils/memo-export";
import { notify } from "@/lib/utils";
import { getTemplateById, getTemplateOptionsGrouped } from "@/lib/memo-templates";

interface CreateOrUpdateMemoProps {
  showTrigger?: boolean;
  openModal?: boolean;
  setOpenModal?: (open: boolean) => void;
  auditPlanId: string;
}

export function CreateOrUpdateMemo({
  showTrigger = false,
  openModal: externalOpenModal,
  setOpenModal: setExternalOpenModal,
  auditPlanId
}: CreateOrUpdateMemoProps) {
  // State management
  const [internalOpenModal, setInternalOpenModal] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoContent, setMemoContent] = useState("");
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templateLoadError, setTemplateLoadError] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Use external modal if provided, otherwise use internal
  const openModal = externalOpenModal !== undefined ? externalOpenModal : internalOpenModal;
  const setOpenModal = setExternalOpenModal || setInternalOpenModal;

  // Queries and mutations
  const { data: memo, isLoading: isMemoLoading, refetch: refetchMemo } = useAuditMemo(auditPlanId);
  const { refetch: refetchTemplate } = useMemoTemplate(auditPlanId);

  const createOrUpdateMutation = useMemoCreateOrUpdateMutation({
    auditPlanId,
    onSuccess: () => {
      refetchMemo();
      setIsEditing(false);
      // Keep dialog open to show the result
    }
  });

  const sendMutation = useSendMemoMutation({
    auditPlanId,
    onSuccess: () => {
      setSendConfirmOpen(false);
      refetchMemo();
    }
  });

  const deleteMutation = useDeleteMemoMutation({
    auditPlanId,
    onSuccess: () => {
      setDeleteConfirmOpen(false);
      setIsEditing(false);
      refetchMemo();
    }
  });

  // Initialize form when memo loads or dialog opens
  useEffect(() => {
    if (memo && openModal) {
      setMemoTitle(memo.subject || "");
      setMemoContent(memo.content || "");
      setIsEditing(false);
    }
  }, [memo, openModal]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!openModal) {
      setMemoTitle("");
      setMemoContent("");
      setIsEditing(false);
    }
  }, [openModal]);

  const handleLoadClientTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setMemoContent(template.html);
      setSelectedTemplateId(templateId);
      setShowTemplateSelector(false);
      setIsEditing(true);
      notify({
        title: "Success",
        description: `Template "${template.name}" loaded. Customize it as needed.`,
        type: "success"
      });
    }
  };

  const handleUseTemplate = async () => {
    try {
      // First, try to load template from backend
      const result = await refetchTemplate();
      if (result.data?.data?.html) {
        setMemoContent(result.data.data.html);
        setTemplateLoadError(false);
        setIsEditing(true);
        notify({
          title: "Success",
          description: "Template loaded successfully from audit plan. Customize it as needed.",
          type: "success"
        });
      } else {
        // Backend succeeded but no template returned - show client-side selector
        setShowTemplateSelector(true);
      }
    } catch (error) {
      // Backend failed - fall back to client-side templates
      setTemplateLoadError(true);
      setShowTemplateSelector(true);
      notify({
        title: "Using Local Templates",
        description: "Backend template unavailable. Choose from pre-built templates instead.",
        type: "warning"
      });
    }
  };

  const handleSave = async () => {
    setShowValidation(true);

    if (!memoTitle.trim()) {
      notify({
        title: "Validation Error",
        description: "Please enter a memo subject",
        type: "error"
      });
      return;
    }

    if (!memoContent.trim()) {
      notify({
        title: "Validation Error",
        description: "Please write some content",
        type: "error"
      });
      return;
    }

    createOrUpdateMutation.mutate({
      subject: memoTitle,
      content: memoContent,
      status: memo?.status || "DRAFT",
      use_template: false
    });
  };

  const handleSendMemo = () => {
    if (memo?.status === "SENT") {
      notify({
        title: "Info",
        description: "This memo has already been sent",
        type: "success"
      });
      return;
    }

    setSendConfirmOpen(true);
  };

  const confirmSendMemo = async () => {
    sendMutation.mutate({});
  };

  const handleDeleteMemo = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteMemo = async () => {
    deleteMutation.mutate();
  };

  const handleCopyHtml = async () => {
    try {
      setIsExporting(true);
      await copyHtmlToClipboard(memoContent);
      notify({
        title: "Success",
        description: "Memo HTML copied to clipboard",
        type: "success"
      });
    } catch (error) {
      notify({
        title: "Error",
        description: "Failed to copy to clipboard",
        type: "error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadHtml = () => {
    try {
      setIsExporting(true);
      const filename = `${memoTitle || "memo"}_${new Date().toISOString().split("T")[0]}.html`;
      downloadHtmlAsFile(memoContent, filename);
      notify({
        title: "Success",
        description: "Memo downloaded as HTML",
        type: "success"
      });
    } catch (error) {
      notify({
        title: "Error",
        description: "Failed to download file",
        type: "error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      await generateMemoPdf(memoContent, memoTitle || "memo");
      notify({
        title: "Success",
        description: "Memo downloaded as PDF",
        type: "success"
      });
    } catch (error) {
      notify({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF",
        type: "error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      await generateMemoDocx(memoContent, memoTitle || "memo");
      notify({
        title: "Success",
        description: "Memo downloaded as Word document",
        type: "success"
      });
    } catch (error) {
      notify({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate document",
        type: "error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isSending = memo?.status === "SENT";
  const isDraft = memo?.status === "DRAFT";

  return (
    <>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              {memo ? (
                <>
                  <PencilLine className="mr-2 h-4 w-4" /> Edit Memo
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Create Memo
                </>
              )}
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="max-h-[90vh] max-w-5xl! overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle>{memo ? "Edit Memo" : "Create New Memo"}</DialogTitle>
              {memo && <Badge variant={isSending ? "secondary" : "default"}>{memo.status}</Badge>}
            </div>
          </DialogHeader>

          {isMemoLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Subject Input */}
              <div className="space-y-2">
                <Input
                  id="memo-subject"
                  placeholder="Enter memo subject..."
                  value={memoTitle}
                  label="Memo Subject"
                  required
                  onChange={(e) => setMemoTitle(e.target.value)}
                  disabled={isSending && !isEditing}
                  className="text-base"
                  isInvalid={!memoTitle.trim() && (isEditing || showValidation)}
                  errorText={
                    !memoTitle.trim() && (isEditing || showValidation)
                      ? "Please enter a memo subject"
                      : ""
                  }
                />
              </div>

              {/* Use Template Button (only for new/draft memos) */}
              {!memo && !memoContent && !showTemplateSelector && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseTemplate}
                  className="w-full">
                  Load Template from Audit Plan
                </Button>
              )}

              {/* Template Selector (shown when template loading fails or is unavailable) */}
              {!memo && !memoContent && showTemplateSelector && (
                <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
                  {templateLoadError && (
                    <div className="flex items-start gap-2 rounded bg-amber-50 p-3 text-sm text-amber-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        Backend template unavailable. Select from pre-built templates below.
                      </span>
                    </div>
                  )}
                  <Label htmlFor="template-select">Select Memo Template</Label>
                  <Select onValueChange={handleLoadClientTemplate}>
                    <SelectTrigger id="template-select">
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getTemplateOptionsGrouped().map((group) => (
                        <SelectGroup key={group.group}>
                          <SelectLabel>{group.group}</SelectLabel>
                          {group.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateSelector(false)}
                    className="w-full">
                    Cancel
                  </Button>
                </div>
              )}

              {/* Editor */}
              <div className="space-y-2">
                <Label htmlFor="memo-content">Memo Content *</Label>
                <TipTapEditor
                  initialContent={memoContent}
                  onSave={async (html) => {
                    setMemoContent(html);
                    await handleSave();
                  }}
                  onCancel={() => {
                    setIsEditing(false);
                    setOpenModal(false);
                  }}
                  isSaving={createOrUpdateMutation.isPending}
                  placeholder="Write your memo content here..."
                  readOnly={isSending && !isEditing}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            {/* Draft Actions */}
            {isDraft && !isEditing && (
              <>
                {/* Close/Cancel */}
                <Button
                  variant="outline"
                  onClick={() => setOpenModal(false)}
                  disabled={createOrUpdateMutation.isPending || sendMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteMemo}
                  disabled={deleteMutation.isPending}
                  className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>

                <Button variant="default" onClick={() => setIsEditing(true)} className="gap-2">
                  <PencilLine className="h-4 w-4" />
                  Edit
                </Button>

                <Button
                  variant="default"
                  onClick={handleSendMemo}
                  className="gap-2"
                  disabled={!memoTitle || !memoContent}>
                  <Send className="h-4 w-4" />
                  Send to Client
                </Button>
              </>
            )}

            {/* Sent Memo Actions */}
            {isSending && !isEditing && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" disabled={isExporting} className="gap-2">
                      <Download className="h-4 w-4" />
                      Export
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopyHtml} disabled={isExporting}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy HTML
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDownloadHtml} disabled={isExporting}>
                      <Download className="mr-2 h-4 w-4" />
                      Download HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPdf} disabled={isExporting}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadDocx} disabled={isExporting}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Word
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <AlertDialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Memo to Client?</AlertDialogTitle>
            <AlertDialogDescription>
              This memo will be sent to the client representative email and marked as sent. You
              won't be able to edit it afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendMemo} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The memo will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMemo}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90">
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
