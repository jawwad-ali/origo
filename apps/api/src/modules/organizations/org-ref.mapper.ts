import { type OrgRefDto } from "@origo/shared";
import { type Organization } from "@prisma/client";

export type OrgRefRecord = Pick<Organization, "id" | "name" | "type" | "city" | "country">;

export const orgRefSelect = { id: true, name: true, type: true, city: true, country: true } as const;

/** How one participant sees another: name and location, never license or review details. */
export const toOrgRef = (org: OrgRefRecord): OrgRefDto => ({
  id: org.id,
  name: org.name,
  type: org.type,
  city: org.city,
  country: org.country,
});
