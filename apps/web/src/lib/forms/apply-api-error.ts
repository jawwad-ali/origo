import { type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { ApiError } from "../api/api-error";

const ROOT_KEY = "_root";

/**
 * Puts an API error on the form: field errors next to their fields, everything else
 * as a form-level message. Field paths from the API match react-hook-form paths.
 */
export const applyApiError = <T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): void => {
  if (!(error instanceof ApiError)) {
    setError("root", { message: "Something went wrong. Try again." });
    return;
  }
  const entries = Object.entries(error.fieldErrors).filter(([key]) => key !== ROOT_KEY);
  for (const [path, messages] of entries) {
    setError(path as Path<T>, { message: messages[0] });
  }
  if (entries.length === 0) setError("root", { message: error.message });
};
