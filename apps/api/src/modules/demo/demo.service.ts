import { Injectable } from "@nestjs/common";
import { type DemoSampleDto, type VerificationVerdict } from "@origo/shared";
import { type OrgType, type PackStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { QrSigningService } from "../qr-signing/qr-signing.service";

interface SampleSpec {
  key: string;
  title: string;
  description: string;
  expected: VerificationVerdict;
  batchNumber: string;
  ownerType: OrgType;
  status: PackStatus;
  /** Which matching pack to use, by serial order (0 = first). */
  pick: number;
  /**
   * Use the least-scanned matching pack instead (skipping the copied-label pack), so demo visits
   * don't push the genuine sample past the many-scans threshold.
   */
  leastScanned?: boolean;
  forged?: boolean;
}

const SPECS: SampleSpec[] = [
  {
    key: "genuine",
    title: "Genuine, sold by a pharmacy",
    description: "Registered, handed on twice, then dispensed to a patient.",
    expected: "VERIFIED",
    batchNumber: "AMX-2026-0101",
    ownerType: "PHARMACY",
    status: "DISPENSED",
    pick: 0,
    leastScanned: true,
  },
  {
    key: "recalled",
    title: "Recalled batch",
    description: "Genuine pack, but its batch was recalled after it reached the pharmacy.",
    expected: "WARNING",
    batchNumber: "SLB-2026-0215",
    ownerType: "PHARMACY",
    status: "IN_STOCK",
    pick: 0,
  },
  {
    key: "copied",
    title: "Copied label",
    description: "The same genuine code has been scanned 30 times in three cities.",
    expected: "WARNING",
    batchNumber: "AMX-2026-0101",
    ownerType: "PHARMACY",
    status: "DISPENSED",
    pick: 1,
  },
  {
    key: "diverted",
    title: "Never reached a pharmacy",
    description: "Genuine code for a pack still in the manufacturer's warehouse.",
    expected: "WARNING",
    batchNumber: "INS-2026-0301",
    ownerType: "MANUFACTURER",
    status: "IN_STOCK",
    pick: 0,
  },
  {
    key: "forged",
    title: "Forged code",
    description: "A real pack ID with a signature Origo never made.",
    expected: "NOT_RECOGNIZED",
    batchNumber: "AMX-2026-0101",
    ownerType: "PHARMACY",
    status: "IN_STOCK",
    pick: 0,
    forged: true,
  },
];

/** Picks real demo packs for each scenario and returns scannable URLs. Demo mode only. */
@Injectable()
export class DemoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qr: QrSigningService,
  ) {}

  async samples(): Promise<DemoSampleDto[]> {
    const results = await Promise.all(SPECS.map((spec) => this.sample(spec)));
    return results.filter((sample): sample is DemoSampleDto => sample !== null);
  }

  private async sample(spec: SampleSpec): Promise<DemoSampleDto | null> {
    const where = {
      batch: { batchNumber: spec.batchNumber },
      currentOwner: { type: spec.ownerType },
      status: spec.status,
    };
    const pack = spec.leastScanned
      ? await this.prisma.pack.findFirst({
          where: {
            ...where,
            scans: { none: { city: { not: null }, signatureValid: true, verdict: "WARNING" } },
          },
          orderBy: [{ scans: { _count: "asc" } }, { serial: "asc" }],
          select: { publicId: true },
        })
      : await this.prisma.pack.findFirst({
          where,
          orderBy: { serial: "asc" },
          skip: spec.pick,
          select: { publicId: true },
        });
    if (!pack) return null;
    const url = this.qr.verifyUrlFor(pack.publicId);
    return {
      key: spec.key,
      title: spec.title,
      description: spec.description,
      expected: spec.expected,
      publicId: pack.publicId,
      // Flip the signature's last characters: still well-formed, never valid.
      verifyUrl: spec.forged ? `${url.slice(0, -6)}AAAAAA` : url,
    };
  }
}
