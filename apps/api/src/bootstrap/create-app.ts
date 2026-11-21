import { NestFactory } from "@nestjs/core";
import { type NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { AppModule } from "../app.module";
import { ProblemDetailsFilter } from "../common/filters/problem-details.filter";
import { AppConfigService } from "../config/app-config.service";
import { type BootstrapOptions, readBootstrapOptions } from "../config/env.schema";

const API_PREFIX = "api/v1";

export interface CreatedApp {
  app: NestExpressApplication;
  options: BootstrapOptions;
}

/** Builds and configures the HTTP app. Shared by the long-running server and the serverless handler. */
export const createApp = async (): Promise<CreatedApp> => {
  const options = readBootstrapOptions();
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot(options), {
    bufferLogs: true,
  });
  const config = app.get(AppConfigService);

  app.useLogger(app.get(Logger));
  app.set("trust proxy", config.get("TRUST_PROXY_HOPS"));
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: config.get("WEB_ORIGIN"), credentials: true });
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(new ProblemDetailsFilter());
  return { app, options };
};
