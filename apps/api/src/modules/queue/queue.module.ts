import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { AppConfigService } from "../../config/app-config.service";
import { DEFAULT_JOB_OPTIONS, LABEL_EXPORT_QUEUE } from "./queue.constants";

/** Redis connection and queue registration, shared by the API (producer) and the worker (consumer). */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        connection: { url: config.get("REDIS_URL"), maxRetriesPerRequest: null },
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      }),
    }),
    BullModule.registerQueue({ name: LABEL_EXPORT_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
