import { Injectable } from "@nestjs/common";
import { type LabelExport, type Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

const exportWithBatch = {
  batch: {
    select: {
      id: true,
      batchNumber: true,
      expiresOn: true,
      product: { select: { name: true, strength: true, packSize: true } },
      organization: { select: { name: true } },
    },
  },
} satisfies Prisma.LabelExportInclude;

export type LabelExportWithBatch = Prisma.LabelExportGetPayload<{ include: typeof exportWithBatch }>;

export interface NewLabelExport {
  batchId: string;
  organizationId: string;
  requestedById: string;
  labelCount: number;
}

@Injectable()
export class LabelExportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewLabelExport): Promise<LabelExport> {
    return this.prisma.labelExport.create({ data });
  }

  findForOrg(orgId: string, id: string): Promise<LabelExport | null> {
    return this.prisma.labelExport.findFirst({ where: { id, organizationId: orgId } });
  }

  findLatestForBatch(orgId: string, batchId: string): Promise<LabelExport | null> {
    return this.prisma.labelExport.findFirst({
      where: { batchId, organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  /** An export already queued or running for this batch, so a double click doesn't build twice. */
  findInFlight(orgId: string, batchId: string): Promise<LabelExport | null> {
    return this.prisma.labelExport.findFirst({
      where: { batchId, organizationId: orgId, status: { in: ["QUEUED", "PROCESSING"] } },
      orderBy: { createdAt: "desc" },
    });
  }

  findWithBatch(id: string): Promise<LabelExportWithBatch | null> {
    return this.prisma.labelExport.findUnique({ where: { id }, include: exportWithBatch });
  }

  async markProcessing(id: string): Promise<void> {
    await this.prisma.labelExport.update({
      where: { id },
      data: { status: "PROCESSING", startedAt: new Date(), error: null },
    });
  }

  async markReady(id: string, file: { path: string; size: number }, expiresAt: Date): Promise<void> {
    await this.prisma.labelExport.update({
      where: { id },
      data: {
        status: "READY",
        filePath: file.path,
        fileSizeBytes: file.size,
        completedAt: new Date(),
        expiresAt,
      },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.prisma.labelExport.update({
      where: { id },
      data: { status: "FAILED", error, completedAt: new Date() },
    });
  }

  findExpiredWithFiles(now: Date): Promise<Pick<LabelExport, "id" | "filePath">[]> {
    return this.prisma.labelExport.findMany({
      where: { status: "READY", expiresAt: { lt: now }, filePath: { not: null } },
      select: { id: true, filePath: true },
    });
  }

  async clearFile(id: string): Promise<void> {
    await this.prisma.labelExport.update({ where: { id }, data: { filePath: null } });
  }
}
