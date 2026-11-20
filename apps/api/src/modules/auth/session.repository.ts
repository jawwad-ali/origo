import { Injectable } from "@nestjs/common";
import { type Session, type SessionRevokeReason } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface NewSession {
  userId: string;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
  ip: string | null;
}

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: NewSession): Promise<void> {
    await this.prisma.session.create({ data });
  }

  findByTokenHash(tokenHash: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { tokenHash } });
  }

  /** Creates the next token in the family and retires the old one, atomically. */
  async rotate(oldId: string, next: NewSession): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const created = await tx.session.create({ data: next, select: { id: true } });
      await tx.session.update({
        where: { id: oldId },
        data: { revokedAt: new Date(), revokedReason: "ROTATED", replacedById: created.id },
      });
    });
  }

  async revokeFamily(familyId: string, reason: SessionRevokeReason): Promise<void> {
    await this.prisma.session.updateMany({
      where: { familyId },
      data: { revokedAt: new Date(), revokedReason: reason },
    });
  }
}
