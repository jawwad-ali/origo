"use client";

import { Trash2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/format";
import { type SendableBatch, type TransferFormInput } from "../types";

interface TransferLineRowProps {
  index: number;
  batches: SendableBatch[];
  /** Batches already chosen on other lines; each batch may appear once. */
  takenIds: string[];
  onRemove: (() => void) | null;
}

export const TransferLineRow = ({ index, batches, takenIds, onRemove }: TransferLineRowProps) => {
  const { control } = useFormContext<TransferFormInput>();
  const batchId = useWatch({ control, name: `lines.${index}.batchId` });
  const selected = batches.find((batch) => batch.id === batchId);

  return (
    <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-start">
      <FormField
        control={control}
        name={`lines.${index}.batchId`}
        render={({ field }) => (
          <FormItem className="min-w-0">
            <FormLabel className="text-xs">Batch</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id} disabled={takenIds.includes(batch.id)}>
                    <span className="truncate">{batch.label}</span>
                    <span className="text-muted-foreground tabular ml-2 text-xs">
                      {formatNumber(batch.inStock)} in stock
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`lines.${index}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Packs</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={selected?.inStock}
                className="tabular"
                {...field}
                value={field.value === undefined ? "" : String(field.value)}
              />
            </FormControl>
            {selected ? (
              <p className="text-muted-foreground tabular text-xs">of {formatNumber(selected.inStock)}</p>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="sm:pt-6">
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={`Remove batch line ${index + 1}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};
