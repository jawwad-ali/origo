import { Injectable } from "@nestjs/common";
import { type PackDto, type PageQuery, type PaginatedDto } from "@origo/shared";
import { type Pack, type Prisma } from "@prisma/client";
import { pageWindow, toPage } from "../../common/utils/pagination";
import { PacksRepository, type RegisterPacksCommand } from "./packs.repository";

const toPackDto = (pack: Pack): PackDto => ({
  id: pack.id,
  publicId: pack.publicId,
  serial: pack.serial,
  status: pack.status,
  createdAt: pack.createdAt.toISOString(),
});

@Injectable()
export class PacksService {
  constructor(private readonly packs: PacksRepository) {}

  register(command: RegisterPacksCommand, tx: Prisma.TransactionClient): Promise<number> {
    return this.packs.register(command, tx);
  }

  /** Callers must have checked the batch belongs to the caller's organization. */
  async listForBatch(batchId: string, query: PageQuery): Promise<PaginatedDto<PackDto>> {
    const { items, total } = await this.packs.listForBatch(batchId, pageWindow(query));
    return toPage(items.map(toPackDto), total, query);
  }

  idRange(batchId: string): Promise<{ first: string | null; last: string | null }> {
    return this.packs.idRange(batchId);
  }

  publicIdsInPages(batchId: string, pageSize: number): AsyncGenerator<string[]> {
    return this.packs.publicIdsInPages(batchId, pageSize);
  }
}
