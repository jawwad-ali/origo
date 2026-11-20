"use client";

import { PACK_ID_PATTERN } from "@origo/shared";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** For when the camera won't scan: type the pack ID printed under the QR code. */
export const VerifyLookupForm = () => {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const packId = value.trim().toUpperCase();
    if (!PACK_ID_PATTERN.test(packId)) {
      setError("Type the ID exactly as printed, like MED-2026-000123.");
      return;
    }
    setError(null);
    router.push(`/v/${encodeURIComponent(packId)}`);
  };

  return (
    <form onSubmit={submit} className="space-y-2" noValidate>
      <Label htmlFor={id}>Pack ID</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="MED-2026-000123"
          autoComplete="off"
          autoCapitalize="characters"
          inputMode="text"
          className="h-11 font-mono"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
        />
        <Button type="submit" className="h-11">
          Check
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          Printed under the QR code on the label.
        </p>
      )}
    </form>
  );
};
