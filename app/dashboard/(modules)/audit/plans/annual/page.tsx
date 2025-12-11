import { redirect } from "next/navigation";
import React from "react";

function AnnualAuditPlansPage() {
  return redirect("/dashboard/audit/plans?tab=annual");
}

export default AnnualAuditPlansPage;
