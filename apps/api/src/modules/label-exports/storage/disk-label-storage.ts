import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { type Writable } from "node:stream";
import { Injectable } from "@nestjs/common";
import { AppConfigService } from "../../../config/app-config.service";
import { type LabelFileStream, LabelStorage, type StoredLabelFile } from "./label-storage";

/**
 * Label PDFs on local disk. In production this directory is a Docker volume mounted into both the
 * API (downloads) and the worker (writes). Keys are file names, always resolved inside this directory.
 */
@Injectable()
export class DiskLabelStorage extends LabelStorage {
  private readonly dir: string;

  constructor(config: AppConfigService) {
    super();
    this.dir = resolve(config.get("LABEL_EXPORT_DIR"));
  }

  async save(exportId: string, write: (out: Writable) => Promise<void>): Promise<StoredLabelFile> {
    const key = `${exportId}.pdf`;
    await mkdir(this.dir, { recursive: true });
    await write(createWriteStream(this.pathOf(key)));
    return { key, size: (await stat(this.pathOf(key))).size };
  }

  async open(key: string): Promise<LabelFileStream | null> {
    const size = await stat(this.pathOf(key)).then(
      (stats) => stats.size,
      () => null,
    );
    return size === null ? null : { stream: createReadStream(this.pathOf(key)), size };
  }

  async remove(key: string): Promise<void> {
    await rm(this.pathOf(key), { force: true });
  }

  /** basename() strips any directory part, so a stored key can never point outside the export dir. */
  private pathOf(key: string): string {
    return resolve(this.dir, basename(key));
  }
}
