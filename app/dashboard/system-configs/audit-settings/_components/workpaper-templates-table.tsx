"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, View, ClipboardCheck, Plus } from "lucide-react";
import { CreateOrUpdateISOTemplateDialog } from "./create-workpaper-dialog";
import { format } from "date-fns";
import Link from "next/link";
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
import { deleteWorkingPaperTemplate } from "@/app/_actions/audit-module-actions";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/status-badge";

import { Spinner } from "../../../../../components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

interface WorkingPaperTemplate {
  id: string;
  name: string;
  standard: string;
  description?: string;
  version?: string;
  is_active?: boolean;
  framework_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface WorkpaperTemplatesTableProps {
  templates: WorkingPaperTemplate[];
  isLoading?: boolean;
  onCreateClick?: () => void;
}

export function WorkpaperTemplatesTable({
  templates,
  isLoading,
  onCreateClick
}: WorkpaperTemplatesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WorkingPaperTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<WorkingPaperTemplate | null>(null);

  const handleDeleteClick = (template: WorkingPaperTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (template: WorkingPaperTemplate) => {
    const frameworkType = (template.framework_type || "").toUpperCase();
    const isStandardFramework = ["ISO27001", "COSO", "COBIT", "NIST"].includes(frameworkType);

    if (isStandardFramework) {
      // Open modal for standard frameworks
      setTemplateToEdit(template);
      setIsEditModalOpen(true);
    } else {
      // Route to edit page for custom/general frameworks
      router.push(`/dashboard/system-configs/audit-settings/templates/${template.id}/edit`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteWorkingPaperTemplate(templateToDelete.id);

      if (result.success) {
        toast({
          title: "Success",
          description: "Template deleted successfully"
        });
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete template",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="bg-canvas/50 border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-8 py-8">
          <div className="relative mb-4">
            <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
            <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
              <ClipboardCheck className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-foreground mb-2 text-2xl font-semibold">No No templates</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            Create your first working paper template to get started
          </p>

          <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">TEMPLATE</div>
              <div className="text-muted-foreground">Clauses & Procedures</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">PLAN</div>
              <div className="text-muted-foreground">Requirement gathering</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">EXECUTE</div>
              <div className="text-muted-foreground">Action Findings</div>
            </div>
          </div>

          <Button size="lg" onClick={onCreateClick} className="gap-2">
            <Plus className="h-5 w-5" />
            Create Workpaper Template
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>TEMPLATE NAME</TableHead>
            <TableHead>STANDARD / FRAMEWORK TYPE</TableHead>
            <TableHead>VERSION</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>LAST UPDATED</TableHead>
            <TableHead className="w-[80px] text-center" align="center">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow
              key={template.id}
              onClick={() => {
                router.push(`/dashboard/system-configs/audit-settings/templates/${template.id}`);
              }}>
              <TableCell>
                <div className="space-y-1">
                  <Link
                    href={`/dashboard/system-configs/audit-settings/templates/${template.id}`}
                    className="hover:text-primary font-medium hover:underline">
                    {template.name}
                  </Link>
                  {template.description && (
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {template.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{template.standard}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{template.version || "1.0"}</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={template.is_active ? "ACTIVE" : "INACTIVE"} />
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {template.updated_at
                    ? format(new Date(template.updated_at), "MMM d, yyyy")
                    : "N/A"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 gap-1.5">
                    <Link
                      href={`/dashboard/system-configs/audit-settings/templates/${template.id}`}
                      className="flex cursor-pointer items-center gap-2">
                      <View className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(template);
                    }}
                    className="h-8 gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      handleDeleteClick(template);
                      e.stopPropagation();
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{templateToDelete?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal for Standard Frameworks */}
      {templateToEdit && (
        <CreateOrUpdateISOTemplateDialog
          openModal={isEditModalOpen}
          setOpenModal={setIsEditModalOpen}
          initialData={templateToEdit as any}
          templateId={templateToEdit.id}
        />
      )}
    </div>
  );
}
