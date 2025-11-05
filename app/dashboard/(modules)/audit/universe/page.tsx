import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import AuditUniverseList from "./_components/audit-universe-list";
import PageHeader from "@/components/page-header";
import { getUniverses, getUniverseItems } from "@/app/_actions/audit-module-actions";

const AuditUniversePage = async () => {
  const universesResponse = await getUniverses();

  const universes = universesResponse?.data?.data || universesResponse?.data || [];
  const universeItemsMap: Record<string, any[]> = {};
  const pagination = universesResponse?.data?.pagination;

  // Fetch all universe items for each universe
  await Promise.all(
    universes.map(async (universe: any) => {
      try {
        const itemsResponse = await getUniverseItems({ audit_universe_id: universe.id });
        const itemsData = itemsResponse?.data?.data?.data || itemsResponse?.data?.data || [];
        universeItemsMap[universe.id] = Array.isArray(itemsData) ? itemsData : [];
      } catch (error) {
        console.error(`Error fetching universe items for ${universe.id}:`, error);
        universeItemsMap[universe.id] = [];
      }
    })
  );

  console.log("UNIVERSE", universes);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Audit Universe"
              description="Comprehensive Audit Management System"
              icon="FileText"
            />
            <div className="flex gap-2">
              <Link href="/dashboard/audit/universe/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Universe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AuditUniverseList
          universes={universes}
          universeItemsMap={universeItemsMap}
          pagination={pagination}
        />
      </div>
    </div>
  );
};

export default AuditUniversePage;
