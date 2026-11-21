import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger, type OnModuleInit } from "@nestjs/common";
import { type Job, Queue } from "bullmq";
import { AppConfigService } from "../../../config/app-config.service";
import { PacksService } from "../../packs/packs.service";
import { type BuildLabelsJobData, LABEL_EXPORT_JOBS, LABEL_EXPORT_QUEUE } from "../../queue/queue.constants";
import { type LabelExportWithBatch, LabelExportsRepository } from "../label-exports.repository";
import { LabelStorageService } from "../label-storage.service";
import { LabelPdfBuilder } from "./label-pdf.builder";

const PACK_PAGE_SIZE = 500;
const CLEANUP_EVERY_MS = 60 * 60 * 1000;
const HOUR_MS = 3_600_000;
const WORKER_CONCURRENCY = 2;

/** Builds label PDFs and removes expired ones. Runs in the worker process, or inside the API with RUN_WORKER_IN_API. */
@Processor(LABEL_EXPORT_QUEUE, { concurrency: WORKER_CONCURRENCY })
export class LabelExportProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(LabelExportProcessor.name);

  constructor(
    @InjectQueue(LABEL_EXPORT_QUEUE) private readonly queue: Queue,
    private readonly exports: LabelExportsRepository,
    private readonly packs: PacksService,
    private readonly storage: LabelStorageService,
    private readonly pdf: LabelPdfBuilder,
    private readonly config: AppConfigService,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.queue.upsertJobScheduler(
      "label-export-cleanup",
      { every: CLEANUP_EVERY_MS },
      {
        name: LABEL_EXPORT_JOBS.cleanup,
      },
    );
  }

  async process(job: Job<BuildLabelsJobData>): Promise<void> {
    if (job.name === LABEL_EXPORT_JOBS.cleanup) return this.cleanup();
    if (job.name === LABEL_EXPORT_JOBS.build) return this.build(job);
    this.logger.warn(`Unknown job "${job.name}" ignored`);
  }

  /** After the last retry fails, record why so the user sees it instead of a spinner forever. */
  @OnWorkerEvent("failed")
  async onFailed(job: Job<BuildLabelsJobData> | undefined, error: Error): Promise<void> {
    if (!job || job.name !== LABEL_EXPORT_JOBS.build) return;
    this.logger.error(
      `Label export ${job.data.exportId} failed (attempt ${job.attemptsMade}): ${error.message}`,
    );
    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
      await this.exports.markFailed(job.data.exportId, "The PDF couldn't be built. Try exporting again.");
    }
  }

  private async build(job: Job<BuildLabelsJobData>): Promise<void> {
    const record = await this.exports.findWithBatch(job.data.exportId);
    if (!record) {
      this.logger.warn(`Label export ${job.data.exportId} no longer exists; skipping`);
      return;
    }
    await this.exports.markProcessing(record.id);

    const fileName = this.storage.fileNameFor(record.id);
    const out = await this.storage.openWrite(fileName);
    await this.pdf.build(
      this.sheetInfo(record),
      this.packs.publicIdsInPages(record.batchId, PACK_PAGE_SIZE),
      out,
      (done) => job.updateProgress(Math.round((done / record.labelCount) * 100)),
    );

    const size = await this.storage.sizeOf(fileName);
    const expiresAt = new Date(Date.now() + this.config.get("LABEL_EXPORT_TTL_HOURS") * HOUR_MS);
    await this.exports.markReady(record.id, { path: fileName, size }, expiresAt);
    this.logger.log(`Label export ${record.id}: ${record.labelCount} labels, ${size} bytes`);
  }

  private async cleanup(): Promise<void> {
    const expired = await this.exports.findExpiredWithFiles(new Date());
    for (const item of expired) {
      if (item.filePath) await this.storage.remove(item.filePath);
      await this.exports.clearFile(item.id);
    }
    if (expired.length > 0) this.logger.log(`Removed ${expired.length} expired label PDFs`);
  }

  private sheetInfo(record: LabelExportWithBatch) {
    const { batch } = record;
    return {
      maker: batch.organization.name,
      productName: batch.product.name,
      strength: batch.product.strength,
      packSize: batch.product.packSize,
      batchNumber: batch.batchNumber,
      expiry: batch.expiresOn.toISOString().slice(0, 7),
      totalLabels: record.labelCount,
    };
  }
}
