"use client";

import { ORG_TYPE_LABELS, ORG_TYPES } from "@origo/shared";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_OPTIONS } from "../constants";
import { type SignupFormInput } from "../types";

export const OrganizationFields = () => {
  const { control } = useFormContext<SignupFormInput>();

  return (
    <fieldset className="space-y-4">
      <legend className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
        Your organization
      </legend>
      <FormField
        control={control}
        name="organization.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization name</FormLabel>
            <FormControl>
              <Input autoComplete="organization" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="organization.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role in the supply chain</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ORG_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ORG_TYPE_LABELS[type]}
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
        name="organization.licenseNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Drug license number</FormLabel>
            <FormControl>
              <Input className="font-mono" placeholder="e.g. DML-000417" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="organization.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input autoComplete="address-level2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="organization.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </fieldset>
  );
};
