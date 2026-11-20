import { Module } from "@nestjs/common";
import { PacksModule } from "../../packs/packs.module";
import { QueueModule } from "../../queue/queue.module";
import { LabelExportsRepository } from "../label-exports.repository";
import { LabelStorageService } from "../label-storage.service";
import { LabelExportProcessor } from "./label-export.processor";
import { LabelPdfBuilder } from "./label-pdf.builder";

/** Worker side of label exports: consumes the queue and writes PDFs. */
@Module({
  imports: [QueueModule, PacksModule],
  providers: [LabelExportsRepository, LabelStorageService, LabelPdfBuilder, LabelExportProcessor],
})
export class LabelExportsWorkerModule {}
