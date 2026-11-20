"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@origo/shared";
import { Plus } from "lucide-react";
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
import { applyApiError } from "@/lib/forms/apply-api-error";
import { productPath } from "@/lib/routes";
import { createProduct } from "../services/catalog.client";
import { type ProductFormInput, type ProductFormOutput } from "../types";
import { ProductFields } from "./product-fields";

const DEFAULTS: DefaultValues<ProductFormInput> = {
  name: "",
  genericName: "",
  strength: "",
  packSize: "",
  storageInstructions: "",
};

export const ProductFormSheet = ({ triggerLabel = "Add product" }: { triggerLabel?: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ProductFormOutput): Promise<void> => {
    try {
      const product = await createProduct(values);
      toast.success("Product added", { description: `${product.name} ${product.strength}` });
      setOpen(false);
      form.reset(DEFAULTS);
      router.push(productPath(product.id));
    } catch (error) {
      applyApiError(error, form.setError);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !isSubmitting && setOpen(next)}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="size-4" aria-hidden="true" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col" noValidate>
            <SheetHeader className="border-b">
              <SheetTitle>Add a product</SheetTitle>
              <SheetDescription>
                The medicine as it appears on the pack. You register batches of it next.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <ProductFields />
              <FormError message={form.formState.errors.root?.message} />
            </div>
            <SheetFooter className="border-t sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <SubmitButton
                isPending={isSubmitting}
                label="Add product"
                pendingLabel="Adding..."
                className="sm:w-auto"
              />
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
