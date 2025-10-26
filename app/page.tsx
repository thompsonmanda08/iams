import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function HomePage({
  children
}: PropsWithChildren & {
  session?: any;
}) {
  const session = await verifySession();

  if (session?.isAuthenticated) {
    return redirect("/dashboard/home");
  }

  return redirect("/login");
}
