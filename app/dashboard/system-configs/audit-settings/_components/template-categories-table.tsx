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
import { Edit, Trash2, Loader2, ArrowRight, Pencil, View } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { deleteTemplateCategory } from "@/app/_actions/audit-module-actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../../components/ui/tooltip";
import { TemplateCategory } from "@/lib/types/audit-types";
import Link from "next/link";
import { MetadataDisplay } from "@/components/audit/metadata-display";
import { usePermissions } from "@/hooks/use-permissions";
import { notify } from "@/lib/utils";

interface TemplateCategoriesTableProps {
  categories: TemplateCategory[];
  templateId: string;
  isLoading?: boolean;
  frameworkType?: string;
}

export function TemplateCategoriesTable({
  categories,
  templateId,
  isLoading,
  frameworkType = "ISO27001"
}: TemplateCategoriesTableProps) {
  const router = useRouter();
  const { checkPermission } = usePermissions();
  // const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<TemplateCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (
    category: TemplateCategory,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    if (!checkPermission("AUDIT_MODULE_CONFIG", "can_delete")) return;
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteTemplateCategory(categoryToDelete?.id as string);

      if (result.success) {
        notify({
          title: "Success",
          description: "Category deleted successfully",
          type: "success"
        });
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        router.refresh();
      } else {
        notify({
          title: "Error",
          description: result.message || "Failed to delete category",
          type: "error"
        });
      }
    } catch (error) {
      notify({
        title: "Error",
        description: "An unexpected error occurred",
        type: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-medium">No categories found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Add categories to organize your template
          </p>
        </div>
      </div>
    );
  }

  // Sort categories by sort_order
  const sortedCategories: TemplateCategory[] = [...categories].sort((a, b) => {
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    return orderA - orderB;
  });

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ORDER</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>
              {frameworkType == "ISO27001"
                ? "ISO 27001 CLAUSES"
                : frameworkType == "COBIT"
                  ? "COBIT FRAMEWORK ITEMS"
                  : frameworkType == "COSO"
                    ? "COSO FRAMEWORK ITEMS"
                    : frameworkType == "NIST"
                      ? "NIST FRAMEWORK ITEMS"
                      : "FRAMEWORK ITEMS"}
            </TableHead>
            <TableHead className="w-[80px] text-center" align="center">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCategories.map((category) => (
            <TableRow
              key={category.id}
              onClick={(e) => {
                router.push(
                  `/dashboard/system-configs/audit-settings/templates/${templateId}/categories/${category.id}`
                );
                e.stopPropagation();
              }}>
              <TableCell>
                <Badge variant="outline">{category.sort_order ?? "-"}</Badge>
              </TableCell>
              <TableCell>
                <div className="grid">
                  <h4 className="font-medium">{category.display_name || category.name}</h4>
                  <span className="text-muted-foreground text-xs font-light">{category.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-md">
                  <MetadataDisplay metadata={category.metadata} frameworkType={frameworkType} />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 gap-1.5">
                    <Link
                      href={`/dashboard/system-configs/audit-settings/templates/${templateId}/categories/${category.id}`}
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
                      href={`/dashboard/system-configs/audit-settings/templates/${templateId}/categories/${category.id}/edit`}
                      onClick={(e) => {
                        if (!checkPermission("AUDIT_MODULE_CONFIG", "can_edit")) {
                          e.preventDefault();
                        }
                      }}
                      className="flex cursor-pointer items-center gap-2">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleDeleteClick(category, e)}
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
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;? This action
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
    </div>
  );
}
