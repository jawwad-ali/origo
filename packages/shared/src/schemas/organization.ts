import { z } from "zod";
import { LICENSE_MAX_LENGTH, NAME_MAX_LENGTH, REJECTION_REASON_MAX_LENGTH } from "../constants";
import { ORG_STATUSES, ORG_TYPES } from "../enums";

export const organizationInputSchema = z.object({
  name: z.string().trim().min(2, "Enter the organization name").max(NAME_MAX_LENGTH),
  type: z.enum(ORG_TYPES, { error: "Choose the organization type" }),
  licenseNumber: z.string().trim().min(3, "Enter the license number").max(LICENSE_MAX_LENGTH),
  city: z.string().trim().min(2, "Enter the city").max(NAME_MAX_LENGTH),
  country: z.string().trim().length(2, "Use a 2-letter country code").toUpperCase(),
});
export type OrganizationInput = z.infer<typeof organizationInputSchema>;

export const rejectOrganizationSchema = z.object({
  reason: z.string().trim().min(5, "Give a short reason").max(REJECTION_REASON_MAX_LENGTH),
});
export type RejectOrganizationInput = z.infer<typeof rejectOrganizationSchema>;

export const listOrganizationsQuerySchema = z.object({
  status: z.enum(ORG_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type ListOrganizationsQuery = z.infer<typeof listOrganizationsQuerySchema>;
