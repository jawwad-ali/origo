"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { login } from "@/features/auth/services/auth-service";
import { ApiError } from "@/lib/api/api-error";
import { ROUTES } from "@/lib/routes";

/** Signs straight in as a demo account. Demo credentials are public by design. */
export const DemoLoginButton = ({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const signIn = (): void => {
    startTransition(async () => {
      try {
        await login({ email, password });
        router.push(ROUTES.dashboard);
        router.refresh();
      } catch (error) {
        toast.error(`Couldn't sign in as ${role.toLowerCase()}`, {
          description: error instanceof ApiError ? error.message : "Try again in a moment.",
        });
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={signIn}
      disabled={isPending}
      aria-label={`Sign in as ${role}`}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      Sign in
      {isPending ? null : <ArrowRight className="size-4" aria-hidden="true" />}
    </Button>
  );
};
