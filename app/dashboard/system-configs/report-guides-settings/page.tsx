import PageHeader from "@/components/page-header";
import { ReportGuides } from "../_components/report-guides";

export default async function RiskConfigurationsPage() {
  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Report Guides Configurations"
              description="Manage report guide parameters and settings"
              icon="Compass"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <ReportGuides />
      </main>
    </div>
  );
}
