import { Module } from "@nestjs/common";
import { PacksModule } from "../packs/packs.module";
import { ProductsModule } from "../products/products.module";
import { BatchesController } from "./batches.controller";
import { BatchesRepository } from "./batches.repository";
import { BatchesService } from "./batches.service";

@Module({
  imports: [ProductsModule, PacksModule],
  controllers: [BatchesController],
  providers: [BatchesRepository, BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}
