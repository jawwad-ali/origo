import { InjectQueue } from "@nestjs/bullmq";
import { HttpStatus, Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { DomainException } from "../../../common/exceptions/domain.exceptions";
import { type BuildLabelsJobData, LABEL_EXPORT_JOBS, LABEL_EXPORT_QUEUE } from "../../queue/queue.constants";
import { LabelExportsRepository } from "../label-exports.repository";
import { LabelExportDispatcher } from "./label-export-dispatcher";

const ENQUEUE_TIMEOUT_MS = 5_000;

class QueueUnavailableException extends DomainException {
  constructor() {
    super(
      HttpStatus.SERVICE_UNAVAILABLE,
      "labels-unavailable",
      "Label service unavailable",
      "Labels can't be generated right now. Try again in a minute.",
    );
  }
}

/** Hands the build to the BullMQ worker, which retries with backoff. */
@Injectable()
export class QueueLabelExportDispatcher extends LabelExportDispatcher {
  constructor(
    @InjectQueue(LABEL_EXPORT_QUEUE) private readonly queue: Queue<BuildLabelsJobData>,
    private readonly exports: LabelExportsRepository,
  ) {
    super();
  }

  /** If Redis doesn't answer in time, fail fast instead of hanging the request. */
  async dispatch(exportId: string): Promise<void> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("queue timeout")), ENQUEUE_TIMEOUT_MS);
    });
    try {
      await Promise.race([
        this.queue.add(LABEL_EXPORT_JOBS.build, { exportId }, { jobId: exportId }),
        timeout,
      ]);
    } catch {
      await this.exports.markFailed(exportId, "The label service is unavailable. Try again in a minute.");
      throw new QueueUnavailableException();
    } finally {
      clearTimeout(timer);
    }
  }
}
