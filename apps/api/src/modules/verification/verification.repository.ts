import { Injectable } from "@nestjs/common";
import { type OrgType, type Prisma, type VerificationVerdict } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

const packForVerification = {
  currentOwner: { select: { type: true } },
  batch: {
    select: {
      batchNumber: true,
      manufacturedOn: true,
      expiresOn: true,
      status: true,
      product: {
        select: {
          name: true,
          genericName: true,
          strength: true,
          dosageForm: true,
          packSize: true,
          storageInstructions: true,
        },
      },
      organization: { select: { name: true, city: true, country: true } },
    },
  },
} satisfies Prisma.PackInclude;

export type PackForVerification = Prisma.PackGetPayload<{ include: typeof packForVerification }>;

export interface NewScan {
  packId: string;
  verdict: VerificationVerdict;
  signatureValid: boolean;
  deviceHash: string | null;
  city: string | null;
  country: string | null;
}

@Injectable()
export class VerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPack(publicId: string): Promise<PackForVerification | null> {
    return this.prisma.pack.findUnique({ where: { publicId }, include: packForVerification });
  }

  /** Org types of the organizations in a pack's ledger, to tell when it first reached a pharmacy. */
  async orgTypes(orgIds: string[]): Promise<Map<string, OrgType>> {
    const orgs = await this.prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, type: true },
    });
    return new Map(orgs.map((org) => [org.id, org.type]));
  }

  /** Counts only scans of genuine codes; forged attempts are logged but don't inflate the count. */
  async scanStats(
    packId: string,
    since: Date,
  ): Promise<{ total: number; first: Date | null; recentCities: string[] }> {
    const [total, first, recent] = await Promise.all([
      this.prisma.scan.count({ where: { packId, signatureValid: true } }),
      this.prisma.scan.findFirst({
        where: { packId, signatureValid: true },
        orderBy: { scannedAt: "asc" },
        select: { scannedAt: true },
      }),
      this.prisma.scan.findMany({
        where: { packId, signatureValid: true, scannedAt: { gte: since }, city: { not: null } },
        distinct: ["city"],
        select: { city: true },
      }),
    ]);
    return {
      total,
      first: first?.scannedAt ?? null,
      recentCities: recent.flatMap((scan) => (scan.city ? [scan.city] : [])),
    };
  }

  async recordScan(scan: NewScan): Promise<void> {
    await this.prisma.scan.create({ data: scan });
  }
}
