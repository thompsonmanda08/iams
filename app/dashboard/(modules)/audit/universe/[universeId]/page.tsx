import { Globe } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { getUniverseById, getUniverseItems } from "@/app/_actions/audit-module-actions";
import UniverseDetails from "../_components/universe-details";
import BackButton from "@/components/back-button";

const dynamic = "force-dynamic";

const UniversePage = async ({
  params,
  searchParams
}: {
  params: Promise<{ universeId: string }>;
  searchParams: Promise<{ page?: string; page_size?: string }>;
}) => {
  const { universeId } = await params;

  const { page = "1", page_size = "10" } = await searchParams;

  const universeResponse = await getUniverseById(universeId);
  const itemsResponse = await getUniverseItems({
    audit_universe_id: universeId,
    page: Number(page),
    page_size: Number(page_size)
  });

  const universe = universeResponse?.data?.data || universeResponse?.data;
  const universeItems = itemsResponse?.data?.data?.data || itemsResponse?.data?.data || [];
  const paginationData = itemsResponse.data?.pagination;

  const pagination = itemsResponse.data?.pagination ?? {
    page: paginationData.page,
    page_size: paginationData.page_size,
    total_pages: paginationData.total_pages,
    totalCount: paginationData.total,
    has_prev: paginationData.has_prev,
    has_next: paginationData.has_next
  };

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
            <BackButton title="Back to Universes" href="/dashboard/audit/universe" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <UniverseDetails
          universe={universe}
          universeItems={universeItems}
          universeItemsPagination={pagination}
        />
      </div>
    </div>
  );
};

export default UniversePage;
