import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import {
  type CreateProductInput,
  createProductSchema,
  type ListProductsQuery,
  listProductsQuerySchema,
  type PaginatedDto,
  type ProductDto,
} from "@origo/shared";
import { OrgTypes } from "../../common/decorators/access.decorators";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { ReqMeta } from "../../common/decorators/request-meta.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { ProductsService } from "./products.service";

@OrgTypes("MANUFACTURER")
@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createProductSchema)) body: CreateProductInput,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<ProductDto> {
    return this.products.create(principal, body, meta);
  }

  @Get()
  list(
    @Query(new ZodValidationPipe(listProductsQuerySchema)) query: ListProductsQuery,
    @CurrentPrincipal() principal: Principal,
  ): Promise<PaginatedDto<ProductDto>> {
    return this.products.list(principal, query);
  }

  @Get(":id")
  get(@Param("id", ParseUUIDPipe) id: string, @CurrentPrincipal() principal: Principal): Promise<ProductDto> {
    return this.products.get(principal, id);
  }
}
