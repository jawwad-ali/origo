import { type OrgStatus } from "@origo/shared";
import { type ReviewAction } from "./types";

export const ORGS_PAGE_SIZE = 20;
export const DEFAULT_STATUS_TAB: OrgStatus = "PENDING";

/** Which review actions make sense for an organization in each status. Mirrors the API's rules. */
export const ACTIONS_BY_STATUS: Record<OrgStatus, ReviewAction[]> = {
  PENDING: ["approve", "reject"],
  APPROVED: ["suspend"],
  REJECTED: ["approve"],
  SUSPENDED: ["approve"],
};

export const EMPTY_COPY: Record<OrgStatus, { title: string; body: string }> = {
  PENDING: { title: "No registrations waiting", body: "New sign-ups appear here for license review." },
  APPROVED: {
    title: "No approved organizations yet",
    body: "Approve a pending registration to see it here.",
  },
  REJECTED: { title: "Nothing rejected", body: "Registrations you reject are kept here with the reason." },
  SUSPENDED: {
    title: "No suspended organizations",
    body: "Suspended organizations can sign in but not record.",
  },
};
