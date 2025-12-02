/**
 * Template Selector Simple Component
 *
 * Simple template selection component for audit plan creation.
 * Shows available templates with descriptions and selection.
 *
 * @module template-selector-simple
 */

"use client";

import { useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, AlertCircle, FileType2, Plus } from "lucide-react";
import type { WorkpaperTemplateDefinition } from "@/lib/types/audit-types";
import {
  useWorkpaperTemplates,
  useWorkpaperTemplateCategories
} from "@/hooks/use-audit-query-data";
import { getTemplateSummary } from "@/lib/utils/audit-helpers";
import { Alert, AlertDescription } from "../../../../../../components/ui/alert";
import { Badge } from "../../../../../../components/ui/badge";
import { Spinner } from "../../../../../../components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Button } from "../../../../../../components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateSelectorSimpleProps {
  value: string;
  onChange: (template: WorkpaperTemplateDefinition) => void;
  disabled?: boolean;
  loadingTemplateDetails?: boolean;
}

export function TemplateSelectorSimple({
  value,
  onChange,
  disabled = false,
  loadingTemplateDetails
}: TemplateSelectorSimpleProps) {
  const { data: templateResponse, isLoading: loadingTemplates } = useWorkpaperTemplates();

  const templates: WorkpaperTemplateDefinition[] = Array.isArray(templateResponse?.data?.data)
    ? templateResponse?.data?.data
    : Array.isArray(templateResponse?.data)
      ? templateResponse?.data
      : Array.isArray(templateResponse)
        ? templateResponse
        : [];

  // Use value prop as the selected template ID (from parent state)
  const selectedTemplateId = value;

  // Fetch categories for the selected template
  const { data: categoriesResponse, isLoading: loadingCategories } =
    useWorkpaperTemplateCategories(selectedTemplateId);

  const templateCategories: WorkpaperTemplateDefinition["categories"] = Array.isArray(
    categoriesResponse?.data?.data
  )
    ? categoriesResponse?.data?.data
    : Array.isArray(categoriesResponse?.data)
      ? categoriesResponse?.data
      : Array.isArray(categoriesResponse)
        ? categoriesResponse
        : [];

  const summary = useMemo(() => {
    // Find the full template object from templates array to ensure we have all template data
    const fullTemplate = templates.find((t) => t.id === selectedTemplateId);

    // Combine full template data with fetched categories for summary calculation
    if (fullTemplate && selectedTemplateId && templateCategories.length > 0) {
      return getTemplateSummary({
        ...fullTemplate,
        categories: templateCategories
      } as WorkpaperTemplateDefinition);
    }
    return null;
  }, [selectedTemplateId, templates, templateCategories]);

  // Auto-select first template if none selected and templates are loaded
  useEffect(() => {
    if (!value && templateResponse?.success && templates.length > 0) {
      const firstTemplate = templates[0];
      onChange({ ...firstTemplate, categories: [] }); // Pass template with empty categories initially
    }
  }, [value, templates, templateResponse?.success, onChange]);

  // Update callback when categories are loaded for the selected template
  useEffect(() => {
    if (selectedTemplateId && templates.length > 0 && templateCategories.length > 0) {
      const fullTemplate = templates.find((t) => t.id === selectedTemplateId);
      if (fullTemplate) {
        onChange({ ...fullTemplate, categories: templateCategories });
      }
    }
  }, [selectedTemplateId, templateCategories, templates, onChange]);

  if (loadingTemplates) {
    return (
      <div className="text-muted-foreground grid animate-pulse gap-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <Spinner className="size-6" /> Loading templates...
        </div>
        <Skeleton className="bg-primary/5 border-input flex h-32 animate-pulse gap-2 rounded-xl border" />
        <Skeleton className="bg-primary/5 border-input flex h-32 animate-pulse gap-2 rounded-xl border" />
        <Skeleton className="bg-primary/5 border-input flex h-32 animate-pulse gap-2 rounded-xl border" />
      </div>
    );
  }

  if (templates.length == 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileType2 />
            </EmptyMedia>
            <EmptyTitle>No templates available</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any templates yet. Get started by creating your first
              template.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/dashboard/system-configs/audit-settings/templates">
                  <Plus className="h-4 w-4" /> Create New Template
                </Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Select Working Paper Template</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose the template that will be used to generate working papers for this audit plan
        </p>
      </div>

      <RadioGroup
        value={value}
        onValueChange={(selectedId) => {
          const selectedTemplate = templates.find((t) => t.id === selectedId);
          if (selectedTemplate) {
            onChange({ ...selectedTemplate, categories: templateCategories });
          }
        }}
        disabled={disabled}
        className="grid gap-4">
        {templates?.map((template, index) => {
          const isSelected = value === template.id;

          return (
            <Label key={template.id + index} htmlFor={template.id} className="grid cursor-pointer">
              <Card
                className={`transition-all ${isSelected ? "border-primary ring-primary/20 ring-2" : "hover:border-primary/50"} ${disabled ? "cursor-not-allowed opacity-50" : ""} `}>
                <CardHeader className="">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                      <FileText className="text-muted-foreground h-5 w-5" />
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          {template.name}
                          {template.version && (
                            <Badge variant="outline" className="text-xs font-normal">
                              v{template.version}
                            </Badge>
                          )}
                          {(template.framework_type || template.standard) && (
                            <Badge className="text-xs font-normal">
                              {template.framework_type || template.standard}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />}
                  </div>
                </CardHeader>

                {
                  <CardContent className="">
                    {loadingTemplateDetails || loadingCategories ? (
                      <span className="flex gap-2">
                        <Spinner
                          className={cn("dark:text-primary-foreground text-primary size-4")}
                        />{" "}
                        Creating Template Summary...
                      </span>
                    ) : isSelected && summary && selectedTemplateId ? (
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">{summary?.totalCategories} categories</Badge>
                        <Badge variant="secondary">{summary?.mainClausesCount} main clauses</Badge>
                        <Badge variant="secondary">
                          {summary?.annexAControlsCount} control groups
                        </Badge>
                      </div>
                    ) : (
                      <Alert variant={"default"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Select This template to see category details.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                }
              </Card>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
