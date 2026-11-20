import { Module } from "@nestjs/common";
import { BatchesModule } from "../batches/batches.module";
import { LedgerModule } from "../ledger/ledger.module";
import { PacksModule } from "../packs/packs.module";
import { DispenseService } from "./dispense.service";
import { PackHistoryController } from "./pack-history.controller";
import { PackHistoryRepository } from "./pack-history.repository";
import { PackHistoryService } from "./pack-history.service";

@Module({
  imports: [PacksModule, BatchesModule, LedgerModule],
  controllers: [PackHistoryController],
  providers: [PackHistoryRepository, PackHistoryService, DispenseService],
})
export class PackHistoryModule {}
