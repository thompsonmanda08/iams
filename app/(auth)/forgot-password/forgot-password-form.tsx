"use client";

import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { requestPasswordReset } from "@/app/_actions/auth-actions";
import { notify } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    const response = await requestPasswordReset(email.trim());

    if (response.success) {
      setSubmitted(true);
    } else {
      notify({ description: response.message || "Failed to send reset email", type: "error" });
    }

    setIsLoading(false);
  };

  if (submitted) {
    return (
      <Card className="flex flex-col gap-6 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
            <CheckCircle className="text-primary h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a password reset link to{" "}
            <span className="text-foreground font-medium">{email}</span>
          </p>
          <p className="text-muted-foreground text-xs">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-primary hover:text-primary/70 font-medium underline-offset-4 hover:underline">
              try again
            </button>
          </p>
        </div>
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-6 p-8">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Mail className="absolute top-2/3 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full py-3 pr-4 pl-11 text-base"
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full font-semibold"
          isLoading={isLoading}
          loadingText="Sending..."
          disabled={isLoading || !email.trim()}>
          Send Reset Link
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
