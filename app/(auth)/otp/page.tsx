import { Suspense } from "react";
import { OTPForm } from "./otp-form";
import { Spinner } from "@/components/ui/spinner";
import { verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OTPPage() {
  // Prefer username from the server session so it survives refreshes and direct
  // navigation. Falls back to the ?username= query param for backward compatibility.
  const { session } = await verifySession();
  const sessionUsername = session?.username ?? "";

  return (
    <div className="w-full max-w-sm">
      <Suspense fallback={<Spinner className="text-primary mx-auto h-24 w-24" />}>
        <OTPForm sessionUsername={sessionUsername} />
      </Suspense>
    </div>
  );
}
