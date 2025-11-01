import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await verifySession();

  if (session?.isAuthenticated && session?.user?.user_type == "BACKOFFICE_USER") {
    // ROUTE PROTECTION - GLOBAL BACK_OFFICE USERS
    redirect("/_/admin/home");
  }

  redirect("/login");
}
