import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AppConfigService } from "../../config/app-config.service";

interface AccessTokenClaims {
  sub: string;
  typ: "access";
}

const isAccessClaims = (value: unknown): value is AccessTokenClaims =>
  typeof value === "object" &&
  value !== null &&
  "sub" in value &&
  typeof value.sub === "string" &&
  "typ" in value &&
  value.typ === "access";

@Injectable()
export class AccessTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  sign(userId: string): Promise<string> {
    const claims: AccessTokenClaims = { sub: userId, typ: "access" };
    return this.jwt.signAsync(claims, { expiresIn: this.config.get("ACCESS_TOKEN_TTL_SECONDS") });
  }

  /** Returns the user ID for a valid token, or null for a missing, expired or forged one. */
  async verify(token: string | undefined): Promise<string | null> {
    if (!token) return null;
    try {
      const claims: unknown = await this.jwt.verifyAsync(token);
      return isAccessClaims(claims) ? claims.sub : null;
    } catch {
      return null;
    }
  }
}
