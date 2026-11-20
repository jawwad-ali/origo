import { Global, Module } from "@nestjs/common";
import { QrSigningService } from "./qr-signing.service";

@Global()
@Module({
  providers: [QrSigningService],
  exports: [QrSigningService],
})
export class QrSigningModule {}
