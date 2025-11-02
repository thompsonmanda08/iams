"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Eye, EyeOff, Lock, Mail } from "lucide-react";

import { toast } from "sonner";
import { initializeSystemSetup, loginUser } from "@/app/_actions/auth-actions";
import { ErrorState } from "@/lib/types";
import Link from "next/link";
import CustomAlert from "../ui/custom-alert";
import { capitalize } from "@/lib/utils";
import { init } from "next/dist/compiled/webpack/webpack";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<ErrorState>({});
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setError({ status: false, message: "" });
    e.preventDefault();
    setIsLoading(true);

    const response = await loginUser({
      username: email,
      password: password
    });

    if (response.success) {
      // Small delay to ensure cookie propagation (mitigates race condition)
      await new Promise((resolve) =>
        setTimeout(async () => {
          await initializeSystemSetup();
        }, 300)
      );

      // Check if MFA is required
      if (response.data?.mfa_required) {
        toast.info("Please enter the OTP sent to your email");
        // Redirect to OTP page with username
        setError({ status: true, redirecting: true, message: "Redirection to OTP screen..." });
        router.push(`/otp?username=${encodeURIComponent(email)}`);
      } else {
        toast.success(response.message || "Login successful");
        // Direct redirect to dashboard (proxy and layout will handle routing)
        router.push(
          response?.data?.user_type === "BACKOFFICE_USER" ? "/admin/home" : "/dashboard/home"
        );
      }
    } else {
      setError({ status: true, message: response.message });
      toast.error(response.message || "Invalid credentials");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3">
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute top-2/3 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            type="text"
            label="Email Address / Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-3 pr-4 pl-11 transition-all"
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute top-2/3 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 pr-12 pl-11"
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-2/3 right-3 -translate-y-1/3 text-slate-400 transition-colors hover:text-slate-600"
            disabled={isLoading}>
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <Label className="flex cursor-pointer items-center">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || true}
            />
            <span className="text-slate-600">Remember me</span>
          </Label>
          <Link
            href="/#forgot-password"
            className="text-primary hover:text-primary/70 text-xs font-medium transition-colors sm:text-sm">
            Forgot password?
          </Link>
        </div>
      </div>

      {error?.status && (
        <>
          <CustomAlert
            type={error?.redirecting ? "info" : "error"}
            title={error?.redirecting ? "Redirecting..." : "Oops! keep calm"}
            message={capitalize(String(error.message))}
            Icon={AlertTriangle}
          />
        </>
      )}

      <Button
        type="submit"
        className="w-full py-3 font-semibold"
        isLoading={isLoading}
        loadingText="Signing in..."
        disabled={isLoading}>
        Sign In
      </Button>
    </form>
  );
}
