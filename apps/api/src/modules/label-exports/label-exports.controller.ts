import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  StreamableFile,
} from "@nestjs/common";
import { type LabelExportDto, type LatestLabelExportDto } from "@origo/shared";
import { type Response } from "express";
import { OrgTypes } from "../../common/decorators/access.decorators";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { ReqMeta } from "../../common/decorators/request-meta.decorator";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { LabelExportsService } from "./label-exports.service";

@OrgTypes("MANUFACTURER")
@Controller()
export class LabelExportsController {
  constructor(private readonly exports: LabelExportsService) {}

  @Post("batches/:batchId/label-exports")
  @HttpCode(HttpStatus.ACCEPTED)
  request(
    @Param("batchId", ParseUUIDPipe) batchId: string,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
  ): Promise<LabelExportDto> {
    return this.exports.request(principal, batchId, meta);
  }

  @Get("batches/:batchId/label-exports/latest")
  async latest(
    @Param("batchId", ParseUUIDPipe) batchId: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<LatestLabelExportDto> {
    return { latest: await this.exports.latestForBatch(principal, batchId) };
  }

  @Get("label-exports/:id")
  get(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<LabelExportDto> {
    return this.exports.get(principal, id);
  }

  @Get("label-exports/:id/file")
  async download(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentPrincipal() principal: Principal,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.exports.openFile(principal, id, meta);
    res.setHeader("Cache-Control", "private, no-store");
    return new StreamableFile(file.stream, {
      type: "application/pdf",
      disposition: `attachment; filename="${file.fileName}"`,
      length: file.size,
    });
  }
}
