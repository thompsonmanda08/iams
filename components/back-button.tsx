"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  title: string;
}

const BackButton = ({ title }: BackButtonProps) => {
  const router = useRouter();
  return (
    <div className="mb-2 flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        {title}
      </Button>
    </div>
  );
};

export default BackButton;
