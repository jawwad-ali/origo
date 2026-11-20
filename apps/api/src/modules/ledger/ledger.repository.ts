import { Injectable } from "@nestjs/common";
import { type LedgerEvent, type Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface ChainTail {
  seq: number;
  hash: string;
}

@Injectable()
export class LedgerRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** The latest event of each pack's chain. Callers must hold a lock on the packs (FOR UPDATE). */
  async tails(packIds: string[], tx: Prisma.TransactionClient): Promise<Map<string, ChainTail>> {
    if (packIds.length === 0) return new Map();
    const rows = await tx.$queryRaw<{ pack_id: string; seq: number; hash: string }[]>`
      SELECT DISTINCT ON (pack_id) pack_id, seq, hash
      FROM ledger_events
      WHERE pack_id = ANY(${packIds}::uuid[])
      ORDER BY pack_id, seq DESC
    `;
    return new Map(rows.map((row) => [row.pack_id, { seq: row.seq, hash: row.hash }]));
  }

  async insert(events: Prisma.LedgerEventCreateManyInput[], tx: Prisma.TransactionClient): Promise<void> {
    if (events.length > 0) await tx.ledgerEvent.createMany({ data: events });
  }

  listForPack(packId: string): Promise<LedgerEvent[]> {
    return this.prisma.ledgerEvent.findMany({ where: { packId }, orderBy: { seq: "asc" } });
  }

  /** True when this organization appears anywhere in the pack's history. */
  async involves(packId: string, orgId: string): Promise<boolean> {
    const count = await this.prisma.ledgerEvent.count({
      where: { packId, OR: [{ actorOrgId: orgId }, { counterpartyOrgId: orgId }] },
    });
    return count > 0;
  }
}
