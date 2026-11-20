import { Injectable } from "@nestjs/common";
import {
  ALLOWED_TRANSFER_TARGETS,
  type CreateTransferInput,
  type ListTransfersQuery,
  type OrgRefDto,
  type PaginatedDto,
  type TransferDetailDto,
  type TransferSummaryDto,
} from "@origo/shared";
import { Prisma } from "@prisma/client";
import { EntityNotFoundException } from "../../common/exceptions/domain.exceptions";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { pageWindow, toPage } from "../../common/utils/pagination";
import { orgIdOf } from "../../common/utils/principal";
import { PrismaService } from "../../prisma/prisma.service";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "../audit/audit-actions";
import { AuditService } from "../audit/audit.service";
import { type BatchRecord } from "../batches/batches.repository";
import { BatchesService } from "../batches/batches.service";
import { LedgerService } from "../ledger/ledger.service";
import { toOrgRef } from "../organizations/org-ref.mapper";
import {
  BatchNotSendableException,
  InsufficientStockException,
  NotAllowedRecipientException,
} from "./transfer-errors";
import { toTransferDetail, toTransferLines, toTransferSummary } from "./transfer.mapper";
import { type TransferRecord, TransfersRepository } from "./transfers.repository";

const PRISMA_UNIQUE_VIOLATION = "P2002";
const TRANSFER_TX_TIMEOUT_MS = 30_000;

