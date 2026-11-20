import { Injectable } from "@nestjs/common";
import { type InventoryLineDto, type PageQuery, type PaginatedDto } from "@origo/shared";
import { type Principal } from "../../common/types/principal";
import { pageWindow, toPage } from "../../common/utils/pagination";
import { orgIdOf } from "../../common/utils/principal";
import { toBatchSummaryDto } from "../batches/batch.mapper";
import { BatchesService } from "../batches/batches.service";
import { InventoryRepository } from "./inventory.repository";

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventory: InventoryRepository,
    private readonly batches: BatchesService,
  ) {}

  /** Batches the caller holds packs of, soonest expiry first, with in-stock and in-transit counts. */
  async list(
    principal: Principal,
    query: PageQuery & { q?: string },
  ): Promise<PaginatedDto<InventoryLineDto>> {
    const orgId = orgIdOf(principal);
    const { ids, total } = await this.inventory.heldBatchIds(orgId, query.q, pageWindow(query));
    const [batches, counts] = await Promise.all([
      this.batches.findByIds(ids),
      this.inventory.counts(orgId, ids),
    ]);
    const byId = new Map(batches.map((batch) => [batch.id, batch]));

    const lines = ids.flatMap((id) => {
      const batch = byId.get(id);
      if (!batch) return [];
      const of = (status: string): number =>
        counts.find((count) => count.batchId === id && count.status === status)?.count ?? 0;
      return [{ batch: toBatchSummaryDto(batch), inStock: of("IN_STOCK"), inTransit: of("IN_TRANSIT") }];
    });
    return toPage(lines, total, query);
  }
}
