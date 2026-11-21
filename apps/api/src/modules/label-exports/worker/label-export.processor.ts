import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger, type OnModuleInit } from "@nestjs/common";
import { type Job, Queue } from "bullmq";
import { type BuildLabelsJobData, LABEL_EXPORT_JOBS, LABEL_EXPORT_QUEUE } from "../../queue/queue.constants";
import { LabelExportCleanupService } from "../core/label-export-cleanup.service";
import { LabelExportBuildService } from "../jobs/label-export-build.service";
import { LabelExportsRepository } from "../label-exports.repository";

const CLEANUP_EVERY_MS = 60 * 60 * 1000;
const WORKER_CONCURRENCY = 2;

/**
 * Queue consumer for label exports (LABEL_EXPORT_RUNNER=queue): builds PDFs with retries and removes
 * expired ones hourly. Runs in the worker process, or inside the API with RUN_WORKER_IN_API.
 */
@Processor(LABEL_EXPORT_QUEUE, { concurrency: WORKER_CONCURRENCY })
export class LabelExportProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(LabelExportProcessor.name);

  constructor(
    @InjectQueue(LABEL_EXPORT_QUEUE) private readonly queue: Queue,
    private readonly builder: LabelExportBuildService,
    private readonly cleanup: LabelExportCleanupService,
    private readonly exports: LabelExportsRepository,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.queue.upsertJobScheduler(
      "label-export-cleanup",
      { every: CLEANUP_EVERY_MS },
      { name: LABEL_EXPORT_JOBS.cleanup },
    );
  }

  async process(job: Job<BuildLabelsJobData>): Promise<void> {
    if (job.name === LABEL_EXPORT_JOBS.cleanup) {
      await this.cleanup.removeExpired();
      return;
    }
    if (job.name === LABEL_EXPORT_JOBS.build) {
      await this.builder.build(job.data.exportId, (percent) => job.updateProgress(percent));
      return;
    }
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
}
