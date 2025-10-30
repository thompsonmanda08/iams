import { getTemplateCategory } from "@/app/_actions/audit-module-actions";
import { TemplateCategory } from "@/lib/types/audit-types";
import NewCategoryPage from "../../new/page";

interface PageProps {
  params: Promise<{
    id: string;
    categoryId: string;
  }>;
}

export default async function UpdateCategoryPage({ params }: PageProps) {
  const categoryId = (await params)?.categoryId as string;

  const response = await getTemplateCategory(categoryId);
  const category = response.data as TemplateCategory;

  console.log(category);

  return <NewCategoryPage categoryId={categoryId} params={params} initialData={category} />;
}
