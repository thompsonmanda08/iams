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
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Copy,
  ArrowRight,
  Pencil,
  View,
  Trash
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
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
import { deleteWorkingPaperTemplate } from "@/app/_actions/audit-module-actions";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/status-badge";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Spinner } from "../../../../../components/ui/spinner";

interface WorkingPaperTemplate {
  id: string;
  name: string;
  standard: string;
  description?: string;
  version?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface WorkpaperTemplatesTableProps {
  templates: WorkingPaperTemplate[];
  isLoading?: boolean;
}

export function WorkpaperTemplatesTable({ templates, isLoading }: WorkpaperTemplatesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WorkingPaperTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (template: WorkingPaperTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
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
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-medium">No templates found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your first working paper template to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template Name</TableHead>
            <TableHead>Standard</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[80px] text-center" align="center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow
              key={template.id}
              onClick={() => {
                router.push(`/dashboard/audit/workpapers/templates/${template.id}`);
              }}>
              <TableCell>
                <div className="space-y-1">
                  <Link
                    href={`/dashboard/audit/workpapers/templates/${template.id}`}
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
                <StatusBadge status={template.is_active ? "ACTIVE" : "INACTIVE"} size="sm" />
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
                      href={`/dashboard/audit/workpapers/templates/${template.id}`}
                      className="flex cursor-pointer items-center gap-2">
                      <View className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 gap-1.5">
                    <Link
                      href={`/dashboard/audit/workpapers/templates/${template.id}/edit`}
                      className="flex cursor-pointer items-center gap-2">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
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
    </div>
  );
}
