import { type DynamicModule, Module } from "@nestjs/common";
import { type LabelExportStorage } from "../../../config/env.schema";
import { QueueModule } from "../../queue/queue.module";
import { LabelExportsCoreModule } from "../core/label-exports-core.module";
import { LabelExportBuildModule } from "../jobs/label-export-build.module";
import { LabelExportProcessor } from "./label-export.processor";

/** Worker side of label exports: consumes the queue and writes PDFs to the configured storage. */
@Module({})
export class LabelExportsWorkerModule {
  static forRoot(storage: LabelExportStorage): DynamicModule {
    return {
      module: LabelExportsWorkerModule,
      imports: [
        QueueModule,
        LabelExportsCoreModule.forRoot(storage),
        LabelExportBuildModule.forRoot(storage),
      ],
      providers: [LabelExportProcessor],
    };
  }
}
