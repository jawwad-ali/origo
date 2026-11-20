import { Module } from "@nestjs/common";
import { BatchesModule } from "../batches/batches.module";
import { QueueModule } from "../queue/queue.module";
import { LabelExportsController } from "./label-exports.controller";
import { LabelExportsRepository } from "./label-exports.repository";
import { LabelExportsService } from "./label-exports.service";
import { LabelStorageService } from "./label-storage.service";

/** API side: request, track and download label exports. The PDF itself is built by the worker. */
@Module({
  imports: [QueueModule, BatchesModule],
  controllers: [LabelExportsController],
  providers: [LabelExportsRepository, LabelExportsService, LabelStorageService],
})
export class LabelExportsModule {}
