import { Injectable } from "@nestjs/common";
import { TRANSFER_REF_PREFIX, type TransferDirection } from "@origo/shared";
import { type OrgType, type PackStatus, type Prisma, type TransferStatus } from "@prisma/client";
import { type PageWindow } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { orgRefSelect } from "../organizations/org-ref.mapper";

const transferWithParties = {
  fromOrg: { select: orgRefSelect },
  toOrg: { select: orgRefSelect },
} satisfies Prisma.TransferInclude;

export type TransferRecord = Prisma.TransferGetPayload<{ include: typeof transferWithParties }>;

export interface NewTransfer {
  reference: string;
  fromOrgId: string;
  toOrgId: string;
  packCount: number;
  note: string | null;
  idempotencyKey: string | null;
  createdById: string;
}

const REF_DIGITS = 6;

@Injectable()
export class TransfersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async reserveReference(at: Date, tx: Prisma.TransactionClient): Promise<string> {
    const [row] = await tx.$queryRaw<{ n: number }[]>`SELECT nextval('transfer_ref_seq')::int AS n`;
    return `${TRANSFER_REF_PREFIX}-${at.getUTCFullYear()}-${String(row?.n ?? 0).padStart(REF_DIGITS, "0")}`;
  }

  /**
   * Locks up to `quantity` in-stock packs of a batch that the sender owns, lowest serial first.
   * SKIP LOCKED lets two concurrent transfers from the same batch take different packs instead of waiting.
   */
  pickAvailablePacks(
    ownerOrgId: string,
    batchId: string,
    quantity: number,
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string }[]> {
    return tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM packs
      WHERE current_owner_org_id = ${ownerOrgId}::uuid AND batch_id = ${batchId}::uuid AND status = 'IN_STOCK'
      ORDER BY serial
      LIMIT ${quantity}
      FOR UPDATE SKIP LOCKED
    `;
  }

  /** Locks the transfer row so two people can't accept/reject/cancel it at the same moment. */
  async lock(id: string, tx: Prisma.TransactionClient): Promise<TransferRecord | null> {
    await tx.$queryRaw`SELECT id FROM transfers WHERE id = ${id}::uuid FOR UPDATE`;
    return tx.transfer.findUnique({ where: { id }, include: transferWithParties });
  }

  /** Locks the transfer's packs, so ledger appends for them are serialized. */
  async lockPacksOf(transferId: string, tx: Prisma.TransactionClient): Promise<string[]> {
    const rows = await tx.$queryRaw<{ id: string }[]>`
      SELECT p.id FROM packs p
      JOIN transfer_items ti ON ti.pack_id = p.id
      WHERE ti.transfer_id = ${transferId}::uuid
      ORDER BY p.id
      FOR UPDATE OF p
    `;
    return rows.map((row) => row.id);
  }

  create(data: NewTransfer, tx: Prisma.TransactionClient): Promise<TransferRecord> {
    return tx.transfer.create({ data, include: transferWithParties });
  }

  async addItems(
    transferId: string,
    items: { packId: string; batchId: string }[],
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.transferItem.createMany({ data: items.map((item) => ({ ...item, transferId })) });
  }

  async closeItems(transferId: string, tx: Prisma.TransactionClient): Promise<void> {
    await tx.transferItem.updateMany({ where: { transferId }, data: { isOpen: false } });
  }

  async setPacks(
    packIds: string[],
    data: { status: PackStatus; currentOwnerOrgId?: string },
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.pack.updateMany({ where: { id: { in: packIds } }, data });
  }

  respond(
    id: string,
    data: { status: TransferStatus; respondedById: string; rejectionReason?: string },
    tx: Prisma.TransactionClient,
  ): Promise<TransferRecord> {
    return tx.transfer.update({
      where: { id },
      data: { ...data, respondedAt: new Date() },
      include: transferWithParties,
    });
  }

  findByIdempotencyKey(fromOrgId: string, key: string): Promise<TransferRecord | null> {
    return this.prisma.transfer.findUnique({
      where: { fromOrgId_idempotencyKey: { fromOrgId, idempotencyKey: key } },
      include: transferWithParties,
    });
  }

  /** A transfer the organization sent or received; null for anyone else. */
  findForParty(orgId: string, id: string): Promise<TransferRecord | null> {
    return this.prisma.transfer.findFirst({
      where: { id, OR: [{ fromOrgId: orgId }, { toOrgId: orgId }] },
      include: transferWithParties,
    });
  }

  async lineCounts(transferId: string): Promise<{ batchId: string; quantity: number }[]> {
    const groups = await this.prisma.transferItem.groupBy({
      by: ["batchId"],
      where: { transferId },
      _count: { _all: true },
    });
    return groups.map((group) => ({ batchId: group.batchId, quantity: group._count._all }));
  }

  async list(
    orgId: string,
    direction: TransferDirection,
    status: TransferStatus | undefined,
    window: PageWindow,
  ): Promise<{ items: TransferRecord[]; total: number }> {
    const where: Prisma.TransferWhereInput = {
      ...(direction === "incoming" ? { toOrgId: orgId } : { fromOrgId: orgId }),
      ...(status ? { status } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.transfer.findMany({
        where,
        include: transferWithParties,
        orderBy: { createdAt: "desc" },
        ...window,
      }),
      this.prisma.transfer.count({ where }),
    ]);
    return { items, total };
  }

  countPending(orgId: string): Promise<number> {
    return this.prisma.transfer.count({ where: { toOrgId: orgId, status: "PENDING" } });
  }

  findOrganization(id: string) {
    return this.prisma.organization.findUnique({ where: { id }, select: { ...orgRefSelect, status: true } });
  }

  findRecipients(types: readonly OrgType[], excludeOrgId: string, search: string | undefined) {
    return this.prisma.organization.findMany({
      where: {
        status: "APPROVED",
        type: { in: [...types] },
        id: { not: excludeOrgId },
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      select: orgRefSelect,
      orderBy: { name: "asc" },
      take: 50,
    });
  }
}
