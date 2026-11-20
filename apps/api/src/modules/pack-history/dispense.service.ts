import { Injectable } from "@nestjs/common";
import { type PackHistoryDto } from "@origo/shared";
import { EntityNotFoundException, InvalidStateException } from "../../common/exceptions/domain.exceptions";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { orgIdOf } from "../../common/utils/principal";
import { PrismaService } from "../../prisma/prisma.service";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "../audit/audit-actions";
import { AuditService } from "../audit/audit.service";
import { LedgerService } from "../ledger/ledger.service";
import { PackHistoryService } from "./pack-history.service";

interface LockedPack {
  id: string;
  status: string;
  current_owner_org_id: string;
  batch_status: string;
  expires_on: Date;
}

/** A pharmacy hands a pack to a patient: status becomes DISPENSED and the ledger records it. */
@Injectable()
export class DispenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly history: PackHistoryService,
    private readonly audit: AuditService,
  ) {}

  async dispense(principal: Principal, publicId: string, meta: RequestMeta): Promise<PackHistoryDto> {
    const orgId = orgIdOf(principal);
    await this.prisma.$transaction(async (tx) => {
      const [pack] = await tx.$queryRaw<LockedPack[]>`
        SELECT p.id, p.status, p.current_owner_org_id, b.status AS batch_status, b.expires_on
        FROM packs p JOIN batches b ON b.id = p.batch_id
        WHERE p.public_id = ${publicId}
        FOR UPDATE OF p
      `;
      if (!pack || pack.current_owner_org_id !== orgId) throw new EntityNotFoundException("Pack");
      if (pack.status !== "IN_STOCK") {
        throw new InvalidStateException(
          "pack-not-in-stock",
          "Can't dispense this pack",
          `This pack is ${pack.status.toLowerCase().replace("_", " ")}, not in your stock.`,
        );
      }
      if (pack.batch_status === "RECALLED") {
        throw new InvalidStateException(
          "batch-recalled",
          "Batch is recalled",
          "Recalled packs must not be dispensed.",
        );
      }
      if (pack.expires_on < new Date(new Date().toISOString().slice(0, 10))) {
        throw new InvalidStateException(
          "batch-expired",
          "Pack has expired",
          "Expired packs must not be dispensed.",
        );
      }

      const at = new Date();
      await tx.pack.update({ where: { id: pack.id }, data: { status: "DISPENSED" } });
      await this.ledger.append(
        [{ packId: pack.id, type: "DISPENSED", actorOrgId: orgId, actorUserId: principal.userId }],
        at,
        tx,
      );
      await this.audit.record(
        {
          action: AUDIT_ACTIONS.PACK_DISPENSED,
          entityType: AUDIT_ENTITIES.PACK,
          entityId: pack.id,
          actorUserId: principal.userId,
          actorOrgId: orgId,
          metadata: { publicId },
          meta,
        },
        tx,
      );
    });
    return this.history.get(principal, publicId);
  }
}
