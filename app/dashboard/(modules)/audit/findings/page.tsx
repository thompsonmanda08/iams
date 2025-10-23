import { FindingsPageEnhanced } from "@/components/audit/findings-page-enhanced";
import { getFindings } from "@/app/_actions/audit-module-actions";

export default async function FindingsPage() {
  const findingsResponse = await getFindings();
  const findings = findingsResponse.success ? findingsResponse.data : [];

  // Calculate stats
  const stats = {
    total: findings.length,
    open: findings.filter((f: any) => f.status === "open").length,
    inProgress: findings.filter((f: any) => f.status === "in-progress").length,
    resolved: findings.filter((f: any) => f.status === "resolved").length,
  };

  return <FindingsPageEnhanced stats={stats} findings={findings} />;
}
