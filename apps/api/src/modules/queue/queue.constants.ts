export const LABEL_EXPORT_QUEUE = "label-exports";

export const LABEL_EXPORT_JOBS = {
  build: "build",
  cleanup: "cleanup-expired",
} as const;

export interface BuildLabelsJobData {
  exportId: string;
}

/** Retries with exponential backoff; failed jobs are kept for a week for inspection. */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5_000 },
  removeOnComplete: { age: 24 * 3600, count: 1000 },
  removeOnFail: { age: 7 * 24 * 3600 },
} as const;
