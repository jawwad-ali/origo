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
