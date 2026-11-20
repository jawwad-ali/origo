import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { type Session } from "@prisma/client";
import { UnauthenticatedException } from "../../common/exceptions/domain.exceptions";
import { type RequestMeta } from "../../common/types/request-meta";
import { AppConfigService } from "../../config/app-config.service";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "../audit/audit-actions";
import { AuditService } from "../audit/audit.service";
import { REFRESH_TOKEN_BYTES, ROTATION_GRACE_SECONDS } from "./constants";
import { SessionRepository } from "./session.repository";

const DAY_MS = 86_400_000;

export interface RotatedSession {
  userId: string;
  refreshToken: string;
}

const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

/** Refresh-token sessions: issue on login, rotate on refresh, revoke the whole family on reuse or logout. */
@Injectable()
export class SessionService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly config: AppConfigService,
    private readonly audit: AuditService,
  ) {}

  async issue(userId: string, meta: RequestMeta): Promise<string> {
    const token = randomBytes(REFRESH_TOKEN_BYTES).toString("base64url");
    await this.sessions.create(this.buildSession(userId, randomUUID(), token, meta));
    return token;
  }

  async rotate(token: string | undefined, meta: RequestMeta): Promise<RotatedSession> {
    if (!token) throw new UnauthenticatedException();
    const session = await this.sessions.findByTokenHash(hashToken(token));
    if (!session || session.expiresAt <= new Date())
      throw new UnauthenticatedException("Your session has expired.");

    if (session.revokedAt && !this.withinRotationGrace(session)) {
      await this.handleReuse(session, meta);
      throw new UnauthenticatedException("Your session has ended. Sign in again.");
    }

    const nextToken = randomBytes(REFRESH_TOKEN_BYTES).toString("base64url");
    await this.sessions.rotate(
      session.id,
      this.buildSession(session.userId, session.familyId, nextToken, meta),
    );
    return { userId: session.userId, refreshToken: nextToken };
  }

  /** Ends the login this token belongs to. Unknown tokens are ignored so logout always succeeds. */
  async revoke(token: string | undefined): Promise<string | null> {
    if (!token) return null;
    const session = await this.sessions.findByTokenHash(hashToken(token));
    if (!session) return null;
    await this.sessions.revokeFamily(session.familyId, "LOGOUT");
    return session.userId;
  }

  private withinRotationGrace(session: Session): boolean {
    if (session.revokedReason !== "ROTATED" || !session.revokedAt) return false;
    return Date.now() - session.revokedAt.getTime() < ROTATION_GRACE_SECONDS * 1000;
  }

  /** A retired token came back: someone may have stolen it. End every token in the family. */
  private async handleReuse(session: Session, meta: RequestMeta): Promise<void> {
    if (session.revokedReason !== "ROTATED") return;
    await this.sessions.revokeFamily(session.familyId, "REUSE");
    await this.audit.record({
      action: AUDIT_ACTIONS.SESSION_REUSE_DETECTED,
      entityType: AUDIT_ENTITIES.SESSION,
      entityId: session.familyId,
      actorUserId: session.userId,
      meta,
    });
  }

  private buildSession(userId: string, familyId: string, token: string, meta: RequestMeta) {
    return {
      userId,
      familyId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + this.config.get("REFRESH_TOKEN_TTL_DAYS") * DAY_MS),
      userAgent: meta.userAgent,
      ip: meta.ip,
    };
  }
}
