import { Controller, Get, NotFoundException } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { type DemoSampleDto } from "@origo/shared";
import { Public } from "../../common/decorators/access.decorators";
import { AppConfigService } from "../../config/app-config.service";
import { DemoService } from "./demo.service";

/** Public helpers for the portfolio demo. Every route 404s unless DEMO_MODE is on. */
@Public()
@SkipThrottle()
@Controller("demo")
export class DemoController {
  constructor(
    private readonly demo: DemoService,
    private readonly config: AppConfigService,
  ) {}

  @Get("samples")
  samples(): Promise<DemoSampleDto[]> {
    if (!this.config.get("DEMO_MODE")) throw new NotFoundException();
    return this.demo.samples();
  }
}
