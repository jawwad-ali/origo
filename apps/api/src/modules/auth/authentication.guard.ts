import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../common/decorators/access.decorators";
import { UnauthenticatedException } from "../../common/exceptions/domain.exceptions";
import { type AuthenticatedRequest } from "../../common/types/principal";
import { UsersService } from "../users/users.service";
import { AccessTokenService } from "./access-token.service";
import { ACCESS_COOKIE } from "./constants";

/**
 * Authentication for every route not marked @Public(). Verifies the access-token cookie
 * and loads the principal fresh, so a suspension or role change applies on the next request.
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokens: AccessTokenService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token: unknown = request.cookies?.[ACCESS_COOKIE];
    const userId = await this.accessTokens.verify(typeof token === "string" ? token : undefined);
    if (!userId) throw new UnauthenticatedException();

    const principal = await this.users.getPrincipal(userId);
    if (!principal) throw new UnauthenticatedException();

    request.principal = principal;
    return true;
  }
}
