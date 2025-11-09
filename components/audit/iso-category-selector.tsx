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
  CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateService } from "@/lib/services/template-service";
import { useWorkpaperTemplateCategories } from "@/hooks/use-audit-query-data";
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

  // Fetch template with categories from database
  const { data: templateResponse, isLoading, error } = useWorkpaperTemplateCategories(templateId);

  // Extract categories from response with fallback to static data
  const categories: TemplateCategory[] =
    templateResponse?.success && templateResponse.data?.data?.categories
      ? templateResponse.data.data.categories
      : TemplateService.getTemplateCategories(templateId);

  // Group categories
  const mainClauses = categories.filter((cat) => cat.group === "main-clauses");
  const annexAControls = categories.filter((cat) => cat.group === "annex-a-controls");
  const groupedCategories = {
    mainClauses,
    annexAControls
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          <span className="text-muted-foreground ml-2">Loading categories...</span>
        </div>
      </Card>
    );
  }

  // Error state - fall back to static data
  if (error) {
    console.warn("Failed to load categories from database, using static fallback:", error);
  }

  if (categories.length === 0) {
    return (
      <Card className="p-6">
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">No categories available for this template</p>
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
                className="w-full justify-between">
                {selectedCategory
                  ? selectedCategory.display_name || selectedCategory.name
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
                    const groupType =
                      groupKey === "mainClauses" ? "main-clauses" : "annex-a-controls";
                    return (
                      <CommandGroup
                        key={groupKey}
                        heading={TemplateService.getGroupDisplayName(groupType)}>
                        {groupCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={`${category.name} ${category.display_name || category.name}`}
                            onSelect={() => {
                              onCategorySelect(category);
                              setOpen(false);
                            }}>
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategory?.id === category.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-1 flex-col">
                              <span className="font-medium">
                                {category.display_name || category.name}
                              </span>
                              <span className="text-muted-foreground line-clamp-1 text-xs">
                                {category.description || category.objectives}
                              </span>
                            </div>
                            {category.is_required && (
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
          <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedCategory.group === "main-clauses" ? "Main Clause" : "Annex A Control"}
                </Badge>
                {selectedCategory.clause_range && (
                  <Badge variant="outline">{selectedCategory.clause_range}</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Expand Details
                  </>
                )}
              </Button>
            </div>

            {/* Always show objectives */}
            <div>
              <p className="mb-1 text-xs font-medium text-slate-600">Objectives</p>
              <p className="text-sm text-slate-700">{selectedCategory.objectives}</p>
            </div>

            {/* Expandable details */}
            {expanded && (
              <>
                {selectedCategory.scope && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-600">Scope</p>
                    <p className="text-sm whitespace-pre-wrap text-slate-700">
                      {selectedCategory.scope}
                    </p>
                  </div>
                )}

                {selectedCategory.audit_procedure && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-600">Audit Procedure</p>
                    <p className="text-sm whitespace-pre-wrap text-slate-700">
                      {selectedCategory.audit_procedure}
                    </p>
                  </div>
                )}

                {selectedCategory.description && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-600">Description</p>
                    <p className="text-sm text-slate-700">{selectedCategory.description}</p>
                  </div>
                )}

                {selectedCategory.clauses && selectedCategory.clauses.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-600">ISO Clauses</p>
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
