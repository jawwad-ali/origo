import { randomBytes } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import { type TransferLineInput } from "@origo/shared";
import { type Principal } from "../common/types/principal";
import { type RequestMeta } from "../common/types/request-meta";
import { BatchesService } from "../modules/batches/batches.service";
import { DispenseService } from "../modules/pack-history/dispense.service";
import { ProductsService } from "../modules/products/products.service";
import { TransferResponsesService } from "../modules/transfers/transfer-responses.service";
import { TransfersService } from "../modules/transfers/transfers.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  CLONE_SCAN_CITIES,
  DEMO_MARKER_BATCH,
  DEMO_ORG_EMAILS,
  DEMO_PRODUCTS,
  type DemoRole,
} from "./demo-world";

const DAY_MS = 86_400_000;
/** Over 25 genuine scans triggers the "copied label" warning; spread over about three days. */
const CLONE_SCAN_COUNT = 30;
const CLONE_SCAN_SPACING_MINUTES = 140;
const META: RequestMeta = { ip: null, userAgent: "origo-demo-seed", requestId: null };

const isoDay = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);

/** Builds the demo world through the same services the API uses, so every rule and hash is real. */
@Injectable()
export class DemoSeedService {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
    private readonly batches: BatchesService,
    private readonly transfers: TransfersService,
    private readonly responses: TransferResponsesService,
    private readonly dispensing: DispenseService,
  ) {}

  async run(): Promise<void> {
    if (await this.prisma.batch.findFirst({ where: { batchNumber: DEMO_MARKER_BATCH } })) {
      this.logger.log("Demo world already exists; nothing to do.");
      return;
    }
    const who = await this.principals();
    const batchIds = await this.registerBatches(who.manufacturer);
    const line = (key: string, quantity: number): TransferLineInput => ({
      batchId: batchIds[key] ?? "",
      quantity,
    });

    await this.send(
      who.manufacturer,
      who.distributor,
      [line("amoxarel", 300), line("ibuvant", 100), line("salbrio", 80), line("insulin", 60)],
      "accept",
    );
    await this.send(who.distributor, who.wholesaler, [line("amoxarel", 120)], "accept");
    await this.send(who.wholesaler, who.pharmacy, [line("amoxarel", 60)], "accept");
    await this.send(who.distributor, who.pharmacy, [line("salbrio", 40), line("insulin", 30)], "accept");
    await this.send(who.distributor, who.pharmacy, [line("amoxarel", 25)], "reject");
    await this.send(who.manufacturer, who.distributor, [line("amoxarel", 30)], "cancel");
    await this.send(
      who.manufacturer,
      who.distributor,
      [line("ibuvant", 50)],
      "pending",
      "Restock for the Lahore depot.",
    );
    await this.send(
      who.distributor,
      who.wholesaler,
      [line("insulin", 20)],
      "pending",
      "Cold box, keep at 2–8°C on arrival.",
    );

    const dispensed = await this.dispense(who.pharmacy, batchIds.amoxarel ?? "", 8);
    await this.prisma.batch.update({ where: { id: batchIds.salbrio }, data: { status: "RECALLED" } });
    await this.simulateScans(dispensed);
    this.logger.log("Demo world created.");
  }

  private async principals(): Promise<Record<DemoRole, Principal>> {
    const entries = await Promise.all(
      (Object.entries(DEMO_ORG_EMAILS) as [DemoRole, string][]).map(async ([role, email]) => {
        const user = await this.prisma.user.findUnique({
          where: { email },
          include: { membership: { include: { organization: true } } },
        });
        const org = user?.membership?.organization;
        if (!user || !org || org.status !== "APPROVED") {
          throw new Error(`Demo user ${email} is missing or not approved. Run "pnpm db:seed" first.`);
        }
        const principal: Principal = {
          userId: user.id,
          email: user.email,
          isPlatformAdmin: false,
          membership: {
            organizationId: org.id,
            role: user.membership?.role ?? "OWNER",
            orgType: org.type,
            orgStatus: org.status,
          },
        };
        return [role, principal] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<DemoRole, Principal>;
  }

  private async registerBatches(manufacturer: Principal): Promise<Record<string, string>> {
    const ids: Record<string, string> = {};
    for (const demo of DEMO_PRODUCTS) {
      const existing = await this.prisma.product.findFirst({
        where: {
          organizationId: manufacturer.membership?.organizationId,
          name: demo.input.name,
          strength: demo.input.strength,
        },
      });
      const productId = existing?.id ?? (await this.products.create(manufacturer, demo.input, META)).id;
      const batch = await this.batches.register(
        manufacturer,
        productId,
        {
          batchNumber: demo.batch.batchNumber,
          manufacturedOn: isoDay(-demo.batch.manufacturedDaysAgo),
          expiresOn: isoDay(demo.batch.expiresInDays),
          packCount: demo.batch.packCount,
        },
        META,
      );
      ids[demo.key] = batch.id;
    }
    return ids;
  }

  private async send(
    from: Principal,
    to: Principal,
    lines: TransferLineInput[],
    outcome: "accept" | "reject" | "cancel" | "pending",
    note?: string,
  ): Promise<void> {
    const transfer = await this.transfers.create(
      from,
      { toOrganizationId: to.membership?.organizationId ?? "", lines, ...(note ? { note } : {}) },
      null,
      META,
    );
    if (outcome === "accept") await this.responses.respond(to, transfer.id, "accept", META);
    if (outcome === "reject") {
      await this.responses.respond(to, transfer.id, "reject", META, "Two cartons arrived with broken seals.");
    }
    if (outcome === "cancel") await this.responses.respond(from, transfer.id, "cancel", META);
  }

  private async dispense(pharmacy: Principal, batchId: string, count: number): Promise<string[]> {
    const packs = await this.prisma.pack.findMany({
      where: { batchId, currentOwnerOrgId: pharmacy.membership?.organizationId, status: "IN_STOCK" },
      orderBy: { serial: "asc" },
      take: count,
      select: { publicId: true },
    });
    for (const pack of packs) await this.dispensing.dispense(pharmacy, pack.publicId, META);
    return packs.map((pack) => pack.publicId);
  }

  /**
   * One normal patient scan, and one "copied label": 30 scans across three cities over three days,
   * so its warning (too many scans) doesn't fade when the 24-hour city window passes.
   */
  private async simulateScans(dispensed: string[]): Promise<void> {
    const [genuine, cloned] = dispensed;
    const scan = async (
      publicId: string | undefined,
      city: string,
      country: string,
      minutesAgo: number,
      verdict: "VERIFIED" | "WARNING",
    ) => {
      const pack = publicId ? await this.prisma.pack.findUnique({ where: { publicId } }) : null;
      if (!pack) return;
      await this.prisma.scan.create({
        data: {
          packId: pack.id,
          verdict,
          signatureValid: true,
          deviceHash: randomBytes(32).toString("hex"),
          city,
          country,
          scannedAt: new Date(Date.now() - minutesAgo * 60_000),
        },
      });
    };
    await scan(genuine, "Islamabad", "PK", 90, "VERIFIED");
    for (let index = 0; index < CLONE_SCAN_COUNT; index += 1) {
      const place = CLONE_SCAN_CITIES[index % CLONE_SCAN_CITIES.length] ?? CLONE_SCAN_CITIES[0];
      await scan(cloned, place.city, place.country, (index + 1) * CLONE_SCAN_SPACING_MINUTES, "WARNING");
    }
  }
}
