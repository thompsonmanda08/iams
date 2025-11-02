import PoweredBy from "@/components/powered-by";
import { Power } from "lucide-react";
import Image from "next/image";
import { PropsWithChildren } from "react";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { initializeSystemSetup, initializeSystemSetupCached } from "@/app/_actions/auth-actions";
import { User } from "@/lib/types/account";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: PropsWithChildren) {
  const { isAuthenticated, session } = await verifySession();

  // If authenticated, handle routing based on MFA status
  if (isAuthenticated) {
    // If MFA is required but not verified, allow access to OTP page only
    if (session?.mfa_required && !session?.mfa_verified) {
      // OTP page is a child of this layout, allow it to render
      return (
        <div className="relative flex min-h-screen items-center justify-center p-4">
          <div className="gradient absolute inset-0">
            <Image
              className="a a h-full w-full object-cover"
              src={"/images/cover.webp"}
              alt="auth-cover-img"
              width={1920}
              height={1080}
            />
          </div>
          <div className="gradient absolute inset-0 grid opacity-80" />
          <div className="z-30 w-full max-w-sm py-12">{children}</div>

          <PoweredBy
            className="absolute bottom-0 z-999"
            classNames={{ text: "text-white" }}
            isWhite={true}
          />
        </div>
      );
    }

    // Fully authenticated (MFA complete or not required)
    // Redirect to appropriate dashboard
    const systemInit = await initializeSystemSetup();
    const user = systemInit?.data?.user as User;

    if (user?.user_type === "BACKOFFICE_USER") {
      redirect("/_/admin/home");
    }

    redirect("/dashboard/home");
  }

  // Not authenticated - allow login/register pages
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="gradient absolute inset-0">
        <Image
          className="a a h-full w-full object-cover"
          src={"/images/cover.webp"}
          alt="auth-cover-img"
          width={1920}
          height={1080}
        />
      </div>
      <div className="gradient absolute inset-0 grid opacity-80" />
      <div className="z-30 w-full max-w-sm py-12">{children}</div>

      <PoweredBy
        className="absolute bottom-0 z-999"
        classNames={{ text: "text-white" }}
        isWhite={true}
      />
    </div>
  );
}
