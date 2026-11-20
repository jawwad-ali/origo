import { Module } from "@nestjs/common";
import { BatchesModule } from "../batches/batches.module";
import { InventoryController } from "./inventory.controller";
import { InventoryRepository } from "./inventory.repository";
import { InventoryService } from "./inventory.service";

@Module({
  imports: [BatchesModule],
  controllers: [InventoryController],
  providers: [InventoryRepository, InventoryService],
})
export class InventoryModule {}
