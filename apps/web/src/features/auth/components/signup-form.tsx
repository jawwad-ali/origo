"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@origo/shared";
import { useRouter } from "next/navigation";
import { type DefaultValues, useForm } from "react-hook-form";
import { FormError } from "@/components/form/form-error";
import { SubmitButton } from "@/components/form/submit-button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { applyApiError } from "@/lib/forms/apply-api-error";
import { ROUTES } from "@/lib/routes";
import { DEFAULT_COUNTRY } from "../constants";
import { signup } from "../services/auth-service";
import { type SignupFormInput, type SignupFormOutput } from "../types";
import { AccountFields } from "./account-fields";
import { OrganizationFields } from "./organization-fields";

const DEFAULT_VALUES: DefaultValues<SignupFormInput> = {
  fullName: "",
  email: "",
  password: "",
  organization: { name: "", licenseNumber: "", city: "", country: DEFAULT_COUNTRY },
};

export const SignupForm = () => {
  const router = useRouter();
  const form = useForm<SignupFormInput, unknown, SignupFormOutput>({
    resolver: zodResolver(signupSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  const onSubmit = async (values: SignupFormOutput): Promise<void> => {
    try {
      await signup(values);
      router.replace(ROUTES.dashboard);
      router.refresh();
    } catch (error) {
      applyApiError(error, form.setError);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <AccountFields />
        <Separator />
        <OrganizationFields />
        <FormError message={form.formState.errors.root?.message} />
        <SubmitButton
          isPending={form.formState.isSubmitting}
          label="Create account"
          pendingLabel="Creating account..."
        />
      </form>
    </Form>
  );
};
