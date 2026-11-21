import { Injectable, Logger } from "@nestjs/common";
import { LabelExportsRepository } from "../label-exports.repository";
import { LabelStorage } from "../storage/label-storage";

/** Deletes PDFs past their expiry. Run hourly by the queue worker, or daily by Vercel Cron when inline. */
@Injectable()
export class LabelExportCleanupService {
  private readonly logger = new Logger(LabelExportCleanupService.name);

  constructor(
    private readonly exports: LabelExportsRepository,
    private readonly storage: LabelStorage,
  ) {}

  async removeExpired(now = new Date()): Promise<number> {
    const expired = await this.exports.findExpiredWithFiles(now);
    for (const item of expired) {
      if (item.filePath) await this.storage.remove(item.filePath);
      await this.exports.clearFile(item.id);
    }
    if (expired.length > 0) this.logger.log(`Removed ${expired.length} expired label PDFs`);
    return expired.length;
  }
}
