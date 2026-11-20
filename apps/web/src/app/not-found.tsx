import Link from "next/link";
import { OrigoMark } from "@/components/brand/origo-mark";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <OrigoMark />
      <div className="space-y-2">
        <p className="text-muted-foreground font-mono text-sm">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">This page doesn&apos;t exist</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          The link may be old, or the address has a typo.
        </p>
      </div>
      <Button asChild>
        <Link href={ROUTES.dashboard}>Go to dashboard</Link>
      </Button>
    </main>
  );
}
