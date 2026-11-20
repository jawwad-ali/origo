import type { MembershipRole, OrgStatus, OrgType } from "./enums";

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  MANUFACTURER: "Manufacturer",
  DISTRIBUTOR: "Distributor",
  WHOLESALER: "Wholesaler",
  PHARMACY: "Pharmacy",
};

export const ORG_STATUS_LABELS: Record<OrgStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

export const MEMBERSHIP_ROLE_LABELS: Record<MembershipRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  STAFF: "Staff",
};

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 120;
export const LICENSE_MAX_LENGTH = 60;
export const REJECTION_REASON_MAX_LENGTH = 500;
