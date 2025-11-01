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
    // CHECK IF MFA IS REQUIRED BUT NOT YET VERIFIED
    if (session?.session?.mfa_required && !session?.session?.mfa_verified) {
      redirect("/otp");
    }

    // ROUTE PROTECTION - GLOBAL BACK_OFFICE USERS
    if (session?.session?.user_type === "BACKOFFICE_USER") {
      redirect("/_/admin/home");
    }

    // ROUTE PROTECTION - DEFAULT USERS
    redirect("/dashboard/home");
  }

  redirect("/login");
}
