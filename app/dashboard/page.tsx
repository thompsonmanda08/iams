import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await verifySession();

  if (session?.isAuthenticated) redirect("/dashboard/home");

  return redirect("/login");
}
