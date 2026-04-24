import { requireModuleView } from "@/lib/permissions/server";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import RisksOverviewClient from "./_components/risks-overview-client";

export default async function RisksOverviewPage() {
  await requireModuleView(MODULE_CODES.RISK_OVERVIEW);
  return <RisksOverviewClient />;
}
