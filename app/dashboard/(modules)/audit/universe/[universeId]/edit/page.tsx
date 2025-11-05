import BackButton from "@/components/back-button";
import AuditUniverseForm from "../../_components/audit-universe-form";
import PageHeader from "@/components/page-header";
import { getUniverseById } from "@/app/_actions/audit-module-actions";

const UniverseEditPage = async ({ params }: { params: Promise<{ universeId: string }> }) => {
  const { universeId } = await params;

  const universeResponse = await getUniverseById(universeId);
  const universe = universeResponse?.data?.data || universeResponse?.data;

  // Transform API data to form data format
  const initialData = universe
    ? {
        universe_name: universe.universe_name || "",
        start_date: universe.start_date ? new Date(universe.start_date) : undefined,
        end_date: universe.end_date ? new Date(universe.end_date) : undefined,
        is_active: universe.is_active ?? true
      }
    : null;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Edit Universe"
              description="Update universe information"
              icon="Globe"
            />
            <BackButton title="Back to Universes" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AuditUniverseForm initialData={initialData} universeId={universeId} mode="universe" />
      </div>
    </div>
  );
};

export default UniverseEditPage;
