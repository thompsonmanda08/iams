import { redirect } from "next/navigation";

export default function UsersPage() {
  redirect("/dashboard/system-configs/setup?tab=users");
}
