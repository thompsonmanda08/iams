/**
 * Template Service
 *
 * Centralized service for managing workpaper templates and categories.
 * Provides utilities for template retrieval, validation, and category management.
 *
 * This service now provides both sync (static fallback) and async (DB-first) methods.
 *
 * @module template-service
 */

import type { WorkpaperTemplateDefinition, TemplateCategory } from "@/lib/types/audit-types";
import {
  // ISO27001_2022_TEMPLATE,
  fetchAvailableTemplates,
  fetchTemplateById,
  fetchTemplateCategoriesById,
  fetchCategoryById
} from "@/lib/templates/iso27001-2022-template";

/**
 * Template Service Class
 *
 * Provides both synchronous (static) and asynchronous (database-first) methods
 * for accessing template and category data.
 */
export class TemplateService {
  // ============================================================================
  // ASYNC METHODS (Database-First) - Recommended for new code
  // ============================================================================

  /**
   * Fetch all available workpaper templates from database (async)
   * Falls back to static template if DB fails
   *
   * @example
   * ```tsx
   * // Server Component
   * const templates = await TemplateService.fetchTemplates();
   * ```
   */
  static async fetchTemplates(): Promise<WorkpaperTemplateDefinition[]> {
    return await fetchAvailableTemplates();
  }

  /**
   * Fetch a specific template by ID from database (async)
   * Falls back to static template if DB fails
   *
   * @example
   * ```tsx
   * // Server Component
   * const template = await TemplateService.fetchTemplate('iso27001-2022');
   * ```
   */
  static async fetchTemplate(templateId: string): Promise<WorkpaperTemplateDefinition | null> {
    return await fetchTemplateById(templateId);
  }

  /**
   * Fetch all categories for a template from database (async)
   * Falls back to static categories if DB fails
   *
   * @example
   * ```tsx
   * // Server Component
   * const categories = await TemplateService.fetchCategories('iso27001-2022');
   * ```
   */
  static async fetchCategories(templateId: string): Promise<TemplateCategory[]> {
    return await fetchTemplateCategoriesById(templateId);
  }

  /**
   * Fetch a specific category by ID from database (async)
   * Falls back to static search if DB fails
   *
   * @example
   * ```tsx
   * // Server Component
   * const category = await TemplateService.fetchCategory('category-id');
   * ```
   */
  static async fetchCategory(categoryId: string): Promise<TemplateCategory | null> {
    return await fetchCategoryById(categoryId);
  }

  /**
   * Fetch a category by template ID and category ID (async)
   * First tries DB, then falls back to static lookup
   */
  static async fetchCategoryByTemplateAndId(
    templateId: string,
    categoryId: string
  ): Promise<TemplateCategory | null> {
    // Try DB first
    const category = await fetchCategoryById(categoryId);
    if (category) return category;

    return null;
  }

  /**
   * Get multiple categories by their IDs
   */
  static async getCategoriesByIds(
    templateId: string,
    categoryIds: string[]
  ): Promise<TemplateCategory[]> {
    const allCategories = await this.fetchCategories(templateId);
    return allCategories.filter((cat) => categoryIds.includes(cat.id as string));
  }

