import { type BatchDetailDto, type BatchSummaryDto } from "@origo/shared";
import { toIsoDate } from "../../common/utils/principal";
import { type BatchRecord } from "./batches.repository";

export const toBatchSummaryDto = (batch: BatchRecord): BatchSummaryDto => ({
  id: batch.id,
  batchNumber: batch.batchNumber,
  manufacturedOn: toIsoDate(batch.manufacturedOn),
  expiresOn: toIsoDate(batch.expiresOn),
  status: batch.status,
  packCount: batch.packCount,
  createdAt: batch.createdAt.toISOString(),
  product: {
    id: batch.product.id,
    name: batch.product.name,
    genericName: batch.product.genericName,
    strength: batch.product.strength,
    dosageForm: batch.product.dosageForm,
    packSize: batch.product.packSize,
  },
});

export const toBatchDetailDto = (
  batch: BatchRecord,
  range: { first: string | null; last: string | null },
): BatchDetailDto => ({
  ...toBatchSummaryDto(batch),
  storageInstructions: batch.product.storageInstructions,
  firstPackId: range.first,
  lastPackId: range.last,
});
