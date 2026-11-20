import { SetMetadata } from "@nestjs/common";
import { type MembershipRole, type OrgType } from "@origo/shared";

export const IS_PUBLIC_KEY = "access:isPublic";
export const PLATFORM_ADMIN_KEY = "access:platformAdmin";
export const APPROVED_ORG_KEY = "access:approvedOrg";
export const ROLES_KEY = "access:roles";

/** Skips authentication for this route. */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

/** Only platform admins may call this route. */
export const PlatformAdminOnly = (): MethodDecorator & ClassDecorator =>
  SetMetadata(PLATFORM_ADMIN_KEY, true);

/** The caller's organization must be approved. */
export const RequireApprovedOrg = (): MethodDecorator & ClassDecorator => SetMetadata(APPROVED_ORG_KEY, true);

/** The caller must hold one of these roles in an approved organization. */
export const Roles = (...roles: MembershipRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);

export const ORG_TYPES_KEY = "access:orgTypes";

/** The caller's approved organization must be one of these types (e.g. only manufacturers register batches). */
export const OrgTypes = (...types: OrgType[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ORG_TYPES_KEY, types);
