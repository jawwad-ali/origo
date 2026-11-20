"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@origo/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { FormError } from "@/components/form/form-error";
import { SubmitButton } from "@/components/form/submit-button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { applyApiError } from "@/lib/forms/apply-api-error";
import { NEXT_PARAM, safeNextPath } from "@/lib/routes";
import { login } from "../services/auth-service";

type LoginFormInput = z.input<typeof loginSchema>;
type LoginFormOutput = z.output<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<LoginFormInput, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: LoginFormOutput): Promise<void> => {
    try {
      await login(values);
      router.replace(safeNextPath(searchParams.get(NEXT_PARAM)));
      router.refresh();
    } catch (error) {
      applyApiError(error, form.setError);
      form.resetField("password", { keepError: true });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
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
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={form.formState.errors.root?.message} />
        <SubmitButton isPending={form.formState.isSubmitting} label="Sign in" pendingLabel="Signing in..." />
      </form>
    </Form>
  );
};
