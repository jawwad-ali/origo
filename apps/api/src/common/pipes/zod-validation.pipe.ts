import { type PipeTransform } from "@nestjs/common";
import { type ZodType } from "zod";
import { ValidationException } from "../exceptions/validation.exception";

/** Validates and transforms a body, query or param with a shared Zod schema. Unknown keys are stripped. */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) throw new ValidationException(result.error);
    return result.data;
  }
}
