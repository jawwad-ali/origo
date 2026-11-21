import { Controller, Get, UseGuards } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/access.decorators";
import { CronSecretGuard } from "../../common/guards/cron-secret.guard";
import { LabelExportCleanupService } from "./core/label-export-cleanup.service";

/** Maintenance called by Vercel Cron (GET, bearer secret). The queue worker schedules its own cleanup. */
@Public()
@SkipThrottle()
@UseGuards(CronSecretGuard)
@Controller("internal/cron")
export class LabelExportsCronController {
  constructor(private readonly cleanup: LabelExportCleanupService) {}

  @Get("label-exports-cleanup")
  async removeExpiredLabels(): Promise<{ removed: number }> {
    return { removed: await this.cleanup.removeExpired() };
  }
}
