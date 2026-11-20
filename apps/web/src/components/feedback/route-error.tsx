"use client";

import { AlertCircle, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
}

/** Shared body for route-level error.tsx files. Never shows raw error text to the user. */
export const RouteError = ({ error, reset, title }: RouteErrorProps) => {
  useEffect(() => {
    // Surfaces in the browser console for debugging; Sentry picks up server errors separately.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Alert variant="destructive">
        <AlertCircle className="size-4" aria-hidden="true" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Something went wrong while loading. Your data is safe.
            {error.digest ? <span className="ml-1 font-mono text-xs">Ref {error.digest}</span> : null}
          </span>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};
