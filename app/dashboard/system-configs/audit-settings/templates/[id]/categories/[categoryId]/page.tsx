/**
 * Template Category Details Page
 *
 * Server component that fetches a specific category by ID from a template
 * and displays its detailed information.
 *
 * @module category-details-page
 */

import { notFound } from "next/navigation";
import { getTemplateCategory } from "@/app/_actions/audit-module-actions";
import { CategoryDetailsClient } from "@/components/audit/category-details-client";
import type { TemplateCategory } from "@/lib/types/audit-types";

interface CategoryDetailsPageProps {
  params: Promise<{
    id: string;
    categoryId: string;
  }>;
}

export default async function CategoryDetailsPage({ params }: CategoryDetailsPageProps) {
  const { id: templateId, categoryId } = await params;

  // Fetch category by ID from the API
  const response = await getTemplateCategory(categoryId);

  if (!response.success || !response.data) {
    notFound();
  }

  const category = response.data as TemplateCategory;

  return (
    <div className="container mx-auto space-y-6 py-6">
      <CategoryDetailsClient category={category} templateId={templateId} />
    </div>
  );
}
