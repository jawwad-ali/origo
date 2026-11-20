import { type MembershipRole, type OrgStatus, type OrgType } from "@origo/shared";
import { type Request } from "express";

export interface PrincipalMembership {
  organizationId: string;
  role: MembershipRole;
  orgType: OrgType;
  orgStatus: OrgStatus;
}

/** The authenticated caller, loaded fresh from the database on every request. */
export interface Principal {
  userId: string;
  email: string;
  isPlatformAdmin: boolean;
  membership: PrincipalMembership | null;
}

export interface AuthenticatedRequest extends Request {
  principal?: Principal;
}
