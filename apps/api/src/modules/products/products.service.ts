import { Injectable } from "@nestjs/common";
import {
  type CreateProductInput,
  type ListProductsQuery,
  type PaginatedDto,
  type ProductDto,
} from "@origo/shared";
import { Prisma } from "@prisma/client";
import { ConflictException, EntityNotFoundException } from "../../common/exceptions/domain.exceptions";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { pageWindow, toPage } from "../../common/utils/pagination";
import { orgIdOf } from "../../common/utils/principal";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "../audit/audit-actions";
import { AuditService } from "../audit/audit.service";
import { toProductDto } from "./product.mapper";
import { type ProductRecord, ProductsRepository } from "./products.repository";

const PRISMA_UNIQUE_VIOLATION = "P2002";

@Injectable()
export class ProductsService {
  constructor(
    private readonly products: ProductsRepository,
    private readonly audit: AuditService,
  ) {}

  async create(principal: Principal, input: CreateProductInput, meta: RequestMeta): Promise<ProductDto> {
    const orgId = orgIdOf(principal);
    let product: ProductRecord;
    try {
      product = await this.products.create(orgId, principal.userId, input);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === PRISMA_UNIQUE_VIOLATION) {
        throw new ConflictException(
          "product-exists",
          "Product already exists",
          `You already have ${input.name} ${input.strength} in this dosage form.`,
        );
      }
      throw error;
    }
    await this.audit.record({
      action: AUDIT_ACTIONS.PRODUCT_CREATED,
      entityType: AUDIT_ENTITIES.PRODUCT,
      entityId: product.id,
      actorUserId: principal.userId,
      actorOrgId: orgId,
      metadata: { name: product.name, strength: product.strength },
      meta,
    });
    return toProductDto(product);
  }

  async list(principal: Principal, query: ListProductsQuery): Promise<PaginatedDto<ProductDto>> {
    const { items, total } = await this.products.list(orgIdOf(principal), query.q, pageWindow(query));
    return toPage(items.map(toProductDto), total, query);
  }

  async get(principal: Principal, id: string): Promise<ProductDto> {
    return toProductDto(await this.getRecord(principal, id));
  }

  /** Loads a product the caller's organization owns. Used by other modules (batch registration). */
  async getRecord(principal: Principal, id: string): Promise<ProductRecord> {
    const product = await this.products.findForOrg(orgIdOf(principal), id);
    if (!product) throw new EntityNotFoundException("Product");
    return product;
  }
}
