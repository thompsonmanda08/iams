"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BackButtonProps {
  title: string;
  href?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  // [key: string]: any;
}

const BackButton = ({ title, className, href, size = "sm", ...props }: BackButtonProps) => {
  const router = useRouter();

  if (href) {
    return (
      <Button variant="outline" size={size} asChild>
        <Link href={href} className={cn("flex items-center gap-2", className)} {...props}>
          <ArrowLeft className="mr-2 size-4" />
          {title}
        </Link>
      </Button>
    );
  }
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
