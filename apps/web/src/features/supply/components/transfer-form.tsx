"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createTransferSchema, MAX_TRANSFER_LINES, ORG_TYPE_LABELS, type OrgRefDto } from "@origo/shared";
import { Plus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormError } from "@/components/form/form-error";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatNumber } from "@/lib/format";
import { applyApiError } from "@/lib/forms/apply-api-error";
import { transferPath } from "@/lib/routes";
import { createTransfer } from "../services/supply.client";
import { type SendableBatch, type TransferFormInput, type TransferFormOutput } from "../types";
import { TransferLineRow } from "./transfer-line-row";

interface TransferFormProps {
  recipients: OrgRefDto[];
  batches: SendableBatch[];
  initialBatchId?: string;
}

export const TransferForm = ({ recipients, batches, initialBatchId }: TransferFormProps) => {
  const router = useRouter();
  // One key per form: a double submit or a retry after a timeout returns the same transfer.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const form = useForm<TransferFormInput, unknown, TransferFormOutput>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: { lines: [{ batchId: initialBatchId ?? "", quantity: undefined }], note: "" },
    mode: "onTouched",
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });
  const lines = useWatch({ control: form.control, name: "lines" });
  const total = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  const { isSubmitting } = form.formState;

  const overStock = (values: TransferFormOutput): boolean => {
    let invalid = false;
    values.lines.forEach((line, index) => {
      const available = batches.find((batch) => batch.id === line.batchId)?.inStock ?? 0;
      if (line.quantity > available) {
        form.setError(`lines.${index}.quantity`, { message: `Only ${formatNumber(available)} in stock` });
        invalid = true;
      }
    });
    return invalid;
  };

  const onSubmit = async (values: TransferFormOutput): Promise<void> => {
    if (overStock(values)) return;
    try {
      const transfer = await createTransfer(values, idempotencyKey);
      toast.success(`Transfer ${transfer.reference} sent`, {
        description: `${formatNumber(transfer.packCount)} packs to ${transfer.to.name}`,
      });
      router.push(transferPath(transfer.id));
      router.refresh();
    } catch (error) {
      applyApiError(error, form.setError);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="toOrganizationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Send to</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose the receiving organization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {recipients.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                      <span className="text-muted-foreground ml-2 text-xs">
                        {ORG_TYPE_LABELS[org.type]} · {org.city}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">What to send</legend>
          {fields.map((field, index) => (
            <TransferLineRow
              key={field.id}
              index={index}
              batches={batches}
              takenIds={lines.filter((_, other) => other !== index).map((line) => line.batchId)}
              onRemove={fields.length > 1 ? () => remove(index) : null}
            />
          ))}
          <FormError
            message={form.formState.errors.lines?.root?.message ?? form.formState.errors.lines?.message}
          />
          {fields.length < Math.min(MAX_TRANSFER_LINES, batches.length) ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ batchId: "", quantity: undefined })}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add another batch
            </Button>
          ) : null}
        </fieldset>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Note for the receiver <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="e.g. Delivery via our van on Thursday" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormError message={form.formState.errors.root?.message} />
        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="tabular text-muted-foreground text-sm" aria-live="polite">
            {total > 0
              ? `${formatNumber(total)} packs will be marked in transit until the receiver accepts.`
              : ""}
          </p>
          <Button type="submit" disabled={isSubmitting}>
            <Send className="size-4" aria-hidden="true" />
            {isSubmitting ? "Sending..." : total > 0 ? `Send ${formatNumber(total)} packs` : "Send"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
