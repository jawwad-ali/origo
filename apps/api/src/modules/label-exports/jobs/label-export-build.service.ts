import { Injectable, Logger } from "@nestjs/common";
import { AppConfigService } from "../../../config/app-config.service";
import { PacksService } from "../../packs/packs.service";
import { type LabelExportWithBatch, LabelExportsRepository } from "../label-exports.repository";
import { LabelStorage } from "../storage/label-storage";
import { LabelPdfBuilder, type LabelSheetInfo } from "./label-pdf.builder";

const PACK_PAGE_SIZE = 500;
const HOUR_MS = 3_600_000;

const sheetInfoOf = ({ batch, labelCount }: LabelExportWithBatch): LabelSheetInfo => ({
  maker: batch.organization.name,
  productName: batch.product.name,
  strength: batch.product.strength,
  packSize: batch.product.packSize,
  batchNumber: batch.batchNumber,
  expiry: batch.expiresOn.toISOString().slice(0, 7),
  totalLabels: labelCount,
});

type ProgressListener = (percent: number) => Promise<void>;

const noProgress: ProgressListener = async () => {};

/**
 * Builds one export's PDF and marks it ready. Runner-agnostic: the queue worker and the inline runner
 * both call it. Throws on failure; whoever runs it decides whether to retry or mark the export failed.
 */
@Injectable()
export class LabelExportBuildService {
  private readonly logger = new Logger(LabelExportBuildService.name);

  constructor(
    private readonly exports: LabelExportsRepository,
    private readonly packs: PacksService,
    private readonly storage: LabelStorage,
    private readonly pdf: LabelPdfBuilder,
    private readonly config: AppConfigService,
  ) {}

  async build(exportId: string, onProgress: ProgressListener = noProgress): Promise<void> {
    const record = await this.exports.findWithBatch(exportId);
    if (!record) {
      this.logger.warn(`Label export ${exportId} no longer exists; skipping`);
      return;
    }
    await this.exports.markProcessing(record.id);

    const file = await this.storage.save(record.id, (out) =>
      this.pdf.build(
        sheetInfoOf(record),
        this.packs.publicIdsInPages(record.batchId, PACK_PAGE_SIZE),
        out,
        (done) => onProgress(Math.round((done / record.labelCount) * 100)),
      ),
    );

    const expiresAt = new Date(Date.now() + this.config.get("LABEL_EXPORT_TTL_HOURS") * HOUR_MS);
    await this.exports.markReady(record.id, { path: file.key, size: file.size }, expiresAt);
    this.logger.log(`Label export ${record.id}: ${record.labelCount} labels, ${file.size} bytes`);
  }
}
