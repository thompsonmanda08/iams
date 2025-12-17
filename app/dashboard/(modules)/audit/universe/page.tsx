import { Globe } from "lucide-react";
import PageHeader from "@/components/page-header";
import AuditUniverseList from "./_components/audit-universe-list";
import UniverseDialog from "./_components/universe-dialog";
import { getUniverses, getUniverseItems } from "@/app/_actions/audit-module-actions";

const AuditUniversePage = async ({
  searchParams
}: {
  searchParams: Promise<{ page?: string; page_size?: string }>;
}) => {
  const { page = "1", page_size = "10" } = await searchParams;
  const universesResponse = await getUniverses({
    page: Number(page),
    page_size: Number(page_size)
  });

  const universes = universesResponse?.data?.data || [];
  const universeItemsMap: Record<string, any[]> = {};
  const paginationData = universesResponse?.data?.pagination;
  const pagination = universesResponse?.data?.pagination ?? {
    page: paginationData.page,
    page_size: paginationData.page_size,
    total_pages: paginationData.total_pages,
    totalCount: paginationData.total,
    has_prev: paginationData.has_prev,
    has_next: paginationData.has_next
  };

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
                  <div className="gradient-blue absolute inset-0 rounded-2xl opacity-40 blur-lg"></div>
                  <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                    <Globe className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              }
            />
            <UniverseDialog />
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
