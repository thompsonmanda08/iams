import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <Suspense fallback={<Spinner className="text-primary mx-auto h-24 w-24" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
