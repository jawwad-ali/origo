import type { Metadata } from "next";
import { Camera, ListChecks, ScanLine } from "lucide-react";
import { VerifyLookupForm } from "@/features/verify/components/verify-lookup-form";

export const metadata: Metadata = {
  title: "Check your medicine",
  description: "Scan the Origo code on a medicine pack to check that it's genuine.",
  robots: { index: true, follow: true },
};

const STEPS = [
  {
    icon: Camera,
    title: "Open your phone camera",
    body: "No app needed. Point it at the Origo QR code on the pack.",
  },
  {
    icon: ScanLine,
    title: "Tap the link that appears",
    body: "It opens this site and checks the code's signature.",
  },
  {
    icon: ListChecks,
    title: "Read the result",
    body: "Genuine, a warning to check, or not recognized, in plain words.",
  },
] as const;

export default function VerifyLandingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Check your medicine</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Every pack on Origo carries a signed code. Scanning it confirms the pack was registered by its
          manufacturer and shows where it has been.
        </p>
      </div>

      <ol className="bg-card divide-y rounded-2xl border">
        {STEPS.map((step) => (
          <li key={step.title} className="flex gap-4 p-4">
            <span className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
              <step.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="text-sm">
              <p className="font-medium">{step.title}</p>
              <p className="text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="bg-card space-y-3 rounded-2xl border p-5" aria-labelledby="manual">
        <h2 id="manual" className="text-base font-semibold">
          Can&apos;t scan it?
        </h2>
        <p className="text-muted-foreground text-sm">
          Type the pack ID instead. You&apos;ll see the product details, but only scanning proves the label
          itself is genuine.
        </p>
        <VerifyLookupForm />
      </section>
    </div>
  );
}
