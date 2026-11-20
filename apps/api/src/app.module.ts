import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { SentryModule } from "@sentry/nestjs/setup";
import { LoggerModule } from "nestjs-pino";
import { AppConfigService } from "./config/app-config.service";
import { AppConfigModule } from "./config/config.module";
import { buildLoggerParams } from "./logger.config";
import { AdminModule } from "./modules/admin/admin.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BatchesModule } from "./modules/batches/batches.module";
import { HealthModule } from "./modules/health/health.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { LabelExportsModule } from "./modules/label-exports/label-exports.module";
import { PackHistoryModule } from "./modules/pack-history/pack-history.module";
import { ProductsModule } from "./modules/products/products.module";
import { QrSigningModule } from "./modules/qr-signing/qr-signing.module";
import { TransfersModule } from "./modules/transfers/transfers.module";
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
    LabelExportsModule,
    InventoryModule,
    TransfersModule,
    PackHistoryModule,
    HealthModule,
  ],
})
export class AppModule {}