  /**
   * Validate category selection for a template
   * Ensures all selected categories exist and required categories are included
   */
  static async validateCategorySelection(
    templateId: string,
    selectedCategories: string[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if template exists
    const template = await this.fetchTemplate(templateId);
    if (!template) {
      errors.push(`Template with ID '${templateId}' not found`);
      return { valid: false, errors };
    }

    // Check if at least one category is selected
    if (!selectedCategories || selectedCategories.length === 0) {
      errors.push("At least one category must be selected");
      return { valid: false, errors };
    }

    // Check if all selected categories exist in the template
    const availableCategories = template.categories.map((cat) => cat.id);
    const invalidCategories = selectedCategories.filter(
      (catId) => !availableCategories.includes(catId)
    );

    if (invalidCategories.length > 0) {
      errors.push(`Invalid category IDs: ${invalidCategories.join(", ")}`);
    }

    // Check if required categories are selected
    const requiredCategories = template.categories
      .filter((cat) => cat.isRequired)
      .map((cat) => cat.id);

    const missingRequired = requiredCategories.filter(
      (catId) => !selectedCategories.includes(catId as string)
    );

    if (missingRequired.length > 0) {
      const missingNames = missingRequired
        .map((catId) => {
          const cat = template.categories.find((c) => c.id === catId);
          return cat?.name || catId;
        })
        .join(", ");
      errors.push(`Required categories must be selected: ${missingNames}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get template summary information
   */
  static async getTemplateSummary(templateId: string): Promise<{
    id: string;
    name: string;
    description: string;
    totalCategories: number;
    mainClausesCount: number;
    annexAControlsCount: number;
    requiredCategoriesCount: number;
  } | null> {
    const template = await this.fetchTemplate(templateId);
    if (!template) return null;

    const mainClauses = template.categories.filter((cat) => cat.group === "main-clauses");
    const annexA = template.categories.filter((cat) => cat.group === "annex-a-controls");
    const required = template.categories.filter((cat) => cat.isRequired);

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      totalCategories: template.categories.length,
      mainClausesCount: mainClauses.length,
      annexAControlsCount: annexA.length,
      requiredCategoriesCount: required.length
    };
  }

  /**
   * Get categories grouped by their group type
   */
  static async getCategoriesGrouped(templateId: string): Promise<{
    mainClauses: TemplateCategory[];
    annexAControls: TemplateCategory[];
  }> {
    const categories = await this.fetchCategories(templateId);

    return {
      mainClauses: categories.filter((cat) => cat.group === "main-clauses"),
      annexAControls: categories.filter((cat) => cat.group === "annex-a-controls")
    };
  }

  /**
   * Search categories by name or description
   */
  static async searchCategories(
    templateId: string,
    searchTerm: string
  ): Promise<TemplateCategory[]> {
    const categories = await this.fetchCategories(templateId);
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
  static async getRecommendedCategories(templateId: string): Promise<any[]> {
    const template = await this.fetchTemplate(templateId);
    if (!template) return [];

    // For ISO 27001, recommend all main clauses as they are fundamental
    if (
      (templateId &&
        template &&
        (template?.name.toLowerCase().replace(" ", "-").split("-").includes("iso27001") ||
          template?.name.toLowerCase().replace(" ", "-").startsWith("iso") ||
          template?.name.toLowerCase().replace(" ", "-").startsWith("iso-27001"))) ||
      template?.name.toLowerCase().replace(" ", "-").startsWith("iso-27001")
    ) {
      return template.categories.filter((cat) => cat.group == "main-clauses").map((cat) => cat.id);
    }

    // For other templates, return required categories
    return template.categories.filter((cat) => cat.isRequired).map((cat) => cat.id);
  }

  /**
   * Get category count by group
   */
  static async getCategoryCountByGroup(
    templateId: string,
    group: "main-clauses" | "annex-a-controls"
  ): Promise<number> {
    const categories = await this.fetchCategories(templateId);
    return categories.filter((cat) => cat.group === group).length;
  }

  /**
   * Check if a template has any required categories
   */
  static async hasRequiredCategories(templateId: string): Promise<boolean> {
    const categories = await this.fetchCategories(templateId);
    return categories.some((cat) => cat.isRequired);
  }

  /**
   * Get display name for a category group
   */
  static getGroupDisplayName(group: "main-clauses" | "annex-a-controls"): string {
    return group === "main-clauses" ? "Main Clauses" : "Annex A Controls";
  }
}

/**
 * Utility function to format category display name
 */
export function formatCategoryDisplayName(category: TemplateCategory): string {
  return (
    category.displayName ||
    `${category.name} (${category.clauseRange || category.clauses.join(", ")})`
  );
}

/**
 * Utility function to get category clause range display
 */
export function getCategoryClauseDisplay(category: TemplateCategory): string {
  if (category.clauseRange) {
    return category.clauseRange;
  }
  if (category.clauses.length <= 3) {
    return category.clauses.join(", ");
  }
  return `${category.clauses[0]}-${category.clauses[category.clauses.length - 1]}`;
}

/**
 * Utility function to get group display name
 */
export function getGroupDisplayName(group: "main-clauses" | "annex-a-controls"): string {
  return group === "main-clauses" ? "Main Clauses" : "Annex A Controls";
}
