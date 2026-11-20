import { type signupSchema } from "@origo/shared";
import { type z } from "zod";

export type SignupFormInput = z.input<typeof signupSchema>;
export type SignupFormOutput = z.output<typeof signupSchema>;
