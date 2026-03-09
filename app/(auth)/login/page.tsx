"use client";

import Image from "next/image";
import { motion } from "motion/react";
import LoginForm from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-8 rounded-2xl border p-8">
      {/* Logo & heading */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center space-y-3">
        <div>
          <h1 className="text-foreground font-mono text-3xl font-bold tracking-tight">Login</h1>
          <p className="text-muted-foreground text-center text-sm leading-relaxed">
            Enter your credentials to access your account
          </p>
        </div>
      </motion.div>

      <LoginForm />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border-t pt-6 text-center">
        <p className="mb-1 text-xs text-gray-400">Need assistance?</p>
        <a href="#" className="text-primary text-sm font-medium transition-colors hover:underline">
          Contact Support
        </a>
      </motion.div>
    </div>
  );
}
