import { Readable, Writable } from "node:stream";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { type LabelFileStream, LabelStorage, type StoredLabelFile } from "./label-storage";

/** Sent in pieces so the download is a streamed response (serverless hosts cap buffered bodies at 4.5 MB). */
const STREAM_CHUNK_BYTES = 64 * 1024;

const chunksOf = function* (data: Buffer): Generator<Buffer> {
  for (let offset = 0; offset < data.length; offset += STREAM_CHUNK_BYTES) {
    yield data.subarray(offset, offset + STREAM_CHUNK_BYTES);
  }
};

/**
 * Label PDFs in Postgres (label_export_files), for hosts without a disk shared between requests.
 * A sheet of 600 labels is about 1.7 MB and files are deleted when the export expires.
 */
@Injectable()
export class DatabaseLabelStorage extends LabelStorage {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(exportId: string, write: (out: Writable) => Promise<void>): Promise<StoredLabelFile> {
    const parts: Buffer[] = [];
    const sink = new Writable({
      write(chunk: Buffer, _encoding, done) {
        parts.push(chunk);
        done();
      },
    });
    await write(sink);

    const data = Buffer.concat(parts);
    await this.prisma.labelExportFile.upsert({
      where: { exportId },
      create: { exportId, data },
      update: { data },
    });
    return { key: exportId, size: data.length };
  }

  async open(key: string): Promise<LabelFileStream | null> {
    const file = await this.prisma.labelExportFile.findUnique({
      where: { exportId: key },
      select: { data: true },
    });
    if (!file) return null;
    const data = Buffer.from(file.data.buffer, file.data.byteOffset, file.data.byteLength);
    return { stream: Readable.from(chunksOf(data)), size: data.length };
  }

  async remove(key: string): Promise<void> {
    await this.prisma.labelExportFile.deleteMany({ where: { exportId: key } });
  }
}
