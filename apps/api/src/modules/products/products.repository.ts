import { Injectable } from "@nestjs/common";
import { type CreateProductInput } from "@origo/shared";
import { type Prisma } from "@prisma/client";
import { type PageWindow } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";

const productWithCount = {
  _count: { select: { batches: true } },
} satisfies Prisma.ProductInclude;

export type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productWithCount }>;

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(orgId: string, createdById: string, input: CreateProductInput): Promise<ProductRecord> {
    return this.prisma.product.create({
      data: { ...input, organizationId: orgId, createdById },
      include: productWithCount,
    });
  }

  findForOrg(orgId: string, id: string): Promise<ProductRecord | null> {
    return this.prisma.product.findFirst({ where: { id, organizationId: orgId }, include: productWithCount });
  }

  async list(
    orgId: string,
    search: string | undefined,
    window: PageWindow,
  ): Promise<{ items: ProductRecord[]; total: number }> {
    const where: Prisma.ProductWhereInput = {
      organizationId: orgId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { genericName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productWithCount,
        orderBy: { createdAt: "desc" },
        ...window,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total };
  }
}
