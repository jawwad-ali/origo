import { Injectable } from "@nestjs/common";
import { type LedgerEventDto, type PackHistoryDto } from "@origo/shared";
import { type LedgerEvent } from "@prisma/client";
import { EntityNotFoundException } from "../../common/exceptions/domain.exceptions";
import { type Principal } from "../../common/types/principal";
import { orgIdOf } from "../../common/utils/principal";
import { toBatchSummaryDto } from "../batches/batch.mapper";
import { BatchesService } from "../batches/batches.service";
import { LedgerService } from "../ledger/ledger.service";
import { type OrgRefRecord, toOrgRef } from "../organizations/org-ref.mapper";
import { PacksService } from "../packs/packs.service";
import { PackHistoryRepository } from "./pack-history.repository";

@Injectable()
export class PackHistoryService {
  constructor(
    private readonly packs: PacksService,
    private readonly batches: BatchesService,
    private readonly ledger: LedgerService,
    private readonly lookups: PackHistoryRepository,
  ) {}

  /**
   * A pack's full history and a fresh check of its hash chain. Visible to the current owner and to
   * every organization that has held or handled it; to anyone else the pack doesn't exist.
   */
  async get(principal: Principal, publicId: string): Promise<PackHistoryDto> {
    const orgId = orgIdOf(principal);
    const pack = await this.packs.findByPublicId(publicId);
    if (!pack) throw new EntityNotFoundException("Pack");
    if (pack.currentOwnerOrgId !== orgId && !(await this.ledger.involves(pack.id, orgId))) {
      throw new EntityNotFoundException("Pack");
    }

    const events = await this.ledger.history(pack.id);
    const orgIds = new Set<string>([pack.currentOwnerOrgId]);
    const transferIds = new Set<string>();
    for (const event of events) {
      orgIds.add(event.actorOrgId);
      if (event.counterpartyOrgId) orgIds.add(event.counterpartyOrgId);
      if (event.transferId) transferIds.add(event.transferId);
    }
    const [[batch], orgs, refs] = await Promise.all([
      this.batches.findByIds([pack.batchId]),
      this.lookups.orgsByIds([...orgIds]),
      this.lookups.transferRefsByIds([...transferIds]),
    ]);
    const owner = orgs.get(pack.currentOwnerOrgId);
    if (!batch || !owner) throw new EntityNotFoundException("Pack");

    return {
      publicId: pack.publicId,
      status: pack.status,
      currentOwner: toOrgRef(owner),
      batch: toBatchSummaryDto(batch),
      events: events.flatMap((event) => this.toEventDto(event, orgs, refs)),
      chain: this.ledger.verify(events),
    };
  }

  private toEventDto(
    event: LedgerEvent,
    orgs: Map<string, OrgRefRecord>,
    refs: Map<string, string>,
  ): LedgerEventDto[] {
    const actor = orgs.get(event.actorOrgId);
    if (!actor) return [];
    const counterparty = event.counterpartyOrgId ? orgs.get(event.counterpartyOrgId) : undefined;
    return [
      {
        seq: event.seq,
        type: event.type,
        actor: toOrgRef(actor),
        counterparty: counterparty ? toOrgRef(counterparty) : null,
        transferReference: event.transferId ? (refs.get(event.transferId) ?? null) : null,
        hash: event.hash,
        prevHash: event.prevHash,
        createdAt: event.createdAt.toISOString(),
      },
    ];
  }
}
