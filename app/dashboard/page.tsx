import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { isAuthenticated } = await verifySession();

  if (isAuthenticated) return redirect("/dashboard/home");

  return redirect("/login");
}
