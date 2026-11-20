import { Module } from "@nestjs/common";
import { LedgerModule } from "../ledger/ledger.module";
import { VerificationController } from "./verification.controller";
import { VerificationRepository } from "./verification.repository";
import { VerificationService } from "./verification.service";

@Module({
  imports: [LedgerModule],
  controllers: [VerificationController],
  providers: [VerificationRepository, VerificationService],
})
export class VerificationModule {}
