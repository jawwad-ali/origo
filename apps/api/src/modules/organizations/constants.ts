import { type OrgStatus } from "@origo/shared";
import { AUDIT_ACTIONS, type AuditAction } from "../audit/audit-actions";

export type ReviewDecision = "approve" | "reject" | "suspend";

interface ReviewRule {
  from: readonly OrgStatus[];
  to: OrgStatus;
  audit: AuditAction;
}

/** Allowed status changes for an organization review. */
export const REVIEW_RULES: Record<ReviewDecision, ReviewRule> = {
  approve: { from: ["PENDING", "REJECTED", "SUSPENDED"], to: "APPROVED", audit: AUDIT_ACTIONS.ORG_APPROVED },
  reject: { from: ["PENDING"], to: "REJECTED", audit: AUDIT_ACTIONS.ORG_REJECTED },
  suspend: { from: ["APPROVED"], to: "SUSPENDED", audit: AUDIT_ACTIONS.ORG_SUSPENDED },
};
