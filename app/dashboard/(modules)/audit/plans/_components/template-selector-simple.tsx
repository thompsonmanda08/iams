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
  useWorkpaperTemplateCategories,
  useGeneralWorkPaperConfigs
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
import { PermissionButton } from "@/components/ui/permission-button";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateSelectorSimpleProps {
  value: string;
  onChange: (template: WorkpaperTemplateDefinition) => void;
  disabled?: boolean;
  loadingTemplateDetails?: boolean;
  frameworkType?: string;
}

export function TemplateSelectorSimple({
  value,
  onChange,
  disabled = false,
  loadingTemplateDetails,
  frameworkType
}: TemplateSelectorSimpleProps) {
  const { data: templateResponse, isLoading: loadingTemplates } = useWorkpaperTemplates(
    frameworkType ? { framework_type: frameworkType } : undefined
  );

  const templates: WorkpaperTemplateDefinition[] = useMemo(
    () =>
      Array.isArray(templateResponse?.data?.data)
        ? templateResponse?.data?.data
        : Array.isArray(templateResponse?.data)
          ? templateResponse?.data
          : Array.isArray(templateResponse)
            ? templateResponse
            : [],
    [templateResponse]
  );

  console.log("Fetched Templates:", templates);

  // Use value prop as the selected template ID (from parent state)
  const selectedTemplateId = value;
  const isGeneralTemplate = frameworkType?.toUpperCase() === "GENERAL";

  // Fetch categories for the selected template (compliance frameworks only)
  const { data: categoriesResponse, isLoading: loadingCategories } =
    useWorkpaperTemplateCategories(!isGeneralTemplate ? selectedTemplateId : "");

  // Fetch configuration for the selected template (GENERAL framework only)
  const { data: configurationsResponse, isLoading: loadingConfigurations } =
    useGeneralWorkPaperConfigs(isGeneralTemplate ? selectedTemplateId : "");

  const templateCategories: WorkpaperTemplateDefinition["categories"] = Array.isArray(
    categoriesResponse?.data?.data
  )
    ? categoriesResponse?.data?.data
    : Array.isArray(categoriesResponse?.data)
      ? categoriesResponse?.data
      : Array.isArray(categoriesResponse)
        ? categoriesResponse
        : [];

  // Parse general config — handles multiple response shapes:
  //   { data: [...] }  |  { configs: [...] }  |  [...]  |  { columns, keys }
  const generalConfig = useMemo(() => {
    const responseData = configurationsResponse?.data;
    const configsArray =
      responseData?.data?.configs ??
      responseData?.data ??
      responseData?.configs ??
      responseData;
    const raw = Array.isArray(configsArray) ? configsArray[0] : configsArray;
    return raw?.columns ? raw : null;
  }, [configurationsResponse]);

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
      if (firstTemplate) {
        onChange({ ...firstTemplate, categories: firstTemplate.categories ?? [] });
      }
    }
  }, [value, templates, templateResponse?.success, onChange]);

  // Update callback when categories are loaded (compliance templates)
  useEffect(() => {
    if (
      !isGeneralTemplate &&
      selectedTemplateId &&
      templates.length > 0 &&
      templateCategories.length > 0
    ) {
      const fullTemplate = templates.find((t) => t.id === selectedTemplateId);
      if (fullTemplate) {
        onChange({ ...fullTemplate, categories: templateCategories });
      }
    }
  }, [selectedTemplateId, templateCategories, templates, onChange, isGeneralTemplate]);

  // Update callback when config is loaded (GENERAL templates)
  useEffect(() => {
    if (isGeneralTemplate && selectedTemplateId && templates.length > 0 && generalConfig) {
      const fullTemplate = templates.find((t) => t.id === selectedTemplateId);
      if (fullTemplate) {
        onChange({ ...fullTemplate, categories: [] });
      }
    }
  }, [selectedTemplateId, generalConfig, templates, onChange, isGeneralTemplate]);

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
              <PermissionButton
                moduleCode={MODULE_CODES.AUDIT_MODULE_CONFIG}
                action="can_create"
                size="sm"
                asChild>
                <Link href="/dashboard/system-configs/audit-settings/templates">
                  <Plus className="h-4 w-4" /> Create New Template
                </Link>
              </PermissionButton>
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
        {frameworkType && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">Filtering by:</span>
            <Badge variant="outline">{frameworkType}</Badge>
          </div>
        )}
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

                <CardContent>
                  {loadingTemplateDetails ||
                  (isGeneralTemplate ? loadingConfigurations : loadingCategories) ? (
                    <span className="flex gap-2">
                      <Spinner
                        className={cn("dark:text-primary-foreground text-primary size-4")}
                      />{" "}
                      {isGeneralTemplate
                        ? "Loading Config Preview..."
                        : "Creating Template Summary..."}
                    </span>
                  ) : isSelected &&
                    selectedTemplateId &&
                    isGeneralTemplate &&
                    generalConfig ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">
                          {generalConfig.columns?.length ?? 0} columns
                        </Badge>
                        <Badge variant="secondary">
                          {generalConfig.keys?.length ?? 0} audit test keys
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(generalConfig.columns ?? []).map((col: any) => (
                          <Badge key={col.key} variant="outline" className="font-mono text-xs">
                            {col.name}
                          </Badge>
                        ))}
                        {(generalConfig.keys ?? []).map((k: any) => (
                          <Badge
                            key={k.key}
                            className="bg-amber-100 font-mono text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {k.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : isSelected &&
                    selectedTemplateId &&
                    isGeneralTemplate &&
                    !generalConfig ? (
                    <Alert variant="default">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No config defined for this template. Contact your administrator.
                      </AlertDescription>
                    </Alert>
                  ) : isSelected && summary && selectedTemplateId && !isGeneralTemplate ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary">{summary?.totalCategories} categories</Badge>
                      <Badge variant="secondary">{summary?.mainClausesCount} main clauses</Badge>
                      <Badge variant="secondary">
                        {summary?.annexAControlsCount} control groups
                      </Badge>
                    </div>
                  ) : (
                    <Alert variant="default">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Select this template to see{" "}
                        {isGeneralTemplate ? "config" : "category"} details.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
