import { type CurrentUserDto } from "@origo/shared";
import { type Principal } from "../../common/types/principal";
import { toOrganizationDto } from "../organizations/organization.mapper";
import { type CurrentUserRecord, type PrincipalRecord } from "./users.repository";

export const toCurrentUserDto = (user: CurrentUserRecord): CurrentUserDto => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  isPlatformAdmin: user.isPlatformAdmin,
  membership: user.membership
    ? { role: user.membership.role, organization: toOrganizationDto(user.membership.organization) }
    : null,
});

export const toPrincipal = (user: PrincipalRecord): Principal => ({
  userId: user.id,
  email: user.email,
  isPlatformAdmin: user.isPlatformAdmin,
  membership: user.membership
    ? {
        organizationId: user.membership.organization.id,
        role: user.membership.role,
        orgType: user.membership.organization.type,
        orgStatus: user.membership.organization.status,
      }
    : null,
});
