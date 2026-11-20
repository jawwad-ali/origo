import { AlertCircle } from "lucide-react";

/** The form-level error (not tied to one field), announced to screen readers. */
export const FormError = ({ message }: { message?: string | undefined }) =>
  message ? (
    <p
      role="alert"
      className="border-destructive/30 bg-destructive-soft text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  ) : null;
