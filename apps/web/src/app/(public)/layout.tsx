import type { Metadata } from "next";
import Link from "next/link";
import { OrigoMark } from "@/components/brand/origo-mark";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Public pages (no sign-in): a light header and a narrow column that reads well on a phone. */
export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="bg-card border-b">
        <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between px-4">
          <Link href="/verify" aria-label="Origo medicine check">
            <OrigoMark />
          </Link>
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Medicine check
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <footer className="text-muted-foreground mx-auto w-full max-w-xl px-4 pb-8 text-xs leading-relaxed">
        Origo records every handover of a medicine pack from the manufacturer to the pharmacy. A pharmacist
        can always help if a result worries you.
      </footer>
    </div>
  );
}
