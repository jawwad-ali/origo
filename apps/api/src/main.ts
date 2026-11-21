import "./instrument";
import "reflect-metadata";
import { Logger } from "nestjs-pino";
import { createApp } from "./bootstrap/create-app";
import { AppConfigService } from "./config/app-config.service";

/** Long-running server (Docker / VM, local dev). Serverless hosts use serverless.ts instead. */
const bootstrap = async (): Promise<void> => {
  const { app, options } = await createApp();
  app.enableShutdownHooks();
  await app.listen(app.get(AppConfigService).get("PORT"), "0.0.0.0");

  const logger = app.get(Logger);
  if (options.embeddedWorker) logger.log("Queue consumers running inside the API (RUN_WORKER_IN_API)");
  logger.log(`Label exports: ${options.labelExports.runner} runner, ${options.labelExports.storage} storage`);
};

void bootstrap();
