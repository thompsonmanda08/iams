"use client";

import BackButton from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CustomAlert from "@/components/ui/custom-alert";
import { ShieldX } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("-->", error);
  }, [error]);

  return (
    <div className="grid min-h-[99vh] flex-col place-items-center gap-4 px-2 py-8">
      <Card className="flex max-w-2xl flex-col border border-dashed border-red-100 p-8 text-center">
        <div className="flex flex-col place-items-center items-center justify-center rounded-xl bg-red-50 p-4">
          <ShieldX className="mx-auto h-12 w-12 text-red-500" />
        </div>
        <div className="grid gap-1">
          <h2 className="text-2xl font-bold">Oops! Keep calm</h2>
          <p className="text-muted-foreground mb-2">
            It seems something went wrong while loading this page.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <BackButton size={"lg"} title="Go Back" className="mb-0" />
          <Button size={"lg"} onClick={() => reset()} className="px-12">
            Reload
          </Button>
        </div>
      </Card>

      {
        <CustomAlert
          type="error"
          className="border-destructive max-w-xl items-center space-y-4 rounded-2xl border border-dashed p-5 text-red-600">
          <p>{String(error)}</p>
        </CustomAlert>
      }
    </div>
  );
}
