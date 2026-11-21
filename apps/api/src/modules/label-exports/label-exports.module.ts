import { type DynamicModule, Module, type Provider } from "@nestjs/common";
import { type BootstrapOptions } from "../../config/env.schema";
import { BatchesModule } from "../batches/batches.module";
import { QueueModule } from "../queue/queue.module";
import { LabelExportsCoreModule } from "./core/label-exports-core.module";
import { InlineLabelExportDispatcher } from "./dispatch/inline-label-export.dispatcher";
import { LabelExportDispatcher } from "./dispatch/label-export-dispatcher";
import { QueueLabelExportDispatcher } from "./dispatch/queue-label-export.dispatcher";
import { LabelExportBuildModule } from "./jobs/label-export-build.module";
import { LabelExportsCronController } from "./label-exports-cron.controller";
import { LabelExportsController } from "./label-exports.controller";
import { LabelExportsService } from "./label-exports.service";

type LabelExportsOptions = BootstrapOptions["labelExports"];

interface RunnerWiring {
  imports: DynamicModule["imports"];
  dispatcher: Provider;
}

/** Queue: Redis + the worker build PDFs. Inline: this process builds them, so no Redis is loaded at all. */
const runnerWiring = ({ runner, storage }: LabelExportsOptions): RunnerWiring =>
  runner === "inline"
    ? {
        imports: [LabelExportBuildModule.forRoot(storage)],
        dispatcher: { provide: LabelExportDispatcher, useClass: InlineLabelExportDispatcher },
      }
    : {
        imports: [QueueModule],
        dispatcher: { provide: LabelExportDispatcher, useClass: QueueLabelExportDispatcher },
      };

/** API side: request, track and download label exports. How PDFs get built and stored is configured. */
@Module({})
export class LabelExportsModule {
  static forRoot(options: LabelExportsOptions): DynamicModule {
    const wiring = runnerWiring(options);
    return {
      module: LabelExportsModule,
      imports: [BatchesModule, LabelExportsCoreModule.forRoot(options.storage), ...(wiring.imports ?? [])],
      controllers: [LabelExportsController, LabelExportsCronController],
      providers: [LabelExportsService, wiring.dispatcher],
    };
  }
}
