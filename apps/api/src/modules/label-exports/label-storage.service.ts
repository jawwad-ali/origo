import { createReadStream, createWriteStream, type ReadStream, type WriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { AppConfigService } from "../../config/app-config.service";

/**
 * Label PDFs on local disk. In production this directory is a Docker volume mounted
 * into both the API (downloads) and the worker (writes). Only file names are stored in the
 * database, and they are always resolved inside this directory.
 */
@Injectable()
export class LabelStorageService {
  private readonly dir: string;

  constructor(config: AppConfigService) {
    this.dir = resolve(config.get("LABEL_EXPORT_DIR"));
  }

  fileNameFor(exportId: string): string {
    return `${exportId}.pdf`;
  }

  async openWrite(fileName: string): Promise<WriteStream> {
    await mkdir(this.dir, { recursive: true });
    return createWriteStream(this.pathOf(fileName));
  }

  openRead(fileName: string): ReadStream {
    return createReadStream(this.pathOf(fileName));
  }

  async sizeOf(fileName: string): Promise<number> {
    return (await stat(this.pathOf(fileName))).size;
  }

  async exists(fileName: string): Promise<boolean> {
    return stat(this.pathOf(fileName)).then(
      () => true,
      () => false,
    );
  }

  async remove(fileName: string): Promise<void> {
    await rm(this.pathOf(fileName), { force: true });
  }

  /** basename() strips any directory part, so a stored name can never point outside the export dir. */
  private pathOf(fileName: string): string {
    return resolve(this.dir, basename(fileName));
  }
}
