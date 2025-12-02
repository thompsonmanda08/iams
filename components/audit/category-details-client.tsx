/**
 * Category Details Client Component
 *
 * Displays detailed information about a template category including
 * description, scope, objectives, audit procedure, and framework-specific metadata.
 *
 * @module category-details-client
 */

"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Target, Clipboard, CheckCircle2, Loader } from "lucide-react";
import type { TemplateCategory } from "@/lib/types/audit-types";
import { MetadataDisplay } from "./metadata-display";
import { useWorkpaperTemplate } from "@/hooks/use-audit-query-data";

interface CategoryDetailsClientProps {
  category: TemplateCategory;
  templateId: string;
}

export function CategoryDetailsClient({ category, templateId }: CategoryDetailsClientProps) {
  const router = useRouter();
  const { data: templateResponse, isLoading } = useWorkpaperTemplate(templateId);
  const frameworkType = templateResponse?.data?.framework_type || templateResponse?.data?.standard || "ISO27001";

  const handleBack = () => {
    router.back();
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Template
          </Button>
        </div>
      </div>

      {/* Category Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-2xl">{category.display_name || category.name}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {category.description || "No description available"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Badge variant="outline" className="gap-1.5">
                  <Loader className="h-3 w-3 animate-spin" />
                  Loading...
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-white">
                  {frameworkType}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Framework Metadata Items */}
          {!isLoading && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                  Framework Items
                </h3>
              </div>
              <MetadataDisplay metadata={category.metadata} frameworkType={frameworkType} />
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 rounded-lg border border-dashed p-4">
              <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Loading framework information...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground mb-1 font-medium">Category Name</dt>
              <dd>{category.name}</dd>
            </div>
            {category.sort_order !== undefined && (
              <div>
                <dt className="text-muted-foreground mb-1 font-medium">Sort Order</dt>
                <dd>{category.sort_order}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
