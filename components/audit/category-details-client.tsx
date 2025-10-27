/**
 * Category Details Client Component
 *
 * Displays detailed information about a template category including
 * description, scope, objectives, audit procedure, and clauses.
 *
 * @module category-details-client
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Target, Clipboard, CheckCircle2, AlertCircle } from "lucide-react";
import type { TemplateCategory } from "@/lib/types/audit-types";
import { getGroupDisplayName } from "@/lib/services/template-service";

interface CategoryDetailsClientProps {
  category: TemplateCategory;
  templateId: string;
}

export function CategoryDetailsClient({ category, templateId }: CategoryDetailsClientProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/dashboard/audit/workpapers/templates/${templateId}`);
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
              {category.is_required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {getGroupDisplayName(category.group)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Clauses */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="text-muted-foreground h-4 w-4" />
              <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                Clauses
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.clauses && category.clauses.length > 0 ? (
                (category.clauses as unknown as string)?.split(",").map((clause) => (
                  <Badge key={clause} variant="outline" className="text-sm">
                    {clause}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No clauses specified</p>
              )}
            </div>
            {category.clause_range && (
              <p className="text-muted-foreground mt-2 text-sm">Range: {category.clause_range}</p>
            )}
          </div>

          <Separator />

          {/* Scope */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Target className="text-muted-foreground h-4 w-4" />
              <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                Scope
              </h3>
            </div>
            <p className="text-sm leading-relaxed">{category.scope || "No scope defined"}</p>
          </div>

          <Separator />

          {/* Objectives */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Target className="text-muted-foreground h-4 w-4" />
              <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                Objectives
              </h3>
            </div>
            <p className="text-sm leading-relaxed">
              {category.objectives || "No objectives defined"}
            </p>
          </div>

          <Separator />

          {/* Audit Procedure */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Clipboard className="text-muted-foreground h-4 w-4" />
              <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                Audit Procedure
              </h3>
            </div>
            <pre className="bg-muted/50 rounded-md p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">
              {category.audit_procedure || "No audit procedure defined"}
            </pre>
          </div>

          {/* Additional Fields (if available) */}
          {(category.documents_obtained ||
            category.source_documents ||
            category.sample_size ||
            category.frequency_of_control ||
            category.sampling_methodology) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                  Additional Details
                </h3>

                {category.documents_obtained && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Documents Obtained</h4>
                    <p className="text-muted-foreground text-sm">{category.documents_obtained}</p>
                  </div>
                )}

                {category.source_documents && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Source Documents</h4>
                    <p className="text-muted-foreground text-sm">{category.source_documents}</p>
                  </div>
                )}

                {category.sample_size && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Sample Size</h4>
                    <p className="text-muted-foreground text-sm">{category.sample_size}</p>
                  </div>
                )}

                {category.frequency_of_control && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Frequency of Control</h4>
                    <p className="text-muted-foreground text-sm">{category.frequency_of_control}</p>
                  </div>
                )}

                {category.sampling_methodology && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Sampling Methodology</h4>
                    <p className="text-muted-foreground text-sm">{category.sampling_methodology}</p>
                  </div>
                )}
              </div>
            </>
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
            <div>
              <dt className="text-muted-foreground mb-1 font-medium">Display Name</dt>
              <dd>{category.display_name || category.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-1 font-medium">Group</dt>
              <dd>
                <Badge variant="outline">{getGroupDisplayName(category.group)}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-1 font-medium">Required</dt>
              <dd>
                {category.is_required ? (
                  <Badge variant="destructive">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </dd>
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
