import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DemoSeedModule } from "./demo-seed.module";
import { DemoSeedService } from "./demo-seed.service";

/**
 * Builds the demo world (products, batches, transfers, dispensed and recalled packs, scans).
 *   pnpm --filter @origo/api db:seed:demo
 * Needs the base seed (admin + demo organizations) first. Safe to rerun: it stops if the world exists.
 */
const main = async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(DemoSeedModule, {
    logger: ["log", "warn", "error"],
  });
  try {
    await app.get(DemoSeedService).run();
  } finally {
    await app.close();
  }
};

main().catch((error: unknown) => {
  new Logger("DemoSeed").error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exitCode = 1;
});
