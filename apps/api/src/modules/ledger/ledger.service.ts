import { Injectable } from "@nestjs/common";
import { type ChainCheckDto, type LedgerEventType } from "@origo/shared";
import { type LedgerEvent, type Prisma } from "@prisma/client";
import { GENESIS_HASH, hashEvent } from "./ledger-hash";
import { LedgerRepository } from "./ledger.repository";

export interface LedgerEntry {
  packId: string;
  type: LedgerEventType;
  actorOrgId: string;
  actorUserId: string | null;
  counterpartyOrgId?: string | null;
  transferId?: string | null;
}

/** Writes and checks each pack's hash-chained history. */
@Injectable()
export class LedgerService {
  constructor(private readonly ledger: LedgerRepository) {}

  /** First event of brand-new packs (no existing chain to look up). */
  async startChains(entries: LedgerEntry[], at: Date, tx: Prisma.TransactionClient): Promise<void> {
    await this.ledger.insert(
      entries.map((entry) => this.build(entry, 1, GENESIS_HASH, at)),
      tx,
    );
  }

  /**
   * Appends one event to each pack's chain. Callers must have locked the packs in this
   * transaction, so no other writer can append between reading the tail and inserting.
   */
  async append(entries: LedgerEntry[], at: Date, tx: Prisma.TransactionClient): Promise<void> {
    const tails = await this.ledger.tails(
      entries.map((entry) => entry.packId),
      tx,
    );
    await this.ledger.insert(
      entries.map((entry) => {
        const tail = tails.get(entry.packId);
        return this.build(entry, (tail?.seq ?? 0) + 1, tail?.hash ?? GENESIS_HASH, at);
      }),
      tx,
    );
  }

  history(packId: string): Promise<LedgerEvent[]> {
    return this.ledger.listForPack(packId);
  }

  involves(packId: string, orgId: string): Promise<boolean> {
    return this.ledger.involves(packId, orgId);
  }

  /** Recomputes every hash from the start; the first mismatch (or gap in seq) marks the break. */
  verify(events: LedgerEvent[]): ChainCheckDto {
    let prevHash = GENESIS_HASH;
    for (const [index, event] of events.entries()) {
      const expected = hashEvent(prevHash, {
        packId: event.packId,
        seq: event.seq,
        type: event.type,
        actorOrgId: event.actorOrgId,
        counterpartyOrgId: event.counterpartyOrgId,
        transferId: event.transferId,
        createdAt: event.createdAt,
      });
      if (event.seq !== index + 1 || event.prevHash !== prevHash || event.hash !== expected) {
        return { intact: false, eventCount: events.length, brokenAtSeq: event.seq };
      }
      prevHash = event.hash;
    }
    return { intact: true, eventCount: events.length, brokenAtSeq: null };
  }

  private build(
    entry: LedgerEntry,
    seq: number,
    prevHash: string,
    at: Date,
  ): Prisma.LedgerEventCreateManyInput {
    const fields = {
      packId: entry.packId,
      seq,
      type: entry.type,
      actorOrgId: entry.actorOrgId,
      counterpartyOrgId: entry.counterpartyOrgId ?? null,
      transferId: entry.transferId ?? null,
      createdAt: at,
    };
    return { ...fields, actorUserId: entry.actorUserId, prevHash, hash: hashEvent(prevHash, fields) };
  }
}
