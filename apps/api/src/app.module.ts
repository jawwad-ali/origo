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
import { HealthModule } from "./modules/health/health.module";
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
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
