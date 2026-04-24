import { requireModuleView } from "@/lib/permissions/server";
import { MODULE_CODES } from "@/lib/constants/module-codes";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireModuleView(MODULE_CODES.RISK_ACCEPTANCES);
  return <>{children}</>;
}
