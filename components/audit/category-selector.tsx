/**
 * Category Selector Component
 *
 * Allows users to select which categories from a template to include
 * when creating an audit plan. Supports "Select All" and category grouping.
 *
 * @module category-selector
 */

'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { TemplateService, getGroupDisplayName } from '@/lib/services/template-service';
import type { TemplateCategory } from '@/lib/types/audit-types';

interface CategorySelectorProps {
  templateId: string;
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  disabled?: boolean;
  showRecommended?: boolean;
}

export function CategorySelector({
  templateId,
  selectedCategories,
  onCategoriesChange,
  disabled = false,
  showRecommended = true,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const template = TemplateService.getTemplate(templateId);
    if (template) {
      setCategories(template.categories);
    }
  }, [templateId]);

  useEffect(() => {
    setSelectAll(
      categories.length > 0 && selectedCategories.length === categories.length
    );
  }, [selectedCategories, categories]);

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all except required categories
      const requiredCategories = categories
        .filter((cat) => cat.isRequired)
        .map((cat) => cat.id);
      onCategoriesChange(requiredCategories);
    } else {
      // Select all categories
      onCategoriesChange(categories.map((cat) => cat.id));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);

    // Don't allow deselecting required categories
    if (category?.isRequired && selectedCategories.includes(categoryId)) {
      return;
    }

    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const handleSelectRecommended = () => {
    const recommended = TemplateService.getRecommendedCategories(templateId);
    onCategoriesChange(recommended);
  };

  const mainClauses = categories.filter((cat) => cat.group === 'main-clauses');
  const annexAControls = categories.filter(
    (cat) => cat.group === 'annex-a-controls'
  );

  if (categories.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No categories available for this template.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            Select Categories for Working Papers
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which categories to include in your audit plan. Working
            papers will be automatically generated for selected categories.
          </p>
        </div>
        <Badge variant="secondary" className="ml-4">
          {selectedCategories.length} of {categories.length} selected
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2 flex-1">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={handleSelectAll}
            disabled={disabled}
          />
          <Label
            htmlFor="select-all"
            className="font-medium cursor-pointer flex-1"
          >
            Select All Categories
          </Label>
        </div>

        {showRecommended && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectRecommended}
            disabled={disabled}
          >
            Select Recommended
          </Button>
        )}
      </div>

      <Separator />

      {/* Main Clauses */}
      {mainClauses.length > 0 && (
        <CategoryGroup
          title={getGroupDisplayName('main-clauses')}
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
          title={getGroupDisplayName('annex-a-controls')}
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
  disabled,
}: CategoryGroupProps) {
  const selectedCount = categories.filter((cat) =>
    selectedCategories.includes(cat.id)
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
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
            selected={selectedCategories.includes(category.id)}
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

function CategoryItem({
  category,
  selected,
  onToggle,
  disabled,
}: CategoryItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`
        border rounded-lg p-4 transition-colors
        ${selected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'}
        ${category.isRequired ? 'border-orange-300 dark:border-orange-700' : ''}
      `}
    >
      <div className="flex items-start space-x-3">
        <Checkbox
          id={category.id}
          checked={selected}
          onCheckedChange={() => onToggle(category.id)}
          disabled={disabled || category.isRequired}
          className="mt-1"
        />

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor={category.id}
              className={`font-medium cursor-pointer ${
                category.isRequired ? 'cursor-not-allowed' : ''
              }`}
            >
              {category.displayName}
            </Label>

            <div className="flex items-center gap-2">
              {category.isRequired && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="h-6 w-6 p-0"
              >
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {category.description && !expanded && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {category.description}
            </p>
          )}

          {expanded && (
            <div className="mt-3 space-y-3 text-sm border-t pt-3">
              {category.description && (
                <div>
                  <span className="font-medium text-foreground">
                    Description:
                  </span>
                  <p className="text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
              )}

              <div>
                <span className="font-medium text-foreground">Scope:</span>
                <p className="text-muted-foreground mt-1">{category.scope}</p>
              </div>

              <div>
                <span className="font-medium text-foreground">
                  Objectives:
                </span>
                <p className="text-muted-foreground mt-1">
                  {category.objectives}
                </p>
              </div>

              <div>
                <span className="font-medium text-foreground">
                  Audit Procedure:
                </span>
                <pre className="text-muted-foreground mt-1 whitespace-pre-wrap font-sans">
                  {category.auditProcedure}
                </pre>
              </div>

              <div>
                <span className="font-medium text-foreground">Clauses:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {category.clauses.map((clause) => (
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
