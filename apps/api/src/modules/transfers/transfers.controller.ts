import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import {
  type CreateTransferInput,
  createTransferSchema,
  type DirectoryQuery,
  directoryQuerySchema,
  type ListTransfersQuery,
  listTransfersQuerySchema,
  type OrgRefDto,
  type PaginatedDto,
  type RejectTransferInput,
  rejectTransferSchema,
  type TransferDetailDto,
  type TransferSummaryDto,
} from "@origo/shared";
import { RequireApprovedOrg } from "../../common/decorators/access.decorators";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { ReqMeta } from "../../common/decorators/request-meta.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { TransferResponsesService } from "./transfer-responses.service";
import { TransfersService } from "./transfers.service";

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;

/** A well-formed Idempotency-Key header, or null (malformed keys are ignored, not trusted). */
const idempotencyKeyOf = (header: string | undefined): string | null =>
  header && IDEMPOTENCY_KEY_PATTERN.test(header) ? header : null;

@RequireApprovedOrg()
@Controller("transfers")
export class TransfersController {
  constructor(
    private readonly transfers: TransfersService,
    private readonly responses: TransferResponsesService,
  ) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createTransferSchema)) body: CreateTransferInput,
    @Headers("idempotency-key") idempotencyKey: string | undefined,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<TransferDetailDto> {
    return this.transfers.create(principal, body, idempotencyKeyOf(idempotencyKey), meta);
  }

  @Get()
  list(
    @Query(new ZodValidationPipe(listTransfersQuerySchema)) query: ListTransfersQuery,
    @CurrentPrincipal() principal: Principal,
  ): Promise<PaginatedDto<TransferSummaryDto>> {
    return this.transfers.list(principal, query);
  }

  @Get("recipients")
  recipients(
    @Query(new ZodValidationPipe(directoryQuerySchema)) query: DirectoryQuery,
    @CurrentPrincipal() principal: Principal,
  ): Promise<OrgRefDto[]> {
    return this.transfers.recipients(principal, query.q);
  }

  @Get("pending-count")
  async pendingCount(@CurrentPrincipal() principal: Principal): Promise<{ count: number }> {
    return { count: await this.transfers.pendingIncomingCount(principal) };
  }

  @Get(":id")
  get(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<TransferDetailDto> {
    return this.transfers.get(principal, id);
  }

  @Post(":id/accept")
  @HttpCode(HttpStatus.OK)
  accept(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<TransferDetailDto> {
    return this.responses.respond(principal, id, "accept", meta);
  }

  @Post(":id/reject")
  @HttpCode(HttpStatus.OK)
  reject(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(rejectTransferSchema)) body: RejectTransferInput,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<TransferDetailDto> {
    return this.responses.respond(principal, id, "reject", meta, body.reason);
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  cancel(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<TransferDetailDto> {
    return this.responses.respond(principal, id, "cancel", meta);
  }
}
