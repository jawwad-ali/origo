import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import {
  type BatchDetailDto,
  type BatchSummaryDto,
  type CreateBatchInput,
  createBatchSchema,
  type LabelPreviewDto,
  type ListBatchesQuery,
  listBatchesQuerySchema,
  type PackDto,
  type PageQuery,
  pageQuerySchema,
  type PaginatedDto,
} from "@origo/shared";
import { OrgTypes } from "../../common/decorators/access.decorators";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { ReqMeta } from "../../common/decorators/request-meta.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { BatchesService } from "./batches.service";

@OrgTypes("MANUFACTURER")
@Controller()
export class BatchesController {
  constructor(private readonly batches: BatchesService) {}

  @Post("products/:productId/batches")
  register(
    @Param("productId", ParseUUIDPipe) productId: string,
    @Body(new ZodValidationPipe(createBatchSchema)) body: CreateBatchInput,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<BatchDetailDto> {
    return this.batches.register(principal, productId, body, meta);
  }

  @Get("batches")
  list(
    @Query(new ZodValidationPipe(listBatchesQuerySchema)) query: ListBatchesQuery,
    @CurrentPrincipal() principal: Principal,
  ): Promise<PaginatedDto<BatchSummaryDto>> {
    return this.batches.list(principal, query);
  }

  @Get("batches/:id")
  get(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<BatchDetailDto> {
    return this.batches.get(principal, id);
  }

  @Get("batches/:id/packs")
  packs(
    @Param("id", ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(pageQuerySchema)) query: PageQuery,
    @CurrentPrincipal() principal: Principal,
  ): Promise<PaginatedDto<PackDto>> {
    return this.batches.listPacks(principal, id, query);
  }

  @Get("batches/:id/label-preview")
  labelPreview(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<LabelPreviewDto> {
    return this.batches.labelPreview(principal, id);
  }
}
