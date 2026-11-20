import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { PACK_ID_PATTERN, type PackHistoryDto } from "@origo/shared";
import { RequireApprovedOrg } from "../../common/decorators/access.decorators";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { type Principal } from "../../common/types/principal";
import { PackHistoryService } from "./pack-history.service";

@RequireApprovedOrg()
@Controller("packs")
export class PackHistoryController {
  constructor(private readonly history: PackHistoryService) {}

  @Get(":publicId/history")
  get(
    @Param("publicId") publicId: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<PackHistoryDto> {
    const id = publicId.trim().toUpperCase();
    if (!PACK_ID_PATTERN.test(id)) throw new BadRequestException("Pack IDs look like MED-2026-000123.");
    return this.history.get(principal, id);
  }
}
