import { Suspense } from "react";
import { OTPForm } from "./otp-form";
import { Spinner } from "@/components/ui/spinner";

export default function OTPPage() {
  return (
    <div className="w-full max-w-sm">
      <Suspense fallback={<Spinner className="text-primary mx-auto h-24 w-24" />}>
        <OTPForm />
      </Suspense>
    </div>
  );
}
