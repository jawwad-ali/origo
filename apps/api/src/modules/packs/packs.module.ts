import { Module } from "@nestjs/common";
import { PacksRepository } from "./packs.repository";
import { PacksService } from "./packs.service";

@Module({
  providers: [PacksRepository, PacksService],
  exports: [PacksService],
})
export class PacksModule {}
