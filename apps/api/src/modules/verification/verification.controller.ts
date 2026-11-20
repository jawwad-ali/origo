import { timingSafeEqual } from "node:crypto";
import { Controller, Get, Headers, Param, Query, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { type PublicKeyDto, type VerificationDto } from "@origo/shared";
import { type Request, type Response } from "express";
import { Public } from "../../common/decorators/access.decorators";
import { AppConfigService } from "../../config/app-config.service";
import { QR_PARAM_KEY, QR_PARAM_SIGNATURE } from "../qr-signing/qr-signing.service";
import { GEO_HEADERS, VERIFY_THROTTLE } from "./constants";
import { type ScanClient, VerificationService } from "./verification.service";

const MAX_GEO_LENGTH = 80;

const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

const cleanGeo = (value: string | undefined, length?: number): string | null => {
  if (!value) return null;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  const trimmed = decoded.trim().slice(0, length ?? MAX_GEO_LENGTH);
  return trimmed.length > 0 ? trimmed : null;
};

/** The only public data endpoint. Rate-limited per IP and never cached. */
@Public()
@Throttle(VERIFY_THROTTLE)
@Controller("verify")
export class VerificationController {
  constructor(
    private readonly verification: VerificationService,
    private readonly config: AppConfigService,
  ) {}

  /** Public keys for checking QR signatures offline. */
  @Get("keys")
  keys(): PublicKeyDto[] {
    return this.verification.publicKeys();
  }

  @Get(":publicId")
  verify(
    @Param("publicId") publicId: string,
    @Query(QR_PARAM_KEY) keyId: string | undefined,
    @Query(QR_PARAM_SIGNATURE) signature: string | undefined,
    @Headers() headers: Record<string, string | undefined>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerificationDto> {
    res.setHeader("Cache-Control", "no-store");
    return this.verification.verify({ publicId, keyId, signature }, this.clientOf(req, headers));
  }

  /** Location headers are trusted only when they come from our web app with the shared secret. */
  private clientOf(req: Request, headers: Record<string, string | undefined>): ScanClient {
    const secret = this.config.get("WEB_PROXY_SECRET");
    const provided = headers[GEO_HEADERS.secret];
    const trusted = Boolean(secret && provided && safeEqual(secret, provided));
    const country = trusted ? cleanGeo(headers[GEO_HEADERS.country], 2) : null;
    return {
      ip: req.ip ?? null,
      city: trusted ? cleanGeo(headers[GEO_HEADERS.city]) : null,
      country: country && /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : null,
    };
  }
}
