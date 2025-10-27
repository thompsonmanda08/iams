/**
 * Category Selector Component
 *
 * Allows users to select which categories from a template to include
 * when creating an audit plan. Supports "Select All" and category grouping.
 *
 * @module category-selector
 */

"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Info, Loader2 } from "lucide-react";
import { TemplateService, getGroupDisplayName } from "@/lib/services/template-service";
import { useWorkpaperTemplatesWithCategories } from "@/hooks/use-audit-query-data";
import type { TemplateCategory, WorkpaperTemplateDefinition } from "@/lib/types/audit-types";
import { getRecommendedCategories } from "@/lib/utils/audit-helpers";
import { Spinner } from "../ui/spinner";
import CustomAlert from "../ui/custom-alert";

interface CategorySelectorProps {
  templateId: string;
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  disabled?: boolean;
  loadingTemplateDetails?: boolean;
  showRecommended?: boolean;
  selectedTemplate: WorkpaperTemplateDefinition;
}

export function CategorySelector({
  templateId,
  selectedCategories,
  onCategoriesChange,
  disabled = false,
  showRecommended = true,
  loadingTemplateDetails,
  selectedTemplate
}: CategorySelectorProps) {
  const [selectAll, setSelectAll] = useState(false);

  const categories: TemplateCategory[] = selectedTemplate?.categories || [];

  useEffect(() => {
    setSelectAll(categories.length > 0 && selectedCategories.length === categories.length);
  }, [selectedCategories, categories]);

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all except required categories
      const requiredCategories = categories.filter((cat) => cat.is_required).map((cat) => cat.id!);
      onCategoriesChange(requiredCategories);
    } else {
      // Select all categories
      onCategoriesChange(categories.map((cat) => cat.id!));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const handleSelectRecommended = () => {
    const recommended = getRecommendedCategories(selectedTemplate);
    onCategoriesChange(recommended);
  };

  const mainClauses = categories.filter((cat) => cat.group === "main-clauses");
  const annexAControls = categories.filter((cat) => cat.group === "annex-a-controls");

  // Loading state
  if (loadingTemplateDetails) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6 animate-spin" />
        <span className="text-muted-foreground ml-2">Loading categories...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <CustomAlert
        type="info"
        Icon={Info}
        title="Categories unavailable"
        message="No categories available for this template."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Select Categories for Working Papers</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Choose which categories to include in your audit plan. Working papers will be
            automatically generated for selected categories.
          </p>
        </div>
        <Badge variant="secondary" className="ml-4">
          {selectedCategories.length} of {categories.length} selected
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-4">
        <div className="flex flex-1 items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={handleSelectAll}
            disabled={disabled}
          />
          <Label htmlFor="select-all" className="flex-1 cursor-pointer font-medium">
            Select All Categories
          </Label>
        </div>

        {showRecommended && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectRecommended}
            disabled={disabled}>
            Select Recommended
          </Button>
        )}
      </div>

      <Separator />

      {/* Main Clauses */}
      {mainClauses.length > 0 && (
        <CategoryGroup
          title={getGroupDisplayName("main-clauses")}
          description="Fundamental requirements of the management system"
          categories={mainClauses}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          disabled={disabled}
        />
      )}

      {annexAControls.length > 0 && <Separator />}

      {/* Annex A Controls */}
      {annexAControls.length > 0 && (
        <CategoryGroup
          title={getGroupDisplayName("annex-a-controls")}
          description="Control categories for information security"
          categories={annexAControls}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          disabled={disabled}
        />
      )}
    </div>
  );
}

interface CategoryGroupProps {
  title: string;
  description?: string;
  categories: TemplateCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  disabled?: boolean;
}

function CategoryGroup({
  title,
  description,
  categories,
  selectedCategories,
  onCategoryToggle,
  disabled
}: CategoryGroupProps) {
  const selectedCount = categories.filter((cat) =>
    selectedCategories.includes(cat.id as string)
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            {title}
          </h4>
          {description && <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>}
        </div>
        <Badge variant="outline" className="text-xs">
          {selectedCount}/{categories.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            selected={selectedCategories.includes(category.id as string)}
            onToggle={onCategoryToggle}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: TemplateCategory;
  selected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

function CategoryItem({ category, selected, onToggle, disabled }: CategoryItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${selected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"} ${category.is_required ? "border-orange-300 dark:border-orange-700" : ""} `}>
      <div className="flex items-start space-x-3">
        <Checkbox
          id={category.id}
          checked={selected}
          onCheckedChange={() => onToggle(category.id as string)}
          disabled={disabled}
          className="mt-1"
        />

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={category.id} className="cursor-pointer font-medium">
              {category.display_name || category.name}
            </Label>

            <div className="flex items-center gap-2">
              {category.is_required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="h-6 w-6 p-0">
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {category.description && !expanded && (
            <p className="text-muted-foreground line-clamp-1 text-sm">{category.description}</p>
          )}

          {expanded && (
            <div className="mt-3 space-y-3 border-t pt-3 text-sm">
              {category.description && (
                <div>
                  <span className="text-foreground font-medium">Description:</span>
                  <p className="text-muted-foreground mt-1">{category.description}</p>
                </div>
              )}

              <div>
                <span className="text-foreground font-medium">Scope:</span>
                <p className="text-muted-foreground mt-1">{category.scope}</p>
              </div>

              <div>
                <span className="text-foreground font-medium">Objectives:</span>
                <p className="text-muted-foreground mt-1">{category.objectives}</p>
              </div>

              <div>
                <span className="text-foreground font-medium">Audit Procedure:</span>
                <pre className="text-muted-foreground mt-1 font-sans whitespace-pre-wrap">
                  {category.audit_procedure}
                </pre>
              </div>

              <div>
                <span className="text-foreground font-medium">Clauses:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(category.clauses as unknown as string).split(",")?.map((clause) => (
                    <Badge key={clause} variant="outline" className="text-xs">
                      {clause}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
