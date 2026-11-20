import { Module } from "@nestjs/common";
import { BatchesModule } from "../batches/batches.module";
import { LedgerModule } from "../ledger/ledger.module";
import { TransferResponsesService } from "./transfer-responses.service";
import { TransfersController } from "./transfers.controller";
import { TransfersRepository } from "./transfers.repository";
import { TransfersService } from "./transfers.service";

@Module({
  imports: [BatchesModule, LedgerModule],
  controllers: [TransfersController],
  providers: [TransfersRepository, TransfersService, TransferResponsesService],
})
export class TransfersModule {}
