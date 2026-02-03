import BackButton from "@/components/back-button";
import { ReportGuideDetail } from "../../_components/report-guide-detail";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GuidesPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 pb-4">
        <ReportGuideDetail guideId={id} />
      </main>
    </div>
  );
}
