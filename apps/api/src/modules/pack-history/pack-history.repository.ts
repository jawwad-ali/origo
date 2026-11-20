import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { type OrgRefRecord, orgRefSelect } from "../organizations/org-ref.mapper";

/** Lookups that turn the IDs stored in ledger events into names for display. */
@Injectable()
export class PackHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async orgsByIds(ids: string[]): Promise<Map<string, OrgRefRecord>> {
    const orgs = await this.prisma.organization.findMany({
      where: { id: { in: ids } },
      select: orgRefSelect,
    });
    return new Map(orgs.map((org) => [org.id, org]));
  }

  async transferRefsByIds(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const transfers = await this.prisma.transfer.findMany({
      where: { id: { in: ids } },
      select: { id: true, reference: true },
    });
    return new Map(transfers.map((transfer) => [transfer.id, transfer.reference]));
  }
}
