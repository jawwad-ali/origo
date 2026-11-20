import { Injectable } from "@nestjs/common";
import { type Prisma } from "@prisma/client";
import { type RequestMeta } from "../../common/types/request-meta";
import { PrismaService } from "../../prisma/prisma.service";
import { type AuditAction, type AuditEntity } from "./audit-actions";

export interface AuditEntry {
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string | null;
  actorUserId?: string | null;
  actorOrgId?: string | null;
  metadata?: Prisma.InputJsonObject;
  meta?: RequestMeta;
}

/** Writes account and admin actions. Pass `tx` to commit the entry together with the change it describes. */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry, tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    await tx.auditLog.create({
      data: {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        actorUserId: entry.actorUserId ?? null,
        actorOrgId: entry.actorOrgId ?? null,
        ...(entry.metadata ? { metadata: entry.metadata } : {}),
        ip: entry.meta?.ip ?? null,
        requestId: entry.meta?.requestId ?? null,
      },
    });
  }
}
