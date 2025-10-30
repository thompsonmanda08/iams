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
    // ROUTE PROTECTION - GLOBAL BACK_OFFICE USERS
    // if (session?.user?.userType == "BACK_OFFICE") {
    //   redirect("/_/admin/home");
    // }

    // ROUTE PROTECTION - DEFAULT USERS

    return redirect("/dashboard/home");
  }

  return redirect("/login");
}
