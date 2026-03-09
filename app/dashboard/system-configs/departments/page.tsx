import { redirect } from "next/navigation";

export default function DepartmentsConfigPage() {
  redirect("/dashboard/system-configs/setup?tab=departments");
}
