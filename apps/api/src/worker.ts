import "./instrument";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { WorkerModule } from "./worker.module";

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(WorkerModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  // Lets in-flight jobs finish on SIGTERM (docker stop / deploy) before the process exits.
  app.enableShutdownHooks();
  app.get(Logger).log("Worker started");
};

void bootstrap();
