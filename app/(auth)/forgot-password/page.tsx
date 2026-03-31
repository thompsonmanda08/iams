import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <Suspense fallback={<Spinner className="text-primary mx-auto h-24 w-24" />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
