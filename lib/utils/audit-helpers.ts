import { TemplateCategory, WorkpaperTemplateDefinition } from "../types/audit-types";

export function getTemplateSummary(template: WorkpaperTemplateDefinition): {
  id: string;
  name: string;
  description: string;
  totalCategories: number;
  mainClausesCount: number;
  annexAControlsCount: number;
  requiredCategoriesCount: number;
} | null {
  // const template = await this.fetchTemplate(templateId);
  if (!template?.id) return null;

  const mainClauses = template?.categories?.filter((cat) => cat.group === "main-clauses");
  const annexA = template?.categories?.filter((cat) => cat.group === "annex-a-controls");
  const required = template?.categories?.filter((cat) => cat.is_required);

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    totalCategories: template.categories?.length || 0,
    mainClausesCount: mainClauses?.length || 0,
    annexAControlsCount: annexA?.length || 0,
    requiredCategoriesCount: required?.length || 0
  };
}

export function getRecommendedCategories(template: WorkpaperTemplateDefinition): string[] {
  // const template = await this.fetchTemplate(templateId);
  if (!template || !template.categories) return [];

  // For ISO 27001, recommend all main clauses as they are fundamental
  if (template.name.toLowerCase().includes("iso 27001")) {
    return template.categories
      .filter((cat) => cat.group === "main-clauses")
      .map((cat) => cat.id as string);
  }

  // For other templates, return required categories
  return template.categories.filter((cat) => cat.is_required).map((cat) => cat.id as string);
}
