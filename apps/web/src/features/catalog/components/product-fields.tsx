"use client";

import { DOSAGE_FORM_LABELS, DOSAGE_FORMS } from "@origo/shared";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STORAGE_SUGGESTIONS } from "../constants";
import { type ProductFormInput } from "../types";

export const ProductFields = () => {
  const { control, setValue } = useFormContext<ProductFormInput>();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Panadol" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="genericName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Generic name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Paracetamol" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="strength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Strength</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 500 mg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="dosageForm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage form</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DOSAGE_FORMS.map((form) => (
                    <SelectItem key={form} value={form}>
                      {DOSAGE_FORM_LABELS[form]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="packSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pack size</FormLabel>
            <FormControl>
              <Input placeholder="e.g. 20 tablets, 120 ml" {...field} />
            </FormControl>
            <FormDescription>What one pack contains. Printed on every label.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="storageInstructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Storage instructions</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <div className="flex flex-wrap gap-1.5" aria-label="Common storage instructions">
              {STORAGE_SUGGESTIONS.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() =>
                    setValue("storageInstructions", text, { shouldValidate: true, shouldDirty: true })
                  }
                  className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring rounded-full border px-2.5 py-0.5 text-xs outline-none transition-colors focus-visible:ring-2"
                >
                  {text}
                </button>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
