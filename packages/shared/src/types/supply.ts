import type { LedgerEventType, OrgType, PackStatus, TransferStatus } from "../enums";
import type { BatchSummaryDto } from "./catalog";

/** An organization as other participants see it (no license or review details). */
export interface OrgRefDto {
  id: string;
  name: string;
  type: OrgType;
  city: string;
  country: string;
}

export interface InventoryLineDto {
  batch: BatchSummaryDto;
  inStock: number;
  inTransit: number;
}

export interface TransferLineDto {
  batchId: string;
  batchNumber: string;
  productName: string;
  strength: string;
  expiresOn: string;
  quantity: number;
}

export interface TransferSummaryDto {
  id: string;
  reference: string;
  status: TransferStatus;
  from: OrgRefDto;
  to: OrgRefDto;
  packCount: number;
  note: string | null;
  rejectionReason: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface TransferDetailDto extends TransferSummaryDto {
  lines: TransferLineDto[];
  /** What the caller may do with this transfer right now. */
  actions: { accept: boolean; reject: boolean; cancel: boolean };
}

export interface LedgerEventDto {
  seq: number;
  type: LedgerEventType;
  actor: OrgRefDto;
  counterparty: OrgRefDto | null;
  transferReference: string | null;
  hash: string;
  prevHash: string;
  createdAt: string;
}

export interface ChainCheckDto {
  intact: boolean;
  eventCount: number;
  /** The first event whose hash doesn't match, when the chain is broken. */
  brokenAtSeq: number | null;
}

export interface PackHistoryDto {
  publicId: string;
  status: PackStatus;
  currentOwner: OrgRefDto;
  batch: BatchSummaryDto;
  events: LedgerEventDto[];
  chain: ChainCheckDto;
}
