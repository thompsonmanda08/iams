import { getWorkingPaperTemplate } from "@/app/_actions/audit-module-actions";
import { WorkpaperTemplate } from "@/lib/types/audit-types";
import NewTemplatePage from "../../new/page";

interface PageProps {
  params: Promise<{
    id: string;
    categoryId: string;
  }>;
}

export default async function EditTemplatePage({ params }: PageProps) {
  const templateId = (await params)?.id as string;

  const response = await getWorkingPaperTemplate(templateId);

  return (
    <NewTemplatePage templateId={templateId} initialData={response.data as WorkpaperTemplate} />
  );
}
