"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createBatchSchema } from "@origo/shared";
import { Boxes } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormError } from "@/components/form/form-error";
import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatNumber } from "@/lib/format";
import { applyApiError } from "@/lib/forms/apply-api-error";
import { batchPath } from "@/lib/routes";
import { registerBatch } from "../services/catalog.client";
import { type BatchFormInput, type BatchFormOutput } from "../types";
import { BatchFields } from "./batch-fields";

const DEFAULTS: DefaultValues<BatchFormInput> = { batchNumber: "", manufacturedOn: "", expiresOn: "" };

interface BatchFormSheetProps {
  productId: string;
  productLabel: string;
}

export const BatchFormSheet = ({ productId, productLabel }: BatchFormSheetProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<BatchFormInput, unknown, BatchFormOutput>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: BatchFormOutput): Promise<void> => {
    try {
      const batch = await registerBatch(productId, values);
      toast.success("Batch registered", {
        description: `${batch.batchNumber} · ${formatNumber(batch.packCount)} packs`,
      });
      setOpen(false);
      form.reset(DEFAULTS);
      router.push(batchPath(batch.id));
    } catch (error) {
      applyApiError(error, form.setError);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !isSubmitting && setOpen(next)}>
      <SheetTrigger asChild>
        <Button>
          <Boxes className="size-4" aria-hidden="true" />
          Register batch
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col" noValidate>
            <SheetHeader className="border-b">
              <SheetTitle>Register a batch</SheetTitle>
              <SheetDescription>{productLabel}. Every pack gets its own signed ID.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <BatchFields />
              <FormError message={form.formState.errors.root?.message} />
            </div>
            <SheetFooter className="border-t sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <SubmitButton
                isPending={isSubmitting}
                label="Register batch"
                pendingLabel="Registering packs..."
                className="sm:w-auto"
              />
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
