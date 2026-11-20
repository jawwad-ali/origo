"use client";

import { RotateCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="bg-card space-y-4 rounded-2xl border p-6 text-center">
      <WifiOff className="text-muted-foreground mx-auto size-8" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">We couldn&apos;t check this pack right now</h1>
        <p className="text-muted-foreground text-sm">
          This isn&apos;t a verdict about your medicine. Check your connection, wait a moment and try again.
        </p>
      </div>
      <Button onClick={reset}>
        <RotateCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}
