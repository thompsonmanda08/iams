"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  title: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  // [key: string]: any;
}

const BackButton = ({ title, className, size = "sm", ...props }: BackButtonProps) => {
  const router = useRouter();
  return (
    <div className={cn("mb-2 flex items-center gap-2", className)} {...props}>
      <Button variant="outline" size={size} onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        {title}
      </Button>
    </div>
  );
};

export default BackButton;
