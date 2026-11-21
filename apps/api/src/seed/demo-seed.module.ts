import { Module } from "@nestjs/common";
import { AppConfigModule } from "../config/config.module";
import { AuditModule } from "../modules/audit/audit.module";
import { BatchesModule } from "../modules/batches/batches.module";
import { PackHistoryModule } from "../modules/pack-history/pack-history.module";
import { ProductsModule } from "../modules/products/products.module";
import { QrSigningModule } from "../modules/qr-signing/qr-signing.module";
import { TransfersModule } from "../modules/transfers/transfers.module";
import { PrismaModule } from "../prisma/prisma.module";
import { DemoSeedService } from "./demo-seed.service";

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuditModule,
    QrSigningModule,
    ProductsModule,
    BatchesModule,
    TransfersModule,
    PackHistoryModule,
  ],
  providers: [DemoSeedService],
})
export class DemoSeedModule {}
