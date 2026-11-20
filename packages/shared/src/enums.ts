/**
 * Domain enums shared by the API and the web app.
 * Values match the Prisma enums one-to-one.
 */
export const ORG_TYPES = ["MANUFACTURER", "DISTRIBUTOR", "WHOLESALER", "PHARMACY"] as const;
export type OrgType = (typeof ORG_TYPES)[number];

export const ORG_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export type OrgStatus = (typeof ORG_STATUSES)[number];

export const MEMBERSHIP_ROLES = ["OWNER", "ADMIN", "STAFF"] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const DOSAGE_FORMS = [
  "TABLET",
  "CAPSULE",
  "SYRUP",
  "SUSPENSION",
  "INJECTION",
  "CREAM",
  "OINTMENT",
  "DROPS",
  "INHALER",
  "OTHER",
] as const;
export type DosageForm = (typeof DOSAGE_FORMS)[number];

export const BATCH_STATUSES = ["ACTIVE", "RECALLED"] as const;
export type BatchStatus = (typeof BATCH_STATUSES)[number];

export const PACK_STATUSES = ["IN_STOCK", "IN_TRANSIT", "DISPENSED", "RECALLED"] as const;
export type PackStatus = (typeof PACK_STATUSES)[number];

export const LABEL_EXPORT_STATUSES = ["QUEUED", "PROCESSING", "READY", "FAILED"] as const;
export type LabelExportStatus = (typeof LABEL_EXPORT_STATUSES)[number];

export const TRANSFER_STATUSES = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"] as const;
export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

export const LEDGER_EVENT_TYPES = [
  "REGISTERED",
  "TRANSFER_SENT",
  "TRANSFER_RECEIVED",
  "TRANSFER_REJECTED",
  "TRANSFER_CANCELLED",
] as const;
export type LedgerEventType = (typeof LEDGER_EVENT_TYPES)[number];

export const TRANSFER_DIRECTIONS = ["incoming", "outgoing"] as const;
export type TransferDirection = (typeof TRANSFER_DIRECTIONS)[number];
