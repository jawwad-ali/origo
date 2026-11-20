import { Injectable } from "@nestjs/common";
import { type Prisma } from "@prisma/client";
import { type PageWindow } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";

const batchWithProduct = {
  product: {
    select: {
      id: true,
      name: true,
      genericName: true,
      strength: true,
      dosageForm: true,
      packSize: true,
      storageInstructions: true,
    },
  },
} satisfies Prisma.BatchInclude;

export type BatchRecord = Prisma.BatchGetPayload<{ include: typeof batchWithProduct }>;

export interface NewBatch {
  organizationId: string;
  productId: string;
  batchNumber: string;
  manufacturedOn: Date;
  expiresOn: Date;
  packCount: number;
  createdById: string;
}

export interface BatchFilter {
  search?: string;
  productId?: string;
}

@Injectable()
export class BatchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewBatch, tx: Prisma.TransactionClient): Promise<BatchRecord> {
    return tx.batch.create({ data, include: batchWithProduct });
  }

  /** Not org-scoped: for stock held by distributors and pharmacies, access is checked via pack ownership. */
  findByIds(ids: string[]): Promise<BatchRecord[]> {
    return this.prisma.batch.findMany({ where: { id: { in: ids } }, include: batchWithProduct });
  }

  findForOrg(orgId: string, id: string): Promise<BatchRecord | null> {
    return this.prisma.batch.findFirst({ where: { id, organizationId: orgId }, include: batchWithProduct });
  }

  async list(
    orgId: string,
    filter: BatchFilter,
    window: PageWindow,
  ): Promise<{ items: BatchRecord[]; total: number }> {
    const where: Prisma.BatchWhereInput = {
      organizationId: orgId,
      ...(filter.productId ? { productId: filter.productId } : {}),
      ...(filter.search
        ? {
            OR: [
              { batchNumber: { contains: filter.search, mode: "insensitive" } },
              { product: { name: { contains: filter.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.batch.findMany({
        where,
        include: batchWithProduct,
        orderBy: { createdAt: "desc" },
        ...window,
      }),
      this.prisma.batch.count({ where }),
    ]);
    return { items, total };
  }
}
