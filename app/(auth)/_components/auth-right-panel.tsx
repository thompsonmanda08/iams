"use client";

import { motion } from "motion/react";
import Image from "next/image";

export default function AuthRightPanel() {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-gray-900 md:block">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}>
        <Image
          className="h-full w-full object-cover"
          src="/images/cover.webp"
          alt="IAMS cover"
          fill
          priority
        />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Glassmorphism card */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9, ease: "easeOut" }}
          className="group relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-10 text-white shadow-2xl backdrop-blur-md">
          {/* Shimmer on hover */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transition-transform duration-1000 group-hover:translate-x-full" />

          <div className="mb-8">
            <div className="h-8 w-8 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />
          </div>

          <h2 className="mb-4 text-2xl leading-snug font-medium tracking-tight">
            Secure Internal Audit Management for your Organization
          </h2>
          <p className="text-sm leading-relaxed font-light text-white/70">
            Manage users, roles, and permissions with precision. IAMS provides a unified platform
            for all your access control needs.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
