import { type LabelExportDto } from "@origo/shared";
import { type LabelExport } from "@prisma/client";

export const toLabelExportDto = (record: LabelExport): LabelExportDto => ({
  id: record.id,
  batchId: record.batchId,
  status: record.status,
  labelCount: record.labelCount,
  fileSizeBytes: record.fileSizeBytes,
  error: record.error,
  createdAt: record.createdAt.toISOString(),
  completedAt: record.completedAt?.toISOString() ?? null,
  expiresAt: record.expiresAt?.toISOString() ?? null,
});
