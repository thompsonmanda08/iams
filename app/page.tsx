import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import { initializeSystemSetupCached } from "./_actions/auth-actions";
import { User } from "@/lib/types/account";

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

    const systemInit = await initializeSystemSetupCached();
    const user = systemInit?.data?.user as User;

    // ROUTE PROTECTION - GLOBAL BACK_OFFICE USERS
    if (session?.session?.user_type === "BACKOFFICE_USER") {
      redirect("/_/admin/home");
    }

    // ROUTE PROTECTION - DEFAULT USERS
    redirect("/dashboard/home");
  }

  redirect("/login");
}
