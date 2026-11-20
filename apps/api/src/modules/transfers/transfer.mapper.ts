import { type TransferDetailDto, type TransferLineDto, type TransferSummaryDto } from "@origo/shared";
import { toIsoDate } from "../../common/utils/principal";
import { type BatchRecord } from "../batches/batches.repository";
import { toOrgRef } from "../organizations/org-ref.mapper";
import { type TransferRecord } from "./transfers.repository";

export const toTransferSummary = (transfer: TransferRecord): TransferSummaryDto => ({
  id: transfer.id,
  reference: transfer.reference,
  status: transfer.status,
  from: toOrgRef(transfer.fromOrg),
  to: toOrgRef(transfer.toOrg),
  packCount: transfer.packCount,
  note: transfer.note,
  rejectionReason: transfer.rejectionReason,
  createdAt: transfer.createdAt.toISOString(),
  respondedAt: transfer.respondedAt?.toISOString() ?? null,
});

export const toTransferLines = (
  counts: { batchId: string; quantity: number }[],
  batches: BatchRecord[],
): TransferLineDto[] => {
  const byId = new Map(batches.map((batch) => [batch.id, batch]));
  return counts.flatMap(({ batchId, quantity }) => {
    const batch = byId.get(batchId);
    if (!batch) return [];
    return [
      {
        batchId,
        batchNumber: batch.batchNumber,
        productName: batch.product.name,
        strength: batch.product.strength,
        expiresOn: toIsoDate(batch.expiresOn),
        quantity,
      },
    ];
  });
};

export const toTransferDetail = (
  transfer: TransferRecord,
  lines: TransferLineDto[],
  callerOrgId: string,
): TransferDetailDto => {
  const pending = transfer.status === "PENDING";
  const isReceiver = transfer.toOrgId === callerOrgId;
  return {
    ...toTransferSummary(transfer),
    lines,
    actions: { accept: pending && isReceiver, reject: pending && isReceiver, cancel: pending && !isReceiver },
  };
};
