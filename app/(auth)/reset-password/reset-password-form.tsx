"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { resetPassword } from "@/app/_actions/auth-actions";
import { notify } from "@/lib/utils";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  if (!token) {
    return (
      <Card className="flex flex-col gap-6 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Invalid reset link</h1>
          <p className="text-muted-foreground text-sm">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="text-primary hover:text-primary/70 text-sm font-medium transition-colors">
          Request new reset link
        </Link>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const response = await resetPassword({ newPassword, token });

    if (response.success) {
      notify({ description: "Password reset successfully. Please sign in.", type: "success" });
      router.push("/login");
    } else {
      notify({
        description: response.message || "Failed to reset password. The link may have expired.",
        type: "error"
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col gap-6 p-8">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-2xl font-bold">Set new password</h1>
        <p className="text-muted-foreground text-sm">
          Create a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Lock className="absolute top-2/3 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="new-password"
            label="New Password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setValidationError("");
            }}
            className="h-12 w-full py-3 pr-12 pl-11 text-base"
            placeholder="Min. 8 characters"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute top-[70%] right-3 -translate-y-1/3 text-slate-400 transition-colors hover:text-slate-600"
            disabled={isLoading}>
            {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute top-2/3 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="confirm-password"
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setValidationError("");
            }}
            className="h-12 w-full py-3 pr-12 pl-11 text-base"
            placeholder="Repeat your password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute top-[70%] right-3 -translate-y-1/3 text-slate-400 transition-colors hover:text-slate-600"
            disabled={isLoading}>
            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {validationError && (
          <p className="flex items-center gap-1.5 text-sm text-red-500">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {validationError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full font-semibold"
          isLoading={isLoading}
          loadingText="Resetting..."
          disabled={isLoading || !newPassword || !confirmPassword}>
          Reset Password
        </Button>
      </form>

      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </Card>
  );
}
