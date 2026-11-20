import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { UnauthenticatedException } from "../exceptions/domain.exceptions";
import { type AuthenticatedRequest, type Principal } from "../types/principal";

export const CurrentPrincipal = createParamDecorator((_data: unknown, ctx: ExecutionContext): Principal => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.principal) throw new UnauthenticatedException();
  return request.principal;
});
