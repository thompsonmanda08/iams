import PoweredBy from "@/components/powered-by";
import { PropsWithChildren } from "react";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import AuthRightPanel from "./_components/auth-right-panel";
import ThemeSwitch from "@/components/layout/header/theme-switch";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: PropsWithChildren) {
  const { isAuthenticated, session } = await verifySession();

  if (isAuthenticated) {
    if (session?.mfa_required && !session?.mfa_verified) {
      // MFA pending — fall through to render OTP page in the split layout
    } else {
      if (session?.user_type === "BACKOFFICE_ADMIN") {
        redirect("/admin/home");
      }
      redirect("/dashboard/home");
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left — form area */}
      <div className="bg-background flex min-h-screen w-full flex-col md:w-1/2">
        <div className="text-muted-foreground flex items-center justify-between p-6">
          <div className="rounded-2xl bg-white p-2">
            <Image
              src="/images/infratel-logo.png"
              width={80}
              height={56}
              alt="Infratel logo"
              unoptimized
            />
          </div>
          <ThemeSwitch />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-8 md:p-12 lg:p-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <div className="flex justify-center pb-6">
          <PoweredBy />
        </div>
      </div>

      {/* Right — visual panel */}
      <AuthRightPanel />
    </div>
  );
}
