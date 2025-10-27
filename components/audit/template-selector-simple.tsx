/**
 * Template Selector Simple Component
 *
 * Simple template selection component for audit plan creation.
 * Shows available templates with descriptions and selection.
 *
 * @module template-selector-simple
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, AlertCircle, FileType2, Plus } from "lucide-react";
import type { WorkpaperTemplateDefinition } from "@/lib/types/audit-types";
import {
  useWorkpaperTemplates,
  useWorkpaperTemplatesWithCategories
} from "@/hooks/use-audit-query-data";
import { getTemplateSummary } from "@/lib/utils/audit-helpers";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "../ui/empty";
import { Button } from "../ui/button";
import Link from "next/link";

interface TemplateSelectorSimpleProps {
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
  loadingTemplateDetails?: boolean;
  selectedTemplate: WorkpaperTemplateDefinition | null;
}

export function TemplateSelectorSimple({
  value,
  onChange,
  disabled = false,
  selectedTemplate,
  loadingTemplateDetails
}: TemplateSelectorSimpleProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const { data: templateResponse, isLoading: loadingTemplates } = useWorkpaperTemplates();

  const templates = templateResponse?.success
    ? (templateResponse.data?.data?.data as WorkpaperTemplateDefinition[])
    : ([] as WorkpaperTemplateDefinition[]);

  const summary = useMemo(() => {
    return selectedTemplateId
      ? getTemplateSummary(selectedTemplate as WorkpaperTemplateDefinition)
      : null;
  }, [selectedTemplateId, selectedTemplate]);

  useEffect(() => {
    // Auto-select first template if none selected and templates are loaded
    if (!value && templateResponse?.success && templates.length > 0) {
      const firstTemplateId = templates[0].id as string;
      onChange(firstTemplateId);
      setSelectedTemplateId(firstTemplateId);
    }
  }, [value, templates, onChange, templateResponse?.success]);

  if (loadingTemplates) {
    return (
      <div className="text-muted-foreground h-24 animate-pulse py-8 text-center">
        <span className="flex gap-2">
          <Spinner className={cn("dark:text-primary-foreground text-primary size-4")} /> Templates
          Loading...
        </span>
      </div>
    );
  }

  if (templates.length === 0) {
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
                <Link href="/dashboard/audit/workpapers/templates/new">
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
        onValueChange={(selected) => {
          setSelectedTemplateId(selected);
          onChange(selected);
        }}
        disabled={disabled}
        className="grid gap-4">
        {templates.map((template, index) => {
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
                        </CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />}
                  </div>
                </CardHeader>

                {
                  <CardContent className="">
                    {loadingTemplateDetails ? (
                      <span className="flex gap-2">
                        <Spinner
                          className={cn("dark:text-primary-foreground text-primary size-4")}
                        />{" "}
                        Creating Template Summary...
                      </span>
                    ) : isSelected && summary && selectedTemplate && selectedTemplateId ? (
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
