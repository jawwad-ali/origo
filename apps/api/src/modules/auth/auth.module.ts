import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AccessGuard } from "../../common/guards/access.guard";
import { AppConfigService } from "../../config/app-config.service";
import { OrganizationsModule } from "../organizations/organizations.module";
import { UsersModule } from "../users/users.module";
import { AccessTokenService } from "./access-token.service";
import { AuthCookiesService } from "./auth-cookies.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthenticationGuard } from "./authentication.guard";
import { PasswordService } from "./password.service";
import { SessionRepository } from "./session.repository";
import { SessionService } from "./session.service";

@Module({
  imports: [
    UsersModule,
    OrganizationsModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.get("JWT_ACCESS_SECRET"),
        signOptions: { algorithm: "HS256", issuer: "origo-api" },
        verifyOptions: { algorithms: ["HS256"], issuer: "origo-api" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCookiesService,
    AccessTokenService,
    PasswordService,
    SessionRepository,
    SessionService,
    // Global guards, run in this order: rate limit → who are you → are you allowed.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AccessGuard },
  ],
})
export class AuthModule {}
