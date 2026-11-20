import { Injectable } from "@nestjs/common";
import { type PackDto, type PageQuery, type PaginatedDto } from "@origo/shared";
import { type Pack, type Prisma } from "@prisma/client";
import { pageWindow, toPage } from "../../common/utils/pagination";
import { LedgerService } from "../ledger/ledger.service";
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
  constructor(
    private readonly packs: PacksRepository,
    private readonly ledger: LedgerService,
  ) {}

  /** Creates the packs and the first ledger event (REGISTERED) of each one's chain. */
  async register(command: RegisterPacksCommand, tx: Prisma.TransactionClient): Promise<number> {
    const packIds = await this.packs.register(command, tx);
    await this.ledger.startChains(
      packIds.map((packId) => ({
        packId,
        type: "REGISTERED",
        actorOrgId: command.ownerOrgId,
        actorUserId: command.registeredById,
      })),
      command.registeredAt,
      tx,
    );
    return packIds.length;
  }

  findByPublicId(publicId: string): Promise<Pack | null> {
    return this.packs.findByPublicId(publicId);
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
