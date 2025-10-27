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

export function getRecommendedCategories(template: WorkpaperTemplateDefinition): string[] {
  // const template = await this.fetchTemplate(templateId);
  if (!template) return [];

  // For ISO 27001, recommend all main clauses as they are fundamental
  if (
    (template &&
      (template?.name.toLowerCase().replace(" ", "-").split("-").includes("iso27001") ||
        template?.name.toLowerCase().replace(" ", "-").startsWith("iso27001"))) ||
    template?.name.toLowerCase().replace(" ", "-").startsWith("iso-27001")
  ) {
    return template.categories
      .filter((cat) => cat.group == "main-clauses")
      .map((cat) => cat.id as string);
  }

  // For other templates, return required categories
  return template.categories.filter((cat) => cat.isRequired).map((cat) => cat.id as string);
}
