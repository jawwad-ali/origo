import { type OrganizationDto } from "@origo/shared";
import { type Organization } from "@prisma/client";

export const toOrganizationDto = (org: Organization): OrganizationDto => ({
  id: org.id,
  name: org.name,
  type: org.type,
  status: org.status,
  licenseNumber: org.licenseNumber,
  city: org.city,
  country: org.country,
  rejectionReason: org.rejectionReason,
  createdAt: org.createdAt.toISOString(),
  reviewedAt: org.reviewedAt?.toISOString() ?? null,
});
