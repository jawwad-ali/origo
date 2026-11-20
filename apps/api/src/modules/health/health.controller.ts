import { Controller, Get, Res } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { type HealthDto } from "@origo/shared";
import { type Response } from "express";
import { Public } from "../../common/decorators/access.decorators";
import { HealthService } from "./health.service";

@Public()
@SkipThrottle()
@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** The process is running. Used by Docker to restart a hung container. */
  @Get("live")
  live(): HealthDto {
    return { status: "ok", checks: {} };
  }

  /** The API can serve traffic: its dependencies answer. Used by the deploy script and Caddy. */
  @Get("ready")
  async ready(@Res({ passthrough: true }) res: Response): Promise<HealthDto> {
    const result = await this.health.check();
    if (result.status !== "ok") res.status(503);
    return result;
  }
}
