import type { Metadata } from "next";
import { ArrowRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { demoPassword } from "@/features/demo/services/demo.server";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  const demoEnabled = demoPassword() !== null;

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Origo</h1>
        <p className="text-muted-foreground text-sm">Use the email your organization registered with.</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          New to Origo?{" "}
          <Link href={ROUTES.signup} className="text-primary font-medium underline-offset-4 hover:underline">
            Register your organization
          </Link>
        </p>
        <p className="text-muted-foreground text-sm">
          Checking a medicine?{" "}
          <Link href="/verify" className="text-primary font-medium underline-offset-4 hover:underline">
            Scan or enter its code
          </Link>
        </p>
      </div>
      {demoEnabled ? (
        <Link
          href="/demo"
          className="hover:bg-muted/60 focus-visible:ring-ring group flex items-center gap-3 rounded-lg border border-dashed p-4 outline-none transition-colors focus-visible:ring-2"
        >
          <FlaskConical className="text-primary size-5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-sm">
            <span className="block font-medium">Exploring the demo?</span>
            <span className="text-muted-foreground">Sign in as any role, or scan sample packs.</span>
          </span>
          <ArrowRight
            className="text-muted-foreground group-hover:text-foreground size-4 transition-colors"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}
