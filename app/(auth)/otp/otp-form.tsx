"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from "@/components/ui/input-otp";
import Image from "next/image";
import Link from "next/link";
import { verifyOTP, resendOTP } from "@/app/_actions/auth-actions";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a complete 6-digit code");
      return;
    }

    if (!username) {
      toast.error("Username not found. Please login again.");
      router.push("/login");
      return;
    }

    setIsLoading(true);

    const response = await verifyOTP({
      username,
      otp
    });

    if (response.success) {
      toast.success("OTP verified successfully!");
      // Redirect to home page which will route based on user_type
      router.push("/");
    } else {
      toast.error(response.message || "Invalid OTP. Please try again.");
      setOtp(""); // Clear OTP on error
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!username) {
      toast.error("Username not found. Please login again.");
      router.push("/login");
      return;
    }

    setIsResending(true);

    const response = await resendOTP({ username });

    if (response.success) {
      toast.success(response.message || "OTP resent successfully!");
      // Reset countdown timer
      setCountdown(60);
      setCanResend(false);
    } else {
      toast.error(response.message || "Failed to resend OTP. Please try again.");
    }

    setIsResending(false);
  };

  return (
    <Card className={cn("flex flex-col", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link href="/" target="_blank" className="flex flex-col items-center gap-2 font-medium">
              <div className="rounded-2xl bg-white p-2">
                <Image
                  src="/images/infratel-logo.png"
                  width={100}
                  height={70}
                  alt="logo"
                  unoptimized
                />
              </div>
              <span className="sr-only">IAMS</span>
            </Link>
            <h1 className="text-xl font-bold">Enter verification code</h1>
            <FieldDescription>We sent a 6-digit code to your email address</FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification code
            </FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              required
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
              containerClassName="gap-4">
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription className="text-center">
              Didn&apos;t receive the code?{" "}
              {canResend ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResend}
                  disabled={isResending}
                  className="h-auto p-0 text-sm font-normal">
                  {isResending ? "Resending..." : "Resend"}
                </Button>
              ) : (
                <span className="text-muted-foreground">Resend in {countdown}s</span>
              )}
            </FieldDescription>
          </Field>
          <Field>
            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              isLoading={isLoading}
              loadingText="  Verifying...">
              Verify
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </Card>
  );
}
