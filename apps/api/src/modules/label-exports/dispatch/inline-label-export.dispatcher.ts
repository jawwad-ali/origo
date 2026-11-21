import { Injectable, Logger } from "@nestjs/common";
import { waitUntil } from "@vercel/functions";
import { LabelExportBuildService } from "../jobs/label-export-build.service";
import { LabelExportsRepository } from "../label-exports.repository";
import { LabelExportDispatcher } from "./label-export-dispatcher";

/**
 * Builds the PDF in this process, after the request has been answered. On Vercel, waitUntil keeps the
 * function alive until the build settles; on a long-running server the promise simply runs. There's
 * no retry: a failed build is marked FAILED and the user exports again.
 */
@Injectable()
export class InlineLabelExportDispatcher extends LabelExportDispatcher {
  private readonly logger = new Logger(InlineLabelExportDispatcher.name);

  constructor(
    private readonly builder: LabelExportBuildService,
    private readonly exports: LabelExportsRepository,
  ) {
    super();
  }

  async dispatch(exportId: string): Promise<void> {
    waitUntil(this.run(exportId));
  }

  private async run(exportId: string): Promise<void> {
    try {
      await this.builder.build(exportId);
    } catch (error) {
      this.logger.error(
        `Label export ${exportId} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      await this.exports
        .markFailed(exportId, "The PDF couldn't be built. Try exporting again.")
        .catch(() => undefined);
    }
  }
}
