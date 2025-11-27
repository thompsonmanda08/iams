import { Globe } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { getUniverseById, getUniverseItems } from "@/app/_actions/audit-module-actions";
import UniverseDetails from "../_components/universe-details";
import BackButton from "@/components/back-button";

const dynamic = "force-dynamic";

const UniversePage = async ({ params }: { params: Promise<{ universeId: string }> }) => {
  const { universeId } = await params;

  const universeResponse = await getUniverseById(universeId);
  const itemsResponse = await getUniverseItems({ audit_universe_id: universeId });

  const universe = universeResponse?.data?.data || universeResponse?.data;
  const universeItems = itemsResponse?.data?.data?.data || itemsResponse?.data?.data || [];

  console.log("Universe Items:", universeItems);

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-muted/40 border-muted z-10 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Universe Details"
              description="Manage universe items and track auditable areas"
              classNames={{
                container: "flex items-center gap-4",
                title: "text-3xl font-bold text-foreground"
              }}
              showBackButton={true}
            />
            <BackButton title="Back to Universes" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <UniverseDetails universe={universe} universeItems={universeItems} />
      </div>
    </div>
  );
};

export default UniversePage;
