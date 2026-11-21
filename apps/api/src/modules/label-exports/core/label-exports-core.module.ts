import { type DynamicModule, Module } from "@nestjs/common";
import { type LabelExportStorage } from "../../../config/env.schema";
import { LabelExportsRepository } from "../label-exports.repository";
import { DatabaseLabelStorage } from "../storage/database-label-storage";
import { DiskLabelStorage } from "../storage/disk-label-storage";
import { LabelStorage } from "../storage/label-storage";
import { LabelExportCleanupService } from "./label-export-cleanup.service";

const STORAGE_IMPLEMENTATIONS = {
  disk: DiskLabelStorage,
  database: DatabaseLabelStorage,
} as const satisfies Record<LabelExportStorage, new (...args: never[]) => LabelStorage>;

/** What both the API side and the build side need: the export rows and the configured PDF storage. */
@Module({})
export class LabelExportsCoreModule {
  static forRoot(storage: LabelExportStorage): DynamicModule {
    return {
      module: LabelExportsCoreModule,
      providers: [
        LabelExportsRepository,
        { provide: LabelStorage, useClass: STORAGE_IMPLEMENTATIONS[storage] },
        LabelExportCleanupService,
      ],
      exports: [LabelExportsRepository, LabelStorage, LabelExportCleanupService],
    };
  }
}
