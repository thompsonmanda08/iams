import { getRisksInRegister } from "@/app/_actions/risk-module-actions";
import { RisksPageHeader } from "../../_components/risks-page-header";
import RisksTable from "../../_components/risks-table";

export default async function RisksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const risks = await getRisksInRegister(id);

  return (
    <div className="space-y-6">
      <RisksPageHeader registerId={id} registerName="Manage and monitor organizational risks" />

      {/* <RisksTable
        risks={risks.data}
        meta={risks.meta}
        registerId={id}
        currentSearch=""
        currentCategory="all"
        currentStatus="all"
      /> */}
    </div>
  );
}
