/**
 * Template Category Details Page
 *
 * Server component that fetches a specific category by ID from a template
 * and displays its detailed information.
 *
 * @module category-details-page
 */

import { getTemplateCategory } from "@/app/_actions/audit-module-actions";
import { CategoryDetailsClient } from "@/components/audit/category-details-client";
import type { TemplateCategory } from "@/lib/types/audit-types";
import { ShieldAlert } from "lucide-react";
import BackButton from "@/components/back-button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty";

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

  const category = (response?.data?.data || response.data || null) as TemplateCategory;

  // console.log(category);

  if (!category || categoryId != category?.id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldAlert className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Category Not Found</EmptyTitle>
            <EmptyDescription>
              The category you're looking for doesn't exist or may have been removed.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <BackButton title="Back to categories" />
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <CategoryDetailsClient category={category} templateId={templateId} />
    </div>
  );
}
