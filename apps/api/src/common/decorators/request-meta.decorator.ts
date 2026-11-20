import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { type Request } from "express";
import { type RequestMeta } from "../types/request-meta";

const USER_AGENT_MAX_LENGTH = 400;

export const ReqMeta = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestMeta => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const userAgent = request.headers["user-agent"];
  return {
    ip: request.ip ?? null,
    userAgent: userAgent ? userAgent.slice(0, USER_AGENT_MAX_LENGTH) : null,
    requestId: request.id ? String(request.id) : null,
  };
});
