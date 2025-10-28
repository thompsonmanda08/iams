"use client";

import OverlayLoader from "@/components/ui/overlay-loader";

export default function LoadingPage({ loadingText = "Please wait" }) {
  return (
    <OverlayLoader
      description="Please be patient while we prepare your session"
      show={true}
      title={loadingText}
    />
  );
}
