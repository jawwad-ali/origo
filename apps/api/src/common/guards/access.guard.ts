import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";

const ORG_TYPE_PLURALS = {
  MANUFACTURER: "manufacturers",
  DISTRIBUTOR: "distributors",
  WHOLESALER: "wholesalers",
  PHARMACY: "pharmacies",
} as const;
import { Reflector } from "@nestjs/core";
import { type MembershipRole, type OrgType } from "@origo/shared";
import {
  APPROVED_ORG_KEY,
  IS_PUBLIC_KEY,
  ORG_TYPES_KEY,
  PLATFORM_ADMIN_KEY,
  ROLES_KEY,
} from "../decorators/access.decorators";
import { ForbiddenActionException, UnauthenticatedException } from "../exceptions/domain.exceptions";
import { type AuthenticatedRequest, type Principal } from "../types/principal";

/**
 * Authorization, run after authentication. Reads the route's access metadata
 * (@PlatformAdminOnly, @RequireApprovedOrg, @Roles, @OrgTypes) and checks it against the principal.
 */
@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const principal = context.switchToHttp().getRequest<AuthenticatedRequest>().principal;
    if (!principal) throw new UnauthenticatedException();

    if (this.reflector.getAllAndOverride<boolean>(PLATFORM_ADMIN_KEY, targets)) {
      if (!principal.isPlatformAdmin) throw new ForbiddenActionException();
      return true;
    }

    const roles = this.reflector.getAllAndOverride<MembershipRole[] | undefined>(ROLES_KEY, targets);
    const orgTypes = this.reflector.getAllAndOverride<OrgType[] | undefined>(ORG_TYPES_KEY, targets);
    const needsApprovedOrg =
      this.reflector.getAllAndOverride<boolean>(APPROVED_ORG_KEY, targets) ||
      Boolean(roles) ||
      Boolean(orgTypes);

    if (needsApprovedOrg) this.assertApprovedOrg(principal);
    if (orgTypes && !orgTypes.includes(principal.membership?.orgType as OrgType)) {
      throw new ForbiddenActionException(
        `This is only available to ${orgTypes.map((type) => ORG_TYPE_PLURALS[type]).join(" and ")}.`,
      );
    }
    if (roles && !roles.includes(principal.membership?.role as MembershipRole)) {
      throw new ForbiddenActionException("Your role in this organization can't do this.");
    }
    return true;
  }

  private assertApprovedOrg(principal: Principal): void {
    if (!principal.membership) throw new ForbiddenActionException("You are not part of an organization.");
    if (principal.membership.orgStatus !== "APPROVED") {
      throw new ForbiddenActionException("Your organization is not approved yet.");
    }
  }
}
