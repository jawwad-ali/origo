import { type ProductDto } from "@origo/shared";
import { type ProductRecord } from "./products.repository";

export const toProductDto = (product: ProductRecord): ProductDto => ({
  id: product.id,
  name: product.name,
  genericName: product.genericName,
  strength: product.strength,
  dosageForm: product.dosageForm,
  packSize: product.packSize,
  storageInstructions: product.storageInstructions,
  batchCount: product._count.batches,
  createdAt: product.createdAt.toISOString(),
});
