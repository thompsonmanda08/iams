"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateService } from "@/lib/services/template-service";
import type { TemplateCategory } from "@/lib/types/audit-types";

interface IsoCategorySelectorProps {
  templateId: string;
  onCategorySelect: (category: TemplateCategory | null) => void;
  selectedCategory: TemplateCategory | null;
}

export function IsoCategorySelector({
  templateId,
  onCategorySelect,
  selectedCategory
}: IsoCategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Get categories from template service
  const categories = TemplateService.getTemplateCategories(templateId);
  const groupedCategories = TemplateService.getCategoriesGrouped(templateId);

  if (categories.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No categories available for this template
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category-select">Select Category</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedCategory
                  ? selectedCategory.displayName
                  : "Select category..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  {Object.entries(groupedCategories).map(([groupKey, groupCategories]) => {
                    // Map camelCase keys to group enum values
                    const groupType = groupKey === 'mainClauses' ? 'main-clauses' : 'annex-a-controls';
                    return (
                      <CommandGroup
                        key={groupKey}
                        heading={TemplateService.getGroupDisplayName(groupType)}
                      >
                        {groupCategories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={`${category.name} ${category.displayName}`}
                          onSelect={() => {
                            onCategorySelect(category);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategory?.id === category.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col flex-1">
                            <span className="font-medium">
                              {category.displayName}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {category.description || category.objectives}
                            </span>
                          </div>
                          {category.isRequired && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Required
                            </Badge>
                          )}
                        </CommandItem>
                        ))}
                      </CommandGroup>
                    );
                  })}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Category preview */}
        {selectedCategory && (
          <div className="space-y-3 rounded-lg bg-slate-50 p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedCategory.group === 'main-clauses' ? 'Main Clause' : 'Annex A Control'}</Badge>
                {selectedCategory.clauseRange && (
                  <Badge variant="outline">{selectedCategory.clauseRange}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expand Details
                  </>
                )}
              </Button>
            </div>

            {/* Always show objectives */}
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Objectives</p>
              <p className="text-sm text-slate-700">{selectedCategory.objectives}</p>
            </div>

            {/* Expandable details */}
            {expanded && (
              <>
                {selectedCategory.scope && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Scope</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedCategory.scope}
                    </p>
                  </div>
                )}

                {selectedCategory.auditProcedure && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Audit Procedure</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedCategory.auditProcedure}
                    </p>
                  </div>
                )}

                {selectedCategory.description && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">Description</p>
                    <p className="text-sm text-slate-700">{selectedCategory.description}</p>
                  </div>
                )}

                {selectedCategory.clauses && selectedCategory.clauses.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1">ISO Clauses</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedCategory.clauses.map((clause) => (
                        <Badge key={clause} variant="outline" className="text-xs">
                          {clause}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
