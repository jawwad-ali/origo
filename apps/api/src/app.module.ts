import { type DynamicModule, Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { SentryModule } from "@sentry/nestjs/setup";
import { LoggerModule } from "nestjs-pino";
import { AppConfigService } from "./config/app-config.service";
import { AppConfigModule } from "./config/config.module";
import { type BootstrapOptions } from "./config/env.schema";
import { buildLoggerParams } from "./logger.config";
import { AdminModule } from "./modules/admin/admin.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BatchesModule } from "./modules/batches/batches.module";
import { DemoModule } from "./modules/demo/demo.module";
import { HealthModule } from "./modules/health/health.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { LabelExportsModule } from "./modules/label-exports/label-exports.module";
import { LabelExportsWorkerModule } from "./modules/label-exports/worker/label-exports-worker.module";
import { PackHistoryModule } from "./modules/pack-history/pack-history.module";
import { ProductsModule } from "./modules/products/products.module";
import { QrSigningModule } from "./modules/qr-signing/qr-signing.module";
import { TransfersModule } from "./modules/transfers/transfers.module";
import { VerificationModule } from "./modules/verification/verification.module";
import { PrismaModule } from "./prisma/prisma.module";

const DEFAULT_RATE_LIMIT = { ttl: 60_000, limit: 120 };

@Module({
  imports: [
    SentryModule.forRoot(),
    AppConfigModule,
    LoggerModule.forRootAsync({ inject: [AppConfigService], useFactory: buildLoggerParams }),
    ThrottlerModule.forRoot([DEFAULT_RATE_LIMIT]),
    PrismaModule,
    AuditModule,
    AuthModule,
    QrSigningModule,
    AdminModule,
    ProductsModule,
    BatchesModule,
    InventoryModule,
    TransfersModule,
    PackHistoryModule,
    VerificationModule,
    DemoModule,
    HealthModule,
  ],
})
export class AppModule {
  /** Modules whose wiring depends on deployment settings (see BootstrapOptions). */
  static forRoot({ embeddedWorker, labelExports }: BootstrapOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        LabelExportsModule.forRoot(labelExports),
        ...(embeddedWorker ? [LabelExportsWorkerModule.forRoot(labelExports.storage)] : []),
      ],
    };
  }
}
