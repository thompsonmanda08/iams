import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { isAuthenticated, user_type } = await verifySession();

  if (isAuthenticated && user_type === "BACKOFFICE_ADMIN") {
    // ROUTE PROTECTION - GLOBAL BACK_OFFICE USERS
    redirect("/admin/home");
  }

  redirect("/login");
}
