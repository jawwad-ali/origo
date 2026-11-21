import { type DynamicModule, Module } from "@nestjs/common";
import { SentryModule } from "@sentry/nestjs/setup";
import { LoggerModule } from "nestjs-pino";
import { AppConfigService } from "./config/app-config.service";
import { AppConfigModule } from "./config/config.module";
import { type LabelExportStorage } from "./config/env.schema";
import { buildLoggerParams } from "./logger.config";
import { LabelExportsWorkerModule } from "./modules/label-exports/worker/label-exports-worker.module";
import { QrSigningModule } from "./modules/qr-signing/qr-signing.module";
import { PrismaModule } from "./prisma/prisma.module";

/** The background worker: same codebase as the API, no HTTP server, only queue consumers. */
@Module({
  imports: [
    SentryModule.forRoot(),
    AppConfigModule,
    LoggerModule.forRootAsync({ inject: [AppConfigService], useFactory: buildLoggerParams }),
    PrismaModule,
    QrSigningModule,
  ],
})
export class WorkerModule {
  static forRoot(storage: LabelExportStorage): DynamicModule {
    return { module: WorkerModule, imports: [LabelExportsWorkerModule.forRoot(storage)] };
  }
}
