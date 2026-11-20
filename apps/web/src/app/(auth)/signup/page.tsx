import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/features/auth/components/signup-form";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Register your organization" };

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Register your organization</h1>
        <p className="text-muted-foreground text-sm">
          An Origo admin checks your license before you can record transfers. This usually takes a working
          day.
        </p>
      </div>
      <SignupForm />
      <p className="text-muted-foreground text-sm">
        Already registered?{" "}
        <Link href={ROUTES.login} className="text-primary font-medium underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
