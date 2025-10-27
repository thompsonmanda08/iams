/**
 * Template Selector Simple Component
 *
 * Simple template selection component for audit plan creation.
 * Shows available templates with descriptions and selection.
 *
 * @module template-selector-simple
 */

"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { TemplateService } from "@/lib/services/template-service";
import type { WorkpaperTemplateDefinition } from "@/lib/types/audit-types";
import {
  useWorkpaperTemplates,
  useWorkpaperTemplatesWithCategories
} from "@/hooks/use-audit-query-data";
import { getTemplateSummary } from "@/lib/utils/audit-helpers";
import { Alert, AlertDescription } from "../ui/alert";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";

interface TemplateSelectorSimpleProps {
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
}

export function TemplateSelectorSimple({
  value,
  onChange,
  disabled = false
}: TemplateSelectorSimpleProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  // const [templates, setTemplates] = useState<WorkpaperTemplateDefinition[]>([]);

  const { data: templateResponse, isLoading: loadingTemplates } = useWorkpaperTemplates();
  const templates = templateResponse?.success
    ? (templateResponse.data?.data?.data as WorkpaperTemplateDefinition[])
    : ([] as WorkpaperTemplateDefinition[]);

  const { data: fullTemplateResponse, isLoading: loadingTemplateDetails } =
    useWorkpaperTemplatesWithCategories(selectedTemplateId);

  useEffect(() => {
    // const availableTemplates = TemplateService.fetchTemplates();
    // setTemplates([...availableTemplates, ...workpaperTemplates]);
    // setTemplates(availableTemplates);
    // setTemplates(workpaperTemplates);

    // Auto-select first template if none selected
    if (!value && templates.length > 0) {
      onChange(templates[0].id);
      // onChange(workpaperTemplates[0].id);
    }
  }, []);

  if (loadingTemplates) {
    return <div className="text-muted-foreground py-8 text-center">Templates Loading...</div>;
  }

  if (templates.length === 0) {
    return <div className="text-muted-foreground py-8 text-center">No templates available</div>;
  }

  const selectedTemplate = fullTemplateResponse?.success
    ? (fullTemplateResponse.data?.data?.data as WorkpaperTemplateDefinition)
    : ({} as WorkpaperTemplateDefinition);

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
          const summary = getTemplateSummary(selectedTemplate);
          const isSelected = value === template.id;

          return (
            <Label key={template.id + index} htmlFor={template.id} className="grid cursor-pointer">
              <Card
                className={`transition-all ${isSelected ? "border-primary ring-primary/20 ring-2" : "hover:border-primary/50"} ${disabled ? "cursor-not-allowed opacity-50" : ""} `}>
                <CardHeader className="pb-3">
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
                  <CardContent className="pt-0">
                    {loadingTemplateDetails ? (
                      <span className="flex gap-2">
                        <Spinner
                          className={cn("dark:text-primary-foreground text-primary size-4")}
                        />{" "}
                        Loading...
                      </span>
                    ) : summary && selectedTemplate && selectedTemplateId ? (
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
                          There are no details available for this template
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
