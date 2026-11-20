import { Controller, Get, Query } from "@nestjs/common";
import {
  type InventoryLineDto,
  type ListProductsQuery,
  listProductsQuerySchema,
  type PaginatedDto,
} from "@origo/shared";
import { RequireApprovedOrg } from "../../common/decorators/access.decorators";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { type Principal } from "../../common/types/principal";
import { InventoryService } from "./inventory.service";

@RequireApprovedOrg()
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  /** Same query shape as product search: page, pageSize and an optional `q`. */
  @Get()
  list(
    @Query(new ZodValidationPipe(listProductsQuerySchema)) query: ListProductsQuery,
    @CurrentPrincipal() principal: Principal,
  ): Promise<PaginatedDto<InventoryLineDto>> {
    return this.inventory.list(principal, query);
  }
}
