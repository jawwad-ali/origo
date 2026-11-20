"use client";

import { MAX_PACKS_PER_BATCH } from "@origo/shared";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { type BatchFormInput } from "../types";

const LABELS_PER_SHEET = 21;

/** "1,000 packs · 48 label sheets", so the user sees what they're about to print. */
const PackCountSummary = () => {
  const { control } = useFormContext<BatchFormInput>();
  const raw = useWatch({ control, name: "packCount" });
  const count = Number(raw);
  if (!Number.isInteger(count) || count < 1 || count > MAX_PACKS_PER_BATCH) return null;
  const sheets = Math.ceil(count / LABELS_PER_SHEET);
  return (
    <p className="tabular text-muted-foreground text-xs" aria-live="polite">
      {formatNumber(count)} unique pack IDs · {formatNumber(sheets)} A4 label{" "}
      {sheets === 1 ? "sheet" : "sheets"}
    </p>
  );
};

export const BatchFields = () => {
  const { control } = useFormContext<BatchFormInput>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="batchNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Batch number</FormLabel>
            <FormControl>
              <Input
                className="font-mono uppercase"
                placeholder="e.g. PCM-2026-0412"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormDescription>
              As printed on the packaging. Each batch number can be used once.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="manufacturedOn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manufactured on</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="expiresOn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires on</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="packCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of packs</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_PACKS_PER_BATCH}
                className="tabular"
                {...field}
                value={field.value === undefined ? "" : String(field.value)}
              />
            </FormControl>
            <FormDescription>Up to {formatNumber(MAX_PACKS_PER_BATCH)} per batch.</FormDescription>
            <PackCountSummary />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
