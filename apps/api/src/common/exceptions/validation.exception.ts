import { HttpStatus } from "@nestjs/common";
import { type ZodError } from "zod";
import { DomainException } from "./domain.exceptions";

export class ValidationException extends DomainException {
  readonly errors: Record<string, string[]>;

  constructor(error: ZodError) {
    super(
      HttpStatus.BAD_REQUEST,
      "validation-failed",
      "Some fields are invalid",
      "Check the highlighted fields.",
    );
    this.errors = error.issues.reduce<Record<string, string[]>>((acc, issue) => {
      const key = issue.path.join(".") || "_root";
      acc[key] = [...(acc[key] ?? []), issue.message];
      return acc;
    }, {});
  }
}
