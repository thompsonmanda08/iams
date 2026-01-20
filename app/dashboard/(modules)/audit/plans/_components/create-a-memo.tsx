"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Plus, PencilLine, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { ConfirmationModal } from "@/components/confirmation-modal";
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
import { TipTapEditor } from "@/components/tiptap-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuditMemo, useMemoTemplate, useMemoHistory } from "@/hooks/use-audit-queries";
import { useMemoCreateOrUpdateMutation, useDeleteMemoMutation } from "@/hooks/use-audit-mutations";
import {
  copyHtmlToClipboard,
  downloadHtmlAsFile,
  generateMemoPdf,
  generateMemoDocx
} from "@/lib/utils/memo-export";
import { notify } from "@/lib/utils";
import { getTemplateById, getTemplateOptionsGrouped } from "@/lib/templates/memo-templates";
import { StatusBadge } from "@/components/status-badge";

interface CreateOrUpdateMemoProps {
  showTrigger?: boolean;
  openModal?: boolean;
  setOpenModal?: (open: boolean) => void;
  auditPlanId: string;
  directEdit?: boolean; // Open modal directly in edit mode
  auditPlanStatus?: string; // Status of the parent audit plan (e.g., "DRAFT", "IN_PROGRESS", "CLOSED")
}

export interface CreateOrUpdateMemoRef {
  openEdit: () => void;
  openView: () => void;
  openDelete: () => void;
  handleCopyHtml: () => Promise<void>;
  handleDownloadHtml: () => void;
  handleDownloadPdf: () => Promise<void>;
  handleDownloadDocx: () => Promise<void>;
  setOpenModal: (open: boolean) => void;
}

