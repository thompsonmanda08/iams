/**
 * Template Selector Simple Component
 *
 * Simple template selection component for audit plan creation.
 * Shows available templates with descriptions and selection.
 *
 * @module template-selector-simple
 */

'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2 } from 'lucide-react';
import { TemplateService } from '@/lib/services/template-service';
import type { WorkpaperTemplateDefinition } from '@/lib/types/audit-types';

interface TemplateSelectorSimpleProps {
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
}

export function TemplateSelectorSimple({
  value,
  onChange,
  disabled = false,
}: TemplateSelectorSimpleProps) {
  const [templates, setTemplates] = useState<WorkpaperTemplateDefinition[]>([]);

  useEffect(() => {
    const availableTemplates = TemplateService.getAvailableTemplates();
    setTemplates(availableTemplates);

    // Auto-select first template if none selected
    if (!value && availableTemplates.length > 0) {
      onChange(availableTemplates[0].id);
    }
  }, [value, onChange]);

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No templates available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Select Working Paper Template</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the template that will be used to generate working papers for this audit plan
        </p>
      </div>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="grid gap-4"
      >
        {templates.map((template) => {
          const summary = TemplateService.getTemplateSummary(template.id);
          const isSelected = value === template.id;

          return (
            <Label
              key={template.id}
              htmlFor={template.id}
              className="cursor-pointer"
            >
              <Card
                className={`
                  transition-all
                  ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem
                        value={template.id}
                        id={template.id}
                        className="mt-1"
                      />
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {template.name}
                          {template.version && (
                            <Badge variant="outline" className="text-xs font-normal">
                              v{template.version}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>

                {summary && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary">
                        {summary.totalCategories} categories
                      </Badge>
                      <Badge variant="secondary">
                        {summary.mainClausesCount} main clauses
                      </Badge>
                      <Badge variant="secondary">
                        {summary.annexAControlsCount} control groups
                      </Badge>
                    </div>
                  </CardContent>
                )}
              </Card>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
