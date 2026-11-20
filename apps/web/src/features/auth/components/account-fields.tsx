"use client";

import { PASSWORD_MIN_LENGTH } from "@origo/shared";
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
import { type SignupFormInput } from "../types";

export const AccountFields = () => {
  const { control } = useFormContext<SignupFormInput>();

  return (
    <fieldset className="space-y-4">
      <legend className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">You</legend>
      <FormField
        control={control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full name</FormLabel>
            <FormControl>
              <Input autoComplete="name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Work email</FormLabel>
            <FormControl>
              <Input type="email" autoComplete="email" placeholder="name@company.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" autoComplete="new-password" {...field} />
            </FormControl>
            <FormDescription>
              At least {PASSWORD_MIN_LENGTH} characters, with a letter and a number.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
};
