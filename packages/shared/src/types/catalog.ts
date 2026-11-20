import type { BatchStatus, DosageForm, LabelExportStatus, PackStatus } from "../enums";

export interface ProductDto {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  dosageForm: DosageForm;
  packSize: string;
  storageInstructions: string;
  batchCount: number;
  createdAt: string;
}

export interface BatchSummaryDto {
  id: string;
  batchNumber: string;
  manufacturedOn: string;
  expiresOn: string;
  status: BatchStatus;
  packCount: number;
  createdAt: string;
  product: Pick<ProductDto, "id" | "name" | "genericName" | "strength" | "dosageForm" | "packSize">;
}

export interface BatchDetailDto extends BatchSummaryDto {
  storageInstructions: string;
  firstPackId: string | null;
  lastPackId: string | null;
}

export interface PackDto {
  id: string;
  publicId: string;
  serial: number;
  status: PackStatus;
  createdAt: string;
}

export interface LabelExportDto {
  id: string;
  batchId: string;
  status: LabelExportStatus;
  labelCount: number;
  fileSizeBytes: number | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string | null;
}

/** A sample label the web app renders as a preview before export. */
export interface LabelPreviewDto {
  publicId: string;
  verifyUrl: string;
}

export interface LatestLabelExportDto {
  latest: LabelExportDto | null;
}
