import { type Readable, type Writable } from "node:stream";

export interface StoredLabelFile {
  /** Opaque key saved on the export row (LabelExport.filePath); only the storage that wrote it reads it. */
  key: string;
  size: number;
}

export interface LabelFileStream {
  stream: Readable;
  size: number;
}

/**
 * Where finished label PDFs are kept. Picked per deployment with LABEL_EXPORT_STORAGE:
 * a shared disk volume on the VM, or the database on hosts with no shared disk (serverless).
 */
export abstract class LabelStorage {
  /** Lets `write` stream the PDF into a sink for this export, then returns where it ended up. */
  abstract save(exportId: string, write: (out: Writable) => Promise<void>): Promise<StoredLabelFile>;

  /** Opens a stored PDF, or null when it's gone (expired and cleaned up, or lost with the disk). */
  abstract open(key: string): Promise<LabelFileStream | null>;

  abstract remove(key: string): Promise<void>;
}
