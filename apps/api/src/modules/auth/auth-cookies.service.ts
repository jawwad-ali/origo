import { Injectable } from "@nestjs/common";
import { type CookieOptions, type Response } from "express";
import { AppConfigService } from "../../config/app-config.service";
import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_COOKIE_PATH } from "./constants";

const DAY_MS = 86_400_000;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthCookiesService {
  constructor(private readonly config: AppConfigService) {}

  set(res: Response, tokens: AuthTokens): void {
    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
      ...this.base(),
      path: "/",
      maxAge: this.config.get("ACCESS_TOKEN_TTL_SECONDS") * 1000,
    });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...this.base(),
      path: REFRESH_COOKIE_PATH,
      maxAge: this.config.get("REFRESH_TOKEN_TTL_DAYS") * DAY_MS,
    });
  }

  clear(res: Response): void {
    res.clearCookie(ACCESS_COOKIE, { ...this.base(), path: "/" });
    res.clearCookie(REFRESH_COOKIE, { ...this.base(), path: REFRESH_COOKIE_PATH });
  }

  private base(): CookieOptions {
    return { httpOnly: true, secure: this.config.get("COOKIE_SECURE"), sameSite: "lax" };
  }
}
