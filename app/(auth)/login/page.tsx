import Image from "next/image";
import { Lock } from "lucide-react";
import LoginForm from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="grid">
      <div className="bg-card space-y-8 rounded-2xl border p-8">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="rounded-2xl bg-white p-2">
            <Image src="/images/infratel-logo.png" width={100} height={70} alt="logo" unoptimized />
          </div>
          <h1 className="text-primary text-3xl font-bold">IAMS</h1>
          <p className="text-foreground/70">Enter your credentials to continue</p>
        </div>

        <LoginForm />

        <div className="text-foreground/70 border-t border-slate-200 pt-6 text-center text-sm">
          Need help?{" "}
          <a href="#" className="text-primary hover:text-primary/70 font-medium transition-colors">
            Contact Support
          </a>
        </div>
      </div>

      <div className="text-foreground/80 mt-6 flex items-center justify-center gap-2 text-center text-sm sm:text-base">
        <Lock className="h-4 w-4 text-green-400" />
        <p>Secured access for authorized personnel only</p>
      </div>
    </div>
  );
}
