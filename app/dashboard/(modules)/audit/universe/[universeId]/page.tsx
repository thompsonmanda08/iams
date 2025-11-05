import PageHeader from "@/components/page-header";
import { getUniverseById, getUniverseItems } from "@/app/_actions/audit-module-actions";
import UniverseDetails from "../_components/universe-details";
import BackButton from "@/components/back-button";

const UniversePage = async ({ params }: { params: Promise<{ universeId: string }> }) => {
  const { universeId } = await params;

  const universeResponse = await getUniverseById(universeId);
  const itemsResponse = await getUniverseItems({ audit_universe_id: universeId });

  const universe = universeResponse?.data?.data || universeResponse?.data;
  const universeItems = itemsResponse?.data?.data?.data || itemsResponse?.data?.data || [];

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <PageHeader
                title="Universe Details"
                description="Manage universe items and track auditable areas"
                icon="Globe"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <UniverseDetails universe={universe} universeItems={universeItems} />
      </div>
    </div>
  );
};

export default UniversePage;
