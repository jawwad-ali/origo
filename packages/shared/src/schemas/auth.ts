import { z } from "zod";
import { NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../constants";
import { organizationInputSchema } from "./organization";

export const emailSchema = z
  .email("Enter a valid email address")
  .max(254)
  .transform((value) => value.trim().toLowerCase());

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-zA-Z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(PASSWORD_MAX_LENGTH),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(NAME_MAX_LENGTH),
  email: emailSchema,
  password: passwordSchema,
  organization: organizationInputSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;
