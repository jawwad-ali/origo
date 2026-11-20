import type { BatchStatus, DosageForm, MembershipRole, OrgStatus, OrgType, PackStatus } from "./enums";

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

export const DOSAGE_FORM_LABELS: Record<DosageForm, string> = {
  TABLET: "Tablet",
  CAPSULE: "Capsule",
  SYRUP: "Syrup",
  SUSPENSION: "Suspension",
  INJECTION: "Injection",
  CREAM: "Cream",
  OINTMENT: "Ointment",
  DROPS: "Drops",
  INHALER: "Inhaler",
  OTHER: "Other",
};

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  ACTIVE: "Active",
  RECALLED: "Recalled",
};

export const PACK_STATUS_LABELS: Record<PackStatus, string> = {
  IN_STOCK: "In stock",
  IN_TRANSIT: "In transit",
  DISPENSED: "Dispensed",
  RECALLED: "Recalled",
};

/** Largest batch registered in one request. Bigger runs are split into several batches. */
export const MAX_PACKS_PER_BATCH = 5000;
export const PRODUCT_TEXT_MAX_LENGTH = 200;
export const BATCH_NUMBER_MAX_LENGTH = 40;
/** Pack IDs look like MED-2026-000123: prefix, year of registration, zero-padded serial. */
export const PACK_ID_PREFIX = "MED";
export const PACK_ID_PATTERN = /^MED-\d{4}-\d{6,}$/;
