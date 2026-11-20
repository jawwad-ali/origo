import { Module } from "@nestjs/common";
import { LedgerModule } from "../ledger/ledger.module";
import { PacksRepository } from "./packs.repository";
import { PacksService } from "./packs.service";

@Module({
  imports: [LedgerModule],
  providers: [PacksRepository, PacksService],
  exports: [PacksService],
})
export class PacksModule {}
