import { redirect } from "next/navigation";

export default function BranchesConfigPage() {
  redirect("/dashboard/system-configs/setup?tab=branches");
}
