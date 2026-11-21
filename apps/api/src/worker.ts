import "./instrument";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { readBootstrapOptions } from "./config/env.schema";
import { WorkerModule } from "./worker.module";

const bootstrap = async (): Promise<void> => {
  const { labelExports } = readBootstrapOptions();
  if (labelExports.runner !== "queue") {
    // With the inline runner the API builds PDFs itself; a worker would sit idle on an empty queue.
    process.stderr.write("LABEL_EXPORT_RUNNER is not 'queue'; the worker has nothing to do. Exiting.\n");
    return;
  }
  const app = await NestFactory.createApplicationContext(WorkerModule.forRoot(labelExports.storage), {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  // Lets in-flight jobs finish on SIGTERM (docker stop / deploy) before the process exits.
  app.enableShutdownHooks();
  app.get(Logger).log("Worker started");
};

void bootstrap();
