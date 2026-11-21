import { type Readable } from "node:stream";
import { HttpStatus, Injectable } from "@nestjs/common";
import { type LabelExportDto } from "@origo/shared";
import { DomainException, EntityNotFoundException } from "../../common/exceptions/domain.exceptions";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { orgIdOf } from "../../common/utils/principal";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "../audit/audit-actions";
import { AuditService } from "../audit/audit.service";
import { BatchesService } from "../batches/batches.service";
import { LabelExportDispatcher } from "./dispatch/label-export-dispatcher";
import { toLabelExportDto } from "./label-export.mapper";
import { LabelExportsRepository } from "./label-exports.repository";
import { LabelStorage } from "./storage/label-storage";

export interface LabelFile {
  stream: Readable;
  fileName: string;
  size: number;
}

class ExportNotReadyException extends DomainException {
  constructor(detail: string) {
    super(HttpStatus.CONFLICT, "export-not-ready", "Labels aren't ready", detail);
  }
}

class ExportExpiredException extends DomainException {
  constructor() {
    super(
      HttpStatus.GONE,
      "export-expired",
      "Download expired",
      "Export the labels again to get a fresh file.",
    );
  }
}

/** API side of label exports: request a build, check its status, download the result. */
@Injectable()
export class LabelExportsService {
  constructor(
    private readonly dispatcher: LabelExportDispatcher,
    private readonly exports: LabelExportsRepository,
    private readonly batches: BatchesService,
    private readonly storage: LabelStorage,
    private readonly audit: AuditService,
  ) {}

  async request(principal: Principal, batchId: string, meta: RequestMeta): Promise<LabelExportDto> {
    const orgId = orgIdOf(principal);
    const batch = await this.batches.getRecord(principal, batchId);

    const inFlight = await this.exports.findInFlight(orgId, batch.id);
    if (inFlight) return toLabelExportDto(inFlight);

    const record = await this.exports.create({
      batchId: batch.id,
      organizationId: orgId,
      requestedById: principal.userId,
      labelCount: batch.packCount,
    });
    await this.dispatcher.dispatch(record.id);
    await this.audit.record({
      action: AUDIT_ACTIONS.LABEL_EXPORT_REQUESTED,
      entityType: AUDIT_ENTITIES.LABEL_EXPORT,
      entityId: record.id,
      actorUserId: principal.userId,
      actorOrgId: orgId,
      metadata: { batchId: batch.id, labelCount: record.labelCount },
      meta,
    });
    return toLabelExportDto(record);
  }

  async get(principal: Principal, id: string): Promise<LabelExportDto> {
    const record = await this.exports.findForOrg(orgIdOf(principal), id);
    if (!record) throw new EntityNotFoundException("Label export");
    return toLabelExportDto(record);
  }

  /** The most recent export for a batch, or null if none was made yet. */
  async latestForBatch(principal: Principal, batchId: string): Promise<LabelExportDto | null> {
    const batch = await this.batches.getRecord(principal, batchId);
    const record = await this.exports.findLatestForBatch(orgIdOf(principal), batch.id);
    return record ? toLabelExportDto(record) : null;
  }

  async openFile(principal: Principal, id: string, meta: RequestMeta): Promise<LabelFile> {
    const orgId = orgIdOf(principal);
    const record = await this.exports.findWithBatch(id);
    if (!record || record.organizationId !== orgId) throw new EntityNotFoundException("Label export");
    if (record.status !== "READY")
      throw new ExportNotReadyException("The PDF is still being built. Try again shortly.");
    if (!record.filePath || (record.expiresAt && record.expiresAt < new Date()))
      throw new ExportExpiredException();
    const file = await this.storage.open(record.filePath);
    if (!file) throw new ExportExpiredException();

    try {
      await this.audit.record({
        action: AUDIT_ACTIONS.LABEL_EXPORT_DOWNLOADED,
        entityType: AUDIT_ENTITIES.LABEL_EXPORT,
        entityId: record.id,
        actorUserId: principal.userId,
        actorOrgId: orgId,
        meta,
      });
    } catch (error) {
      file.stream.destroy();
      throw error;
    }
    return {
      stream: file.stream,
      fileName: `origo-labels-${record.batch.batchNumber.replace(/[^A-Za-z0-9-]/g, "_")}.pdf`,
      size: file.size,
    };
  }
}
