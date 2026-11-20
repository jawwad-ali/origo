import { Injectable } from "@nestjs/common";
import {
  type BatchDetailDto,
  type BatchSummaryDto,
  type CreateBatchInput,
  type LabelPreviewDto,
  type ListBatchesQuery,
  type PackDto,
  type PageQuery,
  type PaginatedDto,
} from "@origo/shared";
import { Prisma } from "@prisma/client";
import { ConflictException, EntityNotFoundException } from "../../common/exceptions/domain.exceptions";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { pageWindow, toPage } from "../../common/utils/pagination";
import { dateOnly, orgIdOf } from "../../common/utils/principal";
import { PrismaService } from "../../prisma/prisma.service";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "../audit/audit-actions";
import { AuditService } from "../audit/audit.service";
import { PacksService } from "../packs/packs.service";
import { ProductsService } from "../products/products.service";
import { QrSigningService } from "../qr-signing/qr-signing.service";
import { toBatchDetailDto, toBatchSummaryDto } from "./batch.mapper";
import { type BatchRecord, BatchesRepository } from "./batches.repository";

const PRISMA_UNIQUE_VIOLATION = "P2002";
/** Registering thousands of packs over a remote database can take a few seconds. */
const REGISTRATION_TX_TIMEOUT_MS = 30_000;

@Injectable()
export class BatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly batches: BatchesRepository,
    private readonly products: ProductsService,
    private readonly packs: PacksService,
    private readonly qr: QrSigningService,
    private readonly audit: AuditService,
  ) {}

  /** Creates the batch and every pack in it atomically: either all packs exist or none do. */
  async register(
    principal: Principal,
    productId: string,
    input: CreateBatchInput,
    meta: RequestMeta,
  ): Promise<BatchDetailDto> {
    const orgId = orgIdOf(principal);
    const product = await this.products.getRecord(principal, productId);

    const batch = await this.runRegistration(async (tx) => {
      const created = await this.batches.create(
        {
          organizationId: orgId,
          productId: product.id,
          batchNumber: input.batchNumber,
          manufacturedOn: dateOnly(input.manufacturedOn),
          expiresOn: dateOnly(input.expiresOn),
          packCount: input.packCount,
          createdById: principal.userId,
        },
        tx,
      );
      await this.packs.register(
        { batchId: created.id, ownerOrgId: orgId, count: input.packCount, registeredAt: created.createdAt },
        tx,
      );
      await this.audit.record(
        {
          action: AUDIT_ACTIONS.BATCH_REGISTERED,
          entityType: AUDIT_ENTITIES.BATCH,
          entityId: created.id,
          actorUserId: principal.userId,
          actorOrgId: orgId,
          metadata: { batchNumber: created.batchNumber, packCount: created.packCount, productId: product.id },
          meta,
        },
        tx,
      );
      return created;
    }, input.batchNumber);

    return toBatchDetailDto(batch, await this.packs.idRange(batch.id));
  }

  async list(principal: Principal, query: ListBatchesQuery): Promise<PaginatedDto<BatchSummaryDto>> {
    const { items, total } = await this.batches.list(
      orgIdOf(principal),
      { ...(query.q ? { search: query.q } : {}), ...(query.productId ? { productId: query.productId } : {}) },
      pageWindow(query),
    );
    return toPage(items.map(toBatchSummaryDto), total, query);
  }

  async get(principal: Principal, id: string): Promise<BatchDetailDto> {
    const batch = await this.getRecord(principal, id);
    return toBatchDetailDto(batch, await this.packs.idRange(batch.id));
  }

  async listPacks(principal: Principal, id: string, query: PageQuery): Promise<PaginatedDto<PackDto>> {
    const batch = await this.getRecord(principal, id);
    return this.packs.listForBatch(batch.id, query);
  }

  /** The first pack's signed QR URL, so the UI can preview a real label. */
  async labelPreview(principal: Principal, id: string): Promise<LabelPreviewDto> {
    const batch = await this.getRecord(principal, id);
    const { first } = await this.packs.idRange(batch.id);
    if (!first) throw new EntityNotFoundException("Pack");
    return { publicId: first, verifyUrl: this.qr.verifyUrlFor(first) };
  }

  /** Loads a batch the caller's organization owns. Used by label exports. */
  async getRecord(principal: Principal, id: string): Promise<BatchRecord> {
    const batch = await this.batches.findForOrg(orgIdOf(principal), id);
    if (!batch) throw new EntityNotFoundException("Batch");
    return batch;
  }

  private async runRegistration(
    work: (tx: Prisma.TransactionClient) => Promise<BatchRecord>,
    batchNumber: string,
  ): Promise<BatchRecord> {
    try {
      return await this.prisma.$transaction(work, { timeout: REGISTRATION_TX_TIMEOUT_MS });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === PRISMA_UNIQUE_VIOLATION) {
        throw new ConflictException(
          "batch-exists",
          "Batch number already used",
          `Batch ${batchNumber} is already registered. Each batch number can be used once.`,
        );
      }
      throw error;
    }
  }
}
