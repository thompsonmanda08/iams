import BackButton from "@/components/back-button";
import UniverseEditContent from "../../_components/universe-edit-content";
import PageHeader from "@/components/page-header";
import { getUniverseById, getUniverseItems } from "@/app/_actions/audit-module-actions";

const UniverseEditPage = async ({ params }: { params: Promise<{ universeId: string }> }) => {
  const { universeId } = await params;

  const universeResponse = await getUniverseById(universeId);
  const universeItemsResponse = await getUniverseItems({ audit_universe_id: universeId });

  const universe = universeResponse?.data?.data || universeResponse?.data;
  const universeItems =
    universeItemsResponse?.data?.data?.data || universeItemsResponse?.data?.data || [];

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
              description="Update universe information and manage universe items"
              icon="Globe"
            />
            <BackButton title="Back to Universes" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto space-y-6 px-4 py-8">
        <UniverseEditContent
          universeId={universeId}
          initialData={initialData}
          initialUniverseItems={universeItems}
        />
      </div>
    </div>
  );
};

export default UniverseEditPage;
