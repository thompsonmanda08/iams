"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="space-y-8 rounded-2xl border bg-white p-8">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Image src="/images/infratel-logo.png" width={70} height={70} alt="logo" unoptimized />

            <h1 className="text-3xl font-bold text-slate-900">IAMS</h1>
            <p className="text-slate-600">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 pr-4 pl-11 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 pr-12 pl-11"
                  placeholder="Enter your password"
                  required
                />
                <Button
                  size={"sm"}
                  type="button"
                  variant="link"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Label className="flex cursor-pointer items-center space-x-2">
                <Checkbox className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                <span className="text-slate-600">Remember me</span>
              </Label>
              <a
                href="#"
                className="text-primary hover:text-primary/70 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full py-3 font-semibold">
              Sign In
            </Button>
          </form>

          <div className="border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
            Need help?{" "}
            <a
              href="#"
              className="text-primary hover:text-primary/70 font-medium transition-colors">
              Contact Support
            </a>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
          <Lock className="h-5 w-5 text-green-400" />
          <p>Secured access for authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}
