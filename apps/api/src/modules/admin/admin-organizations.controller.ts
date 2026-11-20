import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import {
  type ListOrganizationsQuery,
  listOrganizationsQuerySchema,
  type OrganizationDto,
  type PaginatedDto,
  type RejectOrganizationInput,
  rejectOrganizationSchema,
} from "@origo/shared";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { PlatformAdminOnly } from "../../common/decorators/access.decorators";
import { ReqMeta } from "../../common/decorators/request-meta.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { OrganizationsService } from "../organizations/organizations.service";

@PlatformAdminOnly()
@Controller("admin/organizations")
export class AdminOrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listOrganizationsQuerySchema)) query: ListOrganizationsQuery,
  ): Promise<PaginatedDto<OrganizationDto>> {
    return this.organizations.list(query);
  }

  @Get(":id")
  get(@Param("id", ParseUUIDPipe) id: string): Promise<OrganizationDto> {
    return this.organizations.getById(id);
  }

  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  approve(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<OrganizationDto> {
    return this.organizations.review({
      organizationId: id,
      decision: "approve",
      reviewerId: principal.userId,
      meta,
    });
  }

  @Post(":id/reject")
  @HttpCode(HttpStatus.OK)
  reject(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(rejectOrganizationSchema)) body: RejectOrganizationInput,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<OrganizationDto> {
    return this.organizations.review({
      organizationId: id,
      decision: "reject",
      reviewerId: principal.userId,
      reason: body.reason,
      meta,
    });
  }

  @Post(":id/suspend")
  @HttpCode(HttpStatus.OK)
  suspend(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<OrganizationDto> {
    return this.organizations.review({
      organizationId: id,
      decision: "suspend",
      reviewerId: principal.userId,
      meta,
    });
  }
}
