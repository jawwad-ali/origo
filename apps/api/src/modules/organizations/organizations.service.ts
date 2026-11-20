import { Injectable } from "@nestjs/common";
import {
  type ListOrganizationsQuery,
  type OrganizationDto,
  type OrganizationInput,
  type PaginatedDto,
} from "@origo/shared";
import { type Organization, type Prisma } from "@prisma/client";
import {
  ConflictException,
  EntityNotFoundException,
  InvalidStateException,
} from "../../common/exceptions/domain.exceptions";
import { type RequestMeta } from "../../common/types/request-meta";
import { PrismaService } from "../../prisma/prisma.service";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "../audit/audit-actions";
import { AuditService } from "../audit/audit.service";
import { REVIEW_RULES, type ReviewDecision } from "./constants";
import { toOrganizationDto } from "./organization.mapper";
import { OrganizationsRepository } from "./organizations.repository";

export interface ReviewCommand {
  organizationId: string;
  decision: ReviewDecision;
  reviewerId: string;
  reason?: string;
  meta: RequestMeta;
}

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizations: OrganizationsRepository,
    private readonly audit: AuditService,
  ) {}

  /** Creates a pending organization with the given user as its owner. Runs inside the caller's transaction. */
  async createForOwner(
    input: OrganizationInput,
    ownerUserId: string,
    meta: RequestMeta,
    tx: Prisma.TransactionClient,
  ): Promise<Organization> {
    if (await this.organizations.licenseTaken(input.country, input.licenseNumber, tx)) {
      throw new ConflictException(
        "license-taken",
        "License already registered",
        "An organization with this license number is already on Origo.",
      );
    }
    const org = await this.organizations.createWithOwner(input, ownerUserId, tx);
    await this.audit.record(
      {
        action: AUDIT_ACTIONS.ORG_CREATED,
        entityType: AUDIT_ENTITIES.ORGANIZATION,
        entityId: org.id,
        actorUserId: ownerUserId,
        actorOrgId: org.id,
        metadata: { type: org.type },
        meta,
      },
      tx,
    );
    return org;
  }

  async list(query: ListOrganizationsQuery): Promise<PaginatedDto<OrganizationDto>> {
    const { items, total } = await this.organizations.list({
      ...(query.status ? { status: query.status } : {}),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return {
      items: items.map(toOrganizationDto),
      page: query.page,
      pageSize: query.pageSize,
      total,
      pageCount: Math.ceil(total / query.pageSize),
    };
  }

  async getById(id: string): Promise<OrganizationDto> {
    const org = await this.organizations.findById(id);
    if (!org) throw new EntityNotFoundException("Organization");
    return toOrganizationDto(org);
  }

  async review(command: ReviewCommand): Promise<OrganizationDto> {
    const rule = REVIEW_RULES[command.decision];
    const org = await this.organizations.findById(command.organizationId);
    if (!org) throw new EntityNotFoundException("Organization");
    if (!rule.from.includes(org.status)) {
      throw new InvalidStateException(
        "invalid-transition",
        "Can't change status",
        `An organization that is ${org.status.toLowerCase()} can't be moved to ${rule.to.toLowerCase()}.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await this.organizations.updateReview(
        org.id,
        { status: rule.to, reviewedById: command.reviewerId, rejectionReason: command.reason ?? null },
        tx,
      );
      await this.audit.record(
        {
          action: rule.audit,
          entityType: AUDIT_ENTITIES.ORGANIZATION,
          entityId: org.id,
          actorUserId: command.reviewerId,
          metadata: { from: org.status, to: rule.to, ...(command.reason ? { reason: command.reason } : {}) },
          meta: command.meta,
        },
        tx,
      );
      return result;
    });
    return toOrganizationDto(updated);
  }
}
