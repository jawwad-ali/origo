import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  type CurrentUserDto,
  type LoginInput,
  loginSchema,
  type SignupInput,
  signupSchema,
} from "@origo/shared";
import { type Request, type Response } from "express";
import { Public } from "../../common/decorators/access.decorators";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { ReqMeta } from "../../common/decorators/request-meta.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { type Principal } from "../../common/types/principal";
import { type RequestMeta } from "../../common/types/request-meta";
import { UsersService } from "../users/users.service";
import { AuthCookiesService } from "./auth-cookies.service";
import { AuthService } from "./auth.service";
import { AUTH_THROTTLE, REFRESH_COOKIE } from "./constants";

const readRefreshCookie = (req: Request): string | undefined => {
  const value: unknown = req.cookies?.[REFRESH_COOKIE];
  return typeof value === "string" ? value : undefined;
};

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: AuthCookiesService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @Throttle(AUTH_THROTTLE.signup)
  @Post("signup")
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) body: SignupInput,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CurrentUserDto> {
    const result = await this.auth.signup(body, meta);
    this.cookies.set(res, result.tokens);
    return result.user;
  }

  @Public()
  @Throttle(AUTH_THROTTLE.login)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CurrentUserDto> {
    const result = await this.auth.login(body, meta);
    this.cookies.set(res, result.tokens);
    return result.user;
  }

  @Public()
  @Throttle(AUTH_THROTTLE.refresh)
  @Post("refresh")
  @HttpCode(HttpStatus.NO_CONTENT)
  async refresh(
    @Req() req: Request,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      this.cookies.set(res, await this.auth.refresh(readRefreshCookie(req), meta));
    } catch (error) {
      this.cookies.clear(res);
      throw error;
    }
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.auth.logout(readRefreshCookie(req), meta);
    this.cookies.clear(res);
  }

  @Get("me")
  me(@CurrentPrincipal() principal: Principal): Promise<CurrentUserDto> {
    return this.users.getCurrentUser(principal.userId);
  }
}
