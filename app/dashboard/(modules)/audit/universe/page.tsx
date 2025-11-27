import { Button } from "@/components/ui/button";
import { Plus, Globe } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import AuditUniverseList from "./_components/audit-universe-list";
import { getUniverses, getUniverseItems } from "@/app/_actions/audit-module-actions";

const AuditUniversePage = async () => {
  const universesResponse = await getUniverses();

  const universes = universesResponse?.data?.data || [];
  const universeItemsMap: Record<string, any[]> = {};
  const pagination = universesResponse?.data?.pagination;

  // Fetch all universe items for each universe
  await Promise.all(
    universes &&
      universes?.map(async (universe: any) => {
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

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-muted/40 border-muted z-10 border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Audit Universe"
              description="Enterprise Audit Management Platform"
              classNames={{
                container: "flex items-center gap-4",
                title: "text-3xl font-bold text-foreground"
              }}
              customIcon={
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-cyan-400 to-blue-600 opacity-40 blur-lg"></div>
                  <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                    <Globe className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              }
            />
            <Link href="/dashboard/audit/universe/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Universe
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
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
