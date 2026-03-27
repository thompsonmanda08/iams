import { getRiskRegister, getRisksInRegister } from "@/app/_actions/risk-module-actions";
import { RisksPageHeader } from "../../_components/risks-page-header";
import RisksTable from "../../_components/risks-table";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    page_size?: string;
  }>;
};

export default async function RisksPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page = "1", page_size = "10" } = await searchParams;

  const response = await getRisksInRegister(id, {
    page: Number(page),
    page_size: Number(page_size)
  });

  const registerDetails = await getRiskRegister(id);
  const name = registerDetails.data.data.register.name;

  const transformedRisks = response.data.data;
  const pagination = response.data.pagination;

  return (
    <div className="space-y-6">
      <RisksPageHeader registerId={id} registerName={name} />
      <RisksTable
        risks={transformedRisks as unknown as any}
        pagination={pagination}
        registerId={id}
      />
    </div>
  );
}