export const CreateOrUpdateMemo = forwardRef<CreateOrUpdateMemoRef, CreateOrUpdateMemoProps>(
  (
    {
      showTrigger = false,
      openModal: externalOpenModal,
      setOpenModal: setExternalOpenModal,
      auditPlanId,
      directEdit = false,
      auditPlanStatus = "DRAFT"
    }: CreateOrUpdateMemoProps,
    ref
  ) => {
    // State management
    const [internalOpenModal, setInternalOpenModal] = useState(false);
    const [internalViewModal, setInternalViewModal] = useState(false);
    const [memoTitle, setMemoTitle] = useState("");
    const [memoContent, setMemoContent] = useState("");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [templateLoadError, setTemplateLoadError] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [memoError, setMemoError] = useState<string>("");
    const [deleteError, setDeleteError] = useState<string>("");

    // Use external modal if provided, otherwise use internal
    const openModal = externalOpenModal !== undefined ? externalOpenModal : internalOpenModal;
    const setOpenModal = setExternalOpenModal || setInternalOpenModal;

    // Queries and mutations
    const {
      data: memo,
      isLoading: isMemoLoading,
      refetch: refetchMemo
    } = useAuditMemo(auditPlanId);
    const { refetch: refetchTemplate } = useMemoTemplate(auditPlanId);
    const { data: historyData, isLoading: isHistoryLoading } = useMemoHistory(auditPlanId, {
      limit: 100,
      offset: 0
    });

    const createOrUpdateMutation = useMemoCreateOrUpdateMutation({
      auditPlanId,
      onSuccess: () => {
        setMemoError("");
        setIsEditing(false);
        setOpenModal(false);
        refetchMemo();
      },
      onError: (errorMessage: string) => {
        setMemoError(errorMessage);
      }
    });

    const deleteMutation = useDeleteMemoMutation({
      auditPlanId,
      onSuccess: () => {
        setDeleteError("");
        setDeleteConfirmOpen(false);
        setIsEditing(false);
        refetchMemo();
      },
      onError: (errorMessage: string) => {
        setDeleteError(errorMessage);
      }
    });

    // Initialize form when memo loads or dialog opens
    useEffect(() => {
      if (memo && openModal) {
        setMemoTitle(memo.subject || "");
        setMemoContent(memo.content || "");
        setIsEditing(directEdit && memo.status === "DRAFT"); // Auto-enter edit mode if directEdit is true and memo is DRAFT
      }
    }, [memo, openModal, directEdit]);

    // Reset form when dialog closes
    useEffect(() => {
      if (!openModal) {
        setMemoTitle("");
        setMemoContent("");
        setIsEditing(false);
        setMemoError("");
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

    const handleSave = async (contentToSave?: string) => {
      setShowValidation(true);

      if (!memoTitle.trim()) {
        notify({
          title: "Validation Error",
          description: "Please enter a memo subject",
          type: "error"
        });
        return;
      }

      const finalContent = contentToSave !== undefined ? contentToSave : memoContent;

      if (!finalContent.trim()) {
        notify({
          title: "Validation Error",
          description: "Please write some content",
          type: "error"
        });
        return;
      }

      createOrUpdateMutation.mutate({
        subject: memoTitle,
        content: finalContent,
        status: memo?.status || "DRAFT",
        use_template: false,
        ...(memo?.id && { id: memo.id }) // Include ID if updating existing memo
      });
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

    const isDraft = memo?.status === "DRAFT";
    const isPlanDraft = auditPlanStatus === "DRAFT";

    // Expose memo actions to parent component via ref
    useImperativeHandle(
      ref,
      () => ({
        openEdit: () => {
          if (!isPlanDraft) {
            notify({
              title: "Cannot Edit",
              description: "Memos can only be edited when the audit plan is in DRAFT status.",
              type: "error"
            });
            return;
          }
          setOpenModal(true);
          setIsEditing(true);
        },
        openView: () => {
          setInternalViewModal(true);
        },
        openDelete: () => {
          if (!isPlanDraft) {
            notify({
              title: "Cannot Delete",
              description: "Memos can only be deleted when the audit plan is in DRAFT status.",
              type: "error"
            });
            return;
          }
          handleDeleteMemo();
        },
        handleCopyHtml,
        handleDownloadHtml,
        handleDownloadPdf,
        handleDownloadDocx,
        setOpenModal
      }),
      [memo, isPlanDraft]
    );

    return (
      <>
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          {showTrigger && isPlanDraft && (
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
              </div>
            </DialogHeader>

            {isMemoLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {/* Error Alert */}
                {memoError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{memoError}</span>
                  </div>
                )}
                {/* Subject Input */}
                <div className="space-y-2">
                  <Input
                    id="memo-subject"
                    placeholder="Enter memo subject..."
                    value={memoTitle}
                    label="Memo Subject"
                    required
                    onChange={(e) => setMemoTitle(e.target.value)}
                    disabled={!isDraft && !isEditing}
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
                {!memo && !memoContent && !showTemplateSelector && isPlanDraft && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseTemplate}
                    className="w-full">
                    Load Template from Audit Plan
                  </Button>
                )}

                {/* Template Selector (shown when template loading fails or is unavailable) */}
                {!memo && !memoContent && showTemplateSelector && isPlanDraft && (
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
                      await handleSave(html);
                    }}
                    onCancel={() => {
                      setIsEditing(false);
                      setOpenModal(false);
                    }}
                    isSaving={createOrUpdateMutation.isPending}
                    placeholder="Write your memo content here..."
                    readOnly={(!isDraft && !isEditing) || !isPlanDraft}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Memo Modal - Read Only with Tabs */}
        <Dialog open={internalViewModal} onOpenChange={setInternalViewModal}>
          <DialogContent className="max-h-[90vh] max-w-5xl! overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <DialogTitle>{memo?.subject || "Memo"}</DialogTitle>
                  <div className="text-muted-foreground mt-1 text-sm">
                    Status: <StatusBadge status={memo?.status || "DRAFT"} />
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4 py-4">
                {/* Memo Content - Read Only */}
                <div className="prose prose-sm dark:prose-invert border-border bg-card max-w-none rounded-lg border p-4">
                  <div
                    dangerouslySetInnerHTML={{ __html: memo?.content || "" }}
                    className="text-foreground"
                  />
                </div>

                {/* Metadata */}
                {memo && (
                  <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {memo.created_at
                          ? format(new Date(memo.created_at), "MMM d, yyyy 'at' h:mm a")
                          : "N/A"}
                      </p>
                    </div>
                    {memo.updated_at && (
                      <div>
                        <p className="text-muted-foreground">Last Modified</p>
                        <p className="font-medium">
                          {format(new Date(memo.updated_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4 py-4">
                {isHistoryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                  </div>
                ) : historyData && Array.isArray(historyData) && historyData.length > 0 ? (
                  <div className="space-y-4">
                    {historyData.map((entry: any, index: number) => (
                      <div
                        key={entry.id || index}
                        className="border-border bg-card rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Clock className="text-muted-foreground h-4 w-4" />
                              <p className="text-sm font-medium">
                                {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              Edited by:{" "}
                              <span className="text-foreground font-medium">
                                {entry.edited_by_name || "Unknown"}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Show changes */}
                        <div className="mt-4 space-y-3">
                          {entry.previous_subject !== entry.current_subject && (
                            <div className="bg-muted/50 rounded p-3">
                              <p className="text-muted-foreground mb-1 text-xs font-medium">
                                Subject Changed
                              </p>
                              <div className="space-y-1 text-sm">
                                <p className="text-red-600 line-through">
                                  {entry.previous_subject}
                                </p>
                                <p className="text-green-600">{entry.current_subject}</p>
                              </div>
                            </div>
                          )}

                          {entry.previous_status !== entry.current_status && (
                            <div className="bg-muted/50 rounded p-3">
                              <p className="text-muted-foreground mb-2 text-xs font-medium">
                                Status Changed
                              </p>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={entry.previous_status} />
                                <span className="text-muted-foreground">→</span>
                                <StatusBadge status={entry.current_status} />
                              </div>
                            </div>
                          )}

                          {entry.previous_content !== entry.current_content && (
                            <div className="bg-muted/50 rounded p-3">
                              <p className="text-muted-foreground mb-2 text-xs font-medium">
                                Content Modified
                              </p>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-muted-foreground mb-1 text-xs">Previous:</p>
                                  <div className="prose prose-sm dark:prose-invert max-w-none rounded bg-red-50 p-2 dark:bg-red-950/20">
                                    <div
                                      dangerouslySetInnerHTML={{ __html: entry.previous_content }}
                                      className="line-clamp-3 text-xs text-red-900 dark:text-red-100"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1 text-xs">Current:</p>
                                  <div className="prose prose-sm dark:prose-invert max-w-none rounded bg-green-50 p-2 dark:bg-green-950/20">
                                    <div
                                      dangerouslySetInnerHTML={{ __html: entry.current_content }}
                                      className="line-clamp-3 text-xs text-green-900 dark:text-green-100"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {entry.change_description && (
                            <div className="bg-muted/50 rounded p-3">
                              <p className="text-muted-foreground mb-2 text-xs font-medium">
                                Change Summary
                              </p>
                              <p className="text-foreground text-sm">{entry.change_description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground text-sm">No edit history available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={confirmDeleteMemo}
          title="Delete Memo?"
          description={
            deleteError || "This action cannot be undone. The memo will be permanently deleted."
          }
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
          type="delete"
          isLoading={deleteMutation.isPending}
          onCancel={() => setDeleteError("")}
        />
      </>
    );
  }
);

CreateOrUpdateMemo.displayName = "CreateOrUpdateMemo";
