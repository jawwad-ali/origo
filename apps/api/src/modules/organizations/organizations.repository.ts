import { Injectable } from "@nestjs/common";
import { type OrganizationInput } from "@origo/shared";
import { type Organization, type OrgStatus, type Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface ListOrganizationsFilter {
  status?: OrgStatus;
  skip: number;
  take: number;
}

export interface ReviewUpdate {
  status: OrgStatus;
  reviewedById: string;
  rejectionReason: string | null;
}

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  licenseTaken(
    country: string,
    licenseNumber: string,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<boolean> {
    return tx.organization.count({ where: { country, licenseNumber } }).then((count) => count > 0);
  }

  createWithOwner(
    input: OrganizationInput,
    ownerUserId: string,
    tx: Prisma.TransactionClient,
  ): Promise<Organization> {
    return tx.organization.create({
      data: { ...input, memberships: { create: { userId: ownerUserId, role: "OWNER" } } },
    });
  }

  findById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  async list(filter: ListOrganizationsFilter): Promise<{ items: Organization[]; total: number }> {
    const where: Prisma.OrganizationWhereInput = filter.status ? { status: filter.status } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: filter.skip,
        take: filter.take,
      }),
      this.prisma.organization.count({ where }),
    ]);
    return { items, total };
  }

  updateReview(id: string, update: ReviewUpdate, tx: Prisma.TransactionClient): Promise<Organization> {
    return tx.organization.update({
      where: { id },
      data: { ...update, reviewedAt: new Date() },
    });
  }
}
