import { Injectable } from "@nestjs/common";
import { type Pack, type Prisma } from "@prisma/client";
import { type PageWindow } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { formatPackId } from "./pack-id";

export interface RegisterPacksCommand {
  batchId: string;
  ownerOrgId: string;
  registeredById: string;
  count: number;
  registeredAt: Date;
}

@Injectable()
export class PacksRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reserves `count` serials from pack_serial_seq and inserts the packs in one statement.
   * Must run inside the batch's transaction so a failed registration leaves no packs behind.
   */
  async register(command: RegisterPacksCommand, tx: Prisma.TransactionClient): Promise<string[]> {
    const serials = await tx.$queryRaw<{ serial: number }[]>`
      SELECT nextval('pack_serial_seq')::int AS serial FROM generate_series(1, ${command.count}::int)
    `;
    const created = await tx.pack.createManyAndReturn({
      data: serials.map(({ serial }) => ({
        serial,
        publicId: formatPackId(serial, command.registeredAt),
        batchId: command.batchId,
        currentOwnerOrgId: command.ownerOrgId,
      })),
      select: { id: true },
    });
    return created.map((pack) => pack.id);
  }

  findByPublicId(publicId: string): Promise<Pack | null> {
    return this.prisma.pack.findUnique({ where: { publicId } });
  }

  async listForBatch(batchId: string, window: PageWindow): Promise<{ items: Pack[]; total: number }> {
    const where: Prisma.PackWhereInput = { batchId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.pack.findMany({ where, orderBy: { serial: "asc" }, ...window }),
      this.prisma.pack.count({ where }),
    ]);
    return { items, total };
  }

  /** First and last pack IDs of a batch (serials are contiguous per registration, ordered either way). */
  async idRange(batchId: string): Promise<{ first: string | null; last: string | null }> {
    const [first, last] = await Promise.all([
      this.prisma.pack.findFirst({
        where: { batchId },
        orderBy: { serial: "asc" },
        select: { publicId: true },
      }),
      this.prisma.pack.findFirst({
        where: { batchId },
        orderBy: { serial: "desc" },
        select: { publicId: true },
      }),
    ]);
    return { first: first?.publicId ?? null, last: last?.publicId ?? null };
  }

  /** Pack IDs of a batch in print order, streamed in pages so a large batch never sits in memory at once. */
  async *publicIdsInPages(batchId: string, pageSize: number): AsyncGenerator<string[]> {
    let cursor: number | undefined;
    for (;;) {
      const page = await this.prisma.pack.findMany({
        where: { batchId, ...(cursor === undefined ? {} : { serial: { gt: cursor } }) },
        orderBy: { serial: "asc" },
        select: { publicId: true, serial: true },
        take: pageSize,
      });
      if (page.length === 0) return;
      yield page.map((pack) => pack.publicId);
      cursor = page[page.length - 1]?.serial;
    }
  }
}