@Injectable()
export class TransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transfers: TransfersRepository,
    private readonly batches: BatchesService,
    private readonly ledger: LedgerService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Sends packs: picks and locks in-stock packs per batch, marks them in transit and writes a
   * TRANSFER_SENT ledger event for each, all in one transaction. A repeated Idempotency-Key
   * returns the original transfer instead of creating a second one.
   */
  async create(
    principal: Principal,
    input: CreateTransferInput,
    idempotencyKey: string | null,
    meta: RequestMeta,
  ): Promise<TransferDetailDto> {
    const orgId = orgIdOf(principal);
    if (idempotencyKey) {
      const existing = await this.transfers.findByIdempotencyKey(orgId, idempotencyKey);
      if (existing) return this.detail(existing, orgId);
    }
    await this.assertRecipient(principal, input.toOrganizationId);
    const batches = await this.sendableBatches(input);

    try {
      const transfer = await this.prisma.$transaction(
        async (tx) => {
          const at = new Date();
          const picked = await this.pickPacks(orgId, input, batches, tx);
          const created = await this.transfers.create(
            {
              reference: await this.transfers.reserveReference(at, tx),
              fromOrgId: orgId,
              toOrgId: input.toOrganizationId,
              packCount: picked.length,
              note: input.note ?? null,
              idempotencyKey,
              createdById: principal.userId,
            },
            tx,
          );
          await this.transfers.addItems(created.id, picked, tx);
          const packIds = picked.map((item) => item.packId);
          await this.transfers.setPacks(packIds, { status: "IN_TRANSIT" }, tx);
          await this.ledger.append(
            packIds.map((packId) => ({
              packId,
              type: "TRANSFER_SENT",
              actorOrgId: orgId,
              actorUserId: principal.userId,
              counterpartyOrgId: input.toOrganizationId,
              transferId: created.id,
            })),
            at,
            tx,
          );
          await this.audit.record(
            {
              action: AUDIT_ACTIONS.TRANSFER_CREATED,
              entityType: AUDIT_ENTITIES.TRANSFER,
              entityId: created.id,
              actorUserId: principal.userId,
              actorOrgId: orgId,
              metadata: {
                reference: created.reference,
                toOrgId: input.toOrganizationId,
                packCount: picked.length,
              },
              meta,
            },
            tx,
          );
          return created;
        },
        { timeout: TRANSFER_TX_TIMEOUT_MS },
      );
      return this.detail(transfer, orgId);
    } catch (error) {
      const isRetry =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === PRISMA_UNIQUE_VIOLATION;
      const existing =
        isRetry && idempotencyKey ? await this.transfers.findByIdempotencyKey(orgId, idempotencyKey) : null;
      if (existing) return this.detail(existing, orgId);
      throw error;
    }
  }

  async list(principal: Principal, query: ListTransfersQuery): Promise<PaginatedDto<TransferSummaryDto>> {
    const { items, total } = await this.transfers.list(
      orgIdOf(principal),
      query.direction,
      query.status,
      pageWindow(query),
    );
    return toPage(items.map(toTransferSummary), total, query);
  }

  async get(principal: Principal, id: string): Promise<TransferDetailDto> {
    const orgId = orgIdOf(principal);
    const transfer = await this.transfers.findForParty(orgId, id);
    if (!transfer) throw new EntityNotFoundException("Transfer");
    return this.detail(transfer, orgId);
  }

  /** Approved organizations the caller is allowed to send stock to. */
  async recipients(principal: Principal, search: string | undefined): Promise<OrgRefDto[]> {
    const types = ALLOWED_TRANSFER_TARGETS[principal.membership?.orgType ?? "PHARMACY"];
    if (types.length === 0) return [];
    const orgs = await this.transfers.findRecipients(types, orgIdOf(principal), search);
    return orgs.map(toOrgRef);
  }

  pendingIncomingCount(principal: Principal): Promise<number> {
    return this.transfers.countPending(orgIdOf(principal));
  }

  async detail(transfer: TransferRecord, callerOrgId: string): Promise<TransferDetailDto> {
    const counts = await this.transfers.lineCounts(transfer.id);
    const batches = await this.batches.findByIds(counts.map((count) => count.batchId));
    return toTransferDetail(transfer, toTransferLines(counts, batches), callerOrgId);
  }

  private async assertRecipient(principal: Principal, recipientId: string): Promise<void> {
    const senderType = principal.membership?.orgType;
    const recipient = await this.transfers.findOrganization(recipientId);
    if (!recipient || recipient.status !== "APPROVED") {
      throw new NotAllowedRecipientException("The receiving organization isn't an approved Origo member.");
    }
    if (recipient.id === orgIdOf(principal)) {
      throw new NotAllowedRecipientException("You can't send stock to your own organization.");
    }
    if (!senderType || !ALLOWED_TRANSFER_TARGETS[senderType].includes(recipient.type)) {
      throw new NotAllowedRecipientException(
        `A ${senderType?.toLowerCase() ?? "member"} can't send stock to a ${recipient.type.toLowerCase()}.`,
      );
    }
  }

  private async sendableBatches(input: CreateTransferInput): Promise<Map<string, BatchRecord>> {
    const batches = await this.batches.findByIds(input.lines.map((line) => line.batchId));
    const byId = new Map(batches.map((batch) => [batch.id, batch]));
    const today = new Date(new Date().toISOString().slice(0, 10));
    for (const line of input.lines) {
      const batch = byId.get(line.batchId);
      if (!batch) throw new EntityNotFoundException("Batch");
      if (batch.status === "RECALLED") throw new BatchNotSendableException(batch.batchNumber, "recalled");
      if (batch.expiresOn < today) throw new BatchNotSendableException(batch.batchNumber, "expired");
    }
    return byId;
  }

  private async pickPacks(
    orgId: string,
    input: CreateTransferInput,
    batches: Map<string, BatchRecord>,
    tx: Prisma.TransactionClient,
  ): Promise<{ packId: string; batchId: string }[]> {
    const picked: { packId: string; batchId: string }[] = [];
    for (const line of input.lines) {
      const packs = await this.transfers.pickAvailablePacks(orgId, line.batchId, line.quantity, tx);
      if (packs.length < line.quantity) {
        throw new InsufficientStockException(
          batches.get(line.batchId)?.batchNumber ?? "",
          line.quantity,
          packs.length,
        );
      }
      picked.push(...packs.map((pack) => ({ packId: pack.id, batchId: line.batchId })));
    }
    return picked;
  }
}
