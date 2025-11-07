import { getRiskRegister, getRisksInRegister } from "@/app/_actions/risk-module-actions";
import { RisksPageHeader } from "../../_components/risks-page-header";
import RisksTable from "../../_components/risks-table";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
};

export default async function RisksPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const {
    search = "",
    category = "all",
    status = "all",
    page = "1",
    limit = "10"
  } = await searchParams;

  try {
    const response = await getRisksInRegister(id, {
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      status: status !== "all" ? status : undefined,
      page: Number(page),
      limit: Number(limit)
    });

    const registerDetails = await getRiskRegister(id);
    const name = registerDetails.data.data.register.name;

    if (!response?.data?.data) {
      return (
        <div className="space-y-6">
          <RisksPageHeader registerId={id} registerName={name} />
          <RisksTable
            risks={[]}
            meta={{ total: 0, page: 1, limit: 10, totalPages: 1 }}
            registerId={id}
            currentSearch={search}
            currentCategory={category}
            currentStatus={status}
          />
        </div>
      );
    }

    const transformedRisks = response.data.data;
    const transformedMeta = response.data;

    return (
      <div className="space-y-6">
        <RisksPageHeader registerId={id} registerName={name} />
        <RisksTable
          risks={transformedRisks as unknown as any}
          meta={transformedMeta}
          registerId={id}
          currentSearch={search}
          currentCategory={category}
          currentStatus={status}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading risks:", error);
    return (
      <div className="space-y-6">
        <RisksPageHeader registerId={id} />
        <RisksTable
          risks={[]}
          meta={{ total: 0, page: 1, limit: 10, totalPages: 1 }}
          registerId={id}
          currentSearch={search}
          currentCategory={category}
          currentStatus={status}
        />
      </div>
    );
  }
}
