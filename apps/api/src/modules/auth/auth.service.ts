import { Injectable } from "@nestjs/common";
import { type CurrentUserDto, type LoginInput, type SignupInput } from "@origo/shared";
import { ConflictException, UnauthenticatedException } from "../../common/exceptions/domain.exceptions";
import { type RequestMeta } from "../../common/types/request-meta";
import { PrismaService } from "../../prisma/prisma.service";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "../audit/audit-actions";
import { AuditService } from "../audit/audit.service";
import { OrganizationsService } from "../organizations/organizations.service";
import { UsersService } from "../users/users.service";
import { AccessTokenService } from "./access-token.service";
import { type AuthTokens } from "./auth-cookies.service";
import { PasswordService } from "./password.service";
import { SessionService } from "./session.service";

export interface AuthResult {
  user: CurrentUserDto;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly organizations: OrganizationsService,
    private readonly passwords: PasswordService,
    private readonly accessTokens: AccessTokenService,
    private readonly sessions: SessionService,
    private readonly audit: AuditService,
  ) {}

  /** Creates the user, their pending organization and the owner membership in one transaction. */
  async signup(input: SignupInput, meta: RequestMeta): Promise<AuthResult> {
    const passwordHash = await this.passwords.hash(input.password);

    const userId = await this.prisma.$transaction(async (tx) => {
      if (await this.users.emailTaken(input.email, tx)) {
        throw new ConflictException(
          "email-taken",
          "Email already registered",
          "Sign in instead, or use another email.",
        );
      }
      const user = await this.users.create(
        { email: input.email, fullName: input.fullName, passwordHash },
        tx,
      );
      const org = await this.organizations.createForOwner(input.organization, user.id, meta, tx);
      await this.audit.record(
        {
          action: AUDIT_ACTIONS.USER_SIGNED_UP,
          entityType: AUDIT_ENTITIES.USER,
          entityId: user.id,
          actorUserId: user.id,
          actorOrgId: org.id,
          meta,
        },
        tx,
      );
      return user.id;
    });

    return this.startSession(userId, meta);
  }

  async login(input: LoginInput, meta: RequestMeta): Promise<AuthResult> {
    const credentials = await this.users.findCredentials(input.email);
    const valid = await this.passwords.verify(credentials?.passwordHash ?? null, input.password);

    if (!credentials || !valid) {
      await this.audit.record({
        action: AUDIT_ACTIONS.USER_LOGIN_FAILED,
        entityType: AUDIT_ENTITIES.USER,
        entityId: credentials?.id ?? null,
        metadata: { email: input.email },
        meta,
      });
      throw new UnauthenticatedException("Email or password is incorrect.");
    }

    await this.users.recordLogin(credentials.id);
    await this.audit.record({
      action: AUDIT_ACTIONS.USER_LOGGED_IN,
      entityType: AUDIT_ENTITIES.USER,
      entityId: credentials.id,
      actorUserId: credentials.id,
      meta,
    });
    return this.startSession(credentials.id, meta);
  }

  async refresh(refreshToken: string | undefined, meta: RequestMeta): Promise<AuthTokens> {
    const rotated = await this.sessions.rotate(refreshToken, meta);
    const accessToken = await this.accessTokens.sign(rotated.userId);
    return { accessToken, refreshToken: rotated.refreshToken };
  }

  async logout(refreshToken: string | undefined, meta: RequestMeta): Promise<void> {
    const userId = await this.sessions.revoke(refreshToken);
    if (!userId) return;
    await this.audit.record({
      action: AUDIT_ACTIONS.USER_LOGGED_OUT,
      entityType: AUDIT_ENTITIES.USER,
      entityId: userId,
      actorUserId: userId,
      meta,
    });
  }

  private async startSession(userId: string, meta: RequestMeta): Promise<AuthResult> {
    const [accessToken, refreshToken, user] = await Promise.all([
      this.accessTokens.sign(userId),
      this.sessions.issue(userId, meta),
      this.users.getCurrentUser(userId),
    ]);
    return { user, tokens: { accessToken, refreshToken } };
  }
}
