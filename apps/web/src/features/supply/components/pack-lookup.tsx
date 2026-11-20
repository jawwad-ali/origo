"use client";

import { PACK_ID_PATTERN } from "@origo/shared";
import { ScanSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { packPath } from "@/lib/routes";

/** Jump to a pack's history by typing (or scanning into) its ID. */
export const PackLookup = () => {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const id = value.trim().toUpperCase();
    if (!PACK_ID_PATTERN.test(id)) {
      setError("Pack IDs look like MED-2026-000123.");
      return;
    }
    setError(null);
    router.push(packPath(id));
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-1.5 sm:w-auto" noValidate>
      <label htmlFor={inputId} className="sr-only">
        Pack ID
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="MED-2026-000123"
          className="font-mono sm:w-52"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          autoComplete="off"
        />
        <Button type="submit" variant="outline">
          <ScanSearch className="size-4" aria-hidden="true" />
          Look up
        </Button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
};
