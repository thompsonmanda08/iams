/**
 * Template Service
 *
 * Centralized service for managing workpaper templates and categories.
 * Provides utilities for template retrieval, validation, and category management.
 *
 * @module template-service
 */

import type {
  WorkpaperTemplateDefinition,
  TemplateCategory,
} from '@/lib/types/audit-types';
import {
  ISO27001_2022_TEMPLATE,
  getAvailableTemplates as getTemplates,
  getTemplateById as getTemplate,
  getTemplateCategoriesById as getCategories,
  getCategoryById as getCategory,
} from '@/lib/templates/iso27001-2022-template';

/**
 * Template Service Class
 */
export class TemplateService {
  /**
   * Get all available workpaper templates
   */
  static getAvailableTemplates(): WorkpaperTemplateDefinition[] {
    return getTemplates();
  }

  /**
   * Get a specific template by ID
   */
  static getTemplate(templateId: string): WorkpaperTemplateDefinition | null {
    return getTemplate(templateId);
  }

  /**
   * Get all categories for a specific template
   */
  static getTemplateCategories(templateId: string): TemplateCategory[] {
    return getCategories(templateId);
  }

  /**
   * Get a specific category by template ID and category ID
   */
  static getCategoryById(
    templateId: string,
    categoryId: string
  ): TemplateCategory | null {
    return getCategory(templateId, categoryId);
  }

  /**
   * Get multiple categories by their IDs
   */
  static getCategoriesByIds(
    templateId: string,
    categoryIds: string[]
  ): TemplateCategory[] {
    const allCategories = this.getTemplateCategories(templateId);
    return allCategories.filter((cat) => categoryIds.includes(cat.id));
  }

  /**
   * Validate category selection for a template
   * Ensures all selected categories exist and required categories are included
   */
  static validateCategorySelection(
    templateId: string,
    selectedCategories: string[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if template exists
    const template = this.getTemplate(templateId);
    if (!template) {
      errors.push(`Template with ID '${templateId}' not found`);
      return { valid: false, errors };
    }

    // Check if at least one category is selected
    if (!selectedCategories || selectedCategories.length === 0) {
      errors.push('At least one category must be selected');
      return { valid: false, errors };
    }

    // Check if all selected categories exist in the template
    const availableCategories = template.categories.map((cat) => cat.id);
    const invalidCategories = selectedCategories.filter(
      (catId) => !availableCategories.includes(catId)
    );

    if (invalidCategories.length > 0) {
      errors.push(
        `Invalid category IDs: ${invalidCategories.join(', ')}`
      );
    }

    // Check if required categories are selected
    const requiredCategories = template.categories
      .filter((cat) => cat.isRequired)
      .map((cat) => cat.id);

    const missingRequired = requiredCategories.filter(
      (catId) => !selectedCategories.includes(catId)
    );

    if (missingRequired.length > 0) {
      const missingNames = missingRequired
        .map((catId) => {
          const cat = template.categories.find((c) => c.id === catId);
          return cat?.name || catId;
        })
        .join(', ');
      errors.push(`Required categories must be selected: ${missingNames}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get template summary information
   */
  static getTemplateSummary(templateId: string): {
    id: string;
    name: string;
    description: string;
    totalCategories: number;
    mainClausesCount: number;
    annexAControlsCount: number;
    requiredCategoriesCount: number;
  } | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const mainClauses = template.categories.filter(
      (cat) => cat.group === 'main-clauses'
    );
    const annexA = template.categories.filter(
      (cat) => cat.group === 'annex-a-controls'
    );
    const required = template.categories.filter((cat) => cat.isRequired);

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      totalCategories: template.categories.length,
      mainClausesCount: mainClauses.length,
      annexAControlsCount: annexA.length,
      requiredCategoriesCount: required.length,
    };
  }

  /**
   * Get categories grouped by their group type
   */
  static getCategoriesGrouped(templateId: string): {
    mainClauses: TemplateCategory[];
    annexAControls: TemplateCategory[];
  } {
    const categories = this.getTemplateCategories(templateId);

    return {
      mainClauses: categories.filter((cat) => cat.group === 'main-clauses'),
      annexAControls: categories.filter(
        (cat) => cat.group === 'annex-a-controls'
      ),
    };
  }

  /**
   * Search categories by name or description
   */
  static searchCategories(
    templateId: string,
    searchTerm: string
  ): TemplateCategory[] {
    const categories = this.getTemplateCategories(templateId);
    const term = searchTerm.toLowerCase();

    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term) ||
        cat.displayName.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term) ||
        cat.clauses.some((clause) => clause.toLowerCase().includes(term))
    );
  }

  /**
   * Get default/recommended category selection for a template
   */
  static getRecommendedCategories(templateId: string): string[] {
    const template = this.getTemplate(templateId);
    if (!template) return [];

    // For ISO 27001, recommend all main clauses as they are fundamental
    if (templateId === 'iso27001-2022') {
      return template.categories
        .filter((cat) => cat.group === 'main-clauses')
        .map((cat) => cat.id);
    }

    // For other templates, return required categories
    return template.categories
      .filter((cat) => cat.isRequired)
      .map((cat) => cat.id);
  }

  /**
   * Get category count by group
   */
  static getCategoryCountByGroup(
    templateId: string,
    group: 'main-clauses' | 'annex-a-controls'
  ): number {
    const categories = this.getTemplateCategories(templateId);
    return categories.filter((cat) => cat.group === group).length;
  }

  /**
   * Check if a template has any required categories
   */
  static hasRequiredCategories(templateId: string): boolean {
    const categories = this.getTemplateCategories(templateId);
    return categories.some((cat) => cat.isRequired);
  }

  /**
   * Get ISO 27001:2022 template directly (convenience method)
   */
  static getISO27001Template(): WorkpaperTemplateDefinition {
    return ISO27001_2022_TEMPLATE;
  }

  /**
   * Get display name for a category group
   */
  static getGroupDisplayName(
    group: 'main-clauses' | 'annex-a-controls'
  ): string {
    return group === 'main-clauses' ? 'Main Clauses' : 'Annex A Controls';
  }
}

/**
 * Utility function to format category display name
 */
export function formatCategoryDisplayName(category: TemplateCategory): string {
  return category.displayName || `${category.name} (${category.clauseRange || category.clauses.join(', ')})`;
}

/**
 * Utility function to get category clause range display
 */
export function getCategoryClauseDisplay(category: TemplateCategory): string {
  if (category.clauseRange) {
    return category.clauseRange;
  }
  if (category.clauses.length <= 3) {
    return category.clauses.join(', ');
  }
  return `${category.clauses[0]}-${category.clauses[category.clauses.length - 1]}`;
}

/**
 * Utility function to get group display name
 */
export function getGroupDisplayName(
  group: 'main-clauses' | 'annex-a-controls'
): string {
  return group === 'main-clauses' ? 'Main Clauses' : 'Annex A Controls';
}
