import "./instrument";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { type NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { ProblemDetailsFilter } from "./common/filters/problem-details.filter";
import { AppConfigService } from "./config/app-config.service";
import { readRunWorkerInApi } from "./config/env.schema";

const API_PREFIX = "api/v1";

const bootstrap = async (): Promise<void> => {
  const embeddedWorker = readRunWorkerInApi();
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot({ embeddedWorker }), {
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
  app.enableShutdownHooks();

  await app.listen(config.get("PORT"), "0.0.0.0");
  if (embeddedWorker) app.get(Logger).log("Queue consumers running inside the API (RUN_WORKER_IN_API)");
};

void bootstrap();
