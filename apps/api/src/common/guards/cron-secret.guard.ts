import { createHash, timingSafeEqual } from "node:crypto";
import { type CanActivate, type ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { type Request } from "express";
import { AppConfigService } from "../../config/app-config.service";
import { UnauthenticatedException } from "../exceptions/domain.exceptions";

const digest = (value: string): Buffer => createHash("sha256").update(value).digest();

/**
 * Lets scheduled jobs (Vercel Cron) call maintenance routes. Vercel sends `Authorization: Bearer
 * <CRON_SECRET>`. Without CRON_SECRET configured the routes don't exist (404).
 */
@Injectable()
export class CronSecretGuard implements CanActivate {
  constructor(private readonly config: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get("CRON_SECRET");
    if (!secret) throw new NotFoundException();

    const header = context.switchToHttp().getRequest<Request>().headers.authorization ?? "";
    // Hashing first gives equal-length buffers, so the comparison takes the same time for any input.
    if (!timingSafeEqual(digest(header), digest(`Bearer ${secret}`))) {
      throw new UnauthenticatedException("This route is for scheduled jobs only.");
    }
    return true;
  }
}
