import { type DynamicModule, Module } from "@nestjs/common";
import { type LabelExportStorage } from "../../../config/env.schema";
import { PacksModule } from "../../packs/packs.module";
import { LabelExportsCoreModule } from "../core/label-exports-core.module";
import { LabelExportBuildService } from "./label-export-build.service";
import { LabelPdfBuilder } from "./label-pdf.builder";

/** PDF generation. Loaded by the queue worker, or by the API itself with the inline runner. */
@Module({})
export class LabelExportBuildModule {
  static forRoot(storage: LabelExportStorage): DynamicModule {
    return {
      module: LabelExportBuildModule,
      imports: [LabelExportsCoreModule.forRoot(storage), PacksModule],
      providers: [LabelPdfBuilder, LabelExportBuildService],
      exports: [LabelExportBuildService],
    };
  }
}
