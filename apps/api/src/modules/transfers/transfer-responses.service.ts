import { Injectable } from "@nestjs/common";
import { type LedgerEventType, type TransferDetailDto } from "@origo/shared";
import { type TransferStatus } from "@prisma/client";
import { EntityNotFoundException, ForbiddenActionException } from "../../common/exceptions/domain.exceptions";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { orgIdOf } from "../../common/utils/principal";
import { PrismaService } from "../../prisma/prisma.service";
import { AUDIT_ACTIONS, AUDIT_ENTITIES, type AuditAction } from "../audit/audit-actions";
import { AuditService } from "../audit/audit.service";
import { LedgerService } from "../ledger/ledger.service";
import { TransferNotPendingException } from "./transfer-errors";
import { TransfersRepository } from "./transfers.repository";
import { TransfersService } from "./transfers.service";

export type TransferDecision = "accept" | "reject" | "cancel";

interface DecisionRule {
  /** Who may take this decision. */
  by: "receiver" | "sender";
  status: TransferStatus;
  ledger: LedgerEventType;
  audit: AuditAction;
  /** Accepting hands the packs to the receiver; rejecting or cancelling returns them to the sender. */
  newOwner: "receiver" | "sender";
}

const RULES: Record<TransferDecision, DecisionRule> = {
  accept: {
    by: "receiver",
    status: "ACCEPTED",
    ledger: "TRANSFER_RECEIVED",
    audit: AUDIT_ACTIONS.TRANSFER_ACCEPTED,
    newOwner: "receiver",
  },
  reject: {
    by: "receiver",
    status: "REJECTED",
    ledger: "TRANSFER_REJECTED",
    audit: AUDIT_ACTIONS.TRANSFER_REJECTED,
    newOwner: "sender",
  },
  cancel: {
    by: "sender",
    status: "CANCELLED",
    ledger: "TRANSFER_CANCELLED",
    audit: AUDIT_ACTIONS.TRANSFER_CANCELLED,
    newOwner: "sender",
  },
};

const RESPONSE_TX_TIMEOUT_MS = 30_000;

/** Closes a pending transfer: accept (ownership moves), reject or cancel (packs go back to the sender). */
@Injectable()
export class TransferResponsesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transfers: TransfersRepository,
    private readonly transfersService: TransfersService,
    private readonly ledger: LedgerService,
    private readonly audit: AuditService,
  ) {}

  async respond(
    principal: Principal,
    id: string,
    decision: TransferDecision,
    meta: RequestMeta,
    reason?: string,
  ): Promise<TransferDetailDto> {
    const orgId = orgIdOf(principal);
    const rule = RULES[decision];

    const updated = await this.prisma.$transaction(
      async (tx) => {
        const transfer = await this.transfers.lock(id, tx);
        if (!transfer || (transfer.fromOrgId !== orgId && transfer.toOrgId !== orgId)) {
          throw new EntityNotFoundException("Transfer");
        }
        const isReceiver = transfer.toOrgId === orgId;
        if ((rule.by === "receiver") !== isReceiver) {
          throw new ForbiddenActionException(
            rule.by === "receiver"
              ? "Only the receiving organization can do this."
              : "Only the sender can cancel.",
          );
        }
        if (transfer.status !== "PENDING") throw new TransferNotPendingException(transfer.status);

        const at = new Date();
        const packIds = await this.transfers.lockPacksOf(transfer.id, tx);
        const ownerId = rule.newOwner === "receiver" ? transfer.toOrgId : transfer.fromOrgId;
        await this.transfers.setPacks(packIds, { status: "IN_STOCK", currentOwnerOrgId: ownerId }, tx);
        await this.transfers.closeItems(transfer.id, tx);
        await this.ledger.append(
          packIds.map((packId) => ({
            packId,
            type: rule.ledger,
            actorOrgId: orgId,
            actorUserId: principal.userId,
            counterpartyOrgId: isReceiver ? transfer.fromOrgId : transfer.toOrgId,
            transferId: transfer.id,
          })),
          at,
          tx,
        );
        const result = await this.transfers.respond(
          transfer.id,
          {
            status: rule.status,
            respondedById: principal.userId,
            ...(reason ? { rejectionReason: reason } : {}),
          },
          tx,
        );
        await this.audit.record(
          {
            action: rule.audit,
            entityType: AUDIT_ENTITIES.TRANSFER,
            entityId: transfer.id,
            actorUserId: principal.userId,
            actorOrgId: orgId,
            metadata: {
              reference: transfer.reference,
              packCount: packIds.length,
              ...(reason ? { reason } : {}),
            },
            meta,
          },
          tx,
        );
        return result;
      },
      { timeout: RESPONSE_TX_TIMEOUT_MS },
    );
    return this.transfersService.detail(updated, orgId);
  }
}
