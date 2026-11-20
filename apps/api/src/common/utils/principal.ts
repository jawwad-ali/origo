import { ForbiddenActionException } from "../exceptions/domain.exceptions";
import { type Principal } from "../types/principal";

/** The caller's organization ID. Every org-scoped query filters by this. */
export const orgIdOf = (principal: Principal): string => {
  if (!principal.membership) throw new ForbiddenActionException("You are not part of an organization.");
  return principal.membership.organizationId;
};

/** "YYYY-MM-DD" → a Date at UTC midnight, matching Postgres DATE columns. */
export const dateOnly = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);

/** A Postgres DATE (UTC midnight) → "YYYY-MM-DD". */
export const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);
