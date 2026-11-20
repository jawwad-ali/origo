import { Injectable } from "@nestjs/common";
import { type PackStatus, type Prisma } from "@prisma/client";
import { type PageWindow } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";

export interface PackCount {
  batchId: string;
  status: PackStatus;
  count: number;
}

/** Stock an organization holds right now, by batch. Ownership comes from packs.current_owner_org_id. */
@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async heldBatchIds(
    orgId: string,
    search: string | undefined,
    window: PageWindow,
  ): Promise<{ ids: string[]; total: number }> {
    const where: Prisma.BatchWhereInput = {
      packs: { some: { currentOwnerOrgId: orgId, status: { in: ["IN_STOCK", "IN_TRANSIT"] } } },
      ...(search
        ? {
            OR: [
              { batchNumber: { contains: search, mode: "insensitive" } },
              { product: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.batch.findMany({ where, select: { id: true }, orderBy: { expiresOn: "asc" }, ...window }),
      this.prisma.batch.count({ where }),
    ]);
    return { ids: rows.map((row) => row.id), total };
  }

  async counts(orgId: string, batchIds: string[]): Promise<PackCount[]> {
    if (batchIds.length === 0) return [];
    const groups = await this.prisma.pack.groupBy({
      by: ["batchId", "status"],
      where: { currentOwnerOrgId: orgId, batchId: { in: batchIds } },
      _count: { _all: true },
    });
    return groups.map((group) => ({
      batchId: group.batchId,
      status: group.status,
      count: group._count._all,
    }));
  }
}
