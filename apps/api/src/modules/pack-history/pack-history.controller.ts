import { BadRequestException, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { PACK_ID_PATTERN, type PackHistoryDto } from "@origo/shared";
import { OrgTypes, RequireApprovedOrg } from "../../common/decorators/access.decorators";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { ReqMeta } from "../../common/decorators/request-meta.decorator";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { DispenseService } from "./dispense.service";
import { PackHistoryService } from "./pack-history.service";

const normalizePackId = (value: string): string => {
  const id = value.trim().toUpperCase();
  if (!PACK_ID_PATTERN.test(id)) throw new BadRequestException("Pack IDs look like MED-2026-000123.");
  return id;
};

@RequireApprovedOrg()
@Controller("packs")
export class PackHistoryController {
  constructor(
    private readonly history: PackHistoryService,
    private readonly dispensing: DispenseService,
  ) {}

  @Get(":publicId/history")
  get(
    @Param("publicId") publicId: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<PackHistoryDto> {
    return this.history.get(principal, normalizePackId(publicId));
  }

  @OrgTypes("PHARMACY")
  @Post(":publicId/dispense")
  @HttpCode(HttpStatus.OK)
  dispense(
    @Param("publicId") publicId: string,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<PackHistoryDto> {
    return this.dispensing.dispense(principal, normalizePackId(publicId), meta);
  }
}
