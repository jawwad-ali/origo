import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Origo</h1>
        <p className="text-muted-foreground text-sm">Use the email your organization registered with.</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="text-muted-foreground text-sm">
        New to Origo?{" "}
        <Link href={ROUTES.signup} className="text-primary font-medium underline-offset-4 hover:underline">
          Register your organization
        </Link>
      </p>
    </div>
  );
}
